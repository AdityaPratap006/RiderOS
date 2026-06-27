/**
 * Geocoding: Mappls Place Geocode API  — returns eLoc (Mappls place code)
 * Routing:   Mappls route_adv          — biking profile (motorcycle-aware)
 *
 * Lat/lng for weather & hazards is extracted from the route geometry,
 * since the geocode response does not include coordinates.
 */

const MAPPLS_KEY = process.env.MAPPLS_STATIC_API_KEY!;

// ─── Geocoding via Mappls ─────────────────────────────────────────────────────

export const geocode = async (address: string): Promise<{ eloc: string }> => {
  const url = `https://search.mappls.com/search/address/geocode?address=${encodeURIComponent(address)}&access_token=${MAPPLS_KEY}`;
  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mappls geocode failed: ${res.status} — ${body}`);
  }

  const data = await res.json() as {
    copResults?: { eLoc: string } | Array<{ eLoc: string }>;
  };

  if (!data.copResults) throw new Error(`No geocode result for: ${address}`);

  const result = Array.isArray(data.copResults) ? data.copResults[0] : data.copResults;
  return { eloc: result.eLoc };
};

// ─── Routing via Mappls route_adv (biking = motorcycle) ───────────────────────

export const getRoute = async (
  startEloc: string,
  endEloc: string,
): Promise<{
  geometry: object;
  durationSeconds: number;
  durationInTrafficSeconds: number;
  midpoint: { lat: number; lng: number };
  startCoord: { lat: number; lng: number };
  endCoord: { lat: number; lng: number };
}> => {
  const url = `https://route.mappls.com/route/direction/route_adv/biking/${startEloc};${endEloc}?geometries=geojson&overview=full&exclude=ferry&access_token=${MAPPLS_KEY}`;
  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mappls routing failed: ${res.status} — ${body}`);
  }

  const raw = await res.json() as {
    code: string;
    routes: Array<{
      geometry: { type: string; coordinates: [number, number][] };
      duration: number;
      legs: Array<{ duration: number }>;
    }>;
  };

  if (raw.code !== 'Ok' || !raw.routes?.[0]) throw new Error(`No route found. Mappls code=${raw.code}`);

  const route = raw.routes[0];
  const coords = route.geometry.coordinates;
  const mid    = coords[Math.floor(coords.length / 2)];
  const first  = coords[0];
  const last   = coords[coords.length - 1];

  return {
    geometry:                 route.geometry,
    durationSeconds:          route.duration ?? route.legs?.[0]?.duration ?? 0,
    durationInTrafficSeconds: route.duration,
    midpoint:                 { lat: mid[1],   lng: mid[0]   },
    startCoord:               { lat: first[1], lng: first[0] },
    endCoord:                 { lat: last[1],  lng: last[0]  },
  };
};
