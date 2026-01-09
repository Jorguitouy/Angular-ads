
import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { LocationService } from '../services/location.service';
import { ConfigService } from '../services/config.service';
import { CampaignService } from '../services/campaign.service';
import { WhatsAppTrackingDirective } from '../directives/whatsapp-tracking.directive'; 

interface Problem {
  id: string;
  label: string;
  iconPath: string; 
  description: string;
  severity: 'info' | 'warning' | 'danger';
  whatsappText: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [WhatsAppTrackingDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-[#f8f9fa] pt-8 pb-14 px-4 md:py-20 overflow-hidden relative">
      <!-- Background pattern -->
      <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#444 1px, transparent 1px); background-size: 24px 24px;"></div>

      <div class="max-w-6xl mx-auto text-center relative z-10 flex flex-col items-center">
        
        <!-- WIDGET DE ESTADO (Texto más grande para legibilidad) -->
        <div class="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full pl-1.5 pr-4 py-1.5 mb-6 shadow-sm cursor-default select-none max-w-full">
            <div class="relative w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center">
                 <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
                      [class.bg-green-400]="isWorkingHours()"
                      [class.bg-orange-400]="!isWorkingHours()"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 border border-white shadow-sm"
                      [class.bg-[#25D366]]="isWorkingHours()"
                      [class.bg-[#ff6b00]]="!isWorkingHours()"></span>
            </div>
            
            <div class="text-left flex flex-col justify-center leading-tight">
                <p class="text-[11px] md:text-xs uppercase font-bold text-gray-500 tracking-wide">
                    {{ isWorkingHours() ? 'En tu zona' : 'Guardia Activa' }}
                </p>
                <p class="text-sm md:text-base font-bold text-gray-900 truncate">
                    @if (isWorkingHours()) {
                        Móvil cerca de <span class="text-green-700">{{ locationService.city() }}</span>
                    } @else {
                        Técnico de Urgencia <span class="text-[#ff6b00]">Online</span>
                    }
                </p>
            </div>
        </div>

        <h1 class="text-3xl sm:text-4xl md:text-6xl font-black text-[#1a1a1a] mb-4 tracking-tight leading-[1.1]">
          {{ dynamicHeadline() }}
          <span class="text-gray-600 text-2xl sm:text-3xl md:text-5xl block mt-2 font-extrabold">
            {{ dynamicSubheadline() }}
          </span>
        </h1>
        
        <p class="text-base sm:text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto px-2 leading-relaxed font-medium">
          {{ dynamicDescription() }}
        </p>

        <!-- Triage Grid (Botones masivos para dedos grandes) -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl mx-auto mb-8">
          @for (problem of problems; track problem.id) {
            <button 
              type="button"
              (click)="selectProblem(problem)"
              [class]="getButtonClass(problem)"
              class="min-h-[100px] md:min-h-[120px]" 
            >
              <div 
                class="mb-3 p-2.5 rounded-full transition-colors duration-300" 
                [class]="getIconClass(problem)"
              >
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path [attr.d]="problem.iconPath"></path>
                  @if (problem.id === 'luz_no_calienta') { <path d="M12 2v2"/><path d="M12 20v2"/><path d="M5 12H3"/><path d="M21 12h-2"/> }
                  @if (problem.id === 'calienta_continuo') { <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3a1 1 0 0 1 .9 2.5z"/> }
                  @if (problem.id === 'pierde_agua') { <path d="M12 17a2.5 2.5 0 0 1-2.5-2.5"/> }
                </svg>
              </div>
              <span class="font-bold text-sm sm:text-base md:text-lg leading-tight text-gray-800 px-1" [innerHTML]="problem.label"></span>
            </button>
          }
        </div>

        <!-- Diagnosis Card (Fuente aumentada) -->
        @if (selectedProblem(); as problem) {
          <div class="animate-fade-in-up w-full max-w-2xl mx-auto mb-8 bg-white border-l-8 rounded-r-xl shadow-lg p-5 sm:p-6 text-left flex gap-4 items-start"
               [class.border-red-500]="problem.severity === 'danger'"
               [class.border-orange-400]="problem.severity === 'warning'"
               [class.border-blue-500]="problem.severity === 'info'">
            
            <div class="flex-shrink-0 mt-0.5">
               @if (problem.severity === 'danger') {
                 <div class="text-red-600 bg-red-100 p-2 rounded-full"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>
               } @else {
                 <div class="text-blue-600 bg-blue-100 p-2 rounded-full"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
               }
            </div>

            <div>
              <h3 class="font-bold text-gray-900 text-base sm:text-lg mb-1">Diagnóstico Preliminar:</h3>
              <p class="text-gray-700 text-sm sm:text-base leading-relaxed font-medium">{{ problem.description }}</p>
            </div>
          </div>
        }

        <!-- CTA Principal (Botón Gigante) -->
        <div class="w-full max-w-lg px-2 flex flex-col items-center">
          <a 
            appWhatsAppTracking
            [trackingLabel]="'hero_whatsapp'"
            [trackingContext]="{ problemId: selectedProblem()?.id, severity: selectedProblem()?.severity }"
            [href]="whatsappLink()"
            target="_blank"
            rel="noopener noreferrer"
            class="relative w-full md:w-auto min-w-[300px] inline-flex items-center justify-center gap-4 bg-[#25D366] text-white font-black text-xl md:text-2xl py-5 px-8 rounded-2xl shadow-xl hover:bg-[#20bd5a] active:scale-[0.98] transition-all transform hover:-translate-y-1"
            [class.animate-pulse-subtle]="!selectedProblem()"
          >
            @if (selectedProblem()) {
              <span class="absolute inset-0 rounded-2xl bg-white/20 animate-pulse"></span>
            }
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            <span class="z-10 relative">{{ buttonText() }}</span>
          </a>

          <div class="mt-6 flex flex-col items-center">
             <p class="text-base text-gray-600 font-semibold">Línea directa: <a [href]="'tel:' + configService.phoneCallEncodigo()" class="text-black font-black text-lg tracking-wide hover:underline">{{ configService.phoneCallVisual() }}</a></p>
             
             <a href="#contacto" class="mt-3 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors border-b border-dashed border-gray-400 hover:border-blue-500 pb-0.5">
               ¿Prefieres por correo? Formulario aquí
             </a>
          </div>
        </div>

      </div>
    </section>
  `,
  styles: [`
    .animate-pulse-subtle { animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    @keyframes pulse-subtle {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: .95; transform: scale(0.98); }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.4s ease-out forwards;
    }
  `]
})
export class HeroComponent {
  locationService = inject(LocationService);
  configService = inject(ConfigService);
  campaignService = inject(CampaignService);

  selectedProblem = signal<Problem | null>(null);
  isWorkingHours = signal(true);

  constructor() {
    this.checkTime();
  }

  checkTime() {
    try {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = { 
            timeZone: "America/Montevideo", 
            hour: 'numeric', 
            minute: 'numeric', 
            hour12: false 
        };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const parts = formatter.formatToParts(now);
        
        const hourPart = parts.find(p => p.type === 'hour')?.value;
        const minutePart = parts.find(p => p.type === 'minute')?.value;

        if (hourPart && minutePart) {
            const currentHour = parseInt(hourPart);
            const currentMinute = parseInt(minutePart);
            const decimalTime = currentHour + (currentMinute / 60);
            this.isWorkingHours.set(decimalTime >= 7 && decimalTime < 20);
        }
    } catch (e) {
        this.isWorkingHours.set(true);
    }
  }
  
  dynamicHeadline = computed(() => {
    const brand = this.campaignService.brand();
    if (brand) return `Servicio Técnico ${brand}`;
    return `Service de Calefones`;
  });

  dynamicSubheadline = computed(() => {
    const brand = this.campaignService.brand();
    if (brand) return `Repuestos originales y garantía.`;
    return `Reparación multimarca en el día.`;
  });

  dynamicDescription = computed(() => {
    const brand = this.campaignService.brand();
    const city = this.locationService.city();
    if (brand) {
      return `Expertos en ${brand}. Vamos a ${city} en el acto con repuestos originales.`;
    }
    return `Líderes en reparación de calefones en ${city}. Solucionamos problemas de encendido y pérdidas en una sola visita.`;
  });

  problems: Problem[] = [
    {
      id: 'luz_no_calienta',
      label: 'Luz prende,<br>no calienta',
      iconPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
      description: 'Falla común: Resistencia quemada o termostato. Se repara en 20 minutos en tu domicilio.',
      severity: 'info',
      whatsappText: 'Hola, mi calefón prende la luz pero NO calienta'
    },
    {
      id: 'pierde_agua',
      label: 'Pierde agua<br>/ Gotea',
      iconPath: 'M12 2.69l5.74 5.88a6 6 0 0 1-8.48 8.48A6 6 0 0 1 5.8 8.57L12 2.69z',
      description: 'Generalmente es una junta reseca, no el tanque. Tiene arreglo rápido y económico.',
      severity: 'info',
      whatsappText: 'Hola, mi calefón pierde agua por abajo'
    },
    {
      id: 'salta_llave',
      label: 'Salta la<br>llave',
      iconPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
      description: '¡Peligro! Cortocircuito interno. Desconectar y no usar hasta que vaya el técnico.',
      severity: 'danger',
      whatsappText: 'URGENTE: Mi calefón hace saltar la llave'
    },
    {
      id: 'no_prende',
      label: 'No prende<br>nada',
      iconPath: 'M18.36 6.64a9 9 0 1 1-12.73 0',
      description: 'Puede ser el enchufe o el térmico de seguridad. Diagnóstico necesario.',
      severity: 'warning',
      whatsappText: 'Hola, mi calefón no prende ninguna luz'
    },
    {
      id: 'agua_tibia',
      label: 'Sale tibia<br>/ Poca',
      iconPath: 'M14 4v10.54a4 4 0 1 1-4.004-3.004V4a2 2 0 0 1 4 0Z',
      description: 'Probable sarro acumulado o termostato descalibrado. Limpieza profunda recomendada.',
      severity: 'info',
      whatsappText: 'Hola, el agua sale tibia o con poca presión'
    },
    {
      id: 'calienta_continuo',
      label: 'No corta<br>(Hierve)',
      iconPath: '', 
      description: 'Urgencia. El termostato quedó pegado. Desenchufar ya para evitar rotura.',
      severity: 'danger',
      whatsappText: 'URGENTE: Mi calefón no corta, calienta siempre'
    }
  ];

  selectProblem(problem: Problem) { this.selectedProblem.set(problem); }

  getButtonClass(problem: Problem): string {
    const isSelected = this.selectedProblem()?.id === problem.id;
    const base = "group flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 h-full w-full active:scale-[0.95] cursor-pointer touch-manipulation relative overflow-hidden select-none";
    if (isSelected) {
      if (problem.severity === 'danger') return `${base} border-red-500 bg-red-50 ring-2 ring-red-500 shadow-lg transform scale-[1.02]`;
      if (problem.severity === 'warning') return `${base} border-orange-400 bg-orange-50 ring-2 ring-orange-400 shadow-lg transform scale-[1.02]`;
      return `${base} border-[#25D366] bg-green-50 ring-2 ring-[#25D366] shadow-lg transform scale-[1.02]`;
    }
    return `${base} border-gray-200 bg-white shadow-sm hover:border-gray-400 hover:shadow-md`;
  }

  getIconClass(problem: Problem): string {
    const isSelected = this.selectedProblem()?.id === problem.id;
    if (isSelected) {
      if (problem.severity === 'danger') return 'text-red-600 bg-white';
      if (problem.severity === 'warning') return 'text-orange-600 bg-white';
      return 'text-[#25D366] bg-white';
    }
    if (problem.severity === 'danger') return 'text-red-500 bg-red-50';
    if (problem.severity === 'warning') return 'text-orange-500 bg-orange-50';
    return 'text-blue-500 bg-blue-50';
  }

  whatsappLink = computed(() => {
    const phone = this.configService.phoneWhatsapp(); 
    const loc = this.locationService.city();
    const problem = this.selectedProblem();
    const brand = this.campaignService.brand(); 
    
    let text = "";
    if (problem) {
      text = `${problem.whatsappText} en zona ${loc}.`;
      if (brand) text += ` Es un calefón ${brand}.`;
    } else {
      text = `Hola, necesito service para mi calefón${brand ? ' ' + brand : ''} en ${loc}.`;
    }
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  });

  buttonText = computed(() => {
    const p = this.selectedProblem();
    if (!p) return "Consultar por WhatsApp";
    if (p.severity === 'danger') return "Solicitar Urgencia";
    return "Pedir Presupuesto";
  });
}
