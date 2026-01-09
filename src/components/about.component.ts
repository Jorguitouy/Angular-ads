
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ConfigService } from '../services/config.service';
import { WhatsAppTrackingDirective } from '../directives/whatsapp-tracking.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [NgOptimizedImage, WhatsAppTrackingDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-16 md:py-24 bg-white relative overflow-hidden border-b border-gray-50">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          <!-- Content -->
          <div class="order-2 md:order-1">
            <span class="text-green-700 font-bold tracking-widest uppercase text-sm mb-3 block">Sobre Nosotros</span>
            
            <h2 class="text-3xl md:text-5xl font-black text-[#1a1a1a] mb-6 leading-tight">
              Expertos en Arreglo y Service de Calefones en Montevideo.
            </h2>
            
            <div class="prose prose-xl text-gray-700 mb-10 leading-relaxed text-base md:text-xl font-medium">
              <p class="mb-6">
                Sabemos lo frustrante que es quedarse sin agua caliente. La incertidumbre de un calefón roto requiere una solución rápida y experta. 
                En <strong>ServiceCalefones</strong>, somos especialistas en el <strong>arreglo y mantenimiento de termotanques eléctricos</strong> de cobre y acero.
              </p>
              <p class="mb-6">
                A diferencia de una sanitaria general, nos dedicamos 100% al servicio técnico de calefones. Tenemos experiencia comprobada en marcas líderes como <strong>James, Ariston, Copper, Enxuta y Bronx</strong>.
              </p>
              <p>
                Esta especialización nos permite diagnosticar al instante y tener siempre los <strong>repuestos originales</strong> exactos en nuestro taller móvil. 
                Sin improvisaciones. Lo reparamos en el acto, en tu domicilio y con garantía escrita.
              </p>
            </div>

            <ul class="space-y-6 mb-10">
              <li class="flex items-start gap-4">
                <div class="bg-green-100 p-2 rounded-full mt-0.5">
                    <svg class="w-6 h-6 text-green-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div>
                    <span class="text-gray-900 font-bold block text-lg">Empresa Registrada</span>
                    <span class="text-gray-600 text-base">Operamos legalmente con BPS y DGI. Factura oficial.</span>
                </div>
              </li>
              <li class="flex items-start gap-4">
                <div class="bg-green-100 p-2 rounded-full mt-0.5">
                    <svg class="w-6 h-6 text-green-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div>
                    <span class="text-gray-900 font-bold block text-lg">Urgencia 24hs</span>
                    <span class="text-gray-600 text-base">Coordinamos visitas en márgenes de solo 2 horas en todo Montevideo.</span>
                </div>
              </li>
            </ul>

            <a 
              appWhatsAppTracking
              [trackingLabel]="'about_whatsapp'"
              id="btn-whatsapp-about"
              [href]="'https://wa.me/' + configService.phoneWhatsapp()" 
              class="inline-flex items-center font-bold text-[#1a1a1a] border-b-2 border-[#ff6b00] pb-1 hover:text-[#ff6b00] transition-colors text-lg uppercase tracking-wide py-2"
            >
              Solicitar visita técnica
              <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </a>
          </div>

          <!-- Visual -->
          <div class="order-1 md:order-2 relative px-4 md:px-0">
            <!-- Decorative blobs -->
            <div class="absolute -top-4 -right-4 w-32 h-32 bg-gray-100 rounded-full z-0 mix-blend-multiply filter blur-xl opacity-70"></div>
            <div class="absolute -bottom-4 -left-4 w-40 h-40 bg-green-50 rounded-full z-0 mix-blend-multiply filter blur-xl opacity-70"></div>
            
            <div class="relative z-10 rounded-2xl overflow-hidden shadow-2xl rotate-1 hover:rotate-0 transition-all duration-500">
                <img 
                  ngSrc="https://picsum.photos/seed/technicianwork/600/750" 
                  width="600"
                  height="750"
                  alt="Técnico profesional reparando calefón James en Montevideo" 
                  class="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-700"
                >
                
                <!-- Overlay Gradient -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                <!-- Floating Badge -->
                <div class="absolute bottom-6 left-6 right-6 text-white">
                    <p class="font-bold text-xl mb-1">Expertos en Marcas</p>
                    <p class="text-sm text-gray-200 font-medium">James • Ariston • Copper • Enxuta • Bronx</p>
                </div>
            </div>
            
            <!-- Experience Badge Floating -->
            <div class="absolute top-8 -left-2 md:-left-8 bg-white p-5 rounded-xl shadow-lg border-l-4 border-[#ff6b00] z-20 max-w-[200px]">
              <p class="text-xs text-gray-500 uppercase font-bold mb-1 tracking-wider">Trayectoria</p>
              <p class="text-4xl font-black text-gray-900 leading-none">15+</p>
              <p class="text-sm text-gray-600 font-bold mt-1">Años de experiencia</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  `
})
export class AboutComponent {
  configService = inject(ConfigService);
}
