import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideHttpClient, withFetch } from "@angular/common/http";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),

    // 2. NETWORK: Fetch API
    // Usa la API nativa del navegador en lugar de XMLHttpRequest.
    // Mejor para Service Workers y manejo de caché.
    provideHttpClient(withFetch()),
  ],
};
