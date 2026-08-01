# Memory — what the agent remembers, and how

Two audiences read this: **Person B**, who writes the system prompt and tool loop, and **Person D**, who builds the Supabase schema (already sketched in Architecture.md §3). This doc is the contract between them.

Design principle: **the agent has amnesia between turns unless we hand it context.** Supabase is memory. The LLM is just the CPU.

---

## 1. Three layers of memory

| Layer | Lives in | Written when | Read when |
|---|---|---|---|
| **Turn** — what the user just said | in-memory during one webhook invocation | inbound webhook fires | passed to LLM as the user turn |
| **Session** — the recent conversation | `messages` table | after every inbound + outbound | prepended to LLM context on next turn |
| **Long-term** — who this user is, what they've asked us to remember, what trips they have | `users`, `user_places`, `trips` | when the agent calls `remember_place`, `book_trip`, etc. | injected into the system prompt as a preamble |

We do NOT use vector search, RAG, embeddings, or any semantic layer. Everything is small enough to hand-shape as text. Building a vector DB in a hackathon is a scope-drift trap.

---

## 2. Turn-level context (per webhook)

On every inbound message, the agent handler does this before calling the LLM:

```ts
// pseudo-code — real thing lives in /src/agent/context.ts
const user = await getOrCreateUser(inbound.phone);       // Long-term
const places = await getUserPlaces(user.id);             // Long-term
const upcomingTrips = await getUpcomingTrips(user.id);   // Long-term
const recentMessages = await getRecentMessages(user.id, 20);  // Session
const now = new Date();                                  // Turn

const systemPrompt = buildSystemPrompt({ user, places, upcomingTrips, now });
const conversation = [...recentMessages, { role: 'user', content: inbound.body }];

const reply = await claude.messages.create({
  system: systemPrompt,
  messages: conversation,
  tools: TOOLS,
});
```

## 3. The system prompt shape

The system prompt is assembled at request time, not hard-coded. It has four parts, in order:

### Part 1 — Identity + voice (static)
Copied verbatim into every request. Kept under 150 words. See **Design.md §2** for the voice rules; this section encodes them.

### Part 2 — Situational awareness (dynamic)
Everything the LLM needs to know about *right now*, formatted as a compact block:

```
Now: Sat 1 Aug 2026, 14:22, Europe/Copenhagen.
User: "Gokul" (phone +45XXXXXXXX), first seen 14:05 today.
Known places:
  - home: København H (station 8600626)
  - work: DTU Lyngby (station 8600792)
Upcoming trips:
  - trip #3f2a: København H → Aarhus H, dep Sat 1 Aug 15:03 (in 41 min), status: booked
```

If a field is empty (no places, no trips), omit it entirely — don't say "Known places: none." Empty blocks waste tokens and cue the LLM to comment on them.

### Part 3 — Tool guide (static)
Short description of when to use each tool. LLM already has the tool schema; this is the *policy* layer. Example:

> Use `plan_trip` whenever the user asks about going somewhere, even vaguely. Use `book_trip` only after the user has picked a specific option (a number or a clear "yes" to one). Use `set_reminder` after `book_trip` unless the user opts out. Use `remember_place` when the user says something like "call this home" or when we ask "want me to save this as home?" and they say yes.

### Part 4 — Recent conversation (dynamic)
The last N messages, not in the system prompt but in the `messages` array on the API call. Cap at **20 turns or ~4k tokens**, whichever hits first. Trim from the oldest.

---

## 4. Long-term memory — what we persist, what we don't

### We persist:
- **Identity:** phone number → user_id. That's the login.
- **Display name:** if the user offers it ("I'm Sarah"). Do not ask for it — wait for it. Never file it as a required field.
- **Named places:** `home`, `work`, plus whatever the user asks us to remember. Stored as (label, station_id, station_name). This is the single biggest UX win — "take me home" should just work.
- **Trips:** every booked option is a row. Includes snapshot of the legs so we can render "leave for platform X" without re-querying Rejseplanen.
- **Messages:** every turn, both directions, forever. Cheap to store, invaluable to debug. See §5 for what we *don't* put in here.

