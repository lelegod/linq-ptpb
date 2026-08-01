# Architecture — PTPB

Companion doc to **PRD.md**. This is the "how it works" doc; open it when you're wiring things up.

---

## 1. One-diagram overview

```
   ┌─────────────────────┐        ┌────────────────────────┐
   │  Judge on laptop    │  opens │   User's iPhone        │
   │  visits rejsy.link  │──sms:─▶│   (Messages.app)       │
   │  or scans QR        │        │                        │
   └─────────────────────┘        └──────────┬─────────────┘
                                             │  iMessage
                                             ▼
                             ┌────────────────────────────────┐
                             │   Linq iMessage platform       │
                             │   Rejsy's provisioned number   │
                             │   +45 XXX XXX XX               │
                             └───────┬──────────────▲─────────┘
                    webhook POST     │              │  REST POST
                    (inbound msg)    ▼              │  (outbound msg)
   ┌───────────────────────────────────────────────────────────────────┐
   │   Next.js app on Railway (rejsy.up.railway.app)                   │
   │                                                                   │
   │   /api/inbound          ← Linq webhook (message.received)         │
   │   /api/exp/event        ← sendBeacon from map page (user actions) │
   │   /map/[sessionId]      → map page (Leaflet route view)           │
   │   /                     → marketing landing page                  │
   │                                                                   │
   │   Outbound to Linq:                                               │
   │     POST /v3/chats/{chat_id}/messages  (plain text replies)       │
   │     POST /v3/messages                  (Agent App action cards)   │
   │                                                                   │
   │   instrumentation.ts  ── boots node-cron on server start          │
   │     every 1 min → reminder check                                  │
   │     every 5 min → live-status check                               │
   │                                                                   │
   │   ─────  agent core (Claude Haiku + tools) ─────                  │
   │      plan_trip, book_trip, get_status, set_reminder,              │
   │      remember_place, list_trips                                   │
   │                                                                   │
   │   Booking flow: book_trip → send Agent App card (map link) →      │
   │     user taps → map page → user taps "Buy DSB" → deep-link →      │
   │     sendBeacon → server texts confirmation back into chat         │
   └────────────────┬──────────────────────────┬───────────────────────┘
                    │                          │
                    ▼                          ▼
   ┌────────────────────────┐   ┌───────────────────────────────────┐
   │  Supabase (Postgres)   │   │  hafas-client → Rejseplanen HAFAS │
   │  users, trips, msgs,   │   │  (planning + live departures)     │
   │  reminders, memories   │   └───────────────────────────────────┘
   └────────────────────────┘
                    │
                    ▼
   ┌────────────────────────┐
   │  Anthropic Claude API   │
   │  (agent brain)          │
   └────────────────────────┘
```

## 2. Components (owner in brackets — see Phases.md)

### 2.1 iMessage layer — `[Owner: Person A]`
- **Linq** is a hosted iMessage/RCS/SMS platform providing a phone number, inbound webhooks, and outbound REST + Agent App cards. See §2.9 for the send API surface, §2.10 for the Agent App map experience.
- Setup steps (Person A, Phase 0):
  1. Walk to the Linq organizers. Get: **bearer API token**, **provisioned phone number in E.164**, and **webhook registration** — either via their dashboard, or run `linq webhooks create --url https://<railway>/api/inbound --events message.received`.
  2. Env vars in Railway: `LINQ_API_KEY`, `LINQ_FROM_NUMBER`.
  3. Confirm two things with the rep verbally: (a) proactive push allowed outside a session window? (b) any per-minute rate limits?

- **Inbound webhook payload shape** (confirmed from the Agent Apps walkthrough — Linq POSTs this to `/api/inbound`):
  - `data.direction` — `"inbound"` (user → us) or `"outbound"` (our own sends echoed back). **Ignore outbound events** — they'll infinite-loop.
  - `data.chat.id` — the chat id (**not** `data.chat_id`). Save this on the user row; you need it to send plain-text replies.
  - `data.id` — the message id. If you need the full message body, re-fetch via `GET /v3/chats/{chat.id}/messages` — the webhook body is not always the full canonical form.
  - `data.from` (or the equivalent handle field) — the sender's E.164 number.
  - `data.message.parts[]` — the text lives in `parts.find(p => p.type === 'text').value`.
  - Return `200` fast, then do work async — Linq retries on timeout.

