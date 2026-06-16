const MAPPLS_KEY = process.env.MAPPLS_STATIC_API_KEY!;
const TTL_MS = 5 * 60 * 1000; // 5 minutes
const MIN_QUERY_LENGTH = 3;

export interface PlaceSuggestion {
    eLoc: string;
    placeName: string;
    placeAddress: string;
}

interface CacheEntry {
    results: PlaceSuggestion[];
    cachedAt: number;
}

const cache = new Map<string, CacheEntry>();

export const getPlaceAutocompleteSuggestions = async (query: string): Promise<PlaceSuggestion[]> => {
    const normalised = query.trim();
    if (normalised.length < MIN_QUERY_LENGTH) return [];

    const cached = cache.get(normalised);
    if (cached && Date.now() - cached.cachedAt < TTL_MS) return cached.results;

    const url = `https://search.mappls.com/search/places/autosuggest/json?query=${encodeURIComponent(normalised)}&access_token=${MAPPLS_KEY}`;
    const res = await fetch(url);

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Mappls autosuggest failed: ${res.status} — ${body}`);
    }

    const data = await res.json() as {
        suggestedLocations?: Array<{
            eLoc: string;
            placeName: string;
            placeAddress: string;
        }>;
    };

    const results: PlaceSuggestion[] = (data.suggestedLocations ?? []).map((s) => ({
        eLoc: s.eLoc,
        placeName: s.placeName,
        placeAddress: s.placeAddress,
    }));

    cache.set(normalised, { results, cachedAt: Date.now() });
    return results;
};
