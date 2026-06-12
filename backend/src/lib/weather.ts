import { WeatherData } from './scoring';

const BASE = process.env.OPENMETEO_BASE_URL ?? 'https://api.open-meteo.com/v1';

function wmoToCondition(code: number): WeatherData['condition'] {
  if (code === 0)                          return 'clear';
  if (code <= 2)                           return 'partly_cloudy';
  if (code === 3)                          return 'overcast';
  if (code === 45 || code === 48)          return 'fog';
  if (code >= 51 && code <= 55)            return 'drizzle';
  if (code >= 61 && code <= 65)            return 'rain';
  if (code >= 71 && code <= 77)            return 'snow';
  if (code === 95 || code === 96 || code === 99) return 'thunderstorm';
  return 'overcast';
}

export async function getWeather(lat: number, lng: number): Promise<WeatherData> {
  const url = new URL(`${BASE}/forecast`);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lng));
  url.searchParams.set('current', 'weathercode,wind_speed_10m,precipitation,visibility');
  url.searchParams.set('timezone', 'auto');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo failed: ${res.status}`);

  const data = await res.json() as {
    current: {
      weathercode: number;
      wind_speed_10m: number;
      precipitation: number;
      visibility: number;
    };
  };

  const c = data.current;
  return {
    condition: wmoToCondition(c.weathercode),
    windSpeedKmh: c.wind_speed_10m,
    precipitationMm: c.precipitation,
    visibilityKm: c.visibility / 1000,
  };
}
