
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { HeaderComponent } from './components/header.component';
import { HeroComponent } from './components/hero.component';
import { TrustBarComponent } from './components/trust-bar.component';
import { StatsComponent } from './components/stats.component';
import { BenefitsComponent } from './components/benefits.component';
import { AboutComponent } from './components/about.component'; 
import { FaqComponent } from './components/faq.component';
import { PaymentMethodsComponent } from './components/payment-methods.component';
import { ContactFormComponent } from './components/contact-form.component';
import { FooterComponent } from './components/footer.component';
import { TestimonialsComponent } from './components/testimonials.component';
import { HowItWorksComponent } from './components/how-it-works.component';
import { MobileStickyBarComponent } from './components/mobile-sticky-bar.component';
import { CtaStripComponent } from './components/cta-strip.component';
import { SeoSchemaComponent } from './components/seo-schema.component';
import { LeadModalComponent } from './components/lead-modal.component'; // Importar
import { TrackingService } from './services/tracking.service';
import { LeadGateService } from './services/lead-gate.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    SeoSchemaComponent,
    HeaderComponent,
    HeroComponent,
    TrustBarComponent,
    StatsComponent,
    HowItWorksComponent,
    AboutComponent, 
    BenefitsComponent,
    TestimonialsComponent,
    PaymentMethodsComponent,
    FaqComponent,
    ContactFormComponent,
    CtaStripComponent,
    FooterComponent,
    MobileStickyBarComponent,
    LeadModalComponent // Agregar al template
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-seo-schema />
    
    @defer (when leadService.isOpen()) {
      <app-lead-modal /> <!-- El Gatekeeper global -->
    }
    
    <main class="min-h-screen flex flex-col font-sans">
      <!-- Critical Path: Header & Hero load immediately -->
      <app-header />
      <app-hero />

      <!-- Lazy Loaded Components (Below the fold) -->
      @defer (on viewport) {
        <app-trust-bar />
      } @placeholder {
        <div class="h-24 w-full bg-white"></div>
      }

      <!-- Why Choose Us / Benefits Section -->
      @defer (on viewport) {
        <app-benefits />
      } @placeholder {
        <div class="h-96 w-full bg-white"></div>
      }

      @defer (on viewport) {
        <app-stats />
      } @placeholder {
        <div class="h-40 w-full bg-[#1a1a1a]"></div>
      }

      @defer (on viewport) {
        <app-how-it-works />
      } @placeholder {
        <div class="h-96 w-full bg-gray-50"></div>
      }

      @defer (on viewport) {
        <app-about />
      } @placeholder {
        <div class="h-[600px] w-full bg-white"></div>
      }

      @defer (on viewport) {
        <app-testimonials />
      } @placeholder {
        <div class="h-96 w-full bg-[#f8f9fa]"></div>
      }

      @defer (on viewport) {
        <app-payment-methods />
      } @placeholder {
        <div class="h-64 w-full bg-gray-50"></div>
      }

      @defer (on viewport) {
        <app-faq />
      } @placeholder {
        <div class="h-80 w-full bg-white"></div>
      }

      @defer (on viewport) {
        <app-contact-form />
      } @placeholder {
        <div class="h-[500px] w-full bg-white"></div>
      }

      @defer (on viewport) {
        <app-cta-strip />
      } @placeholder {
        <div class="h-64 w-full bg-[#1a1a1a]"></div>
      }

      @defer (on viewport) {
        <app-footer />
      } @placeholder {
        <div class="h-96 w-full bg-[#1a1a1a]"></div>
      }

      <!-- Sticky Bar: Load on idle to not block LCP, but be ready quickly -->
      @defer (on idle) {
        <app-mobile-sticky-bar />
      }
    </main>
  `
})
export class AppComponent {
  private trackingService = inject(TrackingService);
  protected leadService = inject(LeadGateService);
}
    