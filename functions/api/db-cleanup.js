
export async function onRequest({ request, env }) {
    // Seguridad básica: Requerir una clave secreta en la URL o Header para ejecutar la limpieza
    // Ejemplo: /api/db-cleanup?key=SUPER_SECRET_ADMIN_KEY
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    
    // Si no hay clave configurada en variables de entorno, usamos una por defecto insegura (SOLO PARA DEV)
    // En producción, DEBES configurar ADMIN_SECRET en Cloudflare
    const adminSecret = env.ADMIN_SECRET || 'CHANGE_THIS_IN_PROD';

    if (key !== adminSecret) {
        return new Response("Unauthorized", { status: 401 });
    }

    if (!env.DB) {
        return new Response("No DB configured", { status: 500 });
    }

    try {
      // 1. Eliminar datos antiguos (Política de Retención de 60 días)
      const result = await env.DB.prepare(`
        DELETE FROM contacts 
        WHERE created_at <= datetime('now', '-60 days');
      `).run();

      return new Response(JSON.stringify({ 
          success: true, 
          deleted_rows: result.meta?.changes 
      }), { 
          headers: { 'Content-Type': 'application/json' } 
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
