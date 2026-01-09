
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ConfigService } from '../services/config.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Inyección de Schema para Rich Snippets en Google -->
    <div [innerHTML]="jsonLD()"></div>

    <section class="py-16 md:py-24 bg-white border-t border-gray-100" id="faq">
      <div class="max-w-6xl mx-auto px-4">
        
        <div class="text-center mb-12 md:mb-16">
          <span class="inline-block py-1.5 px-4 rounded-full bg-blue-50 text-blue-700 font-bold tracking-wide uppercase text-xs md:text-sm mb-4">Centro de Ayuda</span>
          <h2 class="text-3xl md:text-5xl font-black text-[#1a1a1a] mb-4">Preguntas Frecuentes</h2>
          <p class="text-gray-600 text-base md:text-xl max-w-3xl mx-auto leading-relaxed">
            Resolvemos tus dudas sobre reparación de calefones en Montevideo antes de la visita.
          </p>
        </div>
        
        <!-- Grid de 2 Columnas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          
          <!-- Columna Izquierda -->
          <div class="space-y-4">
            @for (item of leftColumn; track item.question) {
              <ng-container *ngTemplateOutlet="faqItem; context: { $implicit: item }"></ng-container>
            }
          </div>

          <!-- Columna Derecha -->
          <div class="space-y-4">
            @for (item of rightColumn; track item.question) {
              <ng-container *ngTemplateOutlet="faqItem; context: { $implicit: item }"></ng-container>
            }
          </div>

        </div>
        
        <!-- Template Reutilizable para el Acordeón -->
        <ng-template #faqItem let-item>
          <details name="faq-group" class="group bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg open:ring-2 open:ring-blue-100 open:bg-gray-50/50">
            <summary class="flex justify-between items-start w-full p-6 text-left cursor-pointer list-none outline-none select-none">
              <!-- H3 para jerarquía SEO -->
              <h3 class="text-base md:text-lg font-bold text-gray-900 pr-6 leading-snug group-hover:text-blue-700 transition-colors m-0">
                {{ item.question }}
              </h3>
              <span class="flex-shrink-0 mt-0.5 bg-gray-100 rounded-full p-2 transition-all duration-300 group-open:rotate-180 group-open:bg-blue-600 group-open:text-white text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            </summary>
            
            <div class="px-6 pb-6 pt-0 text-gray-700 text-base md:text-lg leading-relaxed animate-accordion-down">
              <div [innerHTML]="item.answer"></div>
              
              @if (item.action) {
                <div class="mt-5 pt-4 border-t border-gray-200/60">
                    <a [href]="getWhatsAppLink(item.whatsappText)" target="_blank" class="inline-flex items-center gap-2 text-base font-bold text-green-700 hover:text-green-800 transition-colors p-2 -ml-2 rounded-lg hover:bg-green-50">
                      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                      {{ item.action }}
                    </a>
                </div>
              }
            </div>
          </details>
        </ng-template>
        
        <div class="mt-12 text-center">
             <p class="text-gray-600 text-base md:text-lg mb-4">¿No encontraste lo que buscabas?</p>
             <a [href]="getWhatsAppLink('Hola, necesito hacer una consulta técnica')" target="_blank" class="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-lg py-4 px-8 rounded-full transition-all shadow-md hover:shadow-lg active:scale-95">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                Consulta Directa
             </a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    details > summary {
      list-style: none;
    }
    details > summary::-webkit-details-marker {
      display: none;
    }
    
    @keyframes accordionDown {
      from { opacity: 0; transform: translateY(-5px); max-height: 0; }
      to { opacity: 1; transform: translateY(0); max-height: 999px; }
    }
    .animate-accordion-down {
      animation: accordionDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
  `]
})
export class FaqComponent {
  configService = inject(ConfigService);
  private sanitizer = inject(DomSanitizer);

  getWhatsAppLink(text: string) {
    return `https://wa.me/${this.configService.phoneWhatsapp()}?text=${encodeURIComponent(text)}`;
  }
  
  faqs = [
    {
      question: '¿Por qué mi calefón enciende la luz pero no calienta?',
      answer: `Es la falla más común. Significa que la resistencia está quemada o el termostato cortado. <strong>Se arregla en el día</strong>. Llevamos el repuesto en el móvil.`,
      action: 'Solicitar Presupuesto',
      whatsappText: 'Hola, mi calefon enciende la luz pero no calienta'
    },
    {
      question: '¿Qué hago si mi calefón hace saltar la llave térmica?',
      answer: `<strong>¡Peligro!</strong> Desconéctalo inmediatamente. Tienes un cortocircuito. Es necesario cambiar la resistencia blindada para evitar descargas eléctricas.`,
      action: 'Reportar Urgencia Eléctrica',
      whatsappText: 'URGENTE: Mi calefon hace saltar la llave'
    },
    {
      question: '¿Mi calefón no prende ninguna luz ni calienta, qué es?',
      answer: `Puede haberse activado el botón de seguridad (reset) o quemado el enchufe. <strong>No lo abras tú mismo.</strong> Un técnico debe verificar por qué saltó la seguridad.`,
      action: 'Consultar Diagnóstico',
      whatsappText: 'Hola, mi calefon no prende ni calienta'
    },
    {
      question: '¿Tiene solución un calefón que pierde agua por abajo?',
      answer: `Sí, en el 80% de los casos. Generalmente es una junta de goma reseca que vale poco dinero cambiar. Si es el tanque pinchado, te avisamos honestamente.`,
      action: 'Pedir Revisión de Fuga',
      whatsappText: 'Hola, mi calefon pierde agua por abajo'
    },
    {
      question: '¿Por qué sale poca agua caliente (sin presión)?',
      answer: `Es sarro acumulado en la entrada. Realizamos la limpieza y desincrustación de cañerías para recuperar la presión normal de tu ducha.`,
      action: null,
      whatsappText: ''
    },
    {
      question: '¿Instalan calefones nuevos comprados por el cliente?',
      answer: `¡Sí! Instalamos cualquier marca. Incluye fijación segura, conexión de agua y eléctrica. Retiramos el viejo gratis si quieres.`,
      action: 'Coordinar Instalación',
      whatsappText: 'Hola, quiero instalar un calefon'
    },
    {
      question: '¿Qué marcas de calefones reparan?',
      answer: `Todas. Somos multimarca: <strong>James, Ariston, Enxuta, Copper, Bronx, Sirium, Panavox, Bosch, Thermor, Tem</strong> y más.`,
      action: null,
      whatsappText: ''
    },
    {
      question: '¿Cuánto tiempo de garantía tiene la reparación?',
      answer: `Te damos <strong>6 meses de garantía escrita</strong>. Si falla lo mismo, volvemos sin cargo.`,
      action: null,
      whatsappText: ''
    }
  ];

  // Generación Dinámica de Schema.org FAQPage (JSON-LD)
  jsonLD = computed((): SafeHtml => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": this.faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer.replace(/<[^>]*>?/gm, '') 
        }
      }))
    };

    return this.sanitizer.bypassSecurityTrustHtml(
      `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
    );
  });

  get leftColumn() {
    const mid = Math.ceil(this.faqs.length / 2);
    return this.faqs.slice(0, mid);
  }

  get rightColumn() {
    const mid = Math.ceil(this.faqs.length / 2);
    return this.faqs.slice(mid);
  }
}
