
/**
 * SERVERLESS EDGE FUNCTION - GEO-GRID OPTIMIZED & SECURED
 */

// --- HEADERS BASE ---
const BASE_SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "accelerometer=(), camera=(), microphone=(), geolocation=(self), payment=(), usb=()"
};

// Dominios permitidos para CORS (Ajustar en producción)
const ALLOWED_ORIGINS = [
  "https://servicecalefones.com",
  "http://localhost:4200",
  "https://localhost:4200"
];

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

// --- HELPERS DE SEGURIDAD ---

/**
 * Verifica si el origen de la petición está permitido
 */
function isOriginAllowed(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true; // Permitir peticiones sin origen (backend-to-backend o directas si no es navegador)
  return ALLOWED_ORIGINS.some(allowed => origin === allowed || origin.endsWith("servicecalefones.com"));
}

/**
 * Rate Limiter Avanzado & Política de Retención
 * Regla 1: Máximo 6 emails cada 24 horas.
 * Regla 2: Si envía 3 días seguidos, marcar para retención de 60 días (sospechoso/frecuente).
 *          Si es usuario normal, marcar para retención de 30 días.
 */
async function checkRateLimitAndRetention(ip, env) {
  if (!env.GEO_KV) return { allowed: true, retentionTag: '30D' }; // Fallback si no hay KV
  
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // 1. CHEQUEO DE LÍMITE DIARIO (6 cada 24hs)
  const dailyKey = `rate_limit_v3:${ip}`; // Clave diaria (TTL 24h)
  const currentDailyCount = await env.GEO_KV.get(dailyKey);
  const count = parseInt(currentDailyCount || '0');

  if (count >= 6) {
    return { allowed: false, retentionTag: 'BLOCKED' };
  }

  // Incrementar contador diario
  await env.GEO_KV.put(dailyKey, (count + 1).toString(), { expirationTtl: 86400 }); // 24 Horas

  // 2. DETECCIÓN DE RACHA (3 Días Seguidos)
  const streakKey = `streak_count:${ip}`;
  const lastSeenKey = `last_seen_date:${ip}`;
  
  const lastSeenDate = await env.GEO_KV.get(lastSeenKey);
  let streak = parseInt(await env.GEO_KV.get(streakKey) || '0');

  // Lógica de días consecutivos
  if (lastSeenDate) {
    const lastDate = new Date(lastSeenDate);
    const diffTime = Math.abs(now - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (lastSeenDate === todayStr) {
      // Mismo día, no tocamos la racha
    } else if (diffDays <= 2) { 
      // Si fue ayer (o casi), sumamos racha
      streak++;
    } else {
      // Pasaron más días, reiniciamos racha
      streak = 1;
    }
  } else {
    // Primera vez
    streak = 1;
  }

  // Guardamos estado de racha (TTL 7 días para no perder el hilo si vuelve en 2 días)
  await env.GEO_KV.put(streakKey, streak.toString(), { expirationTtl: 604800 });
  await env.GEO_KV.put(lastSeenKey, todayStr, { expirationTtl: 604800 });

  // 3. DEFINIR POLÍTICA DE RETENCIÓN
  // Si lleva 3 o más días seguidos molestando, guardamos datos por 60 días. Si no, 30.
  const retentionTag = streak >= 3 ? 'RETENTION_60D_FREQUENT' : 'RETENTION_30D_STANDARD';

  return { allowed: true, retentionTag };
}

// --- HELPERS DE CACHÉ ---

async function getSafeNeighborhoodWithSmartCache(lat, lon, env, ctx) {
  const factor = 200; 
  const gridLat = (Math.round(parseFloat(lat) * factor) / factor).toFixed(3);
  const gridLon = (Math.round(parseFloat(lon) * factor) / factor).toFixed(3);
  
  const storageKey = `geo_v2:${gridLat}:${gridLon}`;
  
  if (env.GEO_KV) {
    const kvValue = await env.GEO_KV.get(storageKey);
    if (kvValue) return kvValue;
  }

  const neighborhood = await getSafeNeighborhoodFromGoogle(lat, lon, env.GOOGLE_MAPS_KEY);

  if (env.GEO_KV) {
    ctx.waitUntil(
        env.GEO_KV.put(storageKey, neighborhood, { expirationTtl: 5184000 })
    );
  }

  return neighborhood;
}

async function getSafeNeighborhoodFromGoogle(lat, lon, apiKey) {
  if (!apiKey) return 'Montevideo';
  
  const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&result_type=neighborhood|sublocality|locality&language=es&key=${apiKey}`;
  
  try {
    const response = await fetch(googleUrl);
    const data = await response.json();
    
    if (data.status !== 'OK' || data.results.length === 0) return 'Montevideo';
    
    const addressComponents = data.results.flatMap(r => r.address_components);
    const match = ALLOWED_BARRIOS.find(allowed => 
      addressComponents.some(comp => comp.long_name.toLowerCase().includes(allowed.toLowerCase()))
    );
    
    return match ? match : 'Montevideo';
  } catch (e) {
    return 'Montevideo';
  }
}

function applyHeaders(response, type = 'generic', request = null) {
  const newHeaders = new Headers(response.headers);
  
  // Security Headers Globales
  Object.keys(BASE_SECURITY_HEADERS).forEach(key => {
    newHeaders.set(key, BASE_SECURITY_HEADERS[key]);
  });

  // CORS Estricto
  if (request) {
     const origin = request.headers.get("Origin");
     if (isOriginAllowed(request)) {
       newHeaders.set("Access-Control-Allow-Origin", origin || "*");
       newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
       newHeaders.set("Access-Control-Allow-Headers", "Content-Type");
     }
  }

  if (type === 'static') {
    newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
  } else if (type === 'html') {
    newHeaders.set("Content-Type", "text/html; charset=utf-8");
    newHeaders.set("Cache-Control", "private, max-age=0, must-revalidate");
    newHeaders.set("CDN-Cache-Control", "max-age=0");
  } else if (type === 'api') {
    newHeaders.set("Cache-Control", "no-store, max-age=0");
    newHeaders.set("Content-Type", "application/json; charset=utf-8");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

// --- MAIN WORKER ---

export default {
  // A. Evento para Tráfico Web (Usuarios)
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 0. MANEJO DE OPTIONS (CORS Preflight)
    if (request.method === "OPTIONS") {
      return applyHeaders(new Response(null, { status: 204 }), 'api', request);
    }

    // 1. API ROUTES
    if (url.pathname.startsWith('/api/')) {
       
       // A. Trap Bot
       if (url.pathname === '/api/trap-bot') {
         // TODO: Podríamos loguear la IP en una lista negra en KV aquí
         return applyHeaders(new Response("OK"), 'api', request);
       }

       // B. Geocode
       if (url.pathname === '/api/geocode') {
          if (!isOriginAllowed(request)) return new Response("Forbidden", { status: 403 });
          
          const lat = url.searchParams.get('lat');
          const lon = url.searchParams.get('lon');
          if (!lat || !lon) return new Response(JSON.stringify({error: 'Params missing'}), {status: 400});
          
          const loc = await getSafeNeighborhoodWithSmartCache(lat, lon, env, ctx);
          return applyHeaders(new Response(JSON.stringify({location: loc})), 'api', request);
       }

       // C. Send Email (CRITICAL SECURITY AREA)
       if (url.pathname === '/api/send-email' && request.method === 'POST') {
          if (!isOriginAllowed(request)) return new Response("Forbidden origin", { status: 403 });

          const clientIp = request.headers.get('CF-Connecting-IP') || 'Unknown';
          
          // RATE LIMITING & RETENTION POLICY
          const { allowed, retentionTag } = await checkRateLimitAndRetention(clientIp, env);
          
          if (!allowed) {
            return applyHeaders(new Response(JSON.stringify({ error: 'Límite de envíos diarios excedido (Max 6/24hs).' }), { status: 429 }), 'api', request);
          }

          try {
             const body = await request.json();
             
             // VALIDACIÓN DE ENTRADA
             if (!body.name || !body.phone || !body.email || !body.turnstileToken) {
                return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
             }
             if (body.message && body.message.length > 2000) {
                return new Response(JSON.stringify({ error: 'Message too long' }), { status: 400 });
             }

             // TURNSTILE VERIFICATION
             const tsData = new FormData();
             tsData.append('secret', env.TURNSTILE_SECRET_KEY);
             tsData.append('response', body.turnstileToken);
             tsData.append('remoteip', clientIp);
             
             const tsResp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: tsData });
             const tsOutcome = await tsResp.json();
             if (!tsOutcome.success) return new Response(JSON.stringify({ error: 'Captcha failed' }), { status: 403 });

             // DATABASE INSERT (With Retention Policy Tag)
             // Nota: Guardamos el Tag de retención junto a la IP para futuras limpiezas
             const ipWithPolicy = `${clientIp} [${retentionTag}]`;
             
             if (env.DB) {
                try {
                  await env.DB.prepare(`INSERT INTO contacts (name, phone, email, message, ip, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
                    .bind(body.name, body.phone, body.email, body.message || '', ipWithPolicy, new Date().toISOString())
                    .run();
                } catch(e) { console.error('DB Error', e); }
             }

             // EMAIL SEND
             const resendResp = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: 'ServiceCalefones <web@servicecalefones.com>',
                    to: [env.CONTACT_EMAIL || 'tucorreo@ejemplo.com'],
                    reply_to: body.email,
                    subject: `🚨 Nuevo Cliente: ${body.name}`,
                    html: `<p>Nombre: ${body.name}</p><p>Tel: <a href="tel:${body.phone}">${body.phone}</a></p><p>Msg: ${body.message}</p><br><small>IP Security: ${ipWithPolicy}</small>`
                })
             });
             
             if (!resendResp.ok) throw new Error('Email provider error');
             return applyHeaders(new Response(JSON.stringify({ success: true })), 'api', request);

          } catch (e) {
             return applyHeaders(new Response(JSON.stringify({ error: e.message }), { status: 500 }), 'api', request);
          }
       }
       
       return applyHeaders(new Response(JSON.stringify({ error: 'Not found' }), { status: 404 }), 'api', request);
    }

    // 2. STATIC ASSETS
    const response = await fetch(request);
    const isStaticAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|ttf|woff|woff2|json)$/);
    if (isStaticAsset) return applyHeaders(response, 'static');

    // 3. HTML INJECTION (SECURED)
    const isPageLoad = (url.pathname === '/' || url.pathname === '/index.html') && 
                       response.headers.get('content-type')?.includes('text/html');
    const isBot = (request.headers.get('User-Agent') || '').toLowerCase().includes('bot');

    if (isPageLoad && !isBot) {
      let originalHtml = await response.text();
      
      const PHONE_CALL = env.PHONE_CALL_ENCODIGO || '59896758200';
      const PHONE_VISUAL = env.PHONE_CALL_VISUAL || '096 758 200';
      const PHONE_WA = env.PHONE_WHATSAPP || '59896758200';
      const country = request.cf?.country || 'UY';
      let injectedLoc = 'Montevideo';

      const lat = request.cf?.latitude;
      const lon = request.cf?.longitude;
      
      if (lat && lon && env.GOOGLE_MAPS_KEY) {
         try {
            injectedLoc = await getSafeNeighborhoodWithSmartCache(lat, lon, env, ctx);
         } catch (e) {}
      }

      // SEGURIDAD: Usamos JSON.stringify para evitar inyección de código al romper el string.
      originalHtml = originalHtml
        .replace('window.SC_PHONE_CALL_ENCODIGO = null;', `window.SC_PHONE_CALL_ENCODIGO = ${JSON.stringify(PHONE_CALL)};`)
        .replace('window.SC_PHONE_CALL_VISUAL = null;', `window.SC_PHONE_CALL_VISUAL = ${JSON.stringify(PHONE_VISUAL)};`)
        .replace('window.SC_PHONE_WHATSAPP = null;', `window.SC_PHONE_WHATSAPP = ${JSON.stringify(PHONE_WA)};`)
        .replace('window.SC_USER_COUNTRY = null;', `window.SC_USER_COUNTRY = ${JSON.stringify(country)};`)
        .replace('window.SC_INJECTED_LOC = null;', `window.SC_INJECTED_LOC = ${JSON.stringify(injectedLoc)};`);

      if (env.TURNSTILE_SITE_KEY) {
        originalHtml = originalHtml.replace('window.SC_TURNSTILE_KEY = null;', `window.SC_TURNSTILE_KEY = ${JSON.stringify(env.TURNSTILE_SITE_KEY)};`);
      }

      return applyHeaders(new Response(originalHtml, {
        status: response.status,
        headers: response.headers
      }), 'html');
    }

    return applyHeaders(response, 'generic');
  },

  // B. Evento Programado (CRON JOB) - Limpieza Automática
  async scheduled(event, env, ctx) {
    if (!env.DB) {
      console.log("⚠️ No DB configured. Skipping cleanup.");
      return;
    }

    console.log("⏰ Cron Trigger fired: Cleaning up database...");

    try {
      // 1. Eliminar datos con etiqueta RETENTION_30D que tengan más de 30 días
      const delete30Query = `
        DELETE FROM contacts 
        WHERE created_at <= datetime('now', '-30 days') 
        AND ip LIKE '%RETENTION_30D%';
      `;
      
      // 2. Eliminar TODO lo que tenga más de 60 días (Catch-all y regla para RETENTION_60D)
      const delete60Query = `
        DELETE FROM contacts 
        WHERE created_at <= datetime('now', '-60 days');
      `;

      // Ejecutar en lote
      const result = await env.DB.batch([
        env.DB.prepare(delete30Query),
        env.DB.prepare(delete60Query)
      ]);

      console.log("✅ Database cleanup successful", JSON.stringify(result));

    } catch (e) {
      console.error("❌ Database cleanup failed", e);
    }
  }
};
