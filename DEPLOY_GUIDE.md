
# 🚀 Guía de Despliegue Automático en Cloudflare

Este proyecto está configurado para desplegarse como una aplicación "Full Stack" en el Edge de Cloudflare:
- **Frontend:** Angular (Estático)
- **Backend:** Cloudflare Workers (API)
- **Database:** Cloudflare D1 (SQL)

## Paso 1: Preparación Inicial (Solo una vez)

Abre tu terminal en Cursor y ejecuta:

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Loguearte en Cloudflare:**
   Se abrirá una ventana del navegador para autorizar a Wrangler.
   ```bash
   npm run login
   ```

3. **Crear la Base de Datos D1:**
   Ejecuta este comando y **copia el `database_id`** que te devolverá la terminal.
   ```bash
   npx wrangler d1 create contact-db
   ```

4. **Configurar `wrangler.toml`:**
   Abre el archivo `wrangler.toml` en la raíz del proyecto y reemplaza:
   ```toml
   database_id = "PEGA_AQUI_EL_ID_QUE_COPIASTE_EN_EL_PASO_3"
   ```

## Paso 2: Despliegue (Día a día)

Cada vez que quieras subir cambios, simplemente ejecuta:

```bash
npm run deploy
```

Este script mágico hará todo por ti:
1. Compilará la app de Angular (`ng build`).
2. Creará la tabla SQL si no existe.
3. Subirá el código y los assets a Cloudflare.

## Paso 3: Configuración de Secretos (Seguridad)

Las claves privadas (como la de Google Maps o Resend) **NO** se suben en el código. Debes configurarlas manualmente una vez en la nube:

Ejecuta estos comandos en la terminal. Te pedirá que pegues la clave:

```bash
# API Key de Resend (Emails)
npx wrangler secret put RESEND_API_KEY

# API Key de Google Maps (Geo)
npx wrangler secret put GOOGLE_MAPS_KEY

# Secret Key de Turnstile (Captcha)
npx wrangler secret put TURNSTILE_SECRET_KEY
```

## Solución de Problemas Comunes

**Error: "No such file or directory dist/browser"**
Asegúrate de que `npm run build` se ejecute correctamente. En Angular 17+, a veces la carpeta de salida es `dist/nombre-proyecto/browser`. Si es así, edita `wrangler.toml` y cambia `bucket = "./dist/browser"` por la ruta correcta.

**Error: "Worker not found"**
Asegúrate de que `src/edge-function.js` existe. Este es tu Backend.
