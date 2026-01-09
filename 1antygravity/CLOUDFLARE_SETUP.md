
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
