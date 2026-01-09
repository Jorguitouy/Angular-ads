
export async function onRequest({ request }) {
    // Aquí podrías agregar lógica para banear la IP en KV si quisieras
    return new Response("OK", { status: 200 });
}
