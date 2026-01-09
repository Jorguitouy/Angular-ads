
# ⚡ Estrategia de Caché Híbrida (Edge Optimized)

Esta aplicación utiliza una estrategia de caché dividida para maximizar la velocidad de carga (LCP) manteniendo la personalización geográfica dinámica.

## 1. El Problema
Normalmente, cachear el HTML (`index.html`) en el Edge es lo ideal. Sin embargo, nuestra app inyecta datos dinámicos en el HTML antes de servirlo:
*   `SC_USER_COUNTRY`: Detectado por Cloudflare en tiempo real.
*   `SC_INJECTED_LOC`: Barrio detectado (ej: "Activos en Pocitos").

Si cacheamos el HTML públicamente, un usuario en Montevideo podría ver la ubicación de un usuario anterior de Buenos Aires.

## 2. La Solución: "Split Caching"

Hemos configurado el Edge Function (`src/edge-function.js`) para tratar los archivos de forma diferente según su extensión.

### A. Archivos Estáticos (Inmutables)
**Archivos:** `.js`, `.css`, `.png`, `.jpg`, `.svg`, `.woff2`.
**Header:** `Cache-Control: public, max-age=31536000, immutable`

*   **Comportamiento:** El navegador descarga estos archivos **una sola vez**.
*   **Actualizaciones:** Angular genera nombres con hash (ej: `main.xf82a.js`). Al hacer un nuevo deploy, el nombre del archivo cambia, forzando al navegador a descargar el nuevo. Esto permite usar `immutable` sin miedo.
*   **Beneficio:** Carga instantánea en segundas visitas.

### B. Documento HTML (Dinámico)
**Archivos:** `index.html`, `/`.
**Header:** `Cache-Control: private, max-age=0, must-revalidate`
**Header:** `CDN-Cache-Control: max-age=0`

*   **Comportamiento:** 
    1.  El navegador pregunta al servidor "¿Hay cambios?".
    2.  El Edge Function intercepta, inyecta la Geo-localización fresca y responde.
    3.  Cloudflare CDN **NO** guarda copia de esto.
*   **Beneficio:** Geolocalización precisa al 100% y rotación de teléfonos inmediata si cambias las variables de entorno.

### C. API Endpoints (Seguros)
**Rutas:** `/api/*`
**Header:** `Cache-Control: no-store`

*   **Comportamiento:** Nunca se guarda nada.

---

## 3. Optimizaciones Adicionales (Plan Gratuito Cloudflare)

Para potenciar esta estrategia sin costo, aplica estas configuraciones en el Panel de Cloudflare:

### 1. Tiered Cache (Smart Topology)
Ve a **Caching > Tiered Cache** y actívalo.
*   **Efecto:** Cloudflare usa su red global para reducir las peticiones a tu Worker, sirviendo los assets estáticos desde el centro de datos más cercano al usuario de forma más eficiente.

### 2. Early Hints
Ve a **Speed > Optimization > Early Hints** y actívalo.
*   **Efecto:** Mientras el servidor piensa la respuesta HTML (los milisegundos que tarda la inyección), Cloudflare le dice al navegador "Ve descargando `styles.css` y `main.js`, que seguro los vas a necesitar".

### 3. HTTP/3 (QUIC)
Ve a **Network** y activa **HTTP/3**.
*   **Efecto:** Reduce la latencia de conexión en redes móviles 4G (la mayoría de tus usuarios de urgencia), eliminando el "Head-of-Line Blocking".

### 4. 0-RTT Connection Resumption
Ve a **Network** y actívalo.
*   **Efecto:** Permite que usuarios recurrentes reanuden la conexión TLS sin el handshake completo, ahorrando ~50-100ms.
