-- RiderOS schema
-- Paste into Supabase SQL editor (Dashboard → SQL Editor → New query)

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";  -- for future geo queries


-- ───────────────────────────────────────────
-- Bike catalogue
-- ───────────────────────────────────────────

create table bike_types (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique  -- maps to BikeType enum values (snake_case)
);

create table bike_type_route_fit (
  id                 uuid primary key default gen_random_uuid(),
  bike_type_id       uuid not null references bike_types(id) on delete cascade,
  surface_preference text not null check (surface_preference in ('tarmac','mixed','off-road')),
  weather_tolerance  text not null check (weather_tolerance  in ('low','medium','high')),
  hazard_tolerance   text not null check (hazard_tolerance   in ('low','medium','high')),
  notes_template     text
);

create table bikes (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  brand        text not null,
  bike_type_id uuid references bike_types(id),
  specs        jsonb,
  image_url    text,
  dealer_url   text,
  created_at   timestamptz not null default now()
);


-- ───────────────────────────────────────────
-- User data (auth.users is managed by Supabase)
-- ───────────────────────────────────────────

create table favorites (
  user_id  uuid not null references auth.users(id) on delete cascade,
  bike_id  uuid not null references bikes(id) on delete cascade,
  primary key (user_id, bike_id)
);

create table garage (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  bike_id     uuid not null references bikes(id),
  mileage_km  int,
  notes       text,
  created_at  timestamptz not null default now()
);


-- ───────────────────────────────────────────
-- Reddit ingestion pipeline
-- ───────────────────────────────────────────

create table raw_posts (
  id          uuid primary key default gen_random_uuid(),
  subreddit   text not null,
  post_url    text not null unique,
  title       text not null,
  body        text,
  created_at  timestamptz not null,
  fetched_at  timestamptz not null default now(),
  processed   boolean not null default false
);

create table rides (
  id            uuid primary key default gen_random_uuid(),
  raw_post_id   uuid references raw_posts(id),
  title         text not null,
  start_location text,
  end_location  text,
  route_text    text,
  ride_date     date,
  notes         text,
  lat           double precision,
  lng           double precision,
  is_ride_post  boolean not null default true,
  source_url    text not null,
  created_at    timestamptz not null default now()
);


-- ───────────────────────────────────────────
-- Hazard reports
-- ───────────────────────────────────────────

create table hazard_reports (
  id           uuid primary key default gen_random_uuid(),
  lat          double precision not null,
  lng          double precision not null,
  hazard_type  text not null,  -- pothole | waterlogging | road_quality | debris | other
  severity     text not null check (severity in ('low','medium','high')),
  description  text not null,
  source       text not null check (source in ('reddit','user_submitted')),
  reported_at  timestamptz not null default now(),
  expires_at   timestamptz not null
);

create table user_hazard_submissions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete set null,
  lat          double precision not null,
  lng          double precision not null,
  hazard_type  text not null,
  description  text not null,
  created_at   timestamptz not null default now()
);


-- ───────────────────────────────────────────
-- Caching tables
-- ───────────────────────────────────────────

create table location_cache (
  place_name text primary key,
  lat        double precision not null,
  lng        double precision not null,
  created_at timestamptz not null default now()
);

create table llm_cache (
  cache_key     text primary key,
  response_json jsonb not null,
  computed_at   timestamptz not null default now(),
  expires_at    timestamptz not null
);


-- ───────────────────────────────────────────
-- Indexes
-- ───────────────────────────────────────────

create index idx_rides_lat_lng      on rides(lat, lng) where lat is not null;
create index idx_hazards_lat_lng    on hazard_reports(lat, lng);
create index idx_hazards_expires    on hazard_reports(expires_at);
create index idx_raw_posts_processed on raw_posts(processed) where processed = false;
create index idx_llm_cache_expires  on llm_cache(expires_at);


-- ───────────────────────────────────────────
-- Row Level Security
-- ───────────────────────────────────────────

alter table bikes                   enable row level security;
alter table bike_types              enable row level security;
alter table bike_type_route_fit     enable row level security;
alter table favorites               enable row level security;
alter table garage                  enable row level security;
alter table raw_posts               enable row level security;
alter table rides                   enable row level security;
alter table hazard_reports          enable row level security;
alter table user_hazard_submissions enable row level security;
alter table location_cache          enable row level security;
alter table llm_cache               enable row level security;

-- Public read on catalogue + community data
create policy "bikes public read"        on bikes               for select using (true);
create policy "bike_types public read"   on bike_types          for select using (true);
create policy "route_fit public read"    on bike_type_route_fit for select using (true);
create policy "rides public read"        on rides               for select using (true);
create policy "hazards public read"      on hazard_reports      for select using (true);
create policy "location_cache read"      on location_cache      for select using (true);

-- Favorites: users manage their own
create policy "favorites own"     on favorites for all using (auth.uid() = user_id);
create policy "garage own"        on garage    for all using (auth.uid() = user_id);
create policy "hazard_submit own" on user_hazard_submissions for all using (auth.uid() = user_id);

-- Backend service role bypasses RLS (used by resolvers with service_role key)