- **Shared-line rule (hackathon sandbox):** the user MUST text your Linq number once before you can send them anything. This is fine for our flow — the website CTA is what makes them text first. Just don't try to broadcast marketing messages to numbers that haven't messaged us.
- **First-message-in-new-chat rule:** the first outbound message to a brand-new chat cannot be an action card (Linq error 1005). Our first reply is always plain text (a greeting), so this is fine — but if you ever want the first reply to be a card, send a `hi` first via `POST /v3/chats`.
- Fallback if Linq breaks mid-demo: Person A stubs a web-chat page (`/chat`) that POSTs into `/api/inbound` with a mock Linq payload. Optional, only if Phase 3 has slack.

### 2.2 Agent core — `[Owner: Person B]`
- Single Next.js API route handler, TypeScript, `@anthropic-ai/sdk`.
- Model: **`claude-haiku-4-5`** (or newest Haiku — check Anthropic docs). Cheap, fast, tool-calling works well. Temperature 0.3. Max tokens 1024.
- Fallback LLM: **Groq** via `groq-sdk` running `llama-3.3-70b-versatile` — free tier is generous, native tool-calling supported. Swap is one file (`/src/agent/llm.ts` exports one interface, two implementations). If Haiku is slow on stage or you run out of $2 credit, flip an env var.
- System prompt lives in `/src/agent/system-prompt.ts` (not scattered). See **Memory.md** for what goes in it at runtime.
- Tool-calling loop caps at 4 iterations to prevent runaway.
- Tools (defined once in `/src/agent/tools.ts`):
  - `plan_trip({from, to, departAt?, arriveBy?, prefer?})` → returns 2–3 options.
  - `book_trip({option_index})` → stores trip + session + reminder, sends Agent App map card (see §2.4). LLM should not send text after — the card IS the reply.
  - `get_status({trip_id?})` → next trip if no id; returns real-time delay/platform.
  - `set_reminder({trip_id, minutes_before})` → writes to `reminders` table.
  - `remember_place({label, station_id})` → writes to `user_places` (e.g. "home", "work", "mom's").
  - `list_trips({window: "upcoming" | "past"})` → for "what do I have this week."

### 2.3 Transport data layer — `[Owner: Person B, shared with A]`
- Use **`hafas-client`** with the Rejseplanen profile — `npm i hafas-client`, `createClient(rejseplanenProfile, 'ptpb-hackathon')`. **No API key needed.**
- Wrap two functions in `/src/transport/rejseplanen.ts`:
  - `findStation(query) → StationId` (autocomplete)
  - `journeys(fromId, toId, opts) → Journey[]`
  - `departures(stationId, when) → Departure[]`
- If `hafas-client` breaks: fallback is scraping `rejseplanen.dk` search results. Do NOT go there unless forced — write the abstraction so the swap is one file.

### 2.4 Booking hand-off via Agent App card — `[Owner: Person B + Person A]`
No plain-text-with-URL reply. Instead, `book_trip` sends a **Linq Agent App action card** that opens the map page (see §2.10).

Flow:
1. User picks an option in text ("1" / "the 9:03 one" / etc). LLM invokes `book_trip({option_index})`.
2. **Server-side** — inside the tool implementation:
   - Insert a `trips` row (status `planned`, snapshot of legs, computed DSB deep link).
   - Insert a `reminders` row for `depart_at - 25min` (pre-rendered message body).
   - Insert an `agent_app_sessions` row with a fresh UUID `session_id`, linking `trip_id` + user's `chat_id`.
   - POST an action card via Linq's handle-targeted endpoint (`POST /v3/messages`):
     ```json
     {
       "to": ["<user E.164>"],
       "message": {
         "action": {
           "experience": "link",
           "action": "open",
           "params": {
             "url": "https://<railway>/map/<session_id>?s=<session_id>",
             "title": "København H → Aarhus H",
             "subtitle": "Sat 09:03 · direct · 3h 14m · 149 kr",
             "button": "See route"
           }
         }
       }
     }
     ```
   - **NOT** `POST /v3/chats/{chat_id}/messages` for the card — that returns error 1005 "send an action to a handle." Actions are handle-targeted; text is chat-scoped.
3. The tool returns to the LLM. The LLM does NOT compose a follow-up text (the card is the reply). If it insists, prompt-engineer it in the system prompt: "when book_trip succeeds, do not send any additional text — the card is enough."

The DSB deep link is stored on the `trips` row but not surfaced in a plain message — it lives on the map page as the "Buy on DSB" button (see §2.10).

DSB deep link format (verify in Phase 3):
- Intercity: `https://www.dsb.dk/find-produkter-og-priser/?from=<stationId>&to=<stationId>&date=<iso>`
- Copenhagen zones: DOT Billetter web-checkout or `dotmobilbilletter://` deep link.
- Fallback if pre-fill doesn't work: link to the DSB homepage — user retypes. Ugly but functional.

