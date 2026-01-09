
import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Interfaz local para extender Window sin necesitar un archivo global.d.ts
interface ExtendedWindow extends Window {
  SC_PHONE_CALL_ENCODIGO?: string;
  SC_PHONE_CALL_VISUAL?: string;
  SC_PHONE_WHATSAPP?: string;
  SC_USER_COUNTRY?: string;
  SC_INJECTED_LOC?: string;
  SC_TURNSTILE_KEY?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private platformId = inject(PLATFORM_ID);
  
  // DEFAULTS (Valores por defecto si Cloudflare falla o en desarrollo local)
  private readonly DEF_CALL_INTL = '59896758200';
  private readonly DEF_CALL_DISPLAY = '096 758 200';
  private readonly DEF_WHATSAPP = '59896758200';
  
  // Signals para consumo reactivo
  phoneCallEncodigo = signal<string>(this.DEF_CALL_INTL);
  phoneCallVisual = signal<string>(this.DEF_CALL_DISPLAY);
  phoneWhatsapp = signal<string>(this.DEF_WHATSAPP);
  
  country = signal<string>('UY');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const w = window as unknown as ExtendedWindow;
      
      // Lectura de Hooks inyectados
      if (w.SC_PHONE_CALL_ENCODIGO && w.SC_PHONE_CALL_ENCODIGO !== 'null') {
        this.phoneCallEncodigo.set(w.SC_PHONE_CALL_ENCODIGO);
      }

      if (w.SC_PHONE_CALL_VISUAL && w.SC_PHONE_CALL_VISUAL !== 'null') {
        this.phoneCallVisual.set(w.SC_PHONE_CALL_VISUAL);
      }

      if (w.SC_PHONE_WHATSAPP && w.SC_PHONE_WHATSAPP !== 'null') {
        this.phoneWhatsapp.set(w.SC_PHONE_WHATSAPP);
      }

      // Geo
      if (w.SC_USER_COUNTRY && w.SC_USER_COUNTRY !== 'null') {
        this.country.set(w.SC_USER_COUNTRY);
      }
    }
  }
}
