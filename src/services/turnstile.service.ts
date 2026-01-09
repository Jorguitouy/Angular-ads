import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * TurnstileService - Verificación anti-bot con Cloudflare Turnstile
 * 
 * Características:
 * - Carga lazy del script (solo cuando se necesita)
 * - Verificación invisible (el usuario no ve nada)
 * - Validación en backend con bloqueo automático de bots
 */
@Injectable({
  providedIn: 'root'
})
export class TurnstileService {
  private http = inject(HttpClient);

  // Site Key se obtiene del servidor (inyectado en window)
  private get SITE_KEY(): string {
    return (window as any).SC_TURNSTILE_KEY || '';
  }

  private readonly VERIFY_URL = '/api/verify-turnstile';

  private scriptCargado = false;
  private cargando = false;

  // Signals para el UI
  verificando = signal(false);
  error = signal<string | null>(null);

  /**
   * Método principal de verificación.
   * 
   * 1. Carga el script si no está cargado
   * 2. Ejecuta verificación invisible
   * 3. Valida el token en el backend (incluye check de bloqueo)
   * 
   * @returns Token válido o null si falló/bloqueado
   */
  async verificar(): Promise<string | null> {
    this.verificando.set(true);
    this.error.set(null);

    // Si no hay Site Key configurada, permitir (modo desarrollo)
    if (!this.SITE_KEY) {
      console.warn('Turnstile: No hay SITE_KEY configurada, omitiendo verificación');
      this.verificando.set(false);
      return 'DEV_MODE_NO_KEY';
    }

    try {
      // PASO 1: Cargar script
      await this.cargarScript();

      // PASO 2: Ejecutar verificación invisible
      const token = await this.ejecutarVerificacionInvisible();

      // PASO 3: Validar en backend (incluye verificación de bloqueo)
      const resultado = await firstValueFrom(
        this.http.post<{ success: boolean; blocked?: boolean; reason?: string }>(
          this.VERIFY_URL, 
          { token }
        )
      );

      this.verificando.set(false);

      if (resultado.blocked) {
        this.error.set('Acceso temporalmente bloqueado. Intenta más tarde.');
        return null;
      }

      if (resultado.success) {
        return token;
      } else {
        this.error.set('No pudimos verificar tu solicitud. Intenta de nuevo.');
        return null;
      }

    } catch (err: any) {
      console.error('Error en verificación Turnstile:', err);
      this.verificando.set(false);
      
      // Si es error 403, el usuario está bloqueado
      if (err?.status === 403) {
        this.error.set('Acceso temporalmente bloqueado.');
        return null;
      }
      
      this.error.set('Error de conexión. Intenta de nuevo.');
      return null;
    }
  }

  /**
   * Precarga el script cuando el usuario pasa el mouse sobre el botón.
   * Mejora la velocidad de verificación al hacer clic.
   */
  precargar(): void {
    if (!this.scriptCargado && !this.cargando && this.SITE_KEY) {
      this.cargarScript().catch(() => {});
    }
  }

  private cargarScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.scriptCargado && (window as any).turnstile) {
        resolve();
        return;
      }

      if (document.getElementById('cf-turnstile-script')) {
        this.esperarTurnstile().then(resolve).catch(reject);
        return;
      }

      this.cargando = true;

      const script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;

      script.onload = () => {
        this.esperarTurnstile()
          .then(() => {
            this.scriptCargado = true;
            this.cargando = false;
            resolve();
          })
          .catch(reject);
      };

      script.onerror = () => {
        this.cargando = false;
        reject(new Error('Error al cargar Turnstile'));
      };

      document.head.appendChild(script);
    });
  }

  private esperarTurnstile(): Promise<void> {
    return new Promise((resolve, reject) => {
      let intentos = 0;
      const maxIntentos = 50; // 5 segundos

      const verificar = () => {
        if ((window as any).turnstile) {
          resolve();
        } else if (intentos >= maxIntentos) {
          reject(new Error('Timeout esperando Turnstile'));
        } else {
          intentos++;
          setTimeout(verificar, 100);
        }
      };

      verificar();
    });
  }

  private ejecutarVerificacionInvisible(): Promise<string> {
    return new Promise((resolve, reject) => {
      const container = document.createElement('div');
      container.id = 'turnstile-temp-' + Date.now();
      container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;visibility:hidden;';
      document.body.appendChild(container);

      let widgetId: string | null = null;

      const timeout = setTimeout(() => {
        this.limpiarWidget(container, widgetId);
        reject(new Error('Timeout: verificación tardó demasiado'));
      }, 15000);

      widgetId = (window as any).turnstile.render(container, {
        sitekey: this.SITE_KEY,
        size: 'invisible',
        callback: (token: string) => {
          clearTimeout(timeout);
          this.limpiarWidget(container, widgetId);
          resolve(token);
        },
        'error-callback': () => {
          clearTimeout(timeout);
          this.limpiarWidget(container, widgetId);
          reject(new Error('Error en verificación Turnstile'));
        },
        'expired-callback': () => {
          clearTimeout(timeout);
          this.limpiarWidget(container, widgetId);
          reject(new Error('Verificación expiró'));
        }
      });
    });
  }

  private limpiarWidget(container: HTMLElement, widgetId: string | null): void {
    try {
      if (widgetId && (window as any).turnstile) {
        (window as any).turnstile.remove(widgetId);
      }
      container?.remove();
    } catch (e) {}
  }
}
