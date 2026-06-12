export interface WeatherData {
  condition: 'clear' | 'partly_cloudy' | 'overcast' | 'drizzle' | 'rain' | 'thunderstorm' | 'fog' | 'snow';
  windSpeedKmh: number;
  precipitationMm: number;
  visibilityKm: number;
}

export interface TrafficData {
  durationSeconds: number;
  durationInTrafficSeconds: number;
}

export interface HazardData {
  id: string;
  hazardType: string;
  severity: 'low' | 'medium' | 'high';
  lat: number;
  lng: number;
  description: string;
  reportedAt: string;
}

export interface Factor {
  score: number;
  note: string;
}

export interface RawScores {
  weather: Factor;
  hazards: Factor;
  traffic: Factor;
}

export interface BikeTypeFit {
  surface_preference: 'tarmac' | 'mixed' | 'off-road';
  weather_tolerance: 'low' | 'medium' | 'high';
  hazard_tolerance: 'low' | 'medium' | 'high';
}

export function scoreWeather(weather: WeatherData): Factor {
  const conditionScores: Record<WeatherData['condition'], number> = {
    clear: 100,
    partly_cloudy: 90,
    overcast: 75,
    drizzle: 55,
    fog: 45,
    rain: 35,
    thunderstorm: 10,
    snow: 5,
  };

  let score = conditionScores[weather.condition] ?? 75;

  if (weather.windSpeedKmh > 50) score = Math.min(score, 40);
  else if (weather.windSpeedKmh > 30) score = Math.min(score, 65);

  if (weather.visibilityKm < 1) score = Math.min(score, 30);
  else if (weather.visibilityKm < 5) score = Math.min(score, 55);

  const notes: string[] = [];
  if (['rain', 'thunderstorm', 'snow'].includes(weather.condition)) notes.push(`${weather.condition} conditions`);
  if (weather.windSpeedKmh > 30) notes.push(`strong winds (${weather.windSpeedKmh} km/h)`);
  if (weather.visibilityKm < 5) notes.push(`low visibility (${weather.visibilityKm.toFixed(1)} km)`);

  return { score, note: notes.length > 0 ? notes.join(', ') : 'Weather is good' };
}

export function scoreTraffic(traffic: TrafficData): Factor {
  // Congestion ratio: the Pune-dev approach — travel time delta as proxy
  const ratio = traffic.durationInTrafficSeconds / traffic.durationSeconds;

  if (ratio <= 1.1) return { score: 95, note: 'Free flow' };
  if (ratio <= 1.25) return { score: 75, note: 'Light traffic' };
  if (ratio <= 1.5) return { score: 50, note: `Moderate congestion (+${Math.round((ratio - 1) * 100)}% travel time)` };
  if (ratio <= 2.0) return { score: 30, note: `Heavy traffic (+${Math.round((ratio - 1) * 100)}% travel time)` };
  return { score: 10, note: `Severe congestion (+${Math.round((ratio - 1) * 100)}% travel time)` };
}

export function scoreHazards(hazards: HazardData[]): Factor {
  if (hazards.length === 0) return { score: 100, note: 'No reported hazards' };

  const severityWeight = { low: 5, medium: 15, high: 30 };
  const totalPenalty = hazards.reduce((sum, h) => sum + (severityWeight[h.severity] ?? 5), 0);
  const score = Math.max(0, 100 - totalPenalty);

  const highCount = hazards.filter(h => h.severity === 'high').length;
  const types = [...new Set(hazards.map(h => h.hazardType))].slice(0, 3).join(', ');

  const note = highCount > 0
    ? `${highCount} high-severity hazard${highCount > 1 ? 's' : ''} (${types})`
    : `${hazards.length} hazard report${hazards.length > 1 ? 's' : ''} (${types})`;

  return { score, note };
}

export function adjustForBikeType(raw: RawScores, fit: BikeTypeFit, weather: WeatherData): RawScores {
  const adjustments = { ...raw };

  const weatherAdj = { low: -15, medium: 0, high: 15 }[fit.weather_tolerance];
  const hazardAdj = { low: -15, medium: 0, high: 15 }[fit.hazard_tolerance];

  const hasRain = ['drizzle', 'rain', 'thunderstorm'].includes(weather.condition);

  adjustments.weather = {
    score: Math.max(0, Math.min(100, raw.weather.score + (hasRain ? weatherAdj : 0))),
    note: raw.weather.note,
  };

  adjustments.hazards = {
    score: Math.max(0, Math.min(100, raw.hazards.score + hazardAdj)),
    note: raw.hazards.note,
  };

  return adjustments;
}

export function combineScores(adjusted: RawScores): { status: 'good' | 'caution' | 'avoid'; summary: string } {
  const overall = adjusted.weather.score * 0.4 + adjusted.hazards.score * 0.4 + adjusted.traffic.score * 0.2;
  const status: 'good' | 'caution' | 'avoid' = overall >= 80 ? 'good' : overall >= 50 ? 'caution' : 'avoid';

  const lowFactors = [adjusted.weather, adjusted.hazards, adjusted.traffic]
    .filter(f => f.score < 80)
    .map(f => f.note);

  const summary = lowFactors.length > 0 ? lowFactors.join('. ') : 'All clear — good to ride.';
  return { status, summary };
}

export function suggestBikeType(
  hazards: HazardData[],
  weather: WeatherData
): { bikeType: string; reason: string } {
  const hasHighHazards = hazards.some(h => h.severity === 'high');
  const hasBadWeather = ['rain', 'thunderstorm'].includes(weather.condition);

  if (hasHighHazards || hasBadWeather) {
    return {
      bikeType: 'ADVENTURE_TOURER_HIGHWAY',
      reason: 'Upright ergonomics and higher ground clearance handle poor conditions better',
    };
  }

  if (weather.condition === 'clear' && hazards.length === 0) {
    return {
      bikeType: 'SPORT_NAKED',
      reason: 'Clean roads and clear weather — ideal for a sporty, engaging ride',
    };
  }

  return {
    bikeType: 'COMMUTER',
    reason: 'Mixed conditions — a comfortable, all-round bike is the safe choice',
  };
}
