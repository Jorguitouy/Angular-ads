
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { LocationService } from '../services/location.service';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
      <div class="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        
        <!-- Logo & Static Location Status -->
        <div class="flex flex-col select-none cursor-default">
          <span class="text-2xl md:text-3xl tracking-tight leading-none font-black text-[#1a1a1a]">ServiceCalefones</span>
          
          <!-- Static Location Text -->
          <div class="flex items-center gap-2 mt-1.5 text-left">
            <span class="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25D366]"></span>
            </span>
            <span class="text-xs md:text-sm uppercase tracking-wide text-gray-600 font-bold truncate max-w-[200px] sm:max-w-none">
              Activos en <span class="text-gray-900">{{ locationService.city() }}</span>
            </span>
          </div>
        </div>

        <!-- CTA Button - Mobile Optimized (Más grande y contraste alto) -->
        <a 
          id="btn-call-header"
          [href]="'tel:' + configService.phoneCallEncodigo()" 
          class="group flex items-center gap-2 px-5 py-3 bg-white border-2 border-[#ff6b00] text-[#ff6b00] rounded-full font-bold text-base md:text-lg hover:bg-[#ff6b00] hover:text-white transition-all duration-200 active:scale-95 shadow-sm"
          aria-label="Llamar ahora"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:animate-wiggle">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <!-- VISIBILIDAD DEL NÚMERO PERSONALIZADO -->
          <span class="tracking-wide">{{ configService.phoneCallVisual() }}</span>
        </a>

      </div>
    </header>
  `,
  styles: [`
    @keyframes wiggle {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-10deg); }
      75% { transform: rotate(10deg); }
    }
    .group-hover\\:animate-wiggle {
      animation: wiggle 0.3s ease-in-out;
    }
  `]
})
export class HeaderComponent {
  locationService = inject(LocationService);
  configService = inject(ConfigService);
}
