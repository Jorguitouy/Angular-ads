
import { Injectable, inject, Renderer2, RendererFactory2 } from '@angular/core';
import { FingerprintService } from '../components/fingerprint.service';
import { LocationService } from './location.service';

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private renderer: Renderer2;
  private fingerprintService = inject(FingerprintService);
  private locationService = inject(LocationService);
  
  private startTime: number;
  
  // Flags de comportamiento humano
  private hasScrolled = false;
  private hasMovedMouse = false;
  private hasTouched = false;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.startTime = Date.now();
    
    this.initClickListener();
    this.initBehaviorListeners();
  }

  // Detectar si hay un humano real detrás
  private initBehaviorListeners() {
    if (typeof window === 'undefined') return;

    const listenerOptions = { passive: true, once: true };

    window.addEventListener('scroll', () => this.hasScrolled = true, listenerOptions);
    window.addEventListener('mousemove', () => this.hasMovedMouse = true, listenerOptions);
    window.addEventListener('touchstart', () => this.hasTouched = true, listenerOptions);
  }

  private initClickListener() {
    this.renderer.listen('document', 'click', (event: Event) => {
      const target = event.target as HTMLElement;
      
      // 1. Detección de Honeypot (Trampa para Bots)
      if (target.id === 'bot-trap-link' || target.closest('#bot-trap-link')) {
        this.triggerBotTrap();
        event.preventDefault();
        return;
      }

      // 2. Tracking Genérico de Clics (No WhatsApp, esos van por directiva)
      const clickableElement = target.closest('a[id^="btn-"]:not([appWhatsAppTracking]), button[id^="btn-"]');
      if (clickableElement) {
        this.trackClick(clickableElement as HTMLElement);
      }
    });
  }

  // --- NUEVO: TRACKING ESPECÍFICO DE LEADS (WHATSAPP) ---
  public trackLeadIntent(metadata: any) {
    const fingerprint = this.fingerprintService.fingerprint();
    const city = this.locationService.city();
    const now = new Date();

    // UTMs & GCLID (Crucial para Google Ads)
    const urlParams = new URLSearchParams(window.location.search);
    
    const payload = {
      event_type: 'lead_whatsapp_click', // Tipo específico para filtrar en DB
      element_id: metadata.label || 'unknown',
      fingerprint: fingerprint,
      location: city,
      timestamp: now.toISOString(),
      
      // Contexto del problema (ej: "luz_no_calienta")
      keyword: metadata.context?.problemId || urlParams.get('utm_term') || '', 
      
      gclid: urlParams.get('gclid') || '', // ID DE GOOGLE ADS
      campaign: urlParams.get('utm_campaign') || '',
      source: urlParams.get('utm_source') || '',
      
      url: window.location.href,
      referrer: document.referrer,
      
      // Data de seguridad
      is_webdriver: (navigator as any).webdriver || false,
      human_score: (this.hasScrolled ? 1 : 0) + (this.hasMovedMouse ? 1 : 0) + (this.hasTouched ? 1 : 0)
    };

    // Usamos sendBeacon para garantizar el envío aunque la página se cierre
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    navigator.sendBeacon('/api/track-click', blob);

    // Disparar evento a GTM (DataLayer) si existe
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
            'event': 'whatsapp_lead',
            'conversion_value': 100, // Valor estimado
            'lead_type': metadata.context?.problemId || 'general'
        });
    }
  }

  private triggerBotTrap() {
    navigator.sendBeacon('/api/trap-bot', JSON.stringify({ reason: 'honeypot_click' }));
  }

  private trackClick(element: HTMLElement) {
    // ... (Lógica existente para otros clics)
    const id = element.id; 
    const type = id.includes('call') ? 'call' : 'other';
    // Reutilizamos trackLeadIntent pero con tipo genérico
    this.trackLeadIntent({ label: id, context: { type } }); 
  }
}
