import { supabase } from '../db/supabase';
import { BikeType } from '../graphql/generated';
import { getRoute } from '../lib/routing';
import { getWeather } from '../lib/weather';
import { rankPOIs } from '../lib/groq';
import {
  scoreWeather,
  scoreTraffic,
  scoreHazards,
  adjustForBikeType,
  combineScores,
  suggestBikeType,
  HazardData,
  BikeTypeFit,
} from '../lib/scoring';

// Fitness profile for each bike type — drives score adjustments in adverse conditions
const BIKE_TYPE_FIT: Record<BikeType, BikeTypeFit> = {
  [BikeType.Supersport]: { surface_preference: 'tarmac', weather_tolerance: 'low', hazard_tolerance: 'low' },
  [BikeType.SportNaked]: { surface_preference: 'tarmac', weather_tolerance: 'low', hazard_tolerance: 'low' },
  [BikeType.AdventureTourerOffroad]: { surface_preference: 'off-road', weather_tolerance: 'high', hazard_tolerance: 'high' },
  [BikeType.AdventureTourerHighway]: { surface_preference: 'mixed', weather_tolerance: 'high', hazard_tolerance: 'medium' },
  [BikeType.Commuter]: { surface_preference: 'tarmac', weather_tolerance: 'medium', hazard_tolerance: 'medium' },
  [BikeType.Supermoto]: { surface_preference: 'mixed', weather_tolerance: 'medium', hazard_tolerance: 'high' },
  [BikeType.Enduro]: { surface_preference: 'off-road', weather_tolerance: 'high', hazard_tolerance: 'high' },
  [BikeType.Cruiser]: { surface_preference: 'tarmac', weather_tolerance: 'medium', hazard_tolerance: 'low' },
  [BikeType.NeoRetro]: { surface_preference: 'tarmac', weather_tolerance: 'low', hazard_tolerance: 'low' },
  [BikeType.Scrambler]: { surface_preference: 'mixed', weather_tolerance: 'medium', hazard_tolerance: 'medium' },
  [BikeType.HyperTourer]: { surface_preference: 'tarmac', weather_tolerance: 'high', hazard_tolerance: 'medium' },
};

async function fetchHazards(
  startLat: number, startLng: number,
  endLat: number, endLng: number
): Promise<HazardData[]> {
  const { data, error } = await supabase
    .from('hazard_reports')
    .select('id, lat, lng, hazard_type, severity, description, reported_at')
    .gte('lat', Math.min(startLat, endLat) - 0.5)
    .lte('lat', Math.max(startLat, endLat) + 0.5)
    .gte('lng', Math.min(startLng, endLng) - 0.5)
    .lte('lng', Math.max(startLng, endLng) + 0.5)
    .gte('expires_at', new Date().toISOString()); // exclude expired reports

  if (error) {
    console.warn('[routeService] fetchHazards skipped (table missing or error):', error.message);
    return [];
  }

  return (data ?? []).map(row => ({
    id: row.id,
    hazardType: row.hazard_type,
    severity: row.severity as HazardData['severity'],
    lat: row.lat,
    lng: row.lng,
    description: row.description,
    reportedAt: row.reported_at,
  }));
}

export async function getRouteReadiness(
  startPlace: string,
  startEloc: string,
  endPlace: string,
  endEloc: string,
  bikeType?: BikeType
) {
  // Step 1: Route using eLocs from autocomplete — geocoding skipped
  const route = await getRoute(startEloc, endEloc);

  // Step 3: Weather + hazards in parallel
  const [weather, hazards] = await Promise.all([
    getWeather(route.midpoint.lat, route.midpoint.lng),
    fetchHazards(route.startCoord.lat, route.startCoord.lng, route.endCoord.lat, route.endCoord.lng),
  ]);

  // Step 4: POIs after weather (Groq prompt uses weather condition)
  const pois = await rankPOIs(startPlace, endPlace, weather);

  // Step 5: Score
  const weatherFactor = scoreWeather(weather);
  const trafficFactor = scoreTraffic({
    durationSeconds: route.durationSeconds,
    durationInTrafficSeconds: route.durationInTrafficSeconds,
  });
  const hazardFactor = scoreHazards(hazards);

  const fit = BIKE_TYPE_FIT[bikeType ?? BikeType.SportNaked];
  const adjusted = adjustForBikeType(
    { weather: weatherFactor, hazards: hazardFactor, traffic: trafficFactor },
    fit,
    weather
  );

  const { status, summary } = combineScores(adjusted);
  const suggestion = suggestBikeType(hazards, weather);

  // Step 6: Assemble RouteReadiness response
  return {
    overallStatus: status,
    summary,
    weather: adjusted.weather,
    hazards: adjusted.hazards,
    traffic: adjusted.traffic,
    hazardReports: hazards,
    suggestedBikeType: { bikeType: suggestion.bikeType, reason: suggestion.reason },
    routeGeometry: route.geometry,
    pointsOfInterest: pois,
  };
}
