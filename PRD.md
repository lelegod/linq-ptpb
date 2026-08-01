# PRD — PTPB (Public Transport Personal Bot)

**Event:** Cursor × Linq iMessage Agent Hackathon, Copenhagen — Aug 1, 2026
**Team:** 4 people, ~5 hours remaining until submission (19:00), demo at 19:30
**Working name:** PTPB — codename; product-facing name TBD before demo. Candidates: *Rejsy*, *Perron*, *TrackMate*, *Blue Line*.

---

## 1. Problem

Denmark has excellent public transport, but the digital experience is fragmented across four apps: **Rejseplanen** (planning), **DSB** (intercity tickets), **DOT Billetter** (Copenhagen zone tickets), and **Rejsekort** (tap-in card). To take a single trip from Nørreport to Aarhus, a user opens 2–3 apps, retypes the same route, chooses a ticket type they may not understand, and once moving has no single place to see "am I on the right platform, is my train delayed, when do I leave the house."

The demo insight: **your friend who has done this trip before does it in one text message.** "Aarhus tomorrow around 9, cheapest." PTPB is that friend.

## 2. Users

**Primary persona:** Denmark-based adult (student, expat, commuter, occasional intercity traveller) who owns an iPhone and already texts constantly.

**Secondary:** Tourists in DK who don't want to learn four apps for a two-week trip.

Not targeting: non-iPhone users, non-Denmark trips, freight, ride-sharing, private cars.

## 3. Solution — the one-line pitch

> Text a phone number in blue bubbles. Get from A to B in Denmark. It plans, it hands you the ticket, it reminds you when to leave, it tells you if your train is late.

## 4. Core capabilities (the ONE thing, done well: *ongoing travel companion*)

Ordered by demo priority. If we run out of time, everything below the cutline gets shipped as text-only stubs, not skipped.

### Must-have (the demo depends on these)

1. **Natural-language trip planning.** User texts intent ("I need to get to Odense before 5pm"). Agent parses origin (falls back to asking or to a saved home station), destination, time constraint, preferences (cheapest / fastest / fewest transfers). Returns 2–3 options with departure, arrival, price estimate, transfers.
2. **Agent App map card + DSB hand-off.** User picks an option ("first one" / "1"). Agent sends a Linq Agent App action card — a rich in-thread embed titled with the trip. Tapping the card opens a map page (Leaflet) showing the route with markers for origin, transfers, and destination. The map page has a big "Buy on DSB" button that deep-links into the DSB app for payment. When the user taps Buy, our server gets a beacon and texts a confetti-effect confirmation back into the thread. **We do not process payment.** The demo line is: *"I planned it, showed you the route, DSB charges you — one tap."*
3. **Trip persistence.** Once a user confirms, we store the trip. This is the seed for reminders and live status.
4. **"Leave now" reminder.** N minutes before departure (default 20; user can say "remind me 30 min before") the agent proactively iMessages: *"Head out now — S-train from Nørreport in 20 min, platform 3."*
5. **Live status check.** User can text "status" or "where's my train" and get real-time departure info from Rejseplanen for their next stored trip.

### Should-have (build if hour-4 checkpoint is green)

6. **Home / work shortcuts.** "home to work" or "take me home" resolves from stored user profile.
7. **Delay push.** If Rejseplanen reports a >5 min delay on a stored upcoming trip, we push a message without being asked.

### Won't-have (v0 — say so out loud in the demo)

- Real payment / real ticket QR code (we deep-link — say why: DSB owns the ticket, we own the experience).
- Non-Denmark routes.
- Multi-modal beyond public transit (no scooters, taxis, bikes).
- Group trips ("book for 3 people") — planning yes, booking no.
- iPhone-native app. iMessage IS the app.
- Voice / call.

## 5. The website (judged alongside the agent)

Job: **landing page + Linq-powered entry point.** Not a dashboard. Not a login. The primary CTA is a **Linq card** ("Tap to text Rejsy") that the user opens; Linq itself launches Messages with a pre-filled greeting. This makes Linq a first-class part of the demo (sponsor points), not a footer credit.

Structure:
1. Hero — one sentence pitch, phone-mockup of a real conversation, embedded Linq card OR "Open my Linq" button.
2. Three-panel demo strip — "Plan → Book → Remind" screenshots of actual iMessage bubbles.
3. Denmark map or coverage strip (visual proof: all of DK).
4. "Built at Cursor × Linq Hackathon 2026" footer, team names, sponsor logos.

See **Design.md** for the visual system.

## 6. Success criteria — how we know we won

Judges score idea + website + agent. Our checklist:

- [ ] Live demo: judge texts our number from an iPhone in the room, gets a real blue-bubble reply within 10 seconds.
- [ ] Full happy-path completes end-to-end on stage without a rescue.
- [ ] Website loads in under 2 seconds on hotel wifi, CTA works from mobile Safari.
- [ ] A stored trip fires a real reminder during the demo (pre-scheduled to hit at demo time).
- [ ] Judges understand what we do in the first 15 seconds of the pitch.

## 7. Non-goals (scope guardrails — cite these in team disputes)

- We are **not** building a DSB competitor. We're a layer on top.
- We are **not** solving payment. Deep link.
- We are **not** supporting Android. iPhone only for demo.
- We are **not** shipping a mobile app. iMessage is the app.
- We are **not** doing account sign-up on the website. Identity = phone number/handle, created on first inbound message.
- We are **not** deploying on Vercel or elsewhere — Railway is the single host for the app + agent + cron.

## 8. Assumptions & risks

| # | Assumption | Risk if wrong | Mitigation |
|---|---|---|---|
| 1 | Linq provisions Rejsy a phone number, an API key, and lets us register a webhook — all within Phase 0 | No blue bubbles, no demo | Person A walks over to the Linq organizers in the first 5 minutes, gets creds + provisioned number, tests one round-trip send/receive before Phase 1. If Linq is slow to provision, ask for a temporary shared sandbox number to unblock. |
| 6 | Railway deploys the Next.js app on push to `main` without config surprises | No agent, no demo | Deploy hello-world first thing in Phase 0. If Railway is being weird, fall back to Vercel — same Next.js codebase runs on either. |
| 7 | Linq's outbound API allows proactive push (send to a user who hasn't messaged recently) | No reminders, no delay warnings — companion story collapses | Confirm this with the Linq rep in the first 10 minutes. If there's a session window, our reminder message text still works if the user has messaged us in the last N hours (they will have — they booked the trip). If push-outside-session is blocked, we lean harder on the "reply with status" flow. |
| 2 | Rejseplanen API token approval takes days, not minutes | No trip planning | Use `hafas-client` npm library from hour 0 — no token needed, hits HAFAS backend that Rejseplanen also uses. |
| 3 | DSB deep-link URL scheme is stable | Booking hand-off broken | If deep link fails silently, fall back to a plain `https://www.dsb.dk` link with a URL that pre-fills the trip if possible, or just the site. |
| 4 | Conference wifi is good enough for a live LLM call in the demo | Long silence on stage | Pre-record a 30s backup demo video. Also cache 2–3 canned trips in Supabase for the demo user. |
| 5 | The 4 devs have compatible dev environments already | First hour lost to laptop config | Hour 0 is explicitly "get on Node 20 + Supabase CLI + Cursor" — non-negotiable checkpoint. |

## 9. Open questions

- Product name (locked before hour 5, needed for website + copy).
- Which teammate owns the demo phone (Sendblue tied to one number).
- Do we register a `.dk` domain, use a Vercel preview URL, or buy a short `.com`? (Vercel preview is fine for demo — buy nothing.)
