import { Injectable, signal, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

// Interfaz para la configuración inyectada desde el Edge
interface ExtendedWindow extends Window {
  _init?: {
    l?: string; // location
    c?: string; // country
    tk?: string; // turnstile key
    p?: string; // phone encoding
    v?: string; // phone visual
    w?: string; // phone whatsapp
  };
}

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  private platformId = inject(PLATFORM_ID);

  // DEFAULTS
  private readonly DEF_CALL_INTL = "59896758200";
  private readonly DEF_CALL_DISPLAY = "096 758 200";
  private readonly DEF_WHATSAPP = "59896758200";

  phoneCallEncodigo = signal<string>(this.DEF_CALL_INTL);
  phoneCallVisual = signal<string>(this.DEF_CALL_DISPLAY);
  phoneWhatsapp = signal<string>(this.DEF_WHATSAPP);

  country = signal<string>("UY");

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const w = window as unknown as ExtendedWindow;
      const init = w._init;

      if (init) {
        if (init.p && init.p !== "null") this.phoneCallEncodigo.set(init.p);
        if (init.v && init.v !== "null") this.phoneCallVisual.set(init.v);
        if (init.w && init.w !== "null") this.phoneWhatsapp.set(init.w);
        if (init.c && init.c !== "null") this.country.set(init.c);
      }
    }
  }
}
