import { Directive, HostListener, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LeadGateService } from '../services/lead-gate.service';
import { TurnstileService } from '../services/turnstile.service';

@Directive({
  selector: 'a[appPhoneTracking]',
  standalone: true
})
export class PhoneTrackingDirective {
  private leadGateService = inject(LeadGateService);
  private turnstileService = inject(TurnstileService);
  private router = inject(Router);

  @Input() trackingLabel: string = 'phone_call';
  @Input() trackingContext: any = {};
  @Input() phoneNumber: string = '59896758200';

  private isVerifying = false;
  private scriptPreloaded = false;

  @HostListener('mouseenter')
  onMouseEnter() {
    // Pre-cargar script Turnstile en hover
    if (!this.scriptPreloaded) {
      this.turnstileService.preload();
      this.scriptPreloaded = true;
    }
  }

  @HostListener('click', ['$event'])
  async onClick(event: MouseEvent) {
    // Prevenir acción inmediata
    event.preventDefault();
    
    if (this.isVerifying) {
      return; // Evitar múltiples clicks durante verificación
    }

    const target = event.currentTarget as HTMLAnchorElement;
    const originalContent = target.innerHTML;
    
    try {
      this.isVerifying = true;
      
      // Mostrar estado de verificación
      target.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Verificando...';
      target.style.pointerEvents = 'none';
      
      // Verificar Turnstile
      const isValid = await this.turnstileService.verify();
      
      if (isValid) {
        // Verificación exitosa - abrir modal
        const phoneUrl = `tel:${this.phoneNumber}`;
        
        // Pasar contexto para que el modal sepa que debe redirigir a llamada después del submit
        const context = {
          ...this.trackingContext,
          action: 'phone_call',
          redirectUrl: phoneUrl,
          conversionType: 'phone_call_hero' // Tipo específico de conversión
        };
        
        this.leadGateService.triggerGate(phoneUrl, context);
      } else {
        // Verificación fallida
        target.innerHTML = '<i class="bi bi-shield-x me-2"></i>Verificación fallida';
        setTimeout(() => {
          target.innerHTML = originalContent;
          target.style.pointerEvents = '';
        }, 2000);
      }
    } catch (error) {
      console.error('Error en verificación de teléfono:', error);
      target.innerHTML = '<i class="bi bi-exclamation-triangle me-2"></i>Error';
      setTimeout(() => {
        target.innerHTML = originalContent;
        target.style.pointerEvents = '';
      }, 2000);
    } finally {
      this.isVerifying = false;
      if (target.innerHTML.includes('Verificando')) {
        target.style.pointerEvents = '';
      }
    }
  }
}
