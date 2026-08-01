# Phases — the 5-hour build plan

Elapsed time from **NOW** (call it 00:00). Targets:

- **04:30 elapsed** = submission deadline (19:00 wall-clock)
- **05:00 elapsed** = live demo (19:30 wall-clock)

So the plan is:
- **00:00 → 04:00** = build (four 45-60 min phases + one polish phase)
- **04:00 → 04:30** = freeze, seed demo data, submit
- **04:30 → 05:00** = three rehearsals + eat something

Owners (assign real names in the group chat before phase 0 begins):

- **A — Mac / iMessage / BlueBubbles / webhook.** Needs to be the person whose MacBook is dedicated to the demo for the rest of the day.
- **B — Agent brain (LLM + tools + Rejseplanen).** Strongest coder / prompt-engineer.
- **C — Website / marketing landing.** Frontend-comfortable, has some design taste.
- **D — Supabase / cron / reminders / demo data.** Comfortable with SQL and JSON.

**Central merge point:** one GitHub repo, one branch (`main`), everyone pushes direct to `main`. **Railway** connected to `main`, auto-deploys on every push. The Railway URL (`*.up.railway.app`) is the demo URL is the submission URL.

**Software everyone uses:** Cursor (IDE, mandatory), the shared GitHub repo, one shared group chat (WhatsApp/Slack — pick now). That's it. No Notion, no Figma, no Jira. This doc + the group chat are the plan.

**Mandatory stack (repeat for emphasis):** Cursor + Supabase + Linq + Railway + BlueBubbles + Anthropic Haiku (Groq fallback) + hafas-client. Everything else is a "no" until 04:00.

---

## Phase 0 (00:00 → 00:40) — Setup. Everyone in parallel. **No coding logic yet.**

Everyone: install Cursor, clone the repo the moment C creates it, run `npm i`, confirm `npm run dev` boots the Next.js scaffold on localhost:3000.

- **A — Linq iMessage plumbing (get credentials FIRST, code AFTER).**
  1. Walk over to the Linq organizers RIGHT NOW. Ask for hackathon credentials for team Rejsy: **bearer API token**, **a provisioned phone number** (E.164, e.g. `+45XXXXXXXX`), and **how to register a webhook URL** (dashboard or via API). While you're there, ask two questions: (a) *"can we send outbound to a user who hasn't messaged us in the last hour?"* — for reminders; (b) *"any rate limits we should know about?"*
  2. Save token as `LINQ_API_KEY` and number as `LINQ_FROM_NUMBER`. Send both to Person C to add as Railway env vars.
  3. Once Person C's Railway URL exists (should be within the same 40-min window), register the webhook: `https://<railway>/api/inbound` in the Linq dashboard, for the incoming-message event.
  4. Sanity check with `curl` from your laptop while everyone else is still scaffolding:
     ```bash
     curl -X POST https://api.linqapp.com/api/partner/v3/chats \
       -H "Authorization: Bearer $LINQ_API_KEY" \
       -H "Content-Type: application/json" \
       -d '{"from":"'$LINQ_FROM_NUMBER'","to":["+45<your-personal-cell>"],"message":{"parts":[{"type":"text","value":"hello from rejsy"}]}}'
     ```
     If you get a blue bubble on your iPhone from Rejsy's number, you're green. **This is the go/no-go for Phase 0.**
  5. **You now have significant free time** — the old Phase 0 for you was Mac + BlueBubbles + Cloudflare Tunnel. Use the free time to help Person B stub the agent tool interfaces, or Person D on Supabase schema wiring.

- **B — LLM keys + Rejseplanen sanity check.**
  1. Anthropic Console → API keys → new key → add $2 credit. Save key.
  2. Groq Console → API keys → new key. Save key (fallback).
  3. `mkdir /tmp/rejsy-scratch && cd /tmp/rejsy-scratch && npm i hafas-client`. Run a 5-line script that plans København H → Aarhus H and prints one journey. **If Rejseplanen doesn't work here, everything downstream is dead — fix now or pivot before Phase 1.**

