
import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private platformId = inject(PLATFORM_ID);
  
  // Señales para el contenido dinámico
  brand = signal<string | null>(null);
  urgencyMode = signal<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.detectCampaignParams();
    }
  }

  private detectCampaignParams() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // 1. Detección de Marca (Ads Relevance)
    // Lee 'brand', 'marca', 'kw' Y AHORA 'utm_term' (Google Ads standard)
    let brandParam = urlParams.get('marca') || 
                     urlParams.get('brand') || 
                     urlParams.get('kw') ||
                     urlParams.get('utm_term'); // Soporte nativo Google Ads

    if (brandParam) {
      // Limpieza: A veces utm_term viene como "reparacion_calefon_james".
      // Intentamos extraer la marca si es posible, o usamos el término tal cual si parece una marca.
      
      // Decodificar URI por si viene con %20
      brandParam = decodeURIComponent(brandParam);

      // Si es una frase larga (ej: "arreglo calefon james pocitos"), intentamos buscar marcas conocidas
      const knownBrands = ['james', 'ariston', 'copper', 'enxuta', 'bronx', 'sirium', 'bosch', 'panavox', 'tem', 'thompson'];
      const foundBrand = knownBrands.find(b => brandParam!.toLowerCase().includes(b));
      
      if (foundBrand) {
        brandParam = foundBrand;
      }

      // Capitalizar primera letra
      const cleanBrand = brandParam.charAt(0).toUpperCase() + brandParam.slice(1).toLowerCase();
      this.brand.set(cleanBrand);
    }

    // 2. Detección de Urgencia (ej: ?urgencia=true)
    // Para anuncios de "Reparación Urgente 24hs"
    const urgencyParam = urlParams.get('urgencia') || urlParams.get('emergency');
    if (urgencyParam === 'true' || urgencyParam === '1') {
      this.urgencyMode.set(true);
    }
  }
}
