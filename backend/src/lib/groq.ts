import Groq from 'groq-sdk';
import { WeatherData } from './scoring';

export interface PointOfInterest {
  name: string;
  type: string;
  lat: number;
  lng: number;
  rating?: number;
  reason?: string;
}

let client: Groq | null = null;
function getClient() {
  if (!client) client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return client;
}

export async function rankPOIs(
  start: string,
  end: string,
  weather: WeatherData
): Promise<PointOfInterest[]> {
  if (!process.env.GROQ_API_KEY) return [];

  const prompt = `You are a motorcycle travel expert for India.
Given a route from "${start}" to "${end}" with current weather: ${weather.condition}, wind ${weather.windSpeedKmh} km/h, visibility ${weather.visibilityKm.toFixed(1)} km.
Suggest 3-5 interesting stops along or near this route for a motorcyclist (scenic viewpoints, dhabas, historical sites, fuel/rest stops, etc).
Respond ONLY with a valid JSON array, no markdown, no explanation:
[{"name":"...","type":"...","lat":0.0,"lng":0.0,"reason":"..."}]`;

  try {
    const chat = await getClient().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    });

    const text = chat.choices[0]?.message?.content ?? '[]';
    // Strip any accidental markdown fences
    const json = text.replace(/```json?|```/g, '').trim();
    return JSON.parse(json) as PointOfInterest[];
  } catch {
    return [];
  }
}
