# RiderOS — Project Brief

## What this is
A personal portfolio project: a "Jarvis for motorcyclists" — a fused intelligence dashboard
that aggregates planned rides (from Reddit), provides route readiness scoring (weather +
traffic + community hazard reports), and suggests destinations for "where can I ride today."

Primary goal: practice frontend system design, React/TypeScript, GraphQL schema design,
Supabase, caching strategies, and machine-coding patterns for interviews. Secondary goal:
build something genuinely useful for planning rides.

---

## Tech stack
- **Frontend**: React + TypeScript, PWA (service worker, installable)
- **Backend**: Node.js + Apollo GraphQL server
- **Database/Auth**: Supabase (Postgres + Auth)
- **Repo structure**: monorepo, independently deployed
  ```
  rideros/
    frontend/   -> deploy to Vercel/Netlify (root dir = frontend/)
    backend/    -> deploy to Railway/Render/Fly.io (root dir = backend/)
    shared/     -> shared TS types (GraphQL codegen output)
  ```

---

## Core features (v1 scope)

1. **Bike profiles & favorites** — spec pages, dealer links, user favorites (Supabase auth + CRUD)
2. **Ride radar (globe)** — planned rides extracted from biker subreddits, plotted on a 3D globe by region
3. **Route planner** — user picks start/end + bike type → readiness score (go/caution/avoid) +
   top 10 restaurants/fuel stops along route
4. **"Where can I ride today"** — given location + bike type, suggests top destinations with
   same readiness metrics

---

## Data sources

| Data | Source | Fetch pattern |
|---|---|---|
| Bike specs | Curated/seeded | Static |
| Planned rides | Reddit API + LLM extraction | Weekly cron |
| Community road-condition reports (potholes, etc.) | Reddit API + LLM extraction | Weekly cron |
| Traffic incidents (accidents, construction, closures) | Live traffic API (TomTom/HERE) | Per-request |
| Weather | Live weather API | Per-request |
| Route geometry / directions | Mapbox Directions or OpenRouteService | Per-request |
| Geocoding | Mapbox/ORS Geocoding (+ `location_cache` table) | Per-request, cached |
| Points of interest (restaurants/fuel) | Places API (Google/Mapbox) + LLM ranking | Per-request, cached 7 days |

---

## Data model (Supabase / Postgres)

```sql
-- Bikes & types
bikes (id, name, brand, specs jsonb, image_url, dealer_url)
bike_types (id, name)  -- supersport, sport_naked, adv_offroad, adv_highway, commuter,
                        -- supermoto, enduro, cruiser, neo_retro, scrambler, hyper_tourer
bike_type_route_fit (
  id, bike_type_id fk,
  surface_preference,   -- tarmac | mixed | off-road
  weather_tolerance,    -- low | medium | high
  hazard_tolerance,     -- low | medium | high
  notes_template
)

-- Users
users (Supabase auth)
favorites (user_id, bike_id)
garage (user_id, bike_id, mileage, service logs...)

-- Reddit ingestion pipeline
raw_posts (id, subreddit, post_url, title, body, created_at, fetched_at, processed bool)

rides (
  id, raw_post_id fk,
  title, start_location, end_location, route_text,
  ride_date, notes,
  lat, lng,            -- filled by geocoding pass
  is_ride_post bool
)

hazard_reports (
  id, lat, lng,
  hazard_type,         -- pothole | waterlogging | road_quality | etc.
  severity,            -- low | medium | high
  description,
  source,              -- 'reddit' | 'user_submitted'
  reported_at, expires_at
)

user_hazard_submissions (id, user_id, lat, lng, hazard_type, description, created_at)

-- Caching
location_cache (place_name, lat, lng)
llm_cache (cache_key, response_json, computed_at, expires_at)
```

---

## GraphQL schema (core)

