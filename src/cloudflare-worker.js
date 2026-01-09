
/**
 * CLOUDFLARE WORKER: GEO-INJECTION, API PROXY, EMAIL & DATABASE
 * 
 * VARIABLES DE ENTORNO REQUERIDAS (Settings -> Variables):
 * 1. GOOGLE_MAPS_KEY: API Key de Google Maps (Geocoding).
 * 2. RESEND_API_KEY: API Key de Resend.com para envío de emails.
 * 3. TURNSTILE_SECRET_KEY: Secret Key de Cloudflare Turnstile (Captcha).
 * 
 * BINDINGS REQUERIDOS (Settings -> Variables -> KV / D1):
 * 1. GEO_KV (KV Namespace): Cache para ubicaciones geográficas.
 * 2. DB (D1 Database): Base de datos para guardar los formularios de contacto.
 */

const ALLOWED_BARRIOS = [
  "Pocitos", "Punta Carretas", "Buceo", "Malvín", "Malvín Norte",
  "Carrasco", "Carrasco Norte", "Punta Gorda", "Centro", "Ciudad Vieja",
  "Barrio Sur", "Palermo", "Cordón", "Parque Rodó", "Tres Cruces",
  "La Blanqueada", "Unión", "Prado", "Aguada", "Reducto",
  "Atahualpa", "Aires Puros", "Paso de las Duranas", "Belvedere",
  "La Teja", "Cerro", "Casabó", "Pajas Blancas", "Paso de la Arena",
  "Nuevo París", "Conciliación", "Sayago", "Peñarol", "Colón",
  "Lezica", "Melilla", "Manga", "Casavalle", "Piedras Blancas",
  "Jardines del Hipódromo", "Ituzaingó", "Maroñas", "Flor de Maroñas",
  "Villa Española", "Curva de Maroñas", "Punta de Rieles", "Bella Italia",
  "Ciudad de la Costa", "Solymar", "Lagomar", "El Pinar", "Shangrilá", 
  "San José de Carrasco", "Parque Miramar", "Barra de Carrasco", "Parque de la Costa",
  "Paso Carrasco", "Colonia Nicolich", "Aeropuerto",
  "Las Piedras", "La Paz", "Progreso", "Pando", "Barros Blancos"
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // =======================================================================
    // 1. ENDPOINT: GEOCODING (Proxy a Google Maps)
    // =======================================================================
    if (url.pathname === '/api/geocode') {
      const lat = url.searchParams.get('lat');
      const lon = url.searchParams.get('lon');

      if (!lat || !lon || !env.GOOGLE_MAPS_KEY) {
        return new Response(JSON.stringify({ error: 'Missing params' }), { status: 400 });
      }
      try {
        const locationName = await getSafeNeighborhoodWithSmartCache(lat, lon, env, ctx);
        return new Response(JSON.stringify({ location: locationName }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // =======================================================================
    // 2. ENDPOINT: SEND EMAIL + DB SAVE + TURNSTILE VERIFICATION
    // =======================================================================
    if (url.pathname === '/api/send-email' && request.method === 'POST') {
      // CORS Handling
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        });
      }

      if (!env.RESEND_API_KEY || !env.TURNSTILE_SECRET_KEY) {
        return new Response(JSON.stringify({ error: 'Server misconfigured (Missing Keys)' }), { status: 500 });
      }

      try {
        const body = await request.json();
        const clientIp = request.headers.get('CF-Connecting-IP') || 'Unknown';
        
        // Validación de datos básicos
        if (!body.name || !body.phone || !body.email || !body.turnstileToken) {
          return new Response(JSON.stringify({ error: 'Faltan datos obligatorios o token de seguridad' }), { status: 400 });
        }

        // --- PASO 1: VERIFICAR CAPTCHA (Turnstile) ---
        const turnstileFormData = new FormData();
        turnstileFormData.append('secret', env.TURNSTILE_SECRET_KEY);
        turnstileFormData.append('response', body.turnstileToken);
        turnstileFormData.append('remoteip', clientIp);

        const turnstileResult = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          body: turnstileFormData,
          method: 'POST',
        });

        const turnstileOutcome = await turnstileResult.json();

        if (!turnstileOutcome.success) {
          return new Response(JSON.stringify({ error: 'Fallo de seguridad (Captcha). Eres un bot.' }), { status: 403 });
        }

        // --- PASO 2: GUARDAR EN BASE DE DATOS (Cloudflare D1) ---
        // Guardamos antes de enviar el email para asegurar registro.
        // Si no existe el binding 'DB', saltamos este paso (para no romper el worker si no está configurado).
        if (env.DB) {
            try {
                const stmt = env.DB.prepare(
                    `INSERT INTO contacts (name, phone, email, message, ip, created_at) VALUES (?, ?, ?, ?, ?, ?)`
                );
                await stmt.bind(
                    body.name, 
                    body.phone, 
                    body.email, 
                    body.message || '', 
                    clientIp, 
                    new Date().toISOString()
                ).run();
            } catch (dbError) {
                console.error("Error guardando en D1:", dbError);
                // No retornamos error al usuario, permitimos que intente enviar el email.
            }
        }

        // --- PASO 3: ENVIAR EMAIL (Resend) ---
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'ServiceCalefones <web@servicecalefones.com>', 
            to: ['tucorreo@empresa.com'], 
            reply_to: body.email,
            subject: `🚨 Nuevo Pedido: ${body.name}`,
            html: `
              <h1>Nueva Solicitud Web</h1>
              <p><strong>Cliente:</strong> ${body.name}</p>
              <p><strong>Teléfono:</strong> <a href="tel:${body.phone}">${body.phone}</a></p>
              <p><strong>Email:</strong> ${body.email}</p>
              <hr>
              <p><strong>Mensaje:</strong></p>
              <blockquote style="background: #f0f0f0; padding: 10px;">${body.message || 'Sin mensaje'}</blockquote>
              <br>
              <p style="font-size: 10px; color: #888;">IP: ${clientIp}</p>
            `
          })
        });

        const data = await resendResponse.json();

        if (!resendResponse.ok) {
           throw new Error(data.message || 'Error en Resend');
        }

        return new Response(JSON.stringify({ success: true, id: data.id }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' 
          }
        });

      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // =======================================================================
    // 3. HTML INJECTION (Geo-Localización Automática)
    // =======================================================================
    const response = await fetch(request);
    const isPageLoad = (url.pathname === '/' || url.pathname === '/index.html') && 
                       response.headers.get('content-type')?.includes('text/html');
    const isBot = (request.headers.get('User-Agent') || '').includes('bot');

    if (isPageLoad && !isBot && env.GOOGLE_MAPS_KEY) {
      const latitude = request.cf?.latitude;
      const longitude = request.cf?.longitude;

      if (latitude && longitude) {
        try {
          const detectedNeighborhood = await getSafeNeighborhoodWithSmartCache(latitude, longitude, env, ctx);
          if (detectedNeighborhood && detectedNeighborhood !== 'Montevideo') {
            const originalHtml = await response.text();
            const injectedHtml = originalHtml.replace(
              'window.SC_INJECTED_LOC = null;', 
              `window.SC_INJECTED_LOC = "${detectedNeighborhood}";`
            );
            return new Response(injectedHtml, {
              status: response.status,
              headers: response.headers
            });
          }
        } catch (e) {
          // Fallback silencioso
        }
      }
    }

    return response;
  }
};

