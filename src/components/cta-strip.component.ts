
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ConfigService } from '../services/config.service';
import { WhatsAppTrackingDirective } from '../directives/whatsapp-tracking.directive';

@Component({
  selector: 'app-cta-strip',
  standalone: true,
  imports: [WhatsAppTrackingDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-[#1a1a1a] py-16 px-4 relative overflow-hidden">
      <!-- Decorator Pattern -->
      <div class="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
      <div class="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-green-500/10 blur-3xl"></div>

      <div class="max-w-4xl mx-auto text-center relative z-10">
        <h2 class="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
          No te bañes con agua fría hoy.
        </h2>
        <p class="text-gray-300 mb-10 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
          Nuestros técnicos están en la calle ahora mismo. Si nos escribes ya, es muy probable que lo solucionemos antes de la noche.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-5">
          <a 
             appWhatsAppTracking
             [trackingLabel]="'cta_strip_whatsapp'"
             id="btn-whatsapp-strip"
             [href]="'https://wa.me/' + configService.phoneWhatsapp() + '?text=Hola,%20quiero%20coordinar%20una%20visita%20hoy'" 
             target="_blank"
             class="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#25D366] text-white font-black text-xl px-8 py-5 rounded-2xl hover:bg-[#20bd5a] transition-all transform hover:-translate-y-1 shadow-xl shadow-green-900/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            Solicitar Urgencia
          </a>
          
          <a 
            id="btn-call-strip"
            [href]="'tel:' + configService.phoneCallEncodigo()" 
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-gray-600 text-white font-bold text-lg px-8 py-5 rounded-2xl hover:bg-white hover:text-black transition-colors"
          >
            Llamar ahora
          </a>
        </div>
      </div>
    </section>
  `
})
export class CtaStripComponent {
  configService = inject(ConfigService);
}
