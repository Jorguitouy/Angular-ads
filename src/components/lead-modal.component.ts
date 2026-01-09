import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { LeadGateService } from "../services/lead-gate.service";
import { ConfigService } from "../services/config.service";
import { TurnstileService } from "../services/turnstile.service";
import { NgClass } from "@angular/common";

interface Country {
  name: string;
  dial: string;
  code: string;
  flag: string;
}

type UserIntent = "quote" | "visit";

@Component({
  selector: "app-lead-modal",
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (leadService.isOpen()) {
    <div
      class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        (click)="leadService.close()"
      ></div>

      <!-- Modal Panel -->
      <div
        class="relative bg-white w-full sm:w-[480px] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up h-[90vh] sm:h-auto flex flex-col max-h-[90vh]"
      >
        <!-- Header -->
        <div
          class="bg-[#1a1a1a] p-6 text-white flex justify-between items-start flex-shrink-0"
        >
          <div>
            <p
              class="font-bold text-xs tracking-widest uppercase mb-1"
              [class.text-[#25D366]]="intent() === 'quote'"
              [class.text-[#ff6b00]]="intent() === 'visit'"
            >
              @if (intent() === 'visit') { MODO URGENCIA } @else { PASO FINAL }
            </p>
            <h3 class="text-2xl font-black leading-tight">
              @if (intent() === 'visit') { Solicitar Técnico } @else { Confirmar
              Solicitud }
            </h3>
          </div>
          <button
            (click)="leadService.close()"
            class="text-gray-400 hover:text-white transition-colors p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Intent Selector (Big Tiles) -->
        <div class="px-6 pt-6 pb-2">
          <p
            class="text-xs font-bold text-gray-500 uppercase mb-3 text-center tracking-wide"
          >
            ¿Qué necesitas realizar ahora?
          </p>
          <div class="flex gap-3">
            <!-- Botón Consultar Costo -->
            <button
              type="button"
              (click)="setIntent('quote')"
              class="flex-1 relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 gap-2 group min-h-[100px]"
              [class.border-gray-100]="intent() !== 'quote'"
              [class.bg-gray-50]="intent() !== 'quote'"
              [class.text-gray-500]="intent() !== 'quote'"
              [class.border-[#25D366]]="intent() === 'quote'"
              [class.bg-green-50]="intent() === 'quote'"
              [class.text-green-700]="intent() === 'quote'"
              [class.shadow-md]="intent() === 'quote'"
            >
              <!-- Checkmark Badge -->
              @if (intent() === 'quote') {
              <div
                class="absolute top-2 right-2 text-[#25D366] animate-scale-in"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              }

              <svg
                class="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <div class="text-center">
                <span class="block font-bold text-base leading-tight"
                  >Consultar Costo</span
                >
                <span class="block text-xs opacity-80 font-medium mt-1"
                  >Por WhatsApp</span
                >
              </div>
            </button>

            <!-- Botón Agendar Visita -->
            <button
              type="button"
              (click)="setIntent('visit')"
              class="flex-1 relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 gap-2 group min-h-[100px]"
              [class.border-gray-100]="intent() !== 'visit'"
              [class.bg-gray-50]="intent() !== 'visit'"
              [class.text-gray-500]="intent() !== 'visit'"
              [class.border-[#ff6b00]]="intent() === 'visit'"
              [class.bg-orange-50]="intent() === 'visit'"
              [class.text-[#ff6b00]]="intent() === 'visit'"
              [class.shadow-md]="intent() === 'visit'"
            >
              @if (intent() === 'visit') {
              <div
                class="absolute top-2 right-2 text-[#ff6b00] animate-scale-in"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              }

              <svg
                class="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div class="text-center">
                <span class="block font-bold text-base leading-tight"
                  >Agendar Visita</span
                >
                <span class="block text-xs opacity-80 font-medium mt-1"
                  >Con Técnico</span
                >
              </div>
            </button>
          </div>
        </div>

        <!-- Form Content -->
        <div class="px-6 pb-8 pt-4 overflow-y-auto">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Name Input -->
            <div>
              <label
                class="block text-sm font-bold text-gray-700 uppercase mb-1.5 tracking-wide"
                >Tu Nombre</label
              >
              <input
                type="text"
                formControlName="name"
                class="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-4 text-gray-900 text-lg font-medium focus:ring-4 focus:border-transparent outline-none transition-all"
                [class.focus:ring-green-100]="intent() === 'quote'"
                [class.focus:ring-orange-100]="intent() === 'visit'"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <!-- Phone Input Split -->
            <div>
              <label
                class="block text-sm font-bold text-gray-700 uppercase mb-1.5 tracking-wide"
                >Celular / WhatsApp</label
              >

              <div class="flex gap-2">
                <div
                  (click)="openCountrySelector()"
                  class="relative flex items-center gap-2 px-3 py-4 bg-gray-100 border border-gray-300 rounded-xl min-w-[100px] justify-center hover:bg-gray-200 transition-colors cursor-pointer select-none group"
                  role="button"
                  tabindex="0"
                >
                  <span class="text-2xl leading-none" role="img">{{
                    countryData().flag
                  }}</span>
                  <span class="text-gray-700 font-bold font-mono text-base">{{
                    countryData().code
                  }}</span>
                  <svg
                    class="w-4 h-4 text-gray-500 group-hover:text-gray-800"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                <input
                  type="tel"
                  formControlName="phone"
                  class="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-4 text-gray-900 text-lg font-medium focus:ring-4 focus:border-transparent outline-none transition-all"
                  [class.focus:ring-green-100]="intent() === 'quote'"
                  [class.focus:ring-orange-100]="intent() === 'visit'"
                  placeholder="099 123 456"
                  (input)="formatPhone($event)"
                />
              </div>
            </div>

            <!-- Time Preference (Solo visible en modo 'visit') -->
            @if (intent() === 'visit') {
            <div class="animate-slide-down">
              <label
                class="block text-sm font-bold text-gray-700 uppercase mb-1.5 tracking-wide"
                >Preferencia Horaria</label
              >
              <div class="relative">
                <select
                  formControlName="timePreference"
                  class="w-full appearance-none bg-orange-50 border border-orange-200 text-orange-900 rounded-xl px-4 py-4 text-base font-bold focus:ring-4 focus:ring-orange-100 outline-none cursor-pointer"
                >
                  <option value="urgente">
                    🔥 Lo antes posible (Urgencia)
                  </option>
                  <option value="mañana">☀️ Mañana (08:00 - 13:00)</option>
                  <option value="tarde">☁️ Tarde (13:00 - 18:00)</option>
                  <option value="coordinar">📅 Coordinar otro día</option>
                </select>
                <div
                  class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-orange-600"
                >
                  <svg
                    class="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <p class="text-xs text-orange-600 mt-2 font-bold">
                * Confirmaremos disponibilidad exacta por chat.
              </p>
            </div>
            }

            <!-- Submit Button con Turnstile -->
            <button
              type="submit"
              [disabled]="form.invalid || isSubmitting() || turnstileService.verificando()"
              class="w-full font-black text-xl py-5 rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              [style.background-color]="
                intent() === 'quote' ? '#25D366' : '#ff6b00'
              "
              [style.color]="'white'"
              (mouseenter)="turnstileService.precargar()"
            >
              @if (turnstileService.verificando()) {
              <svg class="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Verificando...</span>
              } @else if (isSubmitting()) {
              <svg class="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Enviando...</span>
              } @else { @if (intent() === 'visit') {
              <span>Solicitar Visita Ahora</span>
              } @else {
              <span>Obtener Presupuesto</span>
              }
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
              }
            </button>

            <!-- Error de Turnstile -->
            @if (turnstileService.error()) {
            <p class="text-center text-red-600 text-sm mt-3 font-medium">
              {{ turnstileService.error() }}
            </p>
            }
          </form>
        </div>

        <!-- Country Selector Overlay (Lazy Loaded View) -->
        @if (isSelectorOpen()) {
        <div
          class="absolute inset-0 z-50 bg-white flex flex-col animate-slide-in-right"
        >
          <!-- Selector Header -->
          <div
            class="p-5 border-b border-gray-100 flex items-center gap-4 bg-white"
          >
            <button
              (click)="closeSelector()"
              class="p-2 -ml-2 text-gray-500 hover:text-gray-900"
            >
              <svg
                class="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div class="flex-1 relative">
              <input
                #searchInput
                type="text"
                (input)="searchQuery.set(searchInput.value)"
                placeholder="Buscar país..."
                class="w-full bg-gray-100 text-gray-900 rounded-full py-3 pl-5 pr-5 text-base focus:ring-2 focus:ring-[#25D366] outline-none placeholder-gray-400"
                autocomplete="off"
              />
            </div>
          </div>

          <!-- Countries List -->
          <div class="flex-1 overflow-y-auto p-2 bg-white">
            @if (isLoadingCountries()) {
            <div class="flex justify-center py-8">
              <svg
                class="animate-spin h-8 w-8 text-gray-400"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            } @else {
            <ul class="space-y-1">
              @for (country of filteredCountries(); track country.code) {
              <li>
                <button
                  (click)="selectCountry(country)"
                  class="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors text-left group border border-transparent hover:border-gray-100"
                  [class.bg-green-50]="country.code === detectedCountryCode()"
                >
                  <span
                    class="text-3xl leading-none shadow-sm rounded-sm overflow-hidden"
                    >{{ country.flag }}</span
                  >
                  <div class="flex-1">
                    <div
                      class="font-bold text-gray-900 text-lg group-hover:text-green-700 transition-colors"
                    >
                      {{ country.name }}
                    </div>
                    <div class="text-sm text-gray-500 font-mono">
                      {{ country.dial }}
                    </div>
                  </div>
                </button>
              </li>
              }
            </ul>
            }
          </div>
        </div>
        }
      </div>
    </div>
    }
  `,
  styles: [
    `
      @keyframes slideUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      .animate-slide-up {
        animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(0);
        }
      }
      .animate-slide-in-right {
        animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-slide-down {
        animation: slideDown 0.2s ease-out;
      }

      @keyframes scaleIn {
        from {
          transform: scale(0);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }
      .animate-scale-in {
        animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
    `,
  ],
})
export class LeadModalComponent {
  leadService = inject(LeadGateService);
  configService = inject(ConfigService);
  fb = inject(FormBuilder);
  turnstileService = inject(TurnstileService);

  @ViewChild("searchInput") searchInput!: ElementRef;

  isSubmitting = signal(false);
  isSelectorOpen = signal(false);
  isLoadingCountries = signal(false);
  searchQuery = signal("");

  intent = signal<UserIntent>("quote"); // Estado del Toggle

  detectedCountryCode = signal("UY");
  allCountries = signal<Country[]>([]);
  priorityCountries: Country[] = [
    { code: "UY", dial: "+598", flag: "🇺🇾", name: "Uruguay" },
    { code: "AR", dial: "+54", flag: "🇦🇷", name: "Argentina" },
    { code: "BR", dial: "+55", flag: "🇧🇷", name: "Brasil" },
    { code: "US", dial: "+1", flag: "🇺🇸", name: "Estados Unidos" },
    { code: "ES", dial: "+34", flag: "🇪🇸", name: "España" },
  ];

  form = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(2)]],
    phone: ["", [Validators.required, Validators.minLength(6)]],
    timePreference: ["urgente"], // Default para cuando se activa 'visit'
  });

  constructor() {
    try {
      const stored = localStorage.getItem("sc_user_lead_data");
      if (stored) {
        const data = JSON.parse(stored);
        if (data.name) this.form.get("name")?.setValue(data.name);
        if (data.phone) this.form.get("phone")?.setValue(data.phone);
      }
    } catch (e) {
      /* ignore */
    }

    effect(() => {
      if (this.leadService.isOpen()) {
        this.isSubmitting.set(false);
        // Si hay una "severidad peligrosa" en el contexto, sugerimos Visita por defecto
        const ctx = this.leadService.pendingAction()?.context;
        if (ctx?.severity === "danger" || ctx?.severity === "warning") {
          this.setIntent("visit");
        } else {
          this.setIntent("quote");
        }
      }
    });

    effect(() => {
      const serverCountry = this.configService.country();
      if (serverCountry && serverCountry !== "null") {
        this.detectedCountryCode.set(serverCountry);
      }
    });
  }

  setIntent(val: UserIntent) {
    this.intent.set(val);
  }

  async openCountrySelector() {
    this.isSelectorOpen.set(true);
    if (this.allCountries().length > 0) return;
    this.isLoadingCountries.set(true);
    try {
      const module = await import("../data/countries.data");
      this.allCountries.set(module.COUNTRIES_LIST);
    } catch (e) {
      this.allCountries.set(this.priorityCountries);
    } finally {
      this.isLoadingCountries.set(false);
    }
  }

  closeSelector() {
    this.isSelectorOpen.set(false);
    this.searchQuery.set("");
  }

  selectCountry(country: Country) {
    this.detectedCountryCode.set(country.code);
    this.closeSelector();
  }

  filteredCountries = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const source =
      this.allCountries().length > 0
        ? this.allCountries()
        : this.priorityCountries;
    if (!query) return source;
    return source.filter(
      (c) => c.name.toLowerCase().includes(query) || c.dial.includes(query)
    );
  });

  countryData = computed(() => {
    const code = this.detectedCountryCode();
    const source =
      this.allCountries().length > 0
        ? this.allCountries()
        : this.priorityCountries;
    const data =
      source.find((p) => p.code === code) || this.priorityCountries[0];
    return { flag: data.flag, code: data.dial };
  });

  formatPhone(event: any) {
    let val = event.target.value;
    val = val.replace(/\D/g, "");
    const currentDial = this.countryData().code.replace("+", "");
    if (val.startsWith(currentDial)) {
      val = val.substring(currentDial.length);
      this.form.get("phone")?.setValue(val);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    // VERIFICACIÓN TURNSTILE
    const token = await this.turnstileService.verificar();
    
    if (!token) {
      // Verificación fallida - posible bot o bloqueado
      console.warn('Verificación Turnstile fallida');
      return;
    }

    // Verificación exitosa - procesar lead
    this.isSubmitting.set(true);
    const { name, phone, timePreference } = this.form.value;
    const countryDial = this.countryData().code;

    this.leadService.submitLead(
      name!,
      phone!,
      countryDial,
      this.intent(),
      this.intent() === "visit" ? timePreference! : undefined,
      token // Pasar token de Turnstile
    );
  }
}
