
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


# 🧹 Instrucciones de Limpieza y Seguridad

Para finalizar la implementación y mantener la infraestructura oculta (Security by Obscurity), es necesario eliminar los archivos que hacen referencia explícita a la plataforma de hosting.

## Archivos para ELIMINAR

Por favor, borra los siguientes archivos de tu proyecto, ya que han sido reemplazados por versiones con nombres neutros:

1.  ❌ `src/cloudflare-worker.js` (Reemplazado por `src/edge-function.js`)
2.  ❌ `CLOUDFLARE_SETUP.md` (Reemplazado por `SERVER_CONFIG.md`)

## Verificación de Seguridad

El sistema actual cuenta con las siguientes protecciones activas en `src/edge-function.js`:

1.  **Protección SQL Injection:**
    *   Se utilizan *Prepared Statements* (`stmt.bind()`) para todas las consultas a la base de datos.
    *   **Resultado:** Imposible inyectar comandos SQL maliciosos.

2.  **Protección XSS (HTML Injection):**
    *   Se ha implementado la función `escapeHtml()` que sanitiza: Nombre, Teléfono, Email, Mensaje e IP.
    *   **Resultado:** Si un atacante envía `<script>`, se convertirá en `&lt;script&gt;` y se mostrará como texto plano en el email, sin ejecutarse.

3.  **Protección Anti-Bot:**
    *   Cloudflare Turnstile verifica el token antes de procesar cualquier dato.
    *   **Resultado:** Bloqueo efectivo de bots automatizados y spam masivo.


# 🚀 Guía de Optimización Extrema: Cloudflare (Plan Gratuito)

Esta guía detalla la configuración exacta que debes aplicar en el panel de control de Cloudflare una vez que el dominio `servicecalefones.com` esté conectado.

**Objetivo:** Lograr una puntuación de 100/100 en Lighthouse y carga instantánea en móviles 4G.
**Costo:** $0 (Todo funciona en el Free Tier).

---

## 1. Velocidad y Compresión (Speed > Optimization)

Estas configuraciones reducen el tamaño de los archivos que viajan por el cable.

*   **Auto Minify:** ✅ **ACTIVAR TODO**
    *   Marca las casillas: `HTML`, `CSS`, `JS`.
    *   *Efecto:* Elimina espacios y comentarios innecesarios automáticamente.
*   **Brotli:** ✅ **ON**
    *   *Efecto:* Compresión de nueva generación (mejor que Gzip) para textos y scripts.
*   **Early Hints:** ✅ **ON**
    *   *Efecto:* Ayuda al navegador a precargar recursos antes de que termine de cargar el HTML.

---

## 2. Protocolos de Red (Speed > Optimization > Protocol Optimization)

Mejoran la conexión en redes móviles inestables (3G/4G).

*   **HTTP/3 (con QUIC):** ✅ **ON**
    *   *Efecto:* Reduce drásticamente la latencia en móviles. Fundamental para tu público de urgencia.
*   **0-RTT Connection Resumption:** ✅ **ON**
    *   *Efecto:* Si un usuario ya visitó la web antes, la reconexión es instantánea.

---

## 3. Caché de Archivos Estáticos (Caching > Cache Rules)

Tu web es estática. No necesitamos que el usuario descargue el logo o las fotos cada vez que entra.

**Crear Regla:** "Cache Estático Agresivo"

1.  **Field:** `URI Path` -> **Operator:** `ends with`...
2.  **Value:** (Añade estas extensiones una por una con lógica OR)
    *   `.jpg`, `.jpeg`, `.png`, `.webp`, `.svg`, `.ico`, `.ttf`, `.woff2`
3.  **Cache Status:** `Eligible for cache`.
4.  **Edge Cache TTL:** `Ignore origin and use this TTL` -> **1 Month** (1 Mes).
5.  **Browser Cache TTL:** **1 Year** (1 Año).

*   *Efecto:* Cloudflare guarda las imágenes en sus servidores de borde y le dice al celular del usuario que las guarde por un año. La segunda visita carga en 0.1 segundos.

---

## 4. Seguridad Anti-Bot (Security > Bots)

Protege tu formulario y tu presupuesto de Ads sin molestar a los humanos.

