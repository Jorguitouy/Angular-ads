
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 border-b border-gray-100 overflow-hidden">
      <div class="max-w-7xl mx-auto px-4">
        
        <div class="text-center mb-16 md:mb-20">
          <span class="inline-block py-1.5 px-4 rounded-full bg-green-100 text-green-800 font-bold tracking-wide uppercase text-xs md:text-sm mb-4">Proceso Simple</span>
          <h2 class="text-3xl md:text-5xl font-black text-[#1a1a1a]">Reparación en 3 Pasos</h2>
          <p class="text-gray-600 mt-4 max-w-2xl mx-auto text-lg md:text-xl font-medium">Sin vueltas. Diagnóstico rápido y solución en la primera visita.</p>
        </div>

        <div class="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10">
          
          <!-- Línea Conectora (Desktop) -->
          <div class="hidden md:block absolute top-[5rem] left-[16%] right-[16%] h-1 bg-gray-200 -z-10 rounded-full opacity-50"></div>
          
          <!-- Línea Conectora (Móvil) -->
          <div class="md:hidden absolute top-[5rem] bottom-[5rem] left-1/2 w-1 bg-gray-200 -ml-0.5 -z-10 rounded-full opacity-50"></div>

          <!-- Paso 1 -->
          <div class="flex flex-col items-center text-center group">
            <div class="relative mb-8">
              <!-- Contenedor Icono -->
              <div class="w-40 h-40 bg-white border-4 border-gray-50 rounded-full flex items-center justify-center shadow-xl group-hover:scale-105 group-hover:border-green-100 transition-all duration-300 relative z-10">
                <div class="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
              </div>
              <!-- Badge Número -->
              <div class="absolute top-0 right-0 w-12 h-12 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center font-black text-xl border-4 border-white shadow-sm z-20">1</div>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Envía una Foto</h3>
            <p class="text-gray-700 text-base md:text-lg leading-relaxed max-w-[300px] bg-white/60 backdrop-blur-sm p-2 rounded-xl mx-auto">
              Escríbenos por WhatsApp con una foto del calefón. Así sabemos qué repuesto llevar.
            </p>
          </div>

          <!-- Paso 2 -->
          <div class="flex flex-col items-center text-center group">
            <div class="relative mb-8">
              <div class="w-40 h-40 bg-white border-4 border-gray-50 rounded-full flex items-center justify-center shadow-xl group-hover:scale-105 group-hover:border-orange-100 transition-all duration-300 relative z-10">
                <div class="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center text-[#ff6b00]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
              </div>
              <div class="absolute top-0 right-0 w-12 h-12 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center font-black text-xl border-4 border-white shadow-sm z-20">2</div>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Presupuesto Exacto</h3>
            <p class="text-gray-700 text-base md:text-lg leading-relaxed max-w-[300px] bg-white/60 backdrop-blur-sm p-2 rounded-xl mx-auto">
              Te pasamos el costo antes de ir. Si te sirve, coordinamos la visita en el día.
            </p>
          </div>

          <!-- Paso 3 -->
          <div class="flex flex-col items-center text-center group">
            <div class="relative mb-8">
              <div class="w-40 h-40 bg-white border-4 border-gray-50 rounded-full flex items-center justify-center shadow-xl group-hover:scale-105 group-hover:border-blue-100 transition-all duration-300 relative z-10">
                <div class="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
              </div>
              <div class="absolute top-0 right-0 w-12 h-12 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center font-black text-xl border-4 border-white shadow-sm z-20">3</div>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Solución Inmediata</h3>
            <p class="text-gray-700 text-base md:text-lg leading-relaxed max-w-[300px] bg-white/60 backdrop-blur-sm p-2 rounded-xl mx-auto">
              El técnico va con el repuesto en el móvil. Lo repara en una sola visita.
            </p>
          </div>

        </div>
      </div>
    </section>
  `
})
export class HowItWorksComponent {}
