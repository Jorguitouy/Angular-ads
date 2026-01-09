
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-16 bg-gray-50 border-t border-gray-200">
      <div class="max-w-5xl mx-auto px-4 text-center">
        
        <h2 class="text-2xl md:text-3xl font-black text-[#1a1a1a] mb-10">
          Pagá cómodo y seguro en tu domicilio
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          <!-- Mercado Pago -->
          <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4">
            <div class="h-10 flex items-center text-blue-500 font-black text-2xl italic tracking-tighter">
              mercado<span class="text-blue-400">pago</span>
            </div>
            <p class="text-base text-gray-600 font-medium">Hasta 12 cuotas sin recargo con QR o Link.</p>
          </div>

          <!-- Tarjetas -->
          <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4">
            <div class="flex items-center gap-3 h-10 text-gray-700">
               <!-- Generic Card Icons -->
               <svg class="h-10 w-auto" viewBox="0 0 32 20" fill="currentColor"><rect width="32" height="20" rx="2" fill="#1a1a1a"/><path d="M4 12h8v2H4v-2z" fill="white"/></svg> 
               <span class="font-bold text-lg">VISA / MASTER / OCA</span>
            </div>
            <p class="text-base text-gray-600 font-medium">Débito y Crédito directo con el técnico.</p>
          </div>

          <!-- Efectivo / Transferencia -->
          <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4">
             <div class="flex items-center gap-2 h-10 text-green-700">
               <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
               <span class="font-black text-lg">EFECTIVO / BROU</span>
             </div>
            <p class="text-base text-gray-600 font-medium">Descuentos especiales por pago contado.</p>
          </div>

        </div>

        <p class="mt-10 text-sm text-gray-500 font-medium">
          * Todas las reparaciones incluyen boleta oficial (BPS/DGI) y garantía escrita.
        </p>

      </div>
    </section>
  `
})
export class PaymentMethodsComponent {}
