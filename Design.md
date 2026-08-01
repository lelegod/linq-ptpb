# Design — PTPB visual + interaction system

Three surfaces to design: (1) the **iMessage thread** — where the product actually lives — (2) the **marketing website** — where judges first see us — and (3) the **Agent App map page** — the JIT UI moment where a chosen route becomes a visual, tappable, "Buy on DSB"-shaped experience opened from a card inside iMessage. This doc covers all three.

Design principle: **imitate, don't compete.** iMessage has a design language everyone already knows. The website's job is to make judges feel "oh, this is just texting a friend, but the friend knows every train in Denmark."

---

## 1. Brand identity — 20 minutes of decisions, no debate

**Product name (working):** *Rejsy* (Danish "rejse" = travel + friendly diminutive). Alternatives on the shelf: *Perron*, *Blue Line*, *Trackmate*.

**Wordmark:** SF Pro or Inter, semibold, all lowercase. Set the "y" descender kissing the baseline of the following text — one glyph tweak, zero design cost.

**Colors:**

| Role | Hex | Use |
|---|---|---|
| Bubble blue (iMessage) | `#007AFF` | Outbound bubbles in mockups, primary CTA button |
| Grey (iMessage) | `#E5E5EA` | Inbound bubbles in mockups |
| Ink | `#0A0A0F` | Body text, headings |
| Paper | `#FAFAFA` | Website background |
| Danish red accent | `#C60C30` | *One* accent — the flag stripe in the hero, sponsor divider. Do not overuse. |
| Success green | `#34C759` | "Booked" / "on-time" pill |
| Warning amber | `#FF9500` | "Delayed" pill |

That's the whole palette. No gradients. No shadows deeper than `0 4px 24px rgba(0,0,0,0.08)`.

**Typography (website):** Inter, three sizes — 48/28/16, weights 700/500/400. That's it.

