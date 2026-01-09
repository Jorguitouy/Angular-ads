# Sistema de Protección Anti-Bot - Turnstile

## Arquitectura General

El sistema utiliza **Cloudflare Turnstile** (CAPTCHA invisible) para proteger todos los puntos de contacto y evitar envíos automatizados.

### Componentes Principales

```
Frontend (Angular)
├── TurnstileService - Carga lazy del script y verificación
├── WhatsAppTrackingDirective - Botones WhatsApp
├── PhoneTrackingDirective - Botones de llamada
└── LeadModalComponent - Modal de captura de datos

Backend (Cloudflare Workers)
└── /api/verify-turnstile - Verificación y bloqueo de IPs
```

## Flujo de Verificación

### 1. Botones de Llamada (Teléfono)

```
Mouse hover → Pre-cargar script Turnstile
Click → Verificar Turnstile → Si OK → Abrir modal → Submit → Redirigir a llamada
```

**Proceso:**
1. **Hover**: `PhoneTrackingDirective` carga `turnstile.js` en background
2. **Click**: Ejecuta `turnstile.render()` y verifica token
3. **Verificación OK**: Abre modal para capturar datos
4. **Submit exitoso**: Redirige a `tel:59896758200`
5. **Conversión**: Se dispara solo después de verificación exitosa

### 2. Botones de WhatsApp

```
Mouse hover → Pre-cargar script Turnstile
Click → Verificar Turnstile → Si OK → Abrir modal → Submit → Abrir WhatsApp
```

**Proceso:**
1. **Hover**: `WhatsAppTrackingDirective` carga `turnstile.js`
2. **Click**: Verifica Turnstile ANTES de abrir modal
3. **Verificación OK**: Abre modal para nombre/telefono
4. **Submit exitoso**: Abre WhatsApp con mensaje predefinido
5. **Conversión**: Se dispara solo con envío exitoso del modal

### 3. Formularios Directos

```
Submit → Verificar Turnstile → Si OK → Enviar datos → Registrar conversión
```

## Configuración de Variables

### Cloudflare Pages - Environment Variables

```bash
# Variables públicas (texto plano)
TURNSTILE_SITE_KEY=0x4AAAAAACLbRDPnHh5JbRcm
SITE_URL=https://solicitar.servicedecalefones.uy

# Variables secretas (encriptadas)
TURNSTILE_SECRET_KEY=0x4AAAAAACLbRAnWaoEsRz8xDuTRsiV22eY
RESEND_API_KEY=re_xxxxxxxxxx
GOOGLE_MAPS_KEY=AIzaSy_xxxxxxxxxx
```

### Seguridad de Variables

- **Texto plano**: Variables no sensibles (URLs, keys públicas)
- **Secreto**: API keys, tokens privados, claves de verificación

## Sistema de Bloqueo Automático

### Lógica de Bloqueo

```javascript
// En /api/verify-turnstile
if (verification.success) {
  // Resetear contador si es verificación válida
  await resetFailedAttempts(ip);
} else {
  // Incrementar contador de fallos
  const attempts = await incrementFailedAttempts(ip);
  
  if (attempts >= 5) {
    // Bloquear IP progresivamente
    const blockDuration = Math.min(Math.pow(2, attempts), 24) * 3600000;
    await blockIP(ip, blockDuration);
  }
}
```

### Tiempos de Bloqueo

| Fallos | Tiempo de Bloqueo |
|--------|------------------|
| 5+ | 1 hora |
| 6+ | 2 horas |
| 7+ | 4 horas |
| 8+ | 8 horas |
| 9+ | 16 horas |
| 10+ | 24 horas |

## Implementación Técnica

### TurnstileService

```typescript
// Carga lazy del script
private loadTurnstileScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.head.appendChild(script);
  });
}

// Verificación con backend
async verifyToken(token: string): Promise<boolean> {
  const response = await fetch('/api/verify-turnstile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  
  return response.ok;
}
```

### Directiva de Botón con Pre-carga

```typescript
@Directive({ selector: 'a[appPhoneTracking]' })
export class PhoneTrackingDirective {
  
  @HostListener('mouseenter')
  onMouseEnter() {
    // Pre-cargar script en hover
    this.turnstileService.preload();
  }
  
  @HostListener('click', ['$event'])
  async onClick(event: MouseEvent) {
    event.preventDefault();
    
    // Mostrar estado de verificación
    this.showVerificationState();
    
    // Verificar Turnstile
    const valid = await this.turnstileService.verify();
    
    if (valid) {
      // Abrir modal solo si pasa verificación
      this.leadGateService.triggerGate(url, context);
    } else {
      // Mostrar error de verificación
      this.showVerificationError();
    }
  }
}
```

## Códigos de Conversión Google Ads

### Configuración

Los códigos de conversión se configuran en **Google Ads → Conversiones** y se cargan via **Google Tag Manager**.

### Momentos de Disparo

| Evento | Cuándo se dispara | Código de Conversión |
|--------|------------------|---------------------|
| Llamada exitosa | Después de verificación + submit del modal | `gtag('event', 'conversion', {'send_to': 'AW-XXXXXXXX/XXXXXXXX'})` |
| WhatsApp enviado | Después de verificación + submit del modal | `gtag('event', 'conversion', {'send_to': 'AW-XXXXXXXX/XXXXXXXX'})` |
| Formulario enviado | Después de verificación exitosa | `gtag('event', 'conversion', {'send_to': 'AW-XXXXXXXX/XXXXXXXX'})` |

### Implementación en TrackingService

```typescript
trackConversion(conversionId: string, label: string) {
  // Solo dispara si hay verificación exitosa previa
  if (this.lastVerificationSuccess) {
    gtag('event', 'conversion', {
      'send_to': `${conversionId}/${label}`,
      'event_callback': () => {
        console.log('Conversion tracked successfully');
      }
    });
  }
}
```

## Monitoreo y Debug

### Logs de Verificación

```javascript
// En /api/verify-turnstile
console.log({
  ip: clientIp,
  userAgent: request.headers.get('User-Agent'),
  verification: result,
  blocked: isBlocked,
  timestamp: new Date().toISOString()
});
```

### Estadísticas en Dashboard

- **Tasa de verificación exitosa**: % de usuarios que pasan Turnstile
- **IPs bloqueadas**: Número de IPs actualmente bloqueadas
- **Intentos fallidos**: Conteo de verificaciones fallidas por IP

## Recomendaciones de Seguridad

1. **Rotar keys secretas** cada 90 días
2. **Monitorear IPs bloqueadas** semanalmente
3. **Ajustar umbrales** según tráfico legítimo
4. **Whitelist IPs** de desarrolladores y oficinas

## Testing

### Casos de Prueba

1. **Botón hover**: Verificar carga de script sin errores
2. **Click botón**: Verificar modal se abre solo con Turnstile válido
3. **Submit formulario**: Verificar conversión se dispara
4. **IP bloqueada**: Simular 5 fallos para probar bloqueo
5. **Mobile**: Probar flujo en dispositivos móviles

### Herramientas

- **Cloudflare Turnstile Dashboard**: Monitorear widget
- **Google Tag Assistant**: Verificar conversiones
- **Network tab**: Inspeccionar llamadas a `/api/verify-turnstile`
