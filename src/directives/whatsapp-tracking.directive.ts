
import { Directive, HostListener, Input, inject } from '@angular/core';
import { TrackingService } from '../services/tracking.service';
import { LeadGateService } from '../services/lead-gate.service';

@Directive({
  selector: 'a[appWhatsAppTracking]',
  standalone: true
})
export class WhatsAppTrackingDirective {
  private trackingService = inject(TrackingService);
  private leadGateService = inject(LeadGateService);

  @Input() trackingLabel: string = 'generic_whatsapp';
  @Input() trackingContext: any = {}; 

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    // 1. Prevenir navegación inmediata
    event.preventDefault();
    
    const target = event.currentTarget as HTMLAnchorElement;
    const url = target.href;

    // 2. Metadata para tracking silencioso
    const metadata = {
      label: this.trackingLabel,
      context: this.trackingContext,
      url: url
    };

    // 3. Tracking Forense (Se ejecuta siempre, incluso si no llenan el modal)
    this.trackingService.trackLeadIntent(metadata);

    // 4. Activar el Gatekeeper (Modal)
    // El servicio decidirá si muestra el modal o deja pasar si ya tenemos los datos
    this.leadGateService.triggerGate(url, this.trackingContext);
  }
}