*   **Bot Fight Mode:** ✅ **ON**
    *   *Efecto:* Si una IP sospechosa intenta acceder, Cloudflare le pide un cálculo matemático invisible. Si falla, lo bloquea antes de que toque tu servidor.

---

## 5. Scripts de Terceros (Cloudflare Zaraz)

**IMPORTANTE:** Si vas a usar Google Analytics 4 (GA4), Pixel de Meta o Google Tag Manager.

*   **No pegues el código en el HTML.**
*   Ve a la sección **Zaraz** en Cloudflare.
*   Configura las herramientas ahí ("Add Tool").
*   *Efecto:* Cloudflare carga estos scripts pesados en **sus servidores**, no en el celular del cliente. Tu web se mantiene rápida y sigues teniendo analíticas.

---

## ⚠️ ZONA DE PELIGRO: NO TOCAR

Hay una opción muy popular que **ROMPE** las aplicaciones modernas como Angular Zoneless.

*   ❌ **Rocket Loader:** **MANTENER APAGADO (OFF)**
    *   *Por qué:* Rocket Loader intenta cambiar cómo carga el JavaScript. Como Angular 21 ya gestiona su propia carga de forma inteligente, Rocket Loader causa conflictos, hace que los botones no funcionen o que la web se vea blanca. **Nunca lo actives.**
*   ❌ **Email Address Obfuscation:** **PRECAUCIÓN**
    *   A veces interfiere con los enlaces `mailto:` dinámicos que inyectamos. Si notas que al hacer clic en un email no pasa nada, apaga esto.

---

## Checklist Final de Despliegue

1.  [ ] DNS apuntando a Cloudflare (Nube Naranja activada).
2.  [ ] SSL/TLS en modo **Full (Strict)**.
3.  [ ] Minify activado.
4.  [ ] HTTP/3 activado.
5.  [ ] Regla de Caché creada.
6.  [ ] **Rocket Loader APAGADO.**


# 🚀 Guía de Configuración Completa: Cloudflare Workers

Esta aplicación utiliza Cloudflare Workers para manejar 3 funciones críticas:
1.  **Geo-Localización Inteligente:** Detecta el barrio del usuario para mostrar "Activos en [Barrio]".
2.  **Envío de Emails:** Procesa el formulario de contacto de forma segura (vía Resend).
3.  **Base de Datos (D1):** Guarda un respaldo de seguridad de todos los contactos.

---

## PASO 1: Geo-Cache (Cloudflare KV)

Para ahorrar costos de Google Maps y responder rápido.

1.  Ve a **Workers & Pages** -> **KV**.
2.  Crea un Namespace llamado: `GEO_CACHE_KV`.
3.  Ve a tu Worker -> **Settings** -> **Variables**.
4.  Agrega en **KV Namespace Bindings**:
    *   Variable name: `GEO_KV`
    *   Namespace: `GEO_CACHE_KV`

---

## PASO 2: Seguridad y Emails (Variables de Entorno)

En tu Worker -> **Settings** -> **Variables** -> **Environment Variables**, agrega:

*   `GOOGLE_MAPS_KEY`: Tu API Key de Google Maps.
*   `RESEND_API_KEY`: Tu API Key de Resend.com (empieza con `re_`).
*   `TURNSTILE_SECRET_KEY`: Tu Secret Key de Cloudflare Turnstile (empieza con `0x...`).

---

## PASO 3: Base de Datos de Contactos (Cloudflare D1)

Para guardar historial de los formularios enviados.

1.  Ve a **Workers & Pages** -> **D1**.
2.  Haz clic en **Create Database**.
3.  Nombre de la base: `contact-db`.
4.  Haz clic en **Create**.

### Configuración de la Tabla (Schema)
Una vez creada la base de datos, entra en ella y ve a la pestaña **Console**. Ejecuta el siguiente comando SQL para crear la tabla donde se guardarán los datos:

```sql
CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    email TEXT,
    message TEXT,
    ip TEXT,
    created_at TEXT
);
```

### Conectar al Worker
1.  Ve a tu Worker -> **Settings** -> **Variables**.
2.  Baja hasta **D1 Database Bindings**.
3.  Haz clic en **Add Binding**.
    *   Variable name: `DB` (Debe ser mayúsculas, exacto).
    *   Database: `contact-db` (La que creaste).
4.  **Save and Deploy**.

