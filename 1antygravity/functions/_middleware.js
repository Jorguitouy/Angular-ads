import { getSafeNeighborhoodWithSmartCache } from "./utils";

/**
 * SECURITY POLICIES (Bank-Grade Standards)
 */
const BASE_SECURITY_HEADERS = {
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://picsum.photos https://*.google.com; frame-src https://challenges.cloudflare.com; connect-src 'self' https://maps.googleapis.com https://*.google.com;",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",
};

class ConfigInjector {
  constructor(config) {
    this.config = config;
  }

  element(element) {
    element.setInnerContent(
      `
      window._init = {
        l: ${JSON.stringify(this.config.loc)},
        c: ${JSON.stringify(this.config.country)},
        tk: ${JSON.stringify(this.config.turnstileKey)},
        p: ${JSON.stringify(this.config.phoneCall)},
        v: ${JSON.stringify(this.config.phoneVisual)},
        w: ${JSON.stringify(this.config.phoneWa)}
      };
    `,
      { html: true }
    );
  }
}

/**
 * RATE LIMITER (DDoS Protection Layer)
 * Prevents L7 flood attacks using Cloudflare KV as a distributed state.
 *
 * ¿Dónde se guardan?: Se guardan en "Cloudflare KV" (Key-Value Storage), que es una base de datos
 * ultrarrápida distribuida por todo el mundo en los servidores de Cloudflare.
 * Es totalmente privada y no visible para el usuario.
 *
 * ¿Cuándo se borra?: Usamos un TTL (Time To Live). Cada vez que guardamos la IP, le decimos
 * a Cloudflare: "Si no hay noticias de esta IP en los próximos 120 segundos, borra el registro".
 * Si la IP vuelve a entrar, el cronómetro de 120 segundos se reinicia.
 */
async function enforceRateLimit(request, env, ctx) {
  if (!env.GEO_KV) return true;

  // EXCLUSIÓN DE BOTS VERIFICADOS
  const isVerifiedBot =
    request.cf?.botManagement?.verifiedBot || request.cf?.verifiedBot;
  if (isVerifiedBot) return true;

  // CARGAR CONFIG DINÁMICA (O usar default)
  let rateLimitSeconds = 120;
  let maxRequests = 60;

  try {
    const rawConfig = await env.GEO_KV.get("GLOBAL_CONFIG");
    if (rawConfig) {
      const config = JSON.parse(rawConfig);
      rateLimitSeconds = config.rateLimit || 120;
      maxRequests = config.requestsPerWindow || 60;
    }
  } catch (e) {
    // Si falla la lectura, usamos los defaults robustos
  }

  const ip = request.headers.get("CF-Connecting-IP") || "local";
  const key = `ip_limit_v2:${ip}`; // Renovamos la clave de versión para resetear contadores previos
  const count = parseInt((await env.GEO_KV.get(key)) || "0");

  // El sistema bloquea si se superan las 60 solicitudes en la ventana de 120 segundos (2 minutos).
  if (count > maxRequests) return false;

  // OPTIMIZACIÓN: No esperamos a que la base de datos confirme la escritura para responder al usuario.
  // Usamos ctx.waitUntil para que se ejecute en segundo plano "después" de enviar la respuesta.
  const updateTask = env.GEO_KV.put(key, (count + 1).toString(), {
    expirationTtl: rateLimitSeconds,
  });

  if (ctx && ctx.waitUntil) {
    ctx.waitUntil(updateTask);
  } else {
    await updateTask;
  }

  return true;
}

export async function onRequest({ request, next, env, ctx }) {
  const clientIp = request.headers.get("CF-Connecting-IP") || "local";

  // 1. DDOS CHECK (Excluyendo bots verificados)
  const isAllowed = await enforceRateLimit(request, env, ctx);
  if (!isAllowed) {
    return new Response("Too Many Requests (DDoS Protection Active)", {
      status: 429,
    });
  }

  const response = await next();
  const contentType = response.headers.get("content-type") || "";

  // 2. APPLY SECURITY HEADERS AND CACHE POLICIES
  const secureResponse = new Response(response.body, response);
  Object.entries(BASE_SECURITY_HEADERS).forEach(([k, v]) =>
    secureResponse.headers.set(k, v)
  );

  // ESTRATEGIA DE CACHÉ
  if (contentType.includes("text/html")) {
    secureResponse.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, must-revalidate"
    );
    secureResponse.headers.set("CDN-Cache-Control", "no-store");

    // 3. HTML SPECIFIC ENHANCEMENTS (Inyección)
    const lat = request.cf?.latitude;
    const lon = request.cf?.longitude;
    const country = request.cf?.country || "UY";
    let detectedLoc = "Montevideo";

    if (lat && lon && env.GOOGLE_MAPS_KEY) {
      try {
        const geoPromise = getSafeNeighborhoodWithSmartCache(
          lat,
          lon,
          env,
          ctx
        );
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(() => resolve("Montevideo"), 800)
        );
        detectedLoc = await Promise.race([geoPromise, timeoutPromise]);
      } catch (e) {}
    }

    const config = {
      loc: detectedLoc,
      country: country,
      turnstileKey: env.TURNSTILE_SITE_KEY || null,
      phoneCall: env.PHONE_CALL_ENCODIGO || "59896758200",
      phoneVisual: env.PHONE_CALL_VISUAL || "096 758 200",
      phoneWa: env.PHONE_WHATSAPP || "59896758200",
    };

    return new HTMLRewriter()
      .on("script#app-init", new ConfigInjector(config))
      .transform(secureResponse);
  } else if (
    contentType.includes("javascript") ||
    contentType.includes("css") ||
    contentType.includes("image") ||
    contentType.includes("font")
  ) {
    // Para Estáticos
    secureResponse.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  }

  return secureResponse;
}
