
# 📘 Documentación Técnica y de Seguridad - ServiceCalefones

Este documento detalla la arquitectura, estrategia de caché y capas de seguridad implementadas en la aplicación.

## 1. Arquitectura Serverless (Edge)
El sitio opera bajo un modelo híbrido:
- **Frontend:** Angular (Zoneless) compilado como estático.
- **Backend:** Cloudflare Workers para API, seguridad y Geo-inyección.
- **Base de Datos:** Cloudflare D1.

## 2. Configuración de Seguridad (Híbrida)

Para permitir flexibilidad con herramientas de marketing (GTM, Pixel) sin tocar el código, hemos separado la seguridad en dos capas:

### Capa A: Backend / API (Gestionado por Código)
La API (`/api/*`) tiene seguridad "Hardcoded" que **NO** se puede sobrescribir desde el panel.
*   **Origin Locking:** Solo acepta peticiones de tu dominio real.
*   **CSP Estricta:** `default-src 'none'`. Impide ejecución de scripts o iframes.

### Capa B: Frontend / HTML (Gestionado por Panel Cloudflare)
La política de contenidos (CSP) para el usuario final se configura en el dashboard de Cloudflare.

#### 🛠️ Cómo configurar la CSP del Frontend:

1.  Entra a tu cuenta de **Cloudflare**.
2.  Ve a **Rules** > **Transform Rules**.
3.  Selecciona **Modify Response Header**.
4.  Haz clic en **Create Rule**.
5.  **Regla:**
    *   **Rule Name:** `Frontend CSP`
    *   **Expression:** `(not starts_with(http.request.uri.path, "/api/"))`
        *   *Esto asegura que no dupliquemos la cabecera en la API.*
6.  **Then... Modify response header:**
    *   **Operator:** `Set static`
    *   **Header name:** `Content-Security-Policy`
    *   **Value:** (Copia y pega la cadena de abajo)

```text
default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://challenges.cloudflare.com https://esm.sh https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://*.google.com https://*.googleadservices.com https://*.doubleclick.net; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://fonts.googleapis.com; img-src 'self' data: https://picsum.photos https://fastly.picsum.photos https://www.google-analytics.com https://*.google.com https://*.google.com.uy https://*.facebook.com https://*.googleadservices.com; connect-src 'self' https://challenges.cloudflare.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.google.com https://*.doubleclick.net https://*.facebook.com; frame-src https://challenges.cloudflare.com https://*.google.com https://*.doubleclick.net; font-src 'self' https://fonts.gstatic.com; object-src 'none'; base-uri 'self'; form-action 'self';
```

## 3. Capas de Seguridad (Implementadas en Código)

### A. Anti-Bot & Spam
*   **Honeypot Trap:** Enlace invisible (`/api/trap-bot`) en el footer.
*   **Turnstile:** Captcha invisible de Cloudflare.

### B. Anti-Fraude (Google Ads)
*   **Device Fingerprinting:** Hash único de hardware para detectar granjas de clics.

### C. Protección de Datos
*   **SQL Injection:** Uso de *Prepared Statements*.
*   **XSS:** Sanitización de inputs antes del envío de email.
