
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-trust-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-white border-b border-gray-100 py-8 md:py-10">
      <div class="max-w-6xl mx-auto px-4 text-center">
        
        <p class="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-[0.15em] mb-6 md:mb-8">
          Servicio Técnico Especializado
        </p>

        <!-- Logos Grid (Aumentados de tamaño) -->
        <div class="flex flex-wrap justify-center items-center gap-8 md:gap-20 grayscale opacity-80 hover:opacity-100 transition-all duration-300">
          
          <!-- James -->
          <svg class="h-6 md:h-10 w-auto" viewBox="0 0 100 30" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="22" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="24">JAMES</text>
          </svg>

          <!-- Ariston -->
          <svg class="h-6 md:h-10 w-auto" viewBox="0 0 120 30" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="22" text-anchor="middle" font-family="Times New Roman, serif" font-weight="bold" font-style="italic" font-size="24">ARISTON</text>
          </svg>

          <!-- Enxuta -->
          <svg class="h-5 md:h-9 w-auto" viewBox="0 0 110 30" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="22" text-anchor="middle" font-family="Verdana, sans-serif" font-weight="800" font-size="20" letter-spacing="1">ENXUTA</text>
          </svg>

          <!-- Copper -->
          <svg class="h-5 md:h-9 w-auto" viewBox="0 0 110 30" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="22" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="22">COPPER</text>
          </svg>
          
           <!-- Bronx -->
          <svg class="h-6 md:h-10 w-auto" viewBox="0 0 100 30" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="22" text-anchor="middle" font-family="Impact, sans-serif" font-size="24" letter-spacing="1">BRONX</text>
          </svg>

        </div>
      </div>
    </section>
  `
})
export class TrustBarComponent {}
