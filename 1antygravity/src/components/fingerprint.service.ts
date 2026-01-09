
import { Injectable, signal, afterNextRender, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class FingerprintService {
  // Señal global con el ID. Empieza vacía.
  fingerprint = signal<string>('pending');
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
        // Usamos afterNextRender para no bloquear el pintado inicial
        afterNextRender(() => {
            // Pequeño delay para asegurar que el CPU esté libre
            setTimeout(() => this.generateSimpleFingerprint(), 500);
        });
    }
  }

  private generateSimpleFingerprint() {
    try {
        // 1. Canvas Fingerprinting (Gráfico)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let txt = 'SC_FP_V1'; // Versión corta
        
        if (ctx) {
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText(txt, 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText(txt, 4, 17);
        }
        
        const b64 = canvas.toDataURL().replace('data:image/png;base64,', '');
        const bin = atob(b64).slice(-16, -12); 
        
        // 2. Hardware Info
        const screen = `${window.screen.width}x${window.screen.height}`;
        const cores = navigator.hardwareConcurrency || 1;
        
        // 3. Crear Firma
        const rawString = `${bin}-${screen}-${cores}`;
        
        // 4. Hashing Simple
        let hash = 5381;
        for (let i = 0; i < rawString.length; i++) {
            hash = ((hash << 5) + hash) + rawString.charCodeAt(i); 
        }
        
        this.fingerprint.set((hash >>> 0).toString(16));

    } catch (e) {
        this.fingerprint.set('error');
    }
  }
}
