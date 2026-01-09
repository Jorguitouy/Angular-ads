
import { getSafeNeighborhoodWithSmartCache } from './utils';

// ========== SEGURIDAD: Dominios permitidos ==========
// Se construye dinámicamente desde env.SITE_URL
// Ejemplo: SITE_URL=https://arreglo.servicedecalefones.uy
function getAllowedOrigins(env) {
  const origins = [
    // Desarrollo local
    'http://localhost:4200',
    'http://localhost:3000',
    'http://127.0.0.1:4200',
  ];
  
  // Agregar dominio principal desde variable de entorno
  if (env?.SITE_URL) {
    const siteUrl = env.SITE_URL.replace(/\/$/, ''); // Quitar trailing slash
    origins.push(siteUrl);
    
    // Agregar versión con www si no la tiene, o sin www si la tiene
    try {
      const url = new URL(siteUrl);
      if (url.hostname.startsWith('www.')) {
        origins.push(siteUrl.replace('www.', ''));
      } else {
        origins.push(siteUrl.replace('://', '://www.'));
      }
    } catch(e) {}
  }
  
  // Fallback: sin dominio por defecto - requiere SITE_URL configurado
  // No hardcodear dominios para evitar exposición en código fuente
  
  return origins;
}

// Headers CORS seguros
function getCorsHeaders(origin, env) {
  const allowedOrigins = getAllowedOrigins(env);
  const isAllowed = allowedOrigins.some(allowed => 
    origin === allowed || origin?.endsWith('.pages.dev')
  );
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

// Validar que la petición viene de nuestro sitio
function isValidOrigin(request, env) {
  const origin = request.headers.get('Origin');
  const referer = request.headers.get('Referer');
  const allowedOrigins = getAllowedOrigins(env);
  
  // Permitir peticiones sin Origin (navegación directa, beacons)
  if (!origin && !referer) return true;
  
  // Verificar Origin
  if (origin) {
    return allowedOrigins.some(allowed => 
      origin === allowed || origin.endsWith('.pages.dev')
    );
  }
  
  // Verificar Referer como fallback
  if (referer) {
    return allowedOrigins.some(allowed => referer.startsWith(allowed));
  }
  
  return false;
}

class ConfigInjector {
  constructor(config) {
    this.config = config;
  }
  
  element(element) {
    // Inyectamos las variables globales en el script tag con id="server-config"
    element.setInnerContent(`
      window.SC_INJECTED_LOC = ${JSON.stringify(this.config.loc)};
      window.SC_USER_COUNTRY = ${JSON.stringify(this.config.country)};
      window.SC_TURNSTILE_KEY = ${JSON.stringify(this.config.turnstileKey)};
      window.SC_PHONE_CALL_ENCODIGO = ${JSON.stringify(this.config.phoneCall)};
      window.SC_PHONE_CALL_VISUAL = ${JSON.stringify(this.config.phoneVisual)};
      window.SC_PHONE_WHATSAPP = ${JSON.stringify(this.config.phoneWa)};
    `, { html: true });
  }
}

export async function onRequest({ request, next, env, ctx }) {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin') || '';
  
  // ========== PROTECCIÓN DE APIs ==========
  if (url.pathname.startsWith('/api/')) {
    
    // Manejar preflight CORS (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(origin, env)
      });
    }
    
    // Validar origen para APIs sensibles (excepto trap-bot que es honeypot)
    if (!url.pathname.includes('trap-bot') && !isValidOrigin(request, env)) {
      return new Response(JSON.stringify({ error: 'Forbidden: Invalid origin' }), {
        status: 403,
        headers: { 
          'Content-Type': 'application/json',
          ...getCorsHeaders(origin, env)
        }
      });
    }
  }
  
  const response = await next();
  const contentType = response.headers.get('content-type') || '';

  // Agregar headers CORS a respuestas de API
  if (url.pathname.startsWith('/api/')) {
    const newHeaders = new Headers(response.headers);
    const corsHeaders = getCorsHeaders(origin, env);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }

  // Solo interceptamos HTML, ignoramos CSS/JS/Images
  if (contentType.includes('text/html')) {
    
    // 1. Detección de Geo
    const lat = request.cf?.latitude;
    const lon = request.cf?.longitude;
    const country = request.cf?.country || 'UY';
    let detectedLoc = 'Montevideo';

    // PERFORMANCE OPTIMIZATION: Race Condition
    // Si Google Maps tarda más de 800ms, abortamos la detección para no frenar la carga de la web.
    // El usuario verá "Montevideo" por defecto, que es aceptable para evitar un LCP alto.
    if (lat && lon && env.GOOGLE_MAPS_KEY) {
        try {
            const geoPromise = getSafeNeighborhoodWithSmartCache(lat, lon, env, ctx);
            const timeoutPromise = new Promise(resolve => setTimeout(() => resolve('Montevideo'), 800));
            
            detectedLoc = await Promise.race([geoPromise, timeoutPromise]);
        } catch (e) {
            // Fallback silencioso en caso de error
        }
    }

    // 2. Preparar Configuración
    const config = {
        loc: detectedLoc,
        country: country,
        turnstileKey: env.TURNSTILE_SITE_KEY || null,
        phoneCall: env.PHONE_CALL_ENCODIGO || '59896758200',
        phoneVisual: env.PHONE_CALL_VISUAL || '096 758 200',
        phoneWa: env.PHONE_WHATSAPP || '59896758200'
    };

    // 3. Reescribir el HTML
    return new HTMLRewriter()
      .on('script#server-config', new ConfigInjector(config))
      .transform(response);
  }

  return response;
}