---

## ANEXO: Detalles y Variantes

### ¿Qué datos se guardan exactamente?
La tabla `contacts` funciona como una "caja negra" de respaldo. Si Resend falla o borras un email por error, los datos quedan aquí.

| Columna      | Descripción |
|--------------|-------------|
| `name`       | Nombre del cliente. |
| `phone`      | Teléfono de contacto. |
| `email`      | Email del cliente. |
| `message`    | Contenido del mensaje. |
| `ip`         | **Dirección IP del cliente.** Útil para bloquear ataques o spam. |
| `created_at` | Fecha y hora del envío (ISO 8601). |

### Variantes de Implementación

#### Variante A: Modo Privacidad (GDPR / Sin IP)
Si prefieres no almacenar la dirección IP de los usuarios por políticas de privacidad:
1.  Abre `src/cloudflare-worker.js`.
2.  Busca la línea donde se hace el `INSERT`.
3.  Cambia `clientIp` por el string `'ANON'`.

#### Variante B: Desactivar Base de Datos (Solo Email)
Si decides que no quieres usar D1 (Base de datos):
1.  Simplemente **elimina el Binding `DB`** en las variables de entorno de Cloudflare.
2.  El código es inteligente: detectará que `env.DB` no existe y saltará el guardado automáticamente, enviando solo el email. No necesitas cambiar el código.


# 🛡️ HEADERS DE SEGURIDAD RECOMENDADOS (Copiar a Cloudflare Transform Rules o _headers)

# 1. Content-Security-Policy (CSP)
# Define estrictamente qué recursos pueden cargar el navegador.
# - script-src: Permite scripts propios, de Cloudflare (Turnstile) y ESM (Módulos). 'unsafe-inline' es necesario para la inyección de variables del Worker.
# - connect-src: Permite conexiones a la API interna, Turnstile y Data Layer.
# - img-src: Permite imágenes de Picsum, Data URIs (SVGs) y propias.

Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://challenges.cloudflare.com https://esm.sh; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; img-src 'self' data: https://picsum.photos https://fastly.picsum.photos; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self';

# 2. Strict-Transport-Security (HSTS)
# Fuerza HTTPS durante 1 año, incluye subdominios y precarga.
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

# 3. X-Content-Type-Options
# Evita que el navegador "adivine" el tipo de archivo (MIME Sniffing).
X-Content-Type-Options: nosniff

# 4. Referrer-Policy
# Solo envía el origen (dominio) en enlaces salientes, protegiendo rutas privadas internas.
Referrer-Policy: strict-origin-when-cross-origin

# 5. Permissions-Policy
# Deshabilita características del navegador no utilizadas (Micrófono, Cámara) para reducir superficie de ataque.
Permissions-Policy: accelerometer=(), camera=(), microphone=(), geolocation=(self), payment=(), usb=()


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


# 🚀 Guía de Configuración del Backend

Esta aplicación utiliza funciones Serverless en el Edge. Para configurar los teléfonos y servicios externos, debes establecer las **Variables de Entorno** en tu plataforma de hosting (Cloudflare Workers).

## PASO 1: Acceder a la Configuración
1. Ve a tu panel de Cloudflare.
2. Entra en **Workers & Pages**.
3. Selecciona tu proyecto.
4. Ve a la pestaña **Settings** -> **Variables**.

## PASO 2: Definir Variables

Añade las siguientes variables (Click en "Add Variable").

### 📞 Configuración de Teléfonos (Granular)

Esta configuración permite separar lo que "marca" el teléfono de lo que "ve" el cliente.

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `PHONE_CALL_ENCODIGO` | **Número Técnico**. Es el número que marca el celular al hacer clic. Formato internacional sin símbolos (`+`). | `59896758200` |
| `PHONE_CALL_VISUAL` | **Texto Visible**. Es lo que lee el humano en el botón. Puedes usar espacios y formato local. | `096 758 200` |
| `PHONE_WHATSAPP` | **Número de Chat**. Destino de los mensajes de WhatsApp. Puede ser un número distinto al de llamadas si usas un celular dedicado solo para chat. | `59896758200` |

