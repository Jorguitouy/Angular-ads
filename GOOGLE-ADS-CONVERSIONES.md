# Códigos de Conversión Google Ads - Guía Completa

## ¿Qué son las Conversiones?

Las conversiones en Google Ads son acciones valiosas que los usuarios realizan en tu sitio web después de hacer clic en un anuncio. En nuestro caso, las conversiones principales son:

- **Llamadas telefónicas** (cuando un usuario completa el formulario y es redirigido a `tel:`)
- **Mensajes de WhatsApp** (cuando un usuario completa el formulario y es redirigido a WhatsApp)
- **Envíos de formulario** (cuando un usuario envía sus datos de contacto)

## Configuración en Google Ads

### 1. Crear Acciones de Conversión

En **Google Ads → Herramientas y configuración → Conversiones**:

```
1. Hacer clic en el botón azul "+ Nueva acción de conversión"
2. Seleccionar "Sitio web"
3. Categoría: "Llamada telefónica" o "Contacto"
4. Nombre: "Llamada - Calefones" o "WhatsApp - Calefones"
5. Valor: (opcional) valor monetario estimado
6. Conteo: "Una" (por cada lead único)
7. Ventana de atribución: 30 días recomendado
8. Incluir en "Conversiones": Sí
9. Modelo de atribución: "Último clic"
```

### 2. Obtener Códigos de Conversión

Después de crear cada conversión, Google Ads generará un código como:

```javascript
// Ejemplo para llamada
gtag('event', 'conversion', {
  'send_to': 'AW-1234567890/AbCDeFgHiJkLmNoPqRs'
});

// Ejemplo para WhatsApp  
gtag('event', 'conversion', {
  'send_to': 'AW-1234567890/XyZaBcDeFgHiJkLmNoP'
});
```

## Implementación en el Código

### ConversionService - Gestión Centralizada

Todos los IDs de conversión están centralizados en `src/services/conversion.service.ts`:

```typescript
@Injectable({ providedIn: 'root' })
export class ConversionService {
  private readonly CONVERSION_IDS = {
    // Conversiones de llamada telefónica
    phone_call_header: 'AW-XXXXXXXX/YYYYYYYY',    // Botón principal header
    phone_call_hero: 'AW-XXXXXXXX/YYYYYYYY',      // Hero section
    phone_call_footer: 'AW-XXXXXXXX/YYYYYYYY',    // Footer
    
    // Conversiones de WhatsApp
    whatsapp_header: 'AW-XXXXXXXX/ZZZZZZZZ',      // Botón WhatsApp header
    whatsapp_hero: 'AW-XXXXXXXX/ZZZZZZZZ',        // Hero section
    whatsapp_footer: 'AW-XXXXXXXX/ZZZZZZZZ',      // Footer
    
    // Conversiones de formulario
    form_contact: 'AW-XXXXXXXX/WWWWWWWW',         // Formulario contacto
    form_quote: 'AW-XXXXXXXX/WWWWWWWW',           // Formulario cotización
    
    // Conversiones generales
    lead_submit: 'AW-XXXXXXXX/QQQQQQQQ'           // Submit exitoso del modal
  };
}
```

### Uso en las Directivas

```typescript
// En WhatsAppTrackingDirective
const context = {
  ...this.trackingContext,
  action: 'whatsapp',
  redirectUrl: whatsappUrl,
  conversionType: 'whatsapp_hero', // ← Tipo específico
  message: finalMessage
};

// En PhoneTrackingDirective  
const context = {
  ...this.trackingContext,
  action: 'phone_call',
  redirectUrl: phoneUrl,
  conversionType: 'phone_call_hero' // ← Tipo específico
};
```

### TrackingService Actualizado

```typescript
// Nuevo método con tipos específicos
trackConversion(conversionType: keyof typeof this.conversionService['getAllConversionIds'], action: string = 'conversion', customValue?: number) {
  const config = this.conversionService.buildConversionConfig(conversionType, customValue);
  window.gtag('event', 'conversion', config);
}

// Método legacy para compatibilidad
trackConversionByLabel(conversionLabel: string, action: string = 'conversion') {
  window.gtag('event', 'conversion', { 'send_to': conversionLabel });
}
```

### Valores Monetarios por Conversión

```typescript
getConversionValue(type: string): number {
  const values = {
    phone_call_header: 500,    // Llamada directa (alto valor)
    phone_call_hero: 500,
    phone_call_footer: 300,
    whatsapp_header: 400,      // WhatsApp (medio valor)
    whatsapp_hero: 400,
    whatsapp_footer: 250,
    form_contact: 600,         // Formulario completo (máximo valor)
    form_quote: 800,           // Cotización (máximo valor)
    lead_submit: 450           // Submit del modal
  };
  return values[type] || 450;
}
```

### Entornos (Producción vs Test)

El sistema automáticamente detecta el entorno:

```typescript
private isProduction(): boolean {
  const hostname = window.location.hostname;
  const productionDomains = ['servicedecalefones.uy', 'www.servicedecalefones.uy'];
  return productionDomains.includes(hostname);
}

// En producción usa IDs reales
// En desarrollo usa IDs de prueba: 'AW-1234567890/test123'
```

