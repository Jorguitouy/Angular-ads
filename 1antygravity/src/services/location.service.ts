import { Injectable, signal, effect, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: "root",
})
export class LocationService {
  private readonly STORAGE_KEY = "sc_user_location_v2"; // Clave v2 para evitar conflictos viejos
  private platformId = inject(PLATFORM_ID);

  // Zonas que requieren el sufijo "y todo Montevideo"
  private readonly CANELONES_ZONES = [
    "Ciudad de la Costa",
    "Solymar",
    "Lagomar",
    "El Pinar",
    "Shangrilá",
    "San José de Carrasco",
    "Parque Miramar",
    "Barra de Carrasco",
    "Parque de la Costa",
    "Paso Carrasco",
    "Colonia Nicolich",
    "Aeropuerto",
    "Canelones",
    "Las Piedras",
    "La Paz",
    "Progreso",
    "Pando",
    "Barros Blancos",
  ];

  // Inicializamos con lo que haya en memoria persistente, o Montevideo por defecto
  private _city = signal<string>(this.getStoredLocation() || "Montevideo");
  private _loading = signal<boolean>(false);

  public city = this._city.asReadonly();
  public loading = this._loading.asReadonly();

  constructor() {
    // Solo ejecutamos lógica de detección en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.detectInitialLocation();

      // Efecto: Cada vez que cambia la ciudad, guardarla en LocalStorage (Persistente)
      effect(() => {
        const currentCity = this._city();
        if (currentCity) {
          try {
            localStorage.setItem(this.STORAGE_KEY, currentCity);
          } catch (e) {
            console.warn("Storage blocked", e);
          }
        }
      });
    }
  }

  private getStoredLocation(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private detectInitialLocation() {
    // 1. PRIORIDAD MÁXIMA: Inyección desde el borde
    const injectedLoc = (window as any)._init?.l;

    if (injectedLoc && injectedLoc !== "null" && injectedLoc !== "Montevideo") {
      this.setCleanLocation(injectedLoc);
      return;
    }

    // 2. Si no hay inyección fresca, mantenemos lo que haya en LocalStorage (recuperado en el constructor)
    // Esto es útil si el usuario navega entre páginas internas y el Worker no inyectó nada nuevo.

    // 3. FALLBACK DE URL: Para testing o campañas específicas (?loc=Pocitos)
    const urlParams = new URLSearchParams(window.location.search);
    const locParam = urlParams.get("loc");

    if (locParam) {
      this.setCleanLocation(locParam);
    }
  }

  private setCleanLocation(rawLocation: string) {
    if (!rawLocation) return;

    // Limpieza de texto para que parezca escrito por un humano
    let clean = rawLocation
      .replace(/, Montevideo.*/gi, "") // Borra ", Montevideo" y lo que siga
      .replace(/Montevideo Department/gi, "")
      .replace(/Department/gi, "")
      .replace(/Barrio /gi, "")
      .trim();

    // Limpieza final de caracteres raros:
    // Permite letras (a-z), espacios, números (0-9) y caracteres latinos extendidos (\u00C0-\u00FF)
    clean = clean.replace(/[^a-zA-Z0-9\s\u00C0-\u00FF]/g, "");

    // LOGICA "Y TODO MONTEVIDEO"
    // Si la ubicación detectada está en la lista de Canelones, agregamos el sufijo.
    const isCanelones = this.CANELONES_ZONES.some((zone) =>
      clean.toLowerCase().includes(zone.toLowerCase())
    );

    if (isCanelones) {
      clean = `${clean} y todo Montevideo`;
    }

    if (clean.length > 2) {
      // Evitar strings vacíos o basura corta
      this._city.set(clean);
    }
  }

  // Método manual para solicitar ubicación exacta (GPS del navegador)
  public async detectPreciseLocation() {
    if (!isPlatformBrowser(this.platformId) || !("geolocation" in navigator))
      return;

    this._loading.set(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `/api/geocode?lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data.location) {
            this.setCleanLocation(data.location);
          }
        } catch (error) {
          console.error("Error obteniendo barrio:", error);
        } finally {
          this._loading.set(false);
        }
      },
      (error) => {
        this._loading.set(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }
}
