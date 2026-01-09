
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-stats',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-[#1a1a1a] text-white py-16 border-b border-gray-800">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-6 text-center divide-x divide-gray-800/50">
          
          <!-- Stat 1 -->
          <div class="flex flex-col items-center">
            <span class="text-4xl md:text-5xl font-black text-[#25D366] mb-2">+2.500</span>
            <span class="text-sm md:text-base text-gray-400 uppercase tracking-widest font-bold">Reparaciones</span>
          </div>

          <!-- Stat 2 -->
          <div class="flex flex-col items-center">
            <span class="text-4xl md:text-5xl font-black text-white mb-2">+950</span>
            <span class="text-sm md:text-base text-gray-400 uppercase tracking-widest font-bold">Instalaciones</span>
          </div>

          <!-- Stat 3 -->
          <div class="flex flex-col items-center">
            <span class="text-4xl md:text-5xl font-black text-[#ff6b00] mb-2">100%</span>
            <span class="text-sm md:text-base text-gray-400 uppercase tracking-widest font-bold">Garantía Escrita</span>
          </div>

          <!-- Stat 4 -->
          <div class="flex flex-col items-center">
            <span class="text-4xl md:text-5xl font-black text-white mb-2">15</span>
            <span class="text-sm md:text-base text-gray-400 uppercase tracking-widest font-bold">Años Expertos</span>
          </div>

        </div>
      </div>
    </section>
  `
})
export class StatsComponent {}
