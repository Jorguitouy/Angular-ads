
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