- **C — repo + Railway + Linq sandbox + Next.js scaffold.**
  1. GitHub → new repo `rejsy` (public — Linq organizer may want to see it).
  2. `npx create-next-app@latest rejsy --typescript --tailwind --app --src-dir --no-eslint` locally, `git init`, first commit, push to `main`.
  3. Sign up at **railway.app** with GitHub. New Project → Deploy from GitHub → pick `rejsy`. Railway auto-detects Next.js and deploys. Confirm the "hello world" is live at `https://rejsy-<hash>.up.railway.app`. **This URL is the demo URL. Share it in the group chat.**
  4. Walk over to a Linq organizer and ask for **sandbox access** for team "Rejsy." Create a profile called "Rejsy — your Denmark transport friend." Don't wire the iMessage action yet; just claim the profile URL.
  5. Invite A, B, D as GitHub collaborators. They should all pull the repo immediately.

- **D — Supabase project + schema.**
  1. Supabase → new project → region `eu-central-1` → free tier.
  2. From the SQL editor, paste the schema from `Architecture.md §3`. Run.
  3. Grab the project URL + service_role key. Send both to Person C to add as Vercel env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`.

**Phase 0 checkpoint (00:40):**
- A: cURL to Linq API delivers a real iMessage from Rejsy's number to your iPhone ✅
- B: Rejseplanen script returns a real journey ✅
- C: Railway URL is live and shared; Linq webhook URL registered pointing at it ✅
- D: Supabase URL + key sent to C, tables exist ✅

Any red → 5 more minutes, then proceed with the fallback for that piece. **Do not go past 00:45 in setup.**

---

## Phase 1 (00:40 → 01:30) — First message end-to-end. **Echo, no brain.**

**Goal:** you text Rejsy's Linq number from your iPhone → Linq posts to Railway → Railway replies "hi, i heard you: <your text>" → reply lands in your iPhone as blue bubbles.

- **A:** Write `/src/app/api/inbound/route.ts`:
  ```ts
  export async function POST(req: Request) {
    const body = await req.json();
    const d = body?.data ?? {};
    // Ignore our own outbound events echoed to the webhook — infinite loop otherwise
    if (d.direction !== 'inbound') return new Response('ok');
    const from = d.from;                                        // E.164
    const chatId = d.chat?.id;                                  // NOTE: nested, not chat_id
    const text = d.message?.parts?.find((p: any) => p.type === 'text')?.value ?? '';
    // reply into the existing chat (plain text is chat-scoped, not handle-scoped)
    await fetch(`https://api.linqapp.com/api/partner/v3/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LINQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: { parts: [{ type: 'text', value: `hi, i heard you: ${text}` }] },
      }),
    });
    return new Response('ok');
  }
  ```
  Env vars (Person C sets these in Railway): `LINQ_API_KEY`, `LINQ_FROM_NUMBER`, `PUBLIC_APP_URL` (Railway URL — used later for card URLs).

- **B:** In parallel, build the agent skeleton at `/src/agent/handleTurn.ts` — a function `handleTurn(fromHandle: string, message: string): Promise<string>` that just returns `"hi, i heard you: " + message`. Do not wire to A yet. Also stub `/src/agent/llm.ts` with an interface `chat(messages, tools) → { text, toolCalls }` so the Anthropic/Groq swap is one implementation.

- **C:** Landing page hero + one CTA button. Copy = placeholder ("text rejsy"). Wire the CTA `href` to `process.env.NEXT_PUBLIC_IMESSAGE_HREF`. Set the env var in Vercel to `sms:<A's-handle>&body=hi%20rejsy`.

- **D:** Write `/src/db/users.ts`: exports `getOrCreateUser(phone, chatId)` — on first inbound, insert the user with `linq_chat_id`. Also write `/src/db/messages.ts`: exports `logMessage(userId, direction, body, toolCalls?)`. Both use `@supabase/supabase-js` with the service-role key.

**Phase 1 checkpoint (01:30):** Live text from any iPhone in the room → blue-bubble echo reply within 5 seconds. If not, A + B + D drop everything and debug the pipe. C keeps building the website.

---

## Phase 2 (01:30 → 02:30) — Real agent, planning works.

**Goal:** text "how do I get to Aarhus from Copenhagen tomorrow at 9am" → get back 3 real Rejseplanen options.

- **A:** Replace echo with a call into `B.handleTurn`. Wrap outbound in `/src/agent/sendMessage.ts` and use it from `handleTurn`. Log both inbound and outbound via `D.logMessage`.

- **B:** Wire real Claude Haiku via `/src/agent/llm.ts`. Define the first tool `plan_trip` in `/src/agent/tools.ts`. The tool implementation calls `/src/transport/rejseplanen.ts` (see D). Write the system prompt in `/src/agent/systemPrompt.ts` — start with the identity + voice from `Design.md §2`, then situational awareness from `Memory.md §3`. Cap the tool-calling loop at 4 iterations.

- **C:** Add the three-panel demo strip section (placeholder screenshots). Refine hero copy to match the pitch. Add a QR code below the CTA for desktop viewers (`npm i qrcode` → server-render into an `<img>`).

- **D:** Ship `/src/transport/rejseplanen.ts` — three functions: `findStation(name)`, `journeys(fromId, toId, when)`, `departures(stationId, when)`. Wrap `hafas-client` with the Rejseplanen profile. Include basic error handling — return `null` instead of throwing on network failures so the LLM can degrade gracefully.

**Phase 2 checkpoint (02:30) — first hard go/no-go:**
- **Green:** live natural-language trip request returns 3 real options in <15s.
- **Yellow:** works but slow or malformed. Continue, allocate polish time in Phase 5.
- **Red:** planning is dead. **Pivot:** B hard-codes 3 canned trips (København → Aarhus, København → Odense, Nørreport → Kastrup). Demo becomes "we picked three routes to nail the experience." Not ideal but shippable.

---

## Phase 3 (02:30 → 03:20) — Booking hand-off via Agent App + map page.

**Goal:** user picks an option ("1") → agent sends a Linq Agent App card that opens a map → user taps "Buy on DSB" on the map → deep-link opens DSB app → agent texts a confirmation into the chat.

This is the phase where the demo goes from "chatbot" to "product." Everything hinges on the map card working smoothly.

- **A:** Ship `/src/agent/linq.ts` with three helpers:
  - `sendChatText(chatId, text, opts?)` → `POST /v3/chats/{chatId}/messages` for plain-text replies. `opts.effect` (e.g. `"confetti"`) for iMessage effects.
  - `sendMapCard(toPhone, {sessionId, title, subtitle})` → `POST /v3/messages` (handle-targeted!) with the action-card body. URL is `${PUBLIC_APP_URL}/map/${sessionId}?s=${sessionId}`.
  - `startTyping(chatId)` / `stopTyping(chatId)` → `POST` / `DELETE /v3/chats/{chatId}/typing`. Wire these into `handleTurn` around the LLM call.
  Also update `/api/inbound` to save `linq_chat_id` on the user row on first inbound.

- **B:** Implement `book_trip({option_index})` tool. Inside the tool:
  1. Look up the last plan_trip result (cache it on the user's conversation state — either in memory keyed by user_id, or in `messages.tool_calls`).
  2. Insert `trips` row (status `planned`, snapshot of legs, computed DSB deep link URL).
  3. Insert `reminders` row for `depart_at - 25min`, pre-rendered body.
  4. Insert `agent_app_sessions` row with a fresh UUID + trip_id + user's chat_id.
  5. Call `sendMapCard(userPhone, {sessionId, title, subtitle})`.
  6. Return a NO-OP result to the LLM (the card is the reply — instruct the LLM in the system prompt: "when book_trip succeeds, do NOT compose a follow-up text").

- **C:** Build the map page at `/src/app/map/[sessionId]/page.tsx`. This is the biggest single piece of new work in Phase 3. Requirements:
  - Fetch trip data via a small `/api/trips/[id]` route (D provides).
  - Include Leaflet via CDN in `<Head>` (see Architecture §2.10) — no `npm install` needed.
  - Render markers (origin, destination, transfers) with popup labels; polyline connecting them (solid for train legs, dashed for walking).
  - Auto-fit bounds. Zoom-out button in the corner.
  - Sticky bottom bar: big blue "Buy on DSB →" button (deep-link href) + small "Not now" link.
  - Beacon script (Architecture §2.10 has the exact snippet). Fire `opened` on mount, `finish:buy` on Buy click, `closed` on `pagehide`.
  - Style with Tailwind; keep it Apple-clean, no logos or clutter.

- **D:** Two things:
  1. DB helpers in `/src/db/trips.ts` (`createTrip`, `getUpcomingTrips`, `getTripById`), `/src/db/sessions.ts` (`createSession`, `getSessionWithTrip`, `appendEvent`, `markNotified`), `/src/db/places.ts` (`remember`, `list`).
  2. Ship `/api/exp/event/route.ts` — see Architecture §2.10 flow. On `finish:buy`: call A's `sendChatText(chatId, "🚆 locked in! i'll remind you 25 min before departure.", {effect: "confetti"})`. On `closed`: log and do nothing.
  3. Also `/api/trips/[id]/route.ts` — returns trip JSON for C's map page to consume.
  4. Seed script (`/scripts/seed-demo.ts`) — demo user with `linq_chat_id` = a valid dev-Linq chat id, plus one dummy past trip.

**Phase 3 checkpoint (03:20):** end-to-end — text "book 1" → get a card in blue bubbles → tap card → see map with real stations → tap Buy DSB → confirmation text lands in chat with confetti. If the card sends but the map page 404s, fix the dynamic route before moving on. If the beacon isn't reaching the server, use `fetch` with `keepalive: true` as a fallback for `sendBeacon`.

**Kill switch:** if the map page is broken by 03:15, replace the card with a plain-text DSB deep link ("locked in — tap to pay: <url>"). Less impressive but ships.

---

## Phase 4 (03:20 → 04:00) — Reminders + status. **The companion story lights up here.**

**Goal:** a scheduled reminder fires unprompted at the right time; "status" query returns live info from Rejseplanen.

- **A:** Support D on cron auth (add `CRON_SECRET`, verify `Authorization` header). Once done, start the demo choreography script — write out exactly what you'll type in the demo, in order, with timestamps.

- **B:** Add `get_status` and `set_reminder` tools. `set_reminder` writes a pre-rendered message body to `reminders` — cron should NEVER call the LLM.

- **C:** Website is essentially done — pivot to helping A with demo screenshots and any last copy fixes. Add the coverage strip ("🇩🇰 works across denmark · dsb · s-tog · metro · movia · dot").

- **D:** Ship in-process cron via `node-cron` (Railway keeps the Node process alive, so we don't need external cron). `npm i node-cron`. Create `/src/cron.ts` with two schedules (`*/1 * * * *` reminders, `*/5 * * * *` status) and `/src/instrumentation.ts` to boot them on server start:
  ```ts
  // src/instrumentation.ts — Next.js 14 hook
  export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      const { startCrons } = await import('./cron');
      startCrons();
    }
  }
  ```
  Test by inserting a reminder that fires in 2 minutes. Watch your phone. **Then insert one that fires at 19:32 (mid-demo)** — this is the choreographed proactive push.

**Phase 4 checkpoint (04:00) — second hard go/no-go:**
- **Green:** reminder fired for real at least once, status query returns something.
- **Yellow:** only reminders work — drop status from the demo script.
- **Red:** cron won't fire. Replace with a "start demo mode" hidden button in the website admin that manually POSTs to the cron endpoints at the right moment.

**Freeze commit at 04:00.** Tag it `demo-freeze`. Nobody pushes after this without an all-four call.

---

## Phase 5 (04:00 → 04:30) — Polish + seed + Linq trip-card (aspirational).

- **A:** Own the demo phone (either your iPhone or a teammate's). Have a real friendly conversation with Rejsy through the Linq → iMessage flow (start on the website, tap Linq, arrive in Messages). Screenshot every good moment. Purge embarrassing rows from `messages` if any.
- **B:** Prompt tuning ONLY. Read the last 10 conversations, fix awkward replies. No new tools.
- **C:** Swap placeholder screenshots for the real ones from A. Product name goes in (default: **Rejsy**). Sponsor names in the footer. **Final check on Linq profile:** the iMessage action works from a fresh iPhone (not the one that made the profile).
- **D:** Confirm the 19:32 reminder is queued. Confirm nothing scary is in `messages`. Backup the Supabase DB by dumping tables to a local JSON file — insurance.

**Aspirational Linq trip-card integration** (only if you have 10 free minutes at 04:15 and Linq's sandbox exposes a create-profile API):
- When a user books a trip, agent POSTs to Linq sandbox to create a temporary "trip card" — a shareable Linq page with trip details + live status link.
- Agent replies as a follow-up: "want me to send this to someone? here's your shareable Linq: <url>"
- Demo money-shot: "Linq isn't just for people — it's for trips, too."
- If Linq API is a hassle, skip and just mention Linq for 3 seconds in the pitch.

## Phase 6 (04:30 → 04:50) — Rehearse ×3.

- **Rehearsal 1:** driver (A) does the demo from cold, no prompts. Everyone else times it — target 90 seconds.
- **Rehearsal 2:** B plays a hostile judge: "how does this differ from DSB app? what if I need to book for 3 people? what about Rejsekort?" Practice a 20-second answer to each.
- **Rehearsal 3:** record it on a phone — this is the backup video. If wifi dies, you play it and pitch over it.

## 04:50 → submit. Submit URL, phone handle (or website that has it), team names. Then breathe.

---

## Roles during the live demo (19:30)

- **Driver (A):** Holds the demo phone. Reads no notes. Texts the agent live. Does not talk.
- **Pitcher (C):** Talks. 90 seconds. Sponsors named once each. Big picture.
- **Sidekick (B):** Watches Vercel logs on a laptop. Hand hovers over the "play backup video" button.
- **Ops (D):** Watches Supabase table editor. If the 19:32 reminder doesn't fire on schedule, D manually inserts+fires one from the Supabase SQL editor.

---

## Central-merge / where-does-everyone-work summary

| Person | IDE | Ships to | Watches |
|---|---|---|---|
| A | Cursor + Linq dashboard + `curl` | GitHub `main` → Railway | Linq dashboard (message log), Railway logs |
| B | Cursor | GitHub `main` → Railway | Anthropic Console usage, Railway logs |
| C | Cursor + Linq dashboard | GitHub `main` → Railway | Railway URL on iPhone Safari, Linq profile stats |
| D | Cursor + Supabase dashboard | GitHub `main` → Railway (for cron/API code), Supabase (for SQL/data) | Supabase table editor, Railway logs (cron output) |

**One shared GitHub repo. One `main` branch. Every push auto-deploys to one Railway URL. That Railway URL is the demo. That's the whole merge story.**

---

## Kill-switch quick reference (skim during panic)

| If this fails by | Do this |
|---|---|
| Phase 0 — Linq credentials delayed or number not provisioned | Ask Linq rep for a shared sandbox number to unblock. If truly stuck, temporarily wire up BlueBubbles on a Mac as a fallback bridge (2h detour — only if Linq is completely down). |
| Phase 0 — Linq blocks proactive push (session-window rule) | Reminder feature becomes "user pings status" instead of "we push status." Still works for the demo since the user has just booked (session is open). Reword the pitch. |
| Phase 2 — Rejseplanen returns nothing | Hard-code 3 canned trips |
| Phase 3 — DSB deep link doesn't pre-fill | Reply with plain "https://www.dsb.dk" URL |
| Phase 3 — LLM (Haiku) is slow / erroring | Flip env var, swap to Groq |
| Phase 4 — `node-cron` doesn't run on Railway | Trigger reminders manually via a `POST /api/admin/fire-reminders` endpoint gated by a header token; D presses it during demo |
| Phase 0 — Railway is being weird / deploy fails | Fall back to Vercel; same Next.js codebase runs on either, no code change needed |
| Live demo — Linq loses connection | Play backup video, pitch over it |
