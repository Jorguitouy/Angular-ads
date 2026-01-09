export async function onRequestPost({ request, env }) {
  const authHeader = request.headers.get("Authorization");
  const token = env.ADMIN_API_TOKEN;

  // 1. AUTH CHECK
  if (!token || authHeader !== `Bearer ${token}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. PARSE CONFIG
  try {
    const newConfig = await request.json();

    // Validar estructura básica
    if (
      typeof newConfig.rateLimit !== "number" ||
      typeof newConfig.requestsPerWindow !== "number"
    ) {
      return new Response("Invalid config structure", { status: 400 });
    }

    // 3. SAVE TO KV
    if (!env.GEO_KV) {
      return new Response("KV Binding 'GEO_KV' missing", { status: 500 });
    }

    await env.GEO_KV.put("GLOBAL_CONFIG", JSON.stringify(newConfig));

    return new Response(
      JSON.stringify({
        success: true,
        applied: newConfig,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    return new Response("Error processing request: " + e.message, {
      status: 500,
    });
  }
}

export async function onRequestGet({ env }) {
  if (!env.GEO_KV) return new Response("KV missing", { status: 500 });

  const config = await env.GEO_KV.get("GLOBAL_CONFIG");
  return new Response(
    config || JSON.stringify({ rateLimit: 120, requestsPerWindow: 60 }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