### 2.5 Reminders + live status — `[Owner: Person D]`
- Railway runs a persistent Node process (Next.js is a long-running server on Railway, not serverless), so we use **`node-cron` in-process**. No separate cron service, no auth secrets.
- Boot the schedules from `src/instrumentation.ts` (Next.js 14's server-startup hook):
  ```ts
  // src/instrumentation.ts
  export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      const { startCrons } = await import('./cron');
      startCrons();
    }
  }
  ```
- `/src/cron.ts`:
  - `cron.schedule('*/1 * * * *', runReminderJob)` — reads `reminders` rows with `fire_at <= now() AND fired_at IS NULL`, sends via outbound wrapper, marks fired.
  - `cron.schedule('*/5 * * * *', runStatusJob)` — for each upcoming trip in the next 60 min, query Rejseplanen for the leg's current delay; if >5 min and we haven't warned about *this delay bucket*, push a message.
- Restart-safety: cron state lives in Supabase, not memory. A Railway redeploy just restarts the interval — no data loss.
- **Demo-time seeding:** `/scripts/seed-demo.ts` inserts a trip + reminder timed to fire mid-demo so the "proactive push" is guaranteed.

### 2.6 Website — `[Owner: Person C]`
- Same Next.js app, `/` route, deployed to Railway with the agent (one deploy).
- Static content — no auth, no DB reads.
- Tech: Tailwind + `framer-motion` for the phone-mockup micro-animation, `next/image` for optimized hero.
- **Primary CTA is a Linq card**, not a raw `sms:` link (see §2.8 below). Two env vars:
  - `NEXT_PUBLIC_LINQ_URL="https://linq.app/rejsy"` (or wherever the profile lives)
  - `NEXT_PUBLIC_IMESSAGE_HREF="sms:<mac-handle>&body=hi%20rejsy"` — used as a secondary fallback button and inside the QR
- See **Design.md** for layout.

### 2.7 Deployment target — Railway `[shared, C owns setup]`
- Single Railway project, single service, connected to the GitHub `main` branch.
- Every push → auto-deploy → the Railway public URL is the demo URL.
- Railway auto-detects Next.js, runs `npm install && npm run build && npm start`. No `railway.toml` needed for v0.
- Env vars set once in Railway dashboard: `ANTHROPIC_API_KEY`, `GROQ_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `LINQ_API_KEY`, `LINQ_FROM_NUMBER`, `PUBLIC_APP_URL` (used inside card URLs — e.g. `https://rejsy.up.railway.app`), `NEXT_PUBLIC_IMESSAGE_HREF`.
- Custom domain optional; the `*.up.railway.app` URL is fine for judges.

### 2.8 Storage — `[Owner: Person D]`
- Supabase Postgres. RLS **disabled** in v0 — service role key only, all reads/writes from the server. No client-side Supabase calls anywhere.
- Migrations in `/supabase/migrations/*.sql`, applied with `supabase db push`.

### 2.9 Linq send API surface — `[Owner: Person A]`
Three distinct send patterns — using the wrong one gives Linq error 1005. Wrap all three in `/src/agent/linq.ts`.

| What you're sending | Endpoint | When |
|---|---|---|
| Plain-text reply into existing chat | `POST /v3/chats/{chat_id}/messages` with `{message: {parts: [{type:'text', value}]}}` | Most agent replies. Chat id comes from `users.linq_chat_id`, saved on first inbound webhook. |
| Agent App action card (map link) | `POST /v3/messages` with `{to: ['<E.164>'], message: {action: {experience:'link', action:'open', params: {url, title, subtitle, button}}}}` | Booking flow — the "See route" card. Handle-targeted, NOT chat-targeted. |
| First-ever message to a new chat | `POST /v3/chats` with `{from, to: ['<E.164>'], message: {parts: [...]}}` | Only if we're initiating a conversation without an inbound. Never happens in our flow (shared-line rule requires user to text first), so we don't need this — but useful to know if it comes up. |

Bonus (all polish, wire only if Phase 5 has time):
- **Typing indicator while LLM thinks:** `POST /v3/chats/{chat_id}/typing` before the Claude call, `DELETE` same path after. Fire in parallel with the LLM call, don't await it.
- **Read receipts:** `POST /v3/chats/{chat_id}/read` when we process an inbound.
- **iMessage effects:** add `"effect": "confetti"` to the message body on the booking-confirmation text. Free wow factor.

### 2.10 Map experience page (Agent App) — `[Owner: Person C, with A's session plumbing]`
The page the Linq card opens. This is the JIT UI moment — a real interactive map inside iMessage's browser.

Route: `/src/app/map/[sessionId]/page.tsx` (Next.js dynamic route).

Flow:
1. Page loads, reads `sessionId` from URL params. Extract `?s=<sessionId>` (Linq HMAC-signs the URL server-side, so no tampering risk).
2. Server-fetches (in the page component) `agent_app_sessions.trip_id → trips` row → produces trip data: origin/destination lat-lon, transfer stops, times, price, DSB deep link.
3. Client renders:
   - **Header:** `København H → Aarhus H`, small: `Sat 09:03 · 3h 14m · 149 kr`.
   - **Map (Leaflet + OpenStreetMap tiles):**
     - Blue markers for origin/destination, grey for transfers.
     - Solid polyline (train legs) and dashed polyline (walking transfer legs) between stops.
     - Auto-fits bounds to all markers.
   - **Bottom sticky bar:** big `#007AFF` button "Buy on DSB → ", small link "Not now."
4. **Beacon layer** (fires reliably even during page close):
   ```html
   <script>
   const S = new URLSearchParams(location.search).get('s');
   function ping(ev) { navigator.sendBeacon('/api/exp/event', JSON.stringify({s:S, ev:ev})); }
   ping('opened');
   window.addEventListener('pagehide', () => ping('closed'));
   // "Buy on DSB" click: ping('finish:buy'); then window.location = dsbUrl;
   // "Not now" click: ping('closed');
   </script>
   ```
5. **Endpoint** `/api/exp/event`:
   - Append event to `agent_app_sessions.events` (jsonb array).
   - If event starts with `finish` OR is `closed` AND we haven't notified yet:
     - Set `notified_at = now()`.
     - Look up trip + chat_id.
     - If event was `finish:buy`, POST plain text into the chat: `"🚆 locked in! i'll remind you 25 min before departure."` with `"effect": "confetti"`.
     - If event was `closed` (abandoned), do nothing — user might come back.

Tech notes:
- **Leaflet** via CDN in the `<Head>`: `<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />` and `<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" defer></script>`. Avoids `npm install` friction; still self-contained.
- **OSM tile URL:** `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` with `attribution: '&copy; OpenStreetMap'`. Free, no key, respect their usage policy (fine for hackathon volume).
- Coordinates come from `hafas-client` — each `Journey.legs[].origin` / `.destination` includes `location.latitude`, `.longitude`. If `polyline` is available on a leg, use it; else just line-between-stops.
- Page is a Client Component (`'use client'`) because Leaflet needs `window`. Trip data is fetched via a small `/api/trips/[id]` endpoint on mount, or hydrated via a Server Component wrapper — either works.

## 3. Data model (Supabase)

```sql
-- users are keyed by phone number, created on first inbound message
create table users (
  id             uuid primary key default gen_random_uuid(),
  phone          text unique not null,       -- E.164, e.g. "+4520123456"
  display_name   text,                        -- captured on first turn if user offers it
  linq_chat_id   text,                        -- from first Linq webhook (data.chat.id); needed for text replies
  created_at     timestamptz not null default now()
);

-- named places the user has taught the agent: home, work, mom's
create table user_places (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users(id) on delete cascade,
  label       text not null,                -- "home", "work", "gym"
  station_id  text not null,                -- HAFAS station id
  station_name text not null,
  unique (user_id, label)
);

-- a planned option the user selected (our "booking")
create table trips (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references users(id) on delete cascade,
  from_station_id text not null,
  to_station_id   text not null,
  depart_at     timestamptz not null,
  arrive_at     timestamptz not null,
  legs_json     jsonb not null,             -- snapshot of legs at booking time
  deep_link_url text,
  status        text not null default 'planned',   -- planned | departed | done | cancelled
  created_at    timestamptz not null default now()
);

-- reminders scheduled off a trip
create table reminders (
  id         uuid primary key default gen_random_uuid(),
  trip_id    uuid references trips(id) on delete cascade,
  fire_at    timestamptz not null,
  message    text not null,                 -- pre-rendered so cron doesn't call LLM
  fired_at   timestamptz
);

-- one row per inbound or outbound iMessage; source of truth for conversation
create table messages (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references users(id) on delete cascade,
  direction    text not null,               -- "in" | "out"
  body         text not null,
  tool_calls   jsonb,                       -- for agent turns
  created_at   timestamptz not null default now()
);

-- delay warnings we've already sent (dedupe key)
create table delay_notices (
  trip_id     uuid references trips(id) on delete cascade,
  delay_bucket int not null,                 -- floor(delay_minutes / 5)
  fired_at    timestamptz not null default now(),
  primary key (trip_id, delay_bucket)
);

-- one row per Agent App card we send; used by /map/[sessionId] and /api/exp/event
create table agent_app_sessions (
  id           uuid primary key default gen_random_uuid(),
  trip_id      uuid references trips(id) on delete cascade,
  chat_id      text not null,                -- Linq chat id, needed to reply back into the thread
  events       jsonb not null default '[]'::jsonb,   -- ['opened', 'finish:buy', 'closed', ...]
  notified_at  timestamptz,                  -- set once we've texted the confirmation; guards against double-fire
  created_at   timestamptz not null default now()
);
```

## 4. Third-party services & keys

| Service | What it does | Cost signal | Set up by |
|---|---|---|---|
| **Linq** (MANDATORY) | Hosted iMessage/RCS/SMS platform — provides Rejsy's phone number, inbound webhooks, outbound REST API | Free during hackathon (sandbox from Linq organizers) | Phase 0, Person A grabs creds in the first 10 minutes |
| **Railway** | Hosts the Next.js app (landing + agent API + in-process cron) | Free $5/mo trial credit is enough for the hackathon | Phase 0, Person C |
| **Supabase** | Postgres (auth unused) | Free tier | Phase 0, Person D |
| **Anthropic** | Claude Haiku for agent | ~$2 total for hackathon (~$0.80/M input, $4/M output for Haiku) | Phase 0, Person B |
| **Groq** (fallback LLM) | Llama 3.3 70B for agent | Free tier | Phase 0, Person B (get key alongside Anthropic) |
| **Rejseplanen** (via hafas-client) | Trip planning + realtime | Free, no key | n/a |
| **Leaflet.js** (via CDN) | Map rendering on the Agent App map page | Free, no key | Phase 3, Person C — just a `<script>` tag |
| **OpenStreetMap tiles** | Basemap tiles for Leaflet | Free, no key (attribution required) | n/a |
| **Cursor** | IDE for all four devs | Free tier or paid | Phase 0, everyone |

All keys go in Railway env vars, mirrored in a `.env.local` **that is gitignored on day one — do not skip this**.

## 5. Repository layout

Single Next.js 14 App Router project. Everything under `/src`:

```
/src
  /app
    /page.tsx                     # marketing landing page
    /api
      /inbound/route.ts           # Linq inbound webhook (message.received)
      /exp/event/route.ts         # sendBeacon receiver from map page
      /trips/[id]/route.ts        # returns trip JSON for the map page (client fetch)
    /map/[sessionId]/page.tsx     # Agent App map page (Leaflet)
  /agent
    /systemPrompt.ts
    /tools.ts                     # plan_trip, book_trip, get_status, ...
    /handleTurn.ts                # the LLM loop
    /llm.ts                       # Anthropic / Groq swap
    /linq.ts                      # send-text, send-card, typing indicator
  /transport
    /rejseplanen.ts               # hafas-client wrapper
  /db
    /supabase.ts                  # client factory
    /users.ts /places.ts /trips.ts /messages.ts /sessions.ts
  /cron.ts                        # node-cron schedules
  /instrumentation.ts             # Next.js server-startup hook
/supabase
  /migrations/*.sql
/scripts
  seed-demo.ts
  smoke-test.ts
```

Do NOT split into a monorepo. One `package.json`, one `next.config.js`, one Railway service.

## 6. Deployment

- Git repo: GitHub, one branch `main`, direct push (no PRs — hackathon).
- **Railway** connected to `main`, auto-deploys on push. Railway URL is the demo URL is the submission URL.
- Custom domain optional — `*.up.railway.app` is fine for judges.
- **Linq webhook URL:** point at the Railway production URL, `https://<railway>/api/inbound`. Set once in the Linq dashboard, don't touch after.

## 7. Observability (minimal)

- `console.log` at every tool call boundary with the user id + tool name.
- Railway's built-in log viewer is enough. **Do not** wire up an APM; that's an hour we don't have.
- One rule: every outbound message is `INSERT`ed into `messages` before the network call, so if Linq silently fails we still see intent.

## 8. What we're explicitly not building (see PRD §7)

- Auth. Web-based login. User settings UI.
- A dashboard.
- Group chats or multi-recipient booking.
- Localization — English only for the hackathon (Danish would be a nice-to-have if hour 5 is free).
