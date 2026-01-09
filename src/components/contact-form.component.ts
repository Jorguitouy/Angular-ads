
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ContactService } from '../services/contact.service';
import { FingerprintService } from './fingerprint.service';

declare global {
  interface Window {
    turnstile: any;
    dataLayer: any[];
    SC_TURNSTILE_KEY?: string; // Definición de tipo para la inyección
  }
}

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-16 md:py-24 bg-white border-t border-gray-100" id="contacto">
      <div class="max-w-4xl mx-auto px-4">
        
        <div class="text-center mb-10">
          <span class="text-blue-700 font-bold tracking-wide uppercase text-sm">Alternativa No Urgente</span>
          <h2 class="text-3xl md:text-4xl font-black text-[#1a1a1a] mt-3">Contacto por Email</h2>
          <p class="text-gray-600 mt-4 max-w-xl mx-auto text-lg leading-relaxed">
            Si no tienes apuro o prefieres no usar WhatsApp, déjanos un correo. Respondemos en el correr del día.
          </p>
        </div>

        <div class="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-10 relative overflow-hidden transition-all duration-500">
          
          <div class="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-blue-50 rounded-full blur-2xl opacity-50 pointer-events-none"></div>

          @if (formStatus() === 'success') {
            <div class="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
              <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-3">¡Correo Enviado!</h3>
              <p class="text-gray-600 text-lg">
                Gracias {{ submittedName() }}. Te responderemos a la casilla indicada a la brevedad.
              </p>
              <button (click)="resetForm()" class="mt-8 text-blue-700 font-bold text-base hover:underline p-3">
                Enviar otro correo
              </button>
            </div>
          } @else {
            
            @if (!isFormOpen()) {
              <div class="flex flex-col items-center justify-center py-6 animate-fade-in">
                <button 
                  (click)="toggleForm()"
                  class="group flex items-center gap-4 bg-white border-2 border-gray-200 text-gray-800 font-bold px-8 py-5 rounded-2xl hover:border-blue-500 hover:text-blue-700 transition-all shadow-sm active:scale-95 w-full md:w-auto justify-center text-lg"
                >
                  <div class="bg-blue-50 p-2.5 rounded-full group-hover:bg-blue-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <span>Redactar Formulario de Email</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-50 group-hover:translate-y-1 transition-transform"><path d="m6 9 6 6 6-6"/></svg>
                </button>
              </div>
            }

            @if (isFormOpen()) {
              <form 
                [formGroup]="contactForm" 
                (ngSubmit)="initiateSubmission()" 
                class="space-y-6 relative z-10 animate-fade-in-down"
                [class.opacity-50]="isProcessing()"
                [class.pointer-events-none]="isProcessing()"
              >
                <!-- HONEYPOT FIELD -->
                <div class="absolute opacity-0 -z-50 h-0 w-0 overflow-hidden">
                   <label for="website_check">Website URL</label>
                   <input id="website_check" type="text" formControlName="website_check" tabindex="-1" autocomplete="off">
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="flex flex-col gap-2">
                    <label for="name" class="text-sm font-bold text-gray-700 uppercase tracking-wide">Nombre</label>
                    <input id="name" type="text" formControlName="name" class="w-full px-5 py-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-gray-50 focus:bg-white text-base font-medium text-gray-900" placeholder="Tu nombre" [class.border-red-300]="isInvalid('name')">
                  </div>
                  <div class="flex flex-col gap-2">
                    <label for="phone" class="text-sm font-bold text-gray-700 uppercase tracking-wide">Teléfono</label>
                    <input id="phone" type="tel" formControlName="phone" class="w-full px-5 py-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-gray-50 focus:bg-white text-base font-medium text-gray-900" placeholder="099 123 456" [class.border-red-300]="isInvalid('phone')">
                  </div>
                </div>

                <div class="flex flex-col gap-2">
                  <label for="email" class="text-sm font-bold text-gray-700 uppercase tracking-wide">Tu Email</label>
                  <input id="email" type="email" formControlName="email" class="w-full px-5 py-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-gray-50 focus:bg-white text-base font-medium text-gray-900" placeholder="ejemplo@correo.com" [class.border-red-300]="isInvalid('email')">
                </div>

                <div class="flex flex-col gap-2">
                  <label for="message" class="text-sm font-bold text-gray-700 uppercase tracking-wide">Mensaje</label>
                  <textarea id="message" formControlName="message" rows="4" class="w-full px-5 py-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-gray-50 focus:bg-white resize-none text-base font-medium text-gray-900" placeholder="Describe el problema..."></textarea>
                </div>

                <div id="security-widget-container" class="flex justify-center min-h-[0px] my-2"></div>

                <div class="flex flex-col-reverse md:flex-row gap-4 pt-4">
                  <button type="button" (click)="toggleForm()" class="w-full md:w-auto px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors text-lg">Cancelar</button>
                  <button id="btn-submit-email" type="submit" [disabled]="contactForm.invalid || isProcessing()" class="flex-1 bg-[#1a1a1a] text-white font-black text-lg px-8 py-4 rounded-xl shadow-xl hover:bg-black hover:shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                    @if (formStatus() === 'loading') { <svg class="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> } 
                    @else if (formStatus() === 'verifying') { <span class="text-base">Verificando...</span> }
                    @else { Enviar Correo <svg class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg> }
                  </button>
                </div>
                
                @if (formStatus() === 'error') { <p class="text-red-600 text-sm mt-4 font-bold text-center animate-pulse">Error de conexión o seguridad. Intenta nuevamente.</p> }
              </form>
            }
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hidden { display: none !important; visibility: hidden; }
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    .animate-fade-in-down { animation: fadeInDown 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ContactFormComponent {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);
  private fingerprintService = inject(FingerprintService); 

  formStatus = signal<'idle' | 'verifying' | 'loading' | 'success' | 'error'>('idle');
  submittedName = signal('');
  isFormOpen = signal(false); 
  private widgetId: string | null = null;

  // Derivamos el estado de procesamiento usando computed para reactividad pura
  isProcessing = computed(() => this.formStatus() === 'verifying' || this.formStatus() === 'loading');

  contactForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: [''],
    website_check: [''] // Honeypot
  });

  toggleForm() { this.isFormOpen.update(v => !v); }

  isInvalid(field: string): boolean {
    const control = this.contactForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  initiateSubmission() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    this.formStatus.set('verifying');
    this.loadSecurityScript();
  }

  private loadSecurityScript() {
    if (window.turnstile) { this.renderWidget(); return; }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => this.renderWidget();
    document.body.appendChild(script);
  }

  private renderWidget() {
    if (this.widgetId) { window.turnstile.reset(this.widgetId); return; }
    
    // Obtenemos la Site Key inyectada o usamos una dummy de prueba segura (si no está configurada)
    const siteKey = window.SC_TURNSTILE_KEY || '1x00000000000000000000AA';

    try {
      this.widgetId = window.turnstile.render('#security-widget-container', {
        sitekey: siteKey,
        callback: (token: string) => this.onSecuritySuccess(token),
        'error-callback': () => { this.formStatus.set('error'); alert('Error de seguridad.'); },
      });
    } catch (e) { this.formStatus.set('error'); }
  }

  private onSecuritySuccess(token: string) {
    this.formStatus.set('loading');
    const formData = this.contactForm.value;
    this.submittedName.set(formData.name);

    this.contactService.sendMessage({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      message: formData.message,
      honeypot: formData.website_check, // Envío del honeypot
      turnstileToken: token,
      deviceFingerprint: this.fingerprintService.fingerprint()
    }).subscribe({
      next: (response: any) => {
        this.formStatus.set('success');
        this.trackConversion(response);
        if (this.widgetId) window.turnstile.remove(this.widgetId);
      },
      error: () => {
        this.formStatus.set('error');
        if (this.widgetId) window.turnstile.reset(this.widgetId);
      }
    });
  }

  private trackConversion(response: any) {
    if (typeof window !== 'undefined') {
        const dataLayer = window.dataLayer || [];
        dataLayer.push({
            'event': 'form_submission_success', 
            'form_name': 'contacto_email',
            'lead_id': response?.id || 'unknown'
        });
    }
  }

  resetForm() {
    this.contactForm.reset();
    this.formStatus.set('idle');
    this.isFormOpen.set(false);
  }
}