### 🏗️ Infraestructura y APIs (Obligatorias)

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `APP_DOMAIN` | Tu dominio principal sin `https://`. Usado para seguridad CORS. | `servicecalefones.com` |
| `GOOGLE_MAPS_KEY` | API Key de Google Maps para detectar el barrio del usuario. | `AIzaSyD...` |
| `RESEND_API_KEY` | API Key de Resend.com para enviar los emails del formulario. | `re_123...` |
| `TURNSTILE_SECRET_KEY` | Secret Key de Cloudflare Turnstile para evitar bots en el formulario. | `0x4AA...` |
| `CONTACT_EMAIL` | La casilla de correo donde quieres recibir los formularios de contacto. | `tu@email.com` |

### 🚨 Alertas de Telegram (Opcional)

Si quieres recibir alertas instantáneas en tu celular cada vez que alguien pide presupuesto.

| Variable | Descripción |
| :--- | :--- |
| `TELEGRAM_ENABLED` | Pon `1` para activar o `0` para desactivar. |
| `TELEGRAM_BOT_TOKEN` | Token de tu bot de Telegram. |
| `TELEGRAM_CHAT_ID` | ID de tu chat o grupo de Telegram. |

---

## PASO 3: Despliegue

Una vez guardadas las variables, asegúrate de hacer un **Deploy** si estás editando el código, o simplemente guarda los cambios en el panel de Cloudflare para que se apliquen inmediatamente.


# 🕵️ Especificación de Rastreo y Reportes de Fraude (Versión 3.1 - Hardware Fingerprint)

Este documento detalla la arquitectura de datos utilizada para el "Rastreo de Intención" y la generación de "Evidencia de Fraude" para Google Ads.

## 1. El Objetivo
Capturar datos forenses de cada usuario para medir ROI y detectar fraude.

## 2. Esquema de Base de Datos (Tabla: `click_events`)

Ahora guardamos **24 puntos de datos** por cada clic:

| Campo | Tipo | ¿Para qué sirve? |
| :--- | :--- | :--- |
| `event_type` | STRING | Tipo de conversión o 'bot_trap'. |
| `element_id` | STRING | Qué botón específico se tocó. |
| `fingerprint` | STRING | **Anti-Fraude.** ID único del dispositivo. |
| `ip` | STRING | Bloqueo nivel servidor. |
| `user_agent` | STRING | Detección de bots. |
| `gclid` | STRING | Importación de conversiones a Google Ads. |
| `campaign` | STRING | **ROI.** Nombre de la campaña (utm_campaign). |
| `source` | STRING | Fuente del tráfico (Google, FB, Directo). |
| `keyword` | STRING | Qué buscó el usuario (utm_term). |
| `local_hour` | INT | **Heatmap.** Hora del usuario (0-23). Ej: ¿Llaman más a las 9AM? |
| `local_day` | INT | **Heatmap.** Día de la semana (0=Domingo). |
| `time_on_page`| INT | Clics en < 2 segundos = Bots o error. |
| `location` | STRING | Barrio detectado. |
| `is_webdriver` | BOOL | **Pistola Humeante.** Si es TRUE, es un bot de Selenium. |
| `screen_res` | STRING | Si es `0x0` o `800x600` en desktop moderno, es sospechoso. |
| `browser_tz` | STRING | Si la IP es de UY pero timezone es `Asia/Shanghai`, es Proxy. |
| `human_score` | INT | ¿Movió el mouse, hizo scroll o tocó la pantalla antes de clickear? |
| `device_memory` | REAL | RAM. Si es muy bajo (0.5GB) en un 'iPhone 15', es falso. |
| `hardware_concurrency` | INT | Núcleos CPU. Bots suelen tener 1 o 2. |
| `connection_type` | STRING | 4g, wifi, etc. |
| `created_at` | DATETIME | Fecha exacta ISO. |

## 3. Estrategia de Reportes

### Reporte A: Detección de Bots "Low Spec"
**Síntoma:** User Agents de alta gama (iPhone 15) pero con hardware pobre.
**Consulta SQL:**
```sql
SELECT * FROM click_events 
WHERE user_agent LIKE '%iPhone%' 
AND device_memory < 2;
```
**Acción:** Reembolso garantizado por Google (Falsificación de dispositivo).

### Reporte B: Honeypot Triggered
Cualquier fila con `event_type = 'bot_trap'` es una prueba de que una IP está escaneando enlaces invisibles.
