
import { Component, ChangeDetectionStrategy, computed, signal, inject } from '@angular/core';
import { ConfigService } from '../services/config.service';
import { WhatsAppTrackingDirective } from '../directives/whatsapp-tracking.directive';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [WhatsAppTrackingDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-[#1a1a1a] text-white py-16 pb-32 md:pb-16 border-t border-gray-800 relative">
      
      <!-- HONEYPOT TRAP: Invisible para humanos, irresistible para bots -->
      <a href="/api/trap-bot" id="bot-trap-link" aria-hidden="true" tabindex="-1" style="position: absolute; left: -9999px; top: -9999px; visibility: hidden;">Do not click here</a>

      <div class="max-w-6xl mx-auto px-4">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          <div>
            <h3 class="text-2xl font-black mb-6 text-white">Service de Calefones Montevideo</h3>
            <p class="text-gray-400 text-base leading-relaxed max-w-md mb-8">
              Servicio técnico profesional, rápido y honesto. Especialistas en todas las marcas del mercado uruguayo con más de 15 años de experiencia.
            </p>
            <div class="flex gap-4">
                <a 
                  appWhatsAppTracking
                  [trackingLabel]="'footer_icon_whatsapp'"
                  id="btn-whatsapp-footer"
                  [href]="'https://wa.me/' + configService.phoneWhatsapp()" 
                  class="text-gray-400 hover:text-[#25D366] transition-colors p-2 -ml-2 rounded-full hover:bg-gray-800"
                  aria-label="WhatsApp"
                >
                    <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                </a>
            </div>
          </div>
          
          <div>
            <h3 class="text-xl font-bold mb-6 text-white">Cobertura Principal</h3>
            <div class="flex flex-wrap gap-3">
              <span class="px-4 py-2 bg-gray-800 rounded-lg text-sm text-gray-300 border border-gray-700">Pocitos</span>
              <span class="px-4 py-2 bg-gray-800 rounded-lg text-sm text-gray-300 border border-gray-700">Cordón</span>
              <span class="px-4 py-2 bg-gray-800 rounded-lg text-sm text-gray-300 border border-gray-700">Centro</span>
              <span class="px-4 py-2 bg-gray-800 rounded-lg text-sm text-gray-300 border border-gray-700">Malvín</span>
              <span class="px-4 py-2 bg-gray-800 rounded-lg text-sm text-gray-300 border border-gray-700">Carrasco</span>
              <span class="px-4 py-2 bg-gray-800 rounded-lg text-sm text-gray-300 border border-gray-700">La Blanqueada</span>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-800 pt-10 text-center text-sm text-gray-500 flex flex-col items-center gap-4">
          <p>&copy; {{ year() }} ServiceCalefones. Todos los derechos reservados.</p>
          
          <!-- LEGAL LINKS (Requerido para Google Ads) -->
          <div class="flex gap-6 mt-2">
            <a href="#" class="hover:text-gray-300 transition-colors p-2">Política de Privacidad</a>
            <span class="text-gray-700 py-2">|</span>
            <a href="#" class="hover:text-gray-300 transition-colors p-2">Términos de Servicio</a>
          </div>
          <p class="max-w-2xl mx-auto mt-2 opacity-50 text-xs leading-relaxed">
            Este sitio utiliza cookies para mejorar la experiencia de usuario y medir el rendimiento de nuestros anuncios. 
            Al continuar navegando, aceptas nuestra política de privacidad.
          </p>
        </div>

      </div>
    </footer>
  `
})
export class FooterComponent {
    configService = inject(ConfigService);
    year = signal(new Date().getFullYear());
}
