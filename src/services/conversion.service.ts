import { Injectable } from '@angular/core';

/**
 * Tipos de conversión disponibles
 */
export type ConversionType = 
  | 'phone_call_header'
  | 'phone_call_hero' 
  | 'phone_call_footer'
  | 'whatsapp_header'
  | 'whatsapp_hero'
  | 'whatsapp_footer'
  | 'form_contact'
  | 'form_quote'
  | 'lead_submit';

/**
 * ConversionService - Gestión de códigos de conversión Google Ads
 * 
 * Centraliza todos los IDs de conversión para fácil mantenimiento
 * y permite configuración por entorno (producción/desarrollo)
 */
@Injectable({
  providedIn: 'root'
})
export class ConversionService {
  
  // IDs de conversión de Google Ads
  // Obtener desde: Google Ads → Herramientas → Conversiones
  private readonly CONVERSION_IDS = {
    // Conversiones de llamada telefónica
    phone_call_header: 'AW-XXXXXXXX/YYYYYYYY',    // Botón principal header
    phone_call_hero: 'AW-XXXXXXXX/YYYYYYYY',      // Hero section
    phone_call_footer: 'AW-XXXXXXXX/YYYYYYYY',    // Footer
    
    // Conversiones de WhatsApp
    whatsapp_header: 'AW-XXXXXXXX/ZZZZZZZZ',      // Botón WhatsApp header
    whatsapp_hero: 'AW-XXXXXXXX/ZZZZZZZZ',        // Hero section
    whatsapp_footer: 'AW-XXXXXXXX/ZZZZZZZZ',      // Footer
    
    // Conversiones de formulario
    form_contact: 'AW-XXXXXXXX/WWWWWWWW',         // Formulario contacto
    form_quote: 'AW-XXXXXXXX/WWWWWWWW',           // Formulario cotización
    
    // Conversiones generales
    lead_submit: 'AW-XXXXXXXX/QQQQQQQQ'           // Submit exitoso del modal
  };

  // IDs para entorno de desarrollo/test
  private readonly TEST_CONVERSION_IDS = {
    ...this.CONVERSION_IDS,
    // En test, todos apuntan al mismo ID de prueba
    phone_call_header: 'AW-1234567890/test123',
    phone_call_hero: 'AW-1234567890/test123',
    phone_call_footer: 'AW-1234567890/test123',
    whatsapp_header: 'AW-1234567890/test123',
    whatsapp_hero: 'AW-1234567890/test123',
    whatsapp_footer: 'AW-1234567890/test123',
    form_contact: 'AW-1234567890/test123',
    form_quote: 'AW-1234567890/test123',
    lead_submit: 'AW-1234567890/test123'
  };

  /**
   * Obtiene el ID de conversión según el tipo y entorno
   */
  getConversionId(type: ConversionType): string {
    const isProduction = this.isProduction();
    const ids = isProduction ? this.CONVERSION_IDS : this.TEST_CONVERSION_IDS;
    
    return ids[type] || this.CONVERSION_IDS.lead_submit;
  }

  /**
   * Obtiene todos los IDs de conversión del entorno actual
   */
  getAllConversionIds(): Record<ConversionType, string> {
    const isProduction = this.isProduction();
    return isProduction ? this.CONVERSION_IDS : this.TEST_CONVERSION_IDS;
  }

  /**
   * Verifica si estamos en producción
   */
  private isProduction(): boolean {
    if (typeof window === 'undefined') return false;
    
    const hostname = window.location.hostname;
    const productionDomains = [
      'servicedecalefones.uy',
      'www.servicedecalefones.uy'
    ];
    
    return productionDomains.includes(hostname);
  }

  /**
   * Obtiene el valor monetario estimado para cada tipo de conversión
   */
  getConversionValue(type: ConversionType): number {
    const values: Record<ConversionType, number> = {
      phone_call_header: 500,    // Llamada directa (alto valor)
      phone_call_hero: 500,
      phone_call_footer: 300,
      whatsapp_header: 400,      // WhatsApp (medio valor)
      whatsapp_hero: 400,
      whatsapp_footer: 250,
      form_contact: 600,         // Formulario completo (máximo valor)
      form_quote: 800,           // Cotización (máximo valor)
      lead_submit: 450           // Submit del modal
    };
    
    return values[type] || 450;
  }

  /**
   * Obtiene la moneda para las conversiones
   */
  getCurrency(): string {
    return 'UYU'; // Pesos Uruguayos
  }

  /**
   * Construye el objeto de configuración para gtag
   */
  buildConversionConfig(type: ConversionType, customValue?: number) {
    const value = customValue || this.getConversionValue(type);
    const currency = this.getCurrency();
    
    return {
      'send_to': this.getConversionId(type),
      'value': value,
      'currency': currency,
      'event_callback': () => {
        console.log(`✅ Conversión ${type}: ${value} ${currency}`);
      }
    };
  }
}
