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

import { BikeType } from '../graphql/generated';

export function analyzeBikeFit(
  bikeType: BikeType,
  fit: BikeTypeFit,
  weather: WeatherData,
  rawScores: { weather: Factor; hazards: Factor }
): { fit: 'ideal' | 'suitable' | 'manageable' | 'not_recommended'; score: number; note: string } {
  let score = 100;
  const concerns: string[] = [];

  const weatherScore = rawScores.weather.score;
  const hazardScore = rawScores.hazards.score;

  if (fit.weather_tolerance === 'low') {
    if (weatherScore < 40) {
      score -= 40;
      concerns.push('severe weather exceeds this bike\'s weather tolerance');
    } else if (weatherScore < 70) {
      score -= 20;
      concerns.push('weather conditions at the edge of comfort for this bike');
    }
  } else if (fit.weather_tolerance === 'medium') {
    if (weatherScore < 40) {
      score -= 20;
      concerns.push('tough weather for this bike profile');
    } else if (weatherScore < 55) {
      score -= 10;
    }
  }

  if (fit.hazard_tolerance === 'low') {
    if (hazardScore < 40) {
      score -= 35;
      concerns.push('road hazards are significant for a low-hazard-tolerance bike');
    } else if (hazardScore < 70) {
      score -= 15;
      concerns.push('some road hazards present on route');
    }
  } else if (fit.hazard_tolerance === 'medium') {
    if (hazardScore < 40) {
      score -= 15;
      concerns.push('notable hazards on route');
    }
  }

  if (fit.surface_preference === 'tarmac' && weather.windSpeedKmh > 40) {
    score -= 20;
    concerns.push(`crosswinds at ${weather.windSpeedKmh} km/h can unsettle a fully-faired machine`);
  } else if (fit.surface_preference === 'tarmac' && weather.windSpeedKmh > 25) {
    score -= 10;
    concerns.push(`notable wind at ${weather.windSpeedKmh} km/h`);
  }

  score = Math.max(0, score);

  const fitTier: 'ideal' | 'suitable' | 'manageable' | 'not_recommended' =
    score >= 85 ? 'ideal' :
    score >= 65 ? 'suitable' :
    score >= 40 ? 'manageable' : 'not_recommended';

  const note = concerns.length > 0
    ? concerns.join('; ')
    : `${bikeType} is a great match for these conditions`;

  return { fit: fitTier, score, note };
}

export function suggestBikeTypes(
  hazards: HazardData[],
  weather: WeatherData
): { bikeType: BikeType; reason: string }[] {
  const highHazardCount = hazards.filter(h => h.severity === 'high').length;
  const anyHazards = hazards.length > 0;

  if (['thunderstorm', 'snow'].includes(weather.condition)) {
    return [
      { bikeType: BikeType.AdventureTourerOffroad, reason: 'Extreme weather demands maximum weather protection and ground clearance' },
      { bikeType: BikeType.AdventureTourerHighway, reason: 'Upright ergonomics and weather protection for severe conditions' },
    ];
  }

  if (highHazardCount >= 2) {
    return [
      { bikeType: BikeType.Enduro, reason: 'Multiple high-severity hazards — built for unpredictable surfaces' },
      { bikeType: BikeType.AdventureTourerOffroad, reason: 'Off-road capability with added weather protection' },
    ];
  }

  if (['rain', 'fog'].includes(weather.condition) || highHazardCount === 1) {
    return [
      { bikeType: BikeType.AdventureTourerHighway, reason: 'Upright ergonomics, wind protection, and traction control suit these conditions' },
      { bikeType: BikeType.Commuter, reason: 'Predictable handling and strong braking on wet or hazardous roads' },
    ];
  }

  if (weather.condition === 'drizzle' || weather.visibilityKm < 5) {
    return [
      { bikeType: BikeType.Commuter, reason: 'Upright and predictable with good braking for damp conditions' },
      { bikeType: BikeType.Scrambler, reason: 'Agility and compliance on wet mixed surfaces' },
    ];
  }

  if (weather.condition === 'overcast' && anyHazards) {
    return [
      { bikeType: BikeType.Scrambler, reason: 'Mixed surface hazards with overcast skies — balances agility and compliance' },
      { bikeType: BikeType.NeoRetro, reason: 'Forgiving geometry handles road variation comfortably' },
    ];
  }

  if (weather.condition === 'overcast') {
    return [
      { bikeType: BikeType.Supermoto, reason: 'Overcast but clear roads — agile and fun' },
      { bikeType: BikeType.SportNaked, reason: 'Engaging ride without full-fairing commitment' },
    ];
  }

  if (weather.condition === 'partly_cloudy' && anyHazards) {
    return [
      { bikeType: BikeType.NeoRetro, reason: 'Good visibility with road hazards — upright ergonomics and forgiving geometry' },
      { bikeType: BikeType.Scrambler, reason: 'Handles surface variation with ease' },
    ];
  }

  if (weather.condition === 'partly_cloudy') {
    return [
      { bikeType: BikeType.SportNaked, reason: 'Great conditions for a sporty, engaging ride' },
      { bikeType: BikeType.Supersport, reason: 'Partly cloudy skies — still ideal enough to push a full-fairing machine' },
      { bikeType: BikeType.Supermoto, reason: 'Agile and fun on open roads' },
      { bikeType: BikeType.Cruiser, reason: 'Relaxed cruise on open roads' },
    ];
  }

  if (weather.condition === 'clear' && weather.windSpeedKmh > 20) {
    return [
      { bikeType: BikeType.Cruiser, reason: "Clear skies but notable wind — low centre of gravity keeps things stable" },
      { bikeType: BikeType.HyperTourer, reason: 'Comfort and stability at speed with wind protection' },
    ];
  }

  if (weather.condition === 'clear' && !anyHazards) {
    return [
      { bikeType: BikeType.Supersport, reason: 'Perfect conditions — clean tarmac and clear skies' },
      { bikeType: BikeType.SportNaked, reason: 'Engaging ride in ideal weather' },
      { bikeType: BikeType.Cruiser, reason: 'Relaxed cruise on a perfect day' },
    ];
  }

  return [
    { bikeType: BikeType.HyperTourer, reason: 'Clear weather with some road variation — comfort and performance in equal measure' },
    { bikeType: BikeType.NeoRetro, reason: 'Versatile choice for mixed conditions' },
  ];
}