**Iconography:** [Lucide](https://lucide.dev) only. No custom SVGs unless someone insists during hour 5 polish.

---

## 2. The message thread — how the agent speaks

Every reply must feel like a friend texting you back. Concrete rules for Person B's prompt:

### 2.1 Voice
- Lowercase-first, casual. "got it" > "Understood."
- Contractions. "you're" not "you are."
- Danish place names spelled correctly: "København H", "Nørreport", "Aarhus H".
- No emojis by default. One emoji per turn max — 🚆 for a confirmed booking, 🕘 for a reminder, ⚠️ for a delay. Never more than one at a time.
- Never say "As an AI" or "I'm just a bot." Never apologize for what you can't do — offer what you can.

### 2.2 Message shapes

**Greeting (first ever message):**
```
hey! i'm rejsy. tell me where you need to go in denmark
and roughly when — i'll figure out the rest.

try: "aarhus tomorrow around 9"
```

**Trip options reply:**
```
københavn h → aarhus h, sat aug 1

1. 09:03 → 12:17 · dsb · 149 kr · direct
2. 09:33 → 12:47 · dsb · 149 kr · direct
3. 10:03 → 13:17 · dsb · 89 kr · orange billet

reply with 1, 2 or 3 to lock it in.
```

Design intent: numbered options, monospace-feel via line-alignment, one word for the operator, price with `kr`, one-line summary per option. No paragraphs.

**Booking hand-off (Agent App card, not plain text):**

Instead of a text message with a URL, the agent sends a Linq action card. In the thread it appears as a rich embed:

```
┌──────────────────────────────────────────┐
│  🗺️  Rejsy                                │
│  København H → Aarhus H                  │
│  Sat 09:03 · direct · 3h 14m · 149 kr    │
│                          [ See route → ] │
└──────────────────────────────────────────┘
```

Title: `København H → Aarhus H`
Subtitle: `Sat 09:03 · direct · 3h 14m · 149 kr` (adjust for chosen option)
Button: `See route`

The card opens the map page (see §4). The agent does NOT send any accompanying text with the card — the card is complete on its own.

**Booking confirmation (after user taps "Buy on DSB" on the map page):**
```
🚆 locked in — i'll remind you 25 min
before departure.
```
Fired server-side from `/api/exp/event` when it receives `finish:buy`. Include `"effect": "confetti"` on the message body for the iMessage confetti animation — free wow factor.

**Reminder push:**
```
🕘 leave in 25 min — head to københavn h,
platform 3. train 79 to aarhus, 09:03.
```

**Delay warning push:**
```
⚠️ heads up — your 09:03 to aarhus is running
7 min late. new departure: 09:10, same platform.
```

**Status query reply:**
```
your next: 09:03 → aarhus h (in 42 min).
on time. platform 3, københavn h.
```

**When something goes wrong / unknown place / no result:**
```
hmm, couldn't find "helsingør h" — did you mean
helsingør station? try again with just the city.
```

### 2.3 What the agent never does
- Sends a wall of text.
- Sends multiple messages back-to-back without user input (except cron pushes).
- Uses markdown (no `**bold**` — iMessage doesn't render it).
- Includes links that aren't the DSB deep-link (no attribution links, no source URLs, no "learn more").
- Makes up prices or platforms. If unknown, omit; never guess.

---

## 3. Website — one page, three scrolls

### 3.1 Layout

```
┌──────────────────────────────────────────────────────────┐
│  rejsy                                    built @ ccnl    │  ← thin top bar
├──────────────────────────────────────────────────────────┤
│                                                          │
│     text a number.                                       │
│     go anywhere in denmark.                              │  ← Hero
│                                                          │
│     [ 📱 Text +45 XX XX XX XX ]  ← primary CTA button    │
│                                                          │
│                              ┌──────────────────┐        │
│                              │ [phone mockup]    │        │
│                              │  live iMessage    │        │
│                              │  screenshot       │        │
│                              └──────────────────┘        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│     ┌──────┐    ┌──────┐    ┌──────┐                     │
│     │ plan │ →  │ book │ →  │remind│                     │  ← Three-panel demo
│     │ img  │    │ img  │    │ img  │                     │
│     └──────┘    └──────┘    └──────┘                     │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│         🇩🇰   works across all of denmark                │  ← Coverage strip
│              dsb · s-tog · metro · movia · dot           │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  cursor · linq · vibe coding network                     │  ← Footer
│  built by [4 names], copenhagen, aug 2026                │
└──────────────────────────────────────────────────────────┘
```

### 3.2 Hero copy — commit to one

Draft A (recommended — matches the pitch):
> **text a number.**
> **go anywhere in denmark.**
> rejsy plans your trip, hands you the ticket, and pings you when to leave.

Draft B (shorter):
> **your friend, if your friend knew every train in denmark.**

Draft C (functional):
> **the fastest way to book public transport in denmark: text a number.**

Pick A unless someone objects. It works on the poster too.

### 3.3 The CTA — text Rejsy's Linq-provisioned number

The website's job is to get the user's finger into Messages with Rejsy's number pre-typed. Two options depending on what Linq's "Agentcard" product looks like when Person A checks:

**Option 1 — plain `sms:` button (fast, always works):**
- Big button in the hero, `#007AFF` bg, white text, iOS radius `12px`.
- `href="sms:$LINQ_FROM_NUMBER&body=hi%20rejsy"` (the number is Rejsy's Linq-provisioned number, injected at build time via `NEXT_PUBLIC_IMESSAGE_HREF`).
- Button label: "iMessage Rejsy."

**Option 2 — Linq Agentcard link (better sponsor story if it exists):**
- Same button, but `href` points to Rejsy's Linq Agentcard URL (e.g. `https://linq.app/rejsy`).
- The Agentcard page itself opens Messages when tapped — same net UX, but the judge sees Linq's brand for a beat before the handoff.
- Button label: "Open Rejsy on Linq."

Pick Option 2 if Agentcard is available in the sandbox; Option 1 as the guaranteed fallback (or the primary — they're functionally identical).

- **Desktop viewers:** a QR code renders next to the primary CTA (`qrcode` npm package, server-rendered at build time). Camera → Messages → typing. Same three-step path but demo-friendly.
- Small text under the block: `iPhone only — blue bubbles required.`
- **Not a secret, but not a headline either:** the Linq-provisioned number belongs to us for the hackathon, not a real person. Fine to print in plain text on the site — no privacy concern anymore now that we're not using a teammate's handle.

### 3.4 The phone mockup

Not a Figma render. Use a **real iPhone screenshot** of a **real conversation** with the agent, taken at hour 3 or later. Crop to the message area, drop-shadow, that's it. Real screenshots convince judges 10x more than mockups.

### 3.5 Three-panel demo strip

Three cropped iMessage screenshots side-by-side, captioned:

1. **plan** — user says "aarhus tomorrow at 9", agent replies with 3 options.
2. **book** — user says "1", agent confirms with deep link.
3. **remind** — outbound-only screenshot of the leave-now reminder message.

### 3.6 Coverage strip

Just a horizontal row of operator names in muted grey. No logos (licensing risk, and they take longer to source than we have). Text-only:

```
dsb · s-tog · metro · movia · dot · øresundståg
```

Preceded by "🇩🇰 works across denmark".

### 3.7 Footer

- Left: **cursor · linq · vibe coding network** — flat text, no logos unless the sponsors provided them by hour 4.
- Right: team names, "copenhagen · aug 2026".

### 3.8 What the website does NOT have

- Nav bar (there's nowhere to go).
- Login / sign up.
- Pricing.
- FAQ.
- Blog.
- Testimonials.
- "How it works" video.
- A footer email newsletter signup.

Every one of those adds surface area and takes attention away from the CTA.

---

## 4. The Agent App map page — the JIT UI moment

Opened when the user taps the "See route" card in their iMessage thread. Rendered in iMessage's in-app browser (which is Safari WebView), so mobile-first, thumb-friendly, one-screen.

### 4.1 Layout

```
┌──────────────────────────────────────────┐
│  ✕                                       │  ← close hint (browser handles)
├──────────────────────────────────────────┤
│  KØBENHAVN H → AARHUS H                  │  ← 20/700 all-caps
│  Sat 09:03 arr 12:17 · 3h 14m · 149 kr   │  ← 14/500 muted
├──────────────────────────────────────────┤
│                                          │
│              [ LEAFLET MAP ]             │
│                                          │
│    ●━━━━━━━●━━━━━━━━━━━━━━━━━━●          │  ← polyline w/ station dots
│  København  Odense           Aarhus      │
│                                          │
│                                          │
│                                          │
├──────────────────────────────────────────┤
│  DEPARTURE  PLATFORM  ARRIVAL            │
│  09:03      3         12:17              │  ← trip meta strip
├──────────────────────────────────────────┤
│                                          │
│   ┌────────────────────────────────┐     │  ← sticky bottom bar
│   │  BUY TICKET ON DSB      →     │     │  #007AFF bg, white text
│   └────────────────────────────────┘     │
│   Not now                                │  small grey link
└──────────────────────────────────────────┘
```

### 4.2 Map styling

- **Tiles:** OpenStreetMap default (`{s}.tile.openstreetmap.org`). No custom style — the plain OSM basemap is clean enough and instant to load.
- **Markers:** small filled circles, not pins. `#007AFF` (blue) for origin + destination, `#8E8E93` (grey) for transfer stops. Circle radius 6px. White border 2px.
- **Popups on tap:** station name only, no times (times live in the trip-meta strip).
- **Polyline:** `#007AFF`, weight 4, `dashArray: null` for train legs, `dashArray: '6, 6'` for walking transfers.
- **Auto-fit bounds** with 40px padding.
- **Attribution:** default Leaflet attribution ("© OpenStreetMap") in the bottom-right — respect their license.

### 4.3 Trip-meta strip

Three columns, equal width, centered text. Labels 11/500 all-caps grey; values 18/600 ink. Only include fields we actually have from Rejseplanen (platform may be null — omit gracefully, don't show "N/A").

### 4.4 The "Buy on DSB" button

- Sticky at the bottom of the viewport, full-width minus 16px side padding.
- `#007AFF` bg, white text, 56px tall, 14px radius, 17/600 label.
- `href` is the DSB deep link stored on the trip.
- Beacon: on click, `ping('finish:buy')` fires BEFORE the navigation kicks in. Use a tiny 50ms `setTimeout` between beacon and `location.href` to make sure it goes out.
- "Not now" link below, 14/500 grey, centered. On click: `ping('closed')` then `window.close()` (which iMessage's WebView honors).

### 4.5 What NOT to put on the map page

- Login. Payment forms. Anything typing-heavy.
- Marketing. "About Rejsy" links. Sponsor logos.
- A conversation view (the conversation is in iMessage — don't duplicate).
- Multiple options — this page shows ONE trip. If the user wants to switch, they go back to iMessage.
- Any Google Analytics / Mixpanel / etc. Just the beacon.

### 4.6 Loading state

Show the trip meta immediately (server-rendered), map tiles fade in. If the map fails to load in 3s, show a static placeholder image of Denmark with the route drawn as SVG lines — no map, still tells the story. `<noscript>` shows the trip meta + a "Buy on DSB" link — page degrades gracefully.

---

## 5. Responsive rules

- **Mobile (≤ 640px):** stacks vertically. Phone mockup below hero. Three-panel becomes three-stacked. Coverage strip wraps.
- **Desktop (≥ 1024px):** two-column hero (copy left, phone mockup right). Three-panel side-by-side.
- **Tablet:** treat as mobile. We're not designing for iPad.

---

## 6. Motion (only if hour 5 has slack)

- Hero copy: fade + rise-in on mount, 300ms, once.
- Phone mockup: a single subtle 4-second loop where a "typing…" indicator appears and a bubble drops in. Use CSS keyframes, no library.
- Anything more is scope creep.

---

## 7. Sponsor treatment

- **Linq:** in the pitch, we say "if you liked our conversational entry point, that's a Linq idea." One nod, on stage, not on the website hero.
- **Cursor:** in the pitch, "the code you're seeing was written in Cursor over the last 6 hours." One nod.
- **Vibe Coding Network:** footer credit.

Do not put sponsor logos in the hero. It reads as advertisement and looks like a class project.
