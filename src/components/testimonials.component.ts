
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-12 md:py-24 bg-[#f8f9fa] border-t border-gray-100">
      <div class="max-w-7xl mx-auto px-4">
        
        <h2 class="text-3xl md:text-4xl font-black text-center mb-10 md:mb-16 text-[#1a1a1a]">
          Vecinos que ya tienen agua caliente
        </h2>

        <!-- Mobile: Carousel | Desktop: Grid -->
        <div class="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-6 md:grid md:grid-cols-3 md:gap-10 md:pb-0 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          
          <!-- Review 1 -->
          <div class="flex-shrink-0 w-[88vw] md:w-auto snap-center bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div class="flex text-[#ff6b00] mb-4">
              @for (star of [1,2,3,4,5]; track star) {
                <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              }
            </div>
            <p class="text-gray-700 text-base md:text-lg italic flex-grow mb-6 leading-relaxed">
              "Llamé un domingo porque el calefón perdía agua y vinieron a las 2 horas. El técnico súper amable y dejó todo limpio."
            </p>
            <div class="flex items-center gap-4 mt-auto">
              <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-sm">SR</div>
              <div>
                <div class="font-bold text-[#1a1a1a] text-base md:text-lg">Sofía R.</div>
                <div class="text-xs text-gray-500 font-bold uppercase tracking-wide">Pocitos</div>
              </div>
            </div>
          </div>

          <!-- Review 2 -->
          <div class="flex-shrink-0 w-[88vw] md:w-auto snap-center bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div class="flex text-[#ff6b00] mb-4">
              @for (star of [1,2,3,4,5]; track star) {
                <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              }
            </div>
            <p class="text-gray-700 text-base md:text-lg italic flex-grow mb-6 leading-relaxed">
              "Tengo un calefón James viejo. Otros me decían de cambiarlo, ellos le cambiaron la resistencia y anda perfecto."
            </p>
            <div class="flex items-center gap-4 mt-auto">
              <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-sm">JM</div>
              <div>
                <div class="font-bold text-[#1a1a1a] text-base md:text-lg">Jorge M.</div>
                <div class="text-xs text-gray-500 font-bold uppercase tracking-wide">Malvín</div>
              </div>
            </div>
          </div>

          <!-- Review 3 -->
          <div class="flex-shrink-0 w-[88vw] md:w-auto snap-center bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div class="flex text-[#ff6b00] mb-4">
              @for (star of [1,2,3,4,5]; track star) {
                <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              }
            </div>
            <p class="text-gray-700 text-base md:text-lg italic flex-grow mb-6 leading-relaxed">
              "Excelente servicio. Me pasaron presupuesto por WhatsApp con una foto y cobraron exactamente eso."
            </p>
            <div class="flex items-center gap-4 mt-auto">
              <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-sm">LG</div>
              <div>
                <div class="font-bold text-[#1a1a1a] text-base md:text-lg">Lucía G.</div>
                <div class="text-xs text-gray-500 font-bold uppercase tracking-wide">Cordón</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  `
})
export class TestimonialsComponent {}
