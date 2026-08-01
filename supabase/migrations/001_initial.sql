-- PTPB / Rejsy — initial schema (Architecture.md §3)
-- Run in Supabase SQL editor (Phase 0) or: supabase db push

create extension if not exists "pgcrypto";

-- users are keyed by phone number, created on first inbound message
create table users (
  id             uuid primary key default gen_random_uuid(),
  phone          text unique not null,       -- E.164, e.g. "+4520123456"
  display_name   text,                        -- captured on first turn if user offers it
  linq_chat_id   text,                        -- from first Linq webhook (data.chat.id)
  created_at     timestamptz not null default now()
);

-- named places the user has taught the agent: home, work, mom's
create table user_places (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references users(id) on delete cascade,
  label        text not null,                -- "home", "work", "gym"
  station_id   text not null,                -- HAFAS station id
  station_name text not null,
  unique (user_id, label)
);

-- a planned option the user selected (our "booking")
create table trips (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references users(id) on delete cascade,
  from_station_id text not null,
  to_station_id   text not null,
  depart_at       timestamptz not null,
  arrive_at       timestamptz not null,
  legs_json       jsonb not null,             -- snapshot of legs at booking time
  deep_link_url   text,
  status          text not null default 'planned',   -- planned | departed | done | cancelled
  created_at      timestamptz not null default now()
);

-- reminders scheduled off a trip
create table reminders (
  id       uuid primary key default gen_random_uuid(),
  trip_id  uuid references trips(id) on delete cascade,
  fire_at  timestamptz not null,
  message  text not null,                 -- pre-rendered so cron doesn't call LLM
  fired_at timestamptz
);

-- one row per inbound or outbound iMessage; source of truth for conversation
create table messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id) on delete cascade,
  direction  text not null,               -- "in" | "out"
  body       text not null,
  tool_calls jsonb,                       -- for agent turns
  created_at timestamptz not null default now()
);

-- delay warnings we've already sent (dedupe key)
create table delay_notices (
  trip_id      uuid references trips(id) on delete cascade,
  delay_bucket int not null,                 -- floor(delay_minutes / 5)
  fired_at     timestamptz not null default now(),
  primary key (trip_id, delay_bucket)
);

-- one row per Agent App card we send; used by /map/[sessionId] and /api/exp/event
create table agent_app_sessions (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid references trips(id) on delete cascade,
  chat_id     text not null,                -- Linq chat id, needed to reply back into the thread
  events      jsonb not null default '[]'::jsonb,
  notified_at timestamptz,                  -- set once we've texted the confirmation
  created_at  timestamptz not null default now()
);

create index messages_user_created_at_idx on messages (user_id, created_at desc);
create index trips_user_depart_at_idx on trips (user_id, depart_at);
create index reminders_fire_at_idx on reminders (fire_at) where fired_at is null;