## Flujo de Conversión por Canal

### 1. Botones de Llamada Telefónica

```
Usuario hover → Pre-cargar Turnstile
Usuario click → Verificar Turnstile
Verificación OK → Abrir modal
Usuario llena form → Submit → Verificar Turnstile
Submit exitoso → Redirigir a tel:59896758200
→ Disparar conversión "phone_call"
```

### 2. Botones de WhatsApp

```
Usuario hover → Pre-cargar Turnstile  
Usuario click → Verificar Turnstile
Verificación OK → Abrir modal
Usuario llena form → Submit → Verificar Turnstile
Submit exitoso → Redirigir a WhatsApp
→ Disparar conversión "whatsapp"
```

### 3. Formularios Directos

```
Usuario llena form → Submit → Verificar Turnstile
Submit exitoso → Mostrar confirmación
→ Disparar conversión "form_submit"
```

## Configuración de Google Tag Manager

### 1. Etiqueta de Google Ads

En **GTM → Etiquetas → Nueva**:

```
Tipo de etiqueta: "Google Ads - Conversión de seguimiento"
ID de conversión: AW-XXXXXXXX/YYYYYYYY
Etiqueta de conversión: Nombre personalizado
Valor: Dejar en blanco (o usar variable)
Moneda: UYU
Disparador: "Todos los clics" o evento personalizado
```

### 2. Variables Dinámicas

Para pasar valores dinámicos:

```javascript
// Variable de DataLayer para valor de conversión
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  'event': 'form_submit',
  'conversion_value': 1500, // Valor estimado en UYU
  'conversion_currency': 'UYU'
});
```

## Verificación y Testing

### 1. Google Tag Assistant

1. Instalar extensión "Google Tag Assistant" en Chrome
2. Navegar a la web
3. Completar flujo de conversión
4. Verificar que se dispare la etiqueta correcta

### 2. URL de Prueba

Para testing, usar parámetro `test_mode=true`:

```javascript
gtag('config', 'AW-XXXXXXXX', { 'test_mode': true });
```

### 3. Console Debug

Verificar en consola:

```javascript
// Debería mostrar:
✅ Conversión registrada: AW-XXXXXXXX/YYYYYYYY
```

## Importaciones en el Código

Asegurar que gtag esté disponible:

```html
<!-- En index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-XXXXXXXX');
</script>
```

## Métricas y Reportes

### 1. En Google Ads

- **Tasa de conversión**: % de clics que se convirtieron
- **Costo por conversión**: CPC / Tasa de conversión
- **Valor de conversión total**: Suma de valores atribuidos

### 2. En Google Analytics

- **Eventos de conversión**: Por canal y dispositivo
- **Ruta de conversión**: Pasos del usuario
- **Atribución**: Modelo de atribución personalizado

## Best Practices

### 1. Tiempo de Disparo

- **Inmediato**: Para redirecciones (tel:, WhatsApp)
- **Después de confirmación**: Para formularios
- **Solo con verificación exitosa**: Prevenir conversiones de bots

### 2. Duplicación

- Usar `event_callback` para confirmar disparo
- Implementar cooldown para evitar múltiples disparos
- Verificar que no se dispare en modo test

### 3. Privacidad

- Respetar consentimiento GDPR/CCPA
- No enviar datos personales en conversiones
- Usar modo test durante desarrollo

## Troubleshooting

### Problema: No se dispara la conversión

**Causas posibles:**
- gtag no está cargado
- ID de conversión incorrecto
- Bloqueador de anuncios

**Solución:**
```javascript
// Verificar disponibilidad
if (typeof gtag !== 'undefined') {
  // Disparar conversión
} else {
  console.warn('gtag no disponible');
}
```

### Problema: Conversiones duplicadas

**Causas posibles:**
- Múltiples disparadores
- Recarga de página
- Eventos bubbling

**Solución:**
```typescript
// Flag para evitar duplicados
private conversionFired = new Set<string>();

trackConversion(label: string) {
  if (this.conversionFired.has(label)) return;
  
  // Disparar conversión
  this.conversionFired.add(label);
}
```

### Problema: Conversiones en modo test

**Solución:**
```javascript
// Detectar ambiente
const isProduction = window.location.hostname === 'servicedecalefones.uy';

if (isProduction) {
  gtag('event', 'conversion', { 'send_to': label });
} else {
  console.log('Test mode - conversión simulada:', label);
}
```

## Monitoreo Continuo

1. **Semanal**: Revisar tasa de conversión por canal
2. **Mensual**: Ajustar valores y categorías
3. **Trimestral**: Optimizar palabras clave con mejor conversión
4. **Anual**: Revisar configuración de atribución

## Contacto Soporte

- **Google Ads Help**: https://support.google.com/google-ads/
- **Google Tag Manager Help**: https://support.google.com/tagmanager/
- **Developer Guide**: https://developers.google.com/google-ads/api/docs/conversions
