
import { getSafeNeighborhoodWithSmartCache } from '../utils';

export async function onRequest({ request, env, ctx }) {
  const url = new URL(request.url);
  const lat = url.searchParams.get('lat');
  const lon = url.searchParams.get('lon');
  
  if (!lat || !lon) return new Response(JSON.stringify({error: 'Params missing'}), {status: 400});
  
  try {
      const loc = await getSafeNeighborhoodWithSmartCache(lat, lon, env, ctx);
      return new Response(JSON.stringify({location: loc}), {
          headers: { 'Content-Type': 'application/json' }
      });
  } catch(e) {
      return new Response(JSON.stringify({error: e.message}), {status: 500});
  }
}
