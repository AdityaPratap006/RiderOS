# RiderOS frontend — UI layout & component design

Theme reference (already in `tailwind.config.js`): `surface #0f172a` (page bg), `panel #1e293b` (card/panel bg), `accent #2ffffc` (teal). Status colors: good = green, caution = amber, avoid = red (Tailwind `emerald`/`amber`/`red` 400-500 on dark).

Aesthetic: **HUD / glass-panel** — full-screen 2D map is always the base layer. All UI panels float on top as semi-transparent dark glass cards (`bg-black/50 backdrop-blur border border-slate-700`). Nothing takes the map away from the user.

---

## 1. Core idea: always-on map with floating HUD panels

The map fills the entire viewport at all times. Three HUD panels float on top:

- **TopBar** — slim bar floating at the very top, centered, semi-transparent. Logo + nav links + profile icon.
- **LeftPanel** — floating on the left edge, full height minus TopBar gap. Scenario tabs + active input form.
- **RightPanel** — floating on the right edge, full height minus TopBar gap. Output cards (readiness, weather, hazards, POIs, bike suggestion).

Panels never obscure the center of the map. On mobile they collapse to bottom sheets.

### Layout zones

```
┌──────────────────────────────────────────────────────────────┐
│  [RiderOS]   Radar  Profile                                  │  ← TopBar (floating, centered, ~60% width)
│                                                              │
│  ┌──────────────┐                        ┌────────────────┐ │
│  │ ScenarioTabs │                        │ ReadinessCard  │ │
│  │ ──────────── │                        │ FactorBreakdwn │ │
│  │ RouteSearch  │    MAP (full screen)   │ BikeSuggestion │ │
│  │ Form         │                        │ PoiList        │ │
│  │              │                        │ HazardList     │ │
│  └──────────────┘                        └────────────────┘ │
└──────────────────────────────────────────────────────────────┘
  ↑ LeftPanel (floating left, glass)        ↑ RightPanel (floating right, glass)
```

- **TopBar** — `absolute top-4 left-1/2 -translate-x-1/2`, `w-[60%]`, `bg-black/50 backdrop-blur rounded-xl border border-slate-700 h-12`
- **LeftPanel** — `absolute top-20 left-4 bottom-4`, `w-72`, `bg-black/50 backdrop-blur rounded-xl border border-slate-700`, scrollable
- **Map canvas** — `absolute inset-0`, react-map-gl/maplibre, 2D, flat. Layers rendered on top of base tiles.
- **RightPanel** — `absolute top-20 right-4 bottom-4`, `w-72`, `bg-black/50 backdrop-blur rounded-xl border border-slate-700`, scrollable

### Secondary pages (BikesPage, GaragePage)
Share the TopBar, render a standard scrollable content area below it. No side panels.

---

## 2. Routes

```
/                -> RadarPage     (full-screen map + floating HUD panels)
/bikes           -> BikesPage
/bikes/:id       -> BikeDetailPage
/garage          -> GaragePage    (auth required)
*                -> NotFoundPage
```

`App.tsx` is `relative w-screen h-screen overflow-hidden`. RadarPage renders `absolute inset-0` and places the map + HUD panels. Other pages render a scrollable content column.

---

## 3. Folder structure

