
import { Injectable, signal, inject } from '@angular/core';
import { ContactService } from './contact.service';
import { CampaignService } from './campaign.service';
import { ConfigService } from './config.service';
import { TrackingService } from './tracking.service';
import { ConversionService, ConversionType } from './conversion.service';

export interface PendingAction {
  url: string;
  context: any;
}

@Injectable({
  providedIn: 'root'
})
export class LeadGateService {
  private contactService = inject(ContactService);
  private campaignService = inject(CampaignService);
  private configService = inject(ConfigService);
  private trackingService = inject(TrackingService);
  private conversionService = inject(ConversionService);

  // Estado del Modal
  isOpen = signal(false);
  
  // Guardamos la acción que el usuario quería hacer (ir a WhatsApp)
  pendingAction = signal<PendingAction | null>(null);

  // ¿Ya tenemos sus datos? (Persistencia básica)
  private readonly STORAGE_KEY = 'sc_user_lead_data';

  constructor() {
    this.checkExistingLead();
  }

  private checkExistingLead() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        // Datos ya existentes
      }
    }
  }

  isLeadIdentified(): boolean {
    // Retornamos false para mostrar siempre el modal (con pre-llenado)
    return false;
  }

  triggerGate(url: string, context: any) {
    if (this.isLeadIdentified()) {
      window.open(url, '_blank');
    } else {
      this.pendingAction.set({ url, context });
      this.isOpen.set(true);
    }
  }

  close() {
    this.isOpen.set(false);
  }

  async submitLead(
      name: string, 
      phone: string, 
      countryCode: string, 
      intent: 'quote' | 'visit' = 'quote', 
      timePreference?: string,
      turnstileToken?: string
  ) {
    // 1. Guardar en LocalStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ name, phone, date: new Date().toISOString() }));
    }

    // 2. Construir Mensaje Personalizado según Intención
    const action = this.pendingAction();
    const context = action?.context || {};
    const brand = this.campaignService.brand() || 'Genérica';
    
    const problemMap: Record<string, string> = {
      'luz_no_calienta': 'Luz prende pero no calienta',
      'no_prende': 'Totalmente apagado / No enciende',
      'salta_llave': 'Hace saltar la llave (Cortocircuito)',
      'pierde_agua': 'Pierde agua / Gotea',
      'agua_tibia': 'Agua sale tibia / Poca temperatura',
      'calienta_continuo': 'No corta / Calienta continuo'
    };

    const problemText = context.problemId ? (problemMap[context.problemId] || context.problemId) : 'Consulta General';
    const severityText = context.severity ? `[Prioridad: ${context.severity.toUpperCase()}]` : '';

    // HEADER DIFERENTE
    let header = "💬 CONSULTA DE PRESUPUESTO";
    let subHeader = `Hola, quisiera saber el costo estimado de reparación.`;
    
    if (intent === 'visit') {
       header = "📅 SOLICITUD DE VISITA TÉCNICA";
       subHeader = `Hola, solicito visita técnica. Mis datos de contacto son correctos.`;
    }

    // PREFERENCIA HORARIA
    let timeText = "";
    if (timePreference) {
        const timeMap: Record<string, string> = {
            'urgente': 'URGENTE (Lo antes posible)',
            'mañana': 'Mañana (08-13hs)',
            'tarde': 'Tarde (13-18hs)',
            'coordinar': 'A coordinar'
        };
        timeText = `⏰ Preferencia: ${timeMap[timePreference] || timePreference}`;
    }

    const formattedMessage = `
*${header}*
${subHeader}

Problema: ${problemText}
Marca: ${brand}
${severityText}
${timeText}

Nombre: ${name}
    `.trim();

    const fullPhone = `(${countryCode}) ${phone}`;
    
    // Envío silencioso al backend (Gatekeeper)
    this.contactService.sendMessage({
      name: name,
      phone: fullPhone,
      email: 'lead_gatekeeper@whatsapp.click',
      message: formattedMessage,
      turnstileToken: turnstileToken || 'SKIP_INTERNAL',
      deviceFingerprint: `GATEKEEPER_${intent.toUpperCase()}`
    }).subscribe({
      next: () => console.log('Lead secured'),
      error: (err) => console.error('Lead save error', err)
    });

    // 3. Ejecutar la redirección original o personalizada
    if (action) {
      setTimeout(() => {
        // Verificar si hay una URL de redirección personalizada
        const redirectUrl = action.context?.redirectUrl;
        
        if (redirectUrl) {
          // Usar URL personalizada (tel: o https://wa.me/)
          window.location.href = redirectUrl;
        } else {
          // Comportamiento por defecto: WhatsApp
          const phoneWa = this.configService.phoneWhatsapp() || '59896758200';
          const targetUrl = `https://wa.me/${phoneWa}?text=${encodeURIComponent(formattedMessage)}`;
          window.open(targetUrl, '_blank');
        }
        
        // Disparar conversión si está configurada
        const conversionType = action.context?.conversionType;
        if (conversionType) {
          // Usar el nuevo sistema con tipos específicos
          this.trackingService.trackConversion(conversionType, action.context?.action);
        } else {
          // Fallback a sistema legacy si no hay tipo específico
          const conversionLabel = action.context?.conversionLabel;
          if (conversionLabel) {
            this.trackingService.trackConversionByLabel(conversionLabel, action.context?.action || 'lead_submit');
          }
        }
        
        this.isOpen.set(false);
        this.pendingAction.set(null);
      }, 500);
    }
  }
}
