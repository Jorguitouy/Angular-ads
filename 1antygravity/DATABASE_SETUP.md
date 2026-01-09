
# 🗄️ Guía de Creación de Base de Datos (D1) y Caché (KV)

Para que el sistema de seguridad funcione, necesitas crear los espacios de almacenamiento en Cloudflare. Sigue estos pasos en tu terminal (Terminal > New Terminal).

## PASO 1: Login en Cloudflare
Si no lo has hecho aún:
```bash
npx wrangler login
```
(Se abrirá el navegador, dale a "Allow").

## PASO 2: Crear la Base de Datos (D1)
Aquí guardaremos el historial de contactos.

1. Ejecuta:
   ```bash
   npx wrangler d1 create contact-db
   ```
2. La terminal te responderá algo como:
   > ✅ Created new database "contact-db" with ID "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
3. **COPIA ese ID** y pégalo en tu archivo `wrangler.toml` donde dice `database_id`.

## PASO 3: Crear las Tablas
Ejecuta estos comandos uno por uno para crear la estructura de datos:

**Tabla 1: Contactos (Formularios)**
```bash
npx wrangler d1 execute contact-db --command "CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, email TEXT, message TEXT, ip TEXT, created_at TEXT);"
```

**Tabla 2: Analítica de Clics (Anti-Fraude)**
```bash
npx wrangler d1 execute contact-db --command "CREATE TABLE IF NOT EXISTS click_events (id INTEGER PRIMARY KEY AUTOINCREMENT, event_type TEXT, element_id TEXT, fingerprint TEXT, ip TEXT, user_agent TEXT, location TEXT, keyword TEXT, created_at TEXT);"
```

## PASO 4: Crear el Sistema Anti-Spam (KV)
Aquí guardamos el contador de intentos de la IP (Rate Limiting).

1. Ejecuta:
   ```bash
   npx wrangler kv:namespace create GEO_CACHE_KV
   ```
2. La terminal te responderá algo como:
   > { binding = "GEO_CACHE_KV", id = "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy" }
3. **COPIA ese ID** y pégalo en tu archivo `wrangler.toml` donde dice `id` (bajo `[[kv_namespaces]]`).

## PASO 5: Subir todo
Una vez configurado el archivo `wrangler.toml` con los IDs reales:

```bash
npm run deploy
```