```graphql
enum BikeType {
  SUPERSPORT
  SPORT_NAKED
  ADVENTURE_TOURER_OFFROAD
  ADVENTURE_TOURER_HIGHWAY
  COMMUTER
  SUPERMOTO
  ENDURO
  CRUISER
  NEO_RETRO
  SCRAMBLER
  HYPER_TOURER
}

type Bike {
  id: ID!
  name: String!
  specs: JSON
  dealerUrl: String
  sentimentSummary: [SentimentCategory!]!   -- future: phase 3
  priceTrend(city: String): [PricePoint!]!  -- future: phase 4
}

type Ride {
  id: ID!
  title: String!
  startLocation: String
  endLocation: String
  routeText: String
  rideDate: String
  notes: String
  lat: Float
  lng: Float
  sourceUrl: String!
}

type Factor {
  score: Int!
  note: String!
}

type HazardReport {
  id: ID!
  hazardType: String!
  severity: String!
  lat: Float!
  lng: Float!
  description: String!
  reportedAt: String!
}

type BikeSuggestion {
  bikeType: BikeType!
  reason: String!
}

type PointOfInterest {
  name: String!
  type: String!   -- restaurant | fuel_station
  lat: Float!
  lng: Float!
  rating: Float
  reason: String
}

type RouteReadiness {
  overallStatus: String!   -- good | caution | avoid
  summary: String!
  weather: Factor!
  hazards: Factor!
  traffic: Factor!
  hazardReports: [HazardReport!]!
  suggestedBikeType: BikeSuggestion!
  routeGeometry: JSON!      -- GeoJSON LineString
  pointsOfInterest: [PointOfInterest!]!
}

type Query {
  bike(id: ID!): Bike
  rides(region: String, fromDate: String, toDate: String): [Ride!]!
  routeReadiness(startPlace: String!, endPlace: String!, bikeType: BikeType): RouteReadiness!
  rideSuggestions(lat: Float!, lng: Float!, bikeType: BikeType, date: String): [RouteReadiness!]!
}

type Mutation {
  submitHazardReport(lat: Float!, lng: Float!, hazardType: String!, description: String!): HazardReport!
  toggleFavorite(bikeId: ID!): Boolean!
}
```

---

## Route Planner — request flow (key feature, end to end)

1. **Frontend**: user submits start place, end place, bike type → GraphQL query `routeReadiness`
2. **Backend resolver**:
   - Geocode start/end (check `location_cache` first)
   - Fetch route geometry from Directions API → returns waypoints + GeoJSON line
   - In parallel:
     - Live traffic incidents API (accidents/construction/closures) along waypoints
     - Live weather API along waypoints
     - DB query: `hazard_reports` near waypoints (bounding box per waypoint, `expires_at > now()`)
   - **Scoring** (pure functions, in-memory):
     - `scoreWeather`, `scoreHazards`, `scoreTraffic` → raw factor scores (0-100)
     - `adjustForBikeType` → adjust scores based on `bike_type_route_fit`
     - `combineScores` → overall status (good/caution/avoid) + human-readable summary
     - `suggestBikeType` → independent recommendation based on route conditions
   - **POIs (LLM + cache)**:
     - Build cache key from rounded coords + bike type
     - Check `llm_cache` — if hit and not expired, return cached POIs
     - If miss: fetch real candidate places from Places API → LLM ranks/explains top 10
       (LLM ranks real data, does not invent places) → write to `llm_cache` (7-day TTL)
3. **Response**: single GraphQL payload with status, factor breakdown, hazard pins, suggested
   bike type, route geometry, and POI list
4. **Frontend**: renders readiness card, factor breakdown cards, bike suggestion card,
   map (route line + hazard pins + POI markers via react-map-gl/Mapbox), POI list

---

## Cron pipeline (weekly, Supabase Edge Function)

1. Fetch new posts from subscribed subreddits (Reddit API) → `raw_posts`
2. Pre-filter with keywords (ride-planning phrases / hazard phrases) — cheap, reduces LLM calls
3. Batch LLM call (~10 posts per call): classify each as `planned_ride` | `hazard_report` | `neither`,
   extract structured fields (locations, dates — resolve relative dates using post's `created_at`)
4. Write results to `rides` or `hazard_reports`; mark `raw_posts.processed = true`
5. Geocoding pass: fill `lat`/`lng` for new rides/hazards (check `location_cache` first)

LLM usage here is **your own API key** (server-side secret, batch job — not per-user-request),
so cost stays small and predictable (~20-30 bikes/subreddits, weekly).

---

## Scoring logic reference

```typescript
// Layer 1: raw factor scores (0-100, independent of bike type)
scoreWeather(forecast) -> { score, note }
scoreHazards(hazards) -> { score, note }
scoreTraffic(traffic) -> { score, note }

// Layer 2: adjust for bike type using bike_type_route_fit
adjustForBikeType(rawScores, bikeType, hazards, weather) -> adjustedScores
// e.g. high hazard_tolerance (ADV) -> +15 to hazard score
//      low weather_tolerance (naked/cruiser) -> -15 to weather score if rain

// Layer 3: combine into overall status
combineScores(adjusted) -> { status: 'good'|'caution'|'avoid', summary: string }
// overall = weather*0.4 + hazards*0.4 + traffic*0.2
// >=80 good, >=50 caution, else avoid
// summary built from notes of any factor scoring <80

// Independent: suggest ideal bike type for route conditions
suggestBikeType(routeSegments, hazards, weather) -> { bikeType, reason }
```

---

## Future phases (post-v1, lower priority)
- Bike sentiment summaries (Reddit/YouTube comments -> categorized sentiment, batch LLM job)
- On-road price tracking per city (scrape or seed) + price history charts + compare bikes
- Cost tracker / garage maintenance logs
- Realtime group ride tracking (Supabase realtime)

---

## Naming
Project name: **RiderOS**
