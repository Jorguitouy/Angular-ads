
export const ALLOWED_BARRIOS = [
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

export async function getSafeNeighborhoodWithSmartCache(lat, lon, env, ctx) {
  const factor = 200; 
  const gridLat = (Math.round(parseFloat(lat) * factor) / factor).toFixed(3);
  const gridLon = (Math.round(parseFloat(lon) * factor) / factor).toFixed(3);
  
  const storageKey = `geo_v2:${gridLat}:${gridLon}`;
  
  // Cache check en KV
  if (env.GEO_KV) {
    const kvValue = await env.GEO_KV.get(storageKey);
    if (kvValue) return kvValue;
  }

  // Fetch Google
  const neighborhood = await getSafeNeighborhoodFromGoogle(lat, lon, env.GOOGLE_MAPS_KEY);

  // Cache Save
  if (env.GEO_KV) {
    // Si tenemos ctx (contexto de ejecución), usamos waitUntil para no bloquear la respuesta
    if(ctx && ctx.waitUntil) {
        ctx.waitUntil(env.GEO_KV.put(storageKey, neighborhood, { expirationTtl: 5184000 }));
    } else {
        await env.GEO_KV.put(storageKey, neighborhood, { expirationTtl: 5184000 });
    }
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
