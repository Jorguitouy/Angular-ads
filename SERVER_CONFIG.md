
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