// --- HELPER FUNCTIONS ---

async function getSafeNeighborhoodWithSmartCache(lat, lon, env, ctx) {
  const gridLat = parseFloat(lat).toFixed(3);
  const gridLon = parseFloat(lon).toFixed(3);
  const storageKey = `geo:${gridLat}:${gridLon}`;
  
  // Capa 1: Cache API
  const cacheUrl = new URL(`https://worker-cache.local/${storageKey}`);
  const cacheKeyReq = new Request(cacheUrl);
  const cache = caches.default;
  let cachedResponse = await cache.match(cacheKeyReq);
  if (cachedResponse) return await cachedResponse.text();

  // Capa 2: KV
  if (env.GEO_KV) {
    const kvValue = await env.GEO_KV.get(storageKey);
    if (kvValue) {
      ctx.waitUntil(writeToRamCache(cache, cacheKeyReq, kvValue));
      return kvValue;
    }
  }

  // Capa 3: Google Maps
  const neighborhood = await getSafeNeighborhoodFromGoogle(lat, lon, env.GOOGLE_MAPS_KEY);

  // Guardado
  if (env.GEO_KV) ctx.waitUntil(env.GEO_KV.put(storageKey, neighborhood));
  ctx.waitUntil(writeToRamCache(cache, cacheKeyReq, neighborhood));

  return neighborhood;
}

async function writeToRamCache(cache, request, value) {
  const response = new Response(value, {
    headers: { 'Cache-Control': 'public, max-age=604800', 'Content-Type': 'text/plain' }
  });
  await cache.put(request, response);
}

async function getSafeNeighborhoodFromGoogle(lat, lon, apiKey) {
  const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&result_type=neighborhood|sublocality|locality&language=es&key=${apiKey}`;
  const response = await fetch(googleUrl);
  const data = await response.json();
  if (data.status !== 'OK' || data.results.length === 0) return 'Montevideo';
  const addressComponents = data.results.flatMap(r => r.address_components);
  const match = ALLOWED_BARRIOS.find(allowed => 
    addressComponents.some(comp => comp.long_name.toLowerCase().includes(allowed.toLowerCase()))
  );
  return match ? match : 'Montevideo';
}
