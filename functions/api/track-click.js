
export async function onRequestPost({ request, env }) {
  try {
    // Los beacons a veces envían JSON, a veces text/plain. Intentamos parsear.
    const text = await request.text();
    let data = {};
    try {
        data = JSON.parse(text);
    } catch(e) {
        // Si falla el parseo, guardamos el texto crudo si es necesario o ignoramos
    }

    // Si tenemos base de datos configurada, guardamos el evento
    if (env.DB && data.event_type) {
        const clientIp = request.headers.get('CF-Connecting-IP') || 'Unknown';
        
        // Tabla sugerida: click_events (verificar si existe en DB, si no, fallará silenciosamente)
        try {
            await env.DB.prepare(`
                INSERT INTO click_events 
                (event_type, element_id, fingerprint, ip, user_agent, location, keyword, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                data.event_type,
                data.element_id,
                data.fingerprint,
                clientIp,
                request.headers.get('User-Agent'),
                data.location,
                data.keyword,
                new Date().toISOString()
            ).run();
        } catch(dbErr) {
            // Ignoramos error de DB para no bloquear la respuesta (es un beacon)
            // console.error(dbErr);
        }
    }

    return new Response("OK", { status: 200 });
  } catch (e) {
    return new Response("Error", { status: 500 });
  }
}