```
frontend/src/
├── main.tsx
├── App.tsx
├── apollo.ts
├── lib/
│   ├── constants.ts          # BikeType labels/icons, status color map, scenarios enum
│   └── format.ts
├── graphql/
│   ├── queries.ts
│   └── mutations.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useRouteReadiness.ts
│   ├── useRideSuggestions.ts
│   ├── useRides.ts
│   ├── useBikes.ts
│   ├── useFavorites.ts
│   └── useGeolocation.ts
├── providers/
│   └── AuthProvider.tsx
├── pages/
│   ├── Radar/index.tsx        # owns scenario state; renders map + HUD panels
│   ├── BikesPage.tsx
│   ├── BikeDetailPage.tsx
│   ├── GaragePage.tsx
│   └── NotFoundPage.tsx
├── components/
│   ├── AppHeader/index.tsx    # floating TopBar (HUDPanel)
│   ├── HUDPanel/index.tsx     # base glass-panel primitive (absolute-positioned wrapper)
│   ├── radar/
│   │   ├── RadarMap.tsx         # full-screen map, switches layers by scenario
│   │   ├── LeftPanel.tsx        # scenario tabs + active input form
│   │   ├── ScenarioTabs.tsx
│   │   └── RightPanel.tsx       # output cards
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx            # status pill (good/caution/avoid)
│   │   ├── Spinner.tsx
│   │   └── EmptyState.tsx
│   ├── map/
│   │   ├── RouteLayer.tsx
│   │   ├── HazardPinLayer.tsx
│   │   ├── PoiMarkerLayer.tsx
│   │   └── RidePinLayer.tsx
│   ├── readiness/
│   │   ├── ReadinessCard.tsx
│   │   ├── FactorBreakdown.tsx
│   │   ├── BikeSuggestionCard.tsx
│   │   ├── HazardList.tsx
│   │   └── PoiList.tsx
│   ├── rides/
│   │   ├── RideList.tsx
│   │   ├── RideListItem.tsx
│   │   └── RidePopup.tsx
│   ├── bikes/
│   │   ├── BikeCard.tsx
│   │   ├── BikeGrid.tsx
│   │   ├── BikeTypeFilterBar.tsx
│   │   └── FavoriteButton.tsx
│   ├── forms/
│   │   ├── RouteSearchForm.tsx
│   │   ├── LocationAutocomplete.tsx
│   │   ├── BikeTypeSelect.tsx
│   │   └── HazardReportForm.tsx
│   └── auth/
│       ├── AuthModal.tsx
│       └── AuthGuard.tsx
└── index.css
```

---

## 4. RadarPage state model

`RadarPage` owns `activeScenario` and `selectedItem`. Map is always rendered; panels overlay it.

```ts
const [scenario, setScenario] = useState<Scenario>('plan-route');
const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

// LeftPanel  → ScenarioTabs + RouteSearchForm(variant=scenario) → fires Apollo hook on submit
// RightPanel → reads hook result, renders output cards
// RadarMap   → reads hook result, renders matching layer set
//              onPinClick → setSelectedItem → RightPanel scrolls/highlights
```

---

## 5. Shared component contracts

```ts
<Badge status="good" | "caution" | "avoid" />
<ReadinessCard overallStatus={...} summary={...} />
<FactorBreakdown weather={Factor} hazards={Factor} traffic={Factor} />
<BikeSuggestionCard bikeType={BikeType} reason={string} />
<HazardList hazards={HazardReport[]} onReport={() => void} />
<PoiList pois={PointOfInterest[]} onHover={(poi) => void} />

<RadarMap
  scenario={Scenario}
  routeGeometry={GeoJSON | null}
  hazards={HazardReport[]}
  pois={PointOfInterest[]}
  rides={Ride[]}
  selectedItem={SelectedItem | null}
  onPinClick={(item) => void}
/>

<RouteSearchForm
  variant="plan-route" | "rides-soon" | "where-ride"
  onSubmit={(values) => void}
/>
```

---

## 6. Data hooks → GraphQL mapping

| Hook | Query/Mutation | Used by |
|---|---|---|
| `useRouteReadiness(startPlace, endPlace, bikeType)` | `routeReadiness(...)` | RadarPage — "Plan a route" |
| `useRideSuggestions(lat, lng, bikeType, date)` | `rideSuggestions(...)` | RadarPage — "Where can I ride" |
| `useRides(region, fromDate, toDate)` | `rides(...)` | RadarPage — "Rides happening soon" |
| `useBikes(bikeType?)` | `bikes(bikeType)` | BikesPage |
| `useBike(id)` | `bike(id)` | BikeDetailPage |
| `useFavorites()` | `toggleFavorite` mutation | FavoriteButton, GaragePage |
| `useAuth()` | Supabase auth session | AuthModal, AuthGuard, TopBar |
| hazard submit | `submitHazardReport` mutation | HazardReportForm |

---

## 7. Build order

1. **Done:** Routing skeleton, AppHeader (HUD TopBar), common placeholder panels
2. **Now:** `RadarMap` shell (static map, no layers) — full-screen map visible beneath HUD panels
3. `LeftPanel` with `ScenarioTabs` (no forms yet) + `RightPanel` (empty state)
4. Common primitives: Button, Card, Badge, Spinner, EmptyState
5. "Plan a route" end to end: `RouteSearchForm` → `useRouteReadiness` → `RouteLayer`/`HazardPinLayer`/`PoiMarkerLayer` on map + RightPanel cards
6. "Where can I ride" — suggestion pins
7. "Rides happening soon" — RideList, RidePopup, ride pins
8. BikesPage / BikeDetailPage
9. Auth (AuthModal, AuthProvider, AuthGuard) + GaragePage + favorites + hazard submission