### We do not persist:
- **Trip queries that didn't result in a booking.** No point.
- **Failed tool calls.** Log to stderr, don't clutter DB.
- **LLM's internal chain-of-thought or reasoning text.** Only the final message the user saw.
- **Payment info.** We never see it. DSB does.
- **Sensitive personal detail.** If the user mentions health, finances, or anything protected, we do not store it. See §6.

---

## 5. What goes in the `messages` table exactly

One row per inbound OR outbound. Never batch. Schema (from Architecture.md §3):

```
messages(id, user_id, direction, body, tool_calls, created_at)
```

- `direction`: `"in"` for user → us, `"out"` for us → user.
- `body`: the exact text sent or received. For `"out"` with tool calls, this is the final composed text, NOT the tool call.
- `tool_calls`: for `"out"` rows, a JSON array of `{name, args}` — what tools the LLM invoked in this turn. Handy for demoing "look, it planned a real trip." For `"in"` rows, always `null`.

**Session reconstruction:** `getRecentMessages(user_id, n)` returns the last `n` messages ordered oldest → newest, mapped to `{role: "user"|"assistant", content: body}`. Tool call rows contribute an assistant message with the composed body; we do NOT replay tool_use / tool_result blocks in the reconstructed conversation — that would blow up context and add nothing the LLM needs.

---

## 6. Sensitive information — what to redact

Ordinary transport queries won't hit these, but be defensive:

If a user's message includes:
- Government ID (CPR number pattern `\d{6}-\d{4}`)
- Payment card patterns (`\d{13,19}`)
- Their home street address (as opposed to a station name)

...we still process the message (natural request), but the tool `remember_place` refuses to save these as place labels or values. The user's raw message still lands in `messages.body` because censoring inbound would break debugging — but we don't propagate it into long-term memory fields.

The agent should never *volunteer* personal detail. If the user asks "what do you know about me," reply with the concrete memory: name, saved places, upcoming trips. That's it.

---

## 7. Cross-trip continuity — the "companion" moment

This is where the demo lands. Sequence:

1. **Turn 1 — planning.** User: "aarhus tomorrow around 9." → agent stores nothing yet, just returns options.
2. **Turn 2 — booking.** User: "1." → agent writes a `trips` row and a `reminders` row set for depart_at − 25min.
3. **~25min before departure — proactive push.** Cron reads the reminder, sends the message, marks fired. The user's iPhone lights up unprompted.
4. **User replies: "will i make it? my meeting starts at 12:30."** → agent looks up the stored trip, calls `get_status`, replies with delay-aware ETA.
5. **The moment.** The agent knows about this trip *because we stored it*. Not because of vector search, not because of any magic. It's just SQL.

Person B should design the system prompt so the LLM naturally leans on step 3–5 context. Person D should make sure the seed script for demo hour installs a `trips` row with a `reminders` row timed to fire mid-demo — this is not accidental, this is choreographed.

---

## 8. Memory limits

- **Recent messages cap:** 20 turns OR 4000 tokens, older gets truncated.
- **Places per user:** no hard cap; UI won't overflow because we present them contextually, not as a list.
- **Trips retained:** all of them; `list_trips({window: "past"})` shows the last 5.
- **Reminder queue:** unlimited rows, but the cron only reads rows with `fire_at ≤ now() AND fired_at IS NULL`.

## 9. Debug view (build only if hour 5 has time)

A single URL `https://<vercel>/admin?user=<phone>&token=<secret>` that renders that user's messages, places, trips, and reminders as a plain HTML table. Not for the demo — for the team, during rehearsal.

If hour 5 is tight, skip it entirely and open Supabase's table editor instead.

---

## 10. One rule for Person B, in bold

**Never let the LLM invent a place, a station id, a departure, an arrival, a price, or a platform.** All of those come from tools that hit real data. If a tool didn't return it, the agent doesn't say it.
