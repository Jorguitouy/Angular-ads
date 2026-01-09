
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-benefits',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-12 md:py-20 bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4">
        
        <div class="text-center mb-10 md:mb-16">
            <span class="text-green-700 font-bold tracking-widest uppercase text-sm mb-3 block">Diferenciales</span>
            <h2 class="text-3xl md:text-5xl font-black text-[#1a1a1a]">Tu casa se respeta.</h2>
        </div>

        <!-- Layout: Vertical Stack (Mobile) / Grid (Desktop) -->
        <div class="flex flex-col gap-6 md:grid md:grid-cols-3 md:gap-12">
          
          <!-- Card 1 -->
          <div class="bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-row md:flex-col items-center md:items-center gap-5 hover:border-green-200 transition-colors">
            <div class="shrink-0 w-16 h-16 md:w-20 md:h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M8 11l4 4 4-4"/></svg>
            </div>
            <div class="flex-1 text-left md:text-center">
              <h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-2">Sin Manchas</h3>
              <p class="text-gray-700 text-base md:text-lg leading-relaxed">
                Usamos cobertores y dejamos el baño/cocina impecable.
              </p>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-row md:flex-col items-center md:items-center gap-5 hover:border-blue-200 transition-colors">
            <div class="shrink-0 w-16 h-16 md:w-20 md:h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </div>
            <div class="flex-1 text-left md:text-center">
              <h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-2">Repuestos Reales</h3>
              <p class="text-gray-700 text-base md:text-lg leading-relaxed">
                Si es James, usamos James. Nada de genéricos chinos.
              </p>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-row md:flex-col items-center md:items-center gap-5 hover:border-purple-200 transition-colors">
            <div class="shrink-0 w-16 h-16 md:w-20 md:h-20 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <div class="flex-1 text-left md:text-center">
              <h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-2">Garantía Escrita</h3>
              <p class="text-gray-700 text-base md:text-lg leading-relaxed">
                6 meses de garantía en mano de obra y piezas.
              </p>
            </div>
          </div>

        </div>
        
      </div>
    </section>
  `
})
export class BenefitsComponent {}
