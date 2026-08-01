# Rejsy — Person C design spec

**Date:** 2026-08-01  
**Owner:** Person C  
**Status:** Approved for implementation planning  
**Visual language source:** [`websitebuild.md`](../../../websitebuild.md)  
**Scope docs:** `PRD.md`, `Design.md`, `Architecture.md`, `Phases.md`, `Rules.md`

---

## 0. Summary

Person C ships the full C stack from the team docs, using `websitebuild.md` as the UI language: marketing landing page, `/map/[sessionId]`, coverage, pitch, **plus** Stripe paywall (Checkout + webhook implemented on the Railway backend; upgrade UI on Vercel).

**Hosts (overrides Phases.md “single Railway URL” for today):**

| Surface | Host |
|---|---|
| Landing, map, pricing/upgrade UI | **Vercel** |
| Agent, inbound, trips API, cron, **Stripe API** | **Railway** |
| Local development | **localhost** |

**Approach:** Single Next.js App Router codebase; degrade-in-place under time pressure (demo-critical path first).

**Product name:** Rejsy (locked).

---

## 1. Architecture & deploy

### 1.1 Split host

- **Vercel** deploys this Next.js app’s public pages: `/`, `/map/[sessionId]`, `/pricing`, `/upgrade`, `/upgrade/done`.
- **Railway** runs the long-lived backend (Linq inbound, trip APIs, cron). Person C also implements Stripe routes **on Railway** in the same repo.
- Do **not** put Linq inbound or `node-cron` on Vercel (no persistent process).

### 1.2 Cross-host contracts

1. **CTA / QR** → Linq via `NEXT_PUBLIC_LINQ_URL` and `NEXT_PUBLIC_IMESSAGE_HREF` (Vercel env).
2. **Map page** on Vercel fetches trip JSON from Railway: `GET ${BACKEND_URL}/api/trips/[id]` (Person D’s route).
3. **Stripe secrets and webhook** live on Railway. Vercel `/upgrade` submits to a **thin Vercel route** `POST /api/checkout` that proxies to Railway (keeps `BACKEND_URL` server-only; avoids CORS). That proxy returns the Checkout URL; the browser redirects.
4. **iMessage / Agent App links** (map URL, upgrade URL) use the **Vercel origin**. Tell Person A: `PUBLIC_APP_URL` (or equivalent) = Vercel base, not Railway.

### 1.3 Env vars

**Vercel:**

```
NEXT_PUBLIC_LINQ_URL=
NEXT_PUBLIC_IMESSAGE_HREF=
BACKEND_URL=
```

**Railway (Person C adds for Stripe; others already own Linq/Supabase):**

```
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
```

(Plus existing Supabase + Linq vars used by webhook → outbound “you’re on plus” message.)

### 1.4 Kill order (demo-critical)

1. Scaffold + Vercel live  
2. Hero + CTA (Linq)  
3. `/map/[sessionId]` working (meta + Buy minimum)  
4. Stripe upgrade happy-path (test mode)  
5. Coverage + polish last  

---

## 2. Landing page

### 2.1 Visual system

`websitebuild.md` wins over `Design.md` for look (no Inter, no soft shadows, no blue CTA chrome).

| Token | Value | Use |
|---|---|---|
| `--red` | `#C8102E` | CTA / accent; max ~2 red hits per viewport |
| `--ink` | `#0B0B0C` | Headings, dark sections |
| `--slate` | `#6B6B70` | Body |
| `--muted` | `#9A978F` | Mono labels |
| `--paper` | `#FDFBF7` | Page base |
| `--line` | `#E8E4DC` | 1px borders |
| `--bubble` | `#007AFF` | **Inside message bubbles only** |

- Fonts: **Archivo** (UI) + **IBM Plex Mono** (labels / numbers). Weights 600 and 400 only.
- No shadows, no gradients, visible `grid-bg` in hero.
- Sentence case; mono uppercase only for Fig. / labels.
- Radii: buttons `10px`, cards `12px`, bubbles `17px` / tail `6px`, phone `42px` / `34px`.

### 2.2 Sections (top → bottom)

| Section | Job | Degrade if late |
|---|---|---|
| Nav | Wordmark + Pricing jump + Get started | Drop “Log in” (no auth) |
| Hero | ~4s animated proof + CTA | Static final frame; keep replay if possible |
| Bento `(1)` | “Four apps, one thread” | Drop “saved places”; row 2 → 2 cols |
| Pricing | Free vs Plus 29 kr/mo | Static cards; Free CTA = Linq href |
| Coverage | Operator list, no logos | One mono line |
| Footer | Hackathon attribution | Minimal |

**Not building on `/`:** Design.md three-panel screenshot strip as primary proof (animated CSS thread replaces it), login, FAQ, testimonials, blog.

**Copy (locked):**

- Headline: `The friend who knows / every train in Denmark`
- Subhead: `Text it where you're going. It plans, hands you the ticket, and tells you when to walk out the door.`
- CTA: `Open Rejsy on Linq` → `NEXT_PUBLIC_LINQ_URL`
- Under CTA: `3 free trips · no card required · iPhone only`
- Reminder lead time in all UI copy: **25 minutes** (not 20)

**QR (optional):** small under CTA or footer via `qrcode`; encodes Linq / `sms:` href. First polish cut.

**Bento icons:** no `lucide-react` unless group approves a new dep — use inline SVG or simple marks.

---

## 3. Stripe paywall

Person C implements payment **on the Railway backend**. Vercel hosts UI only.

### 3.1 Product rule

- 3 free trip **plans** per user; 4th locks.
- Already-planned trips keep working; reminders still fire.
- `plans_used` increments only on successful `plan_trip` with ≥1 option (B/D).
- Stripe **test mode** for the demo; say “test mode” once in the pitch.

### 3.2 Flow

1. Agent hits limit → texts `{VERCEL_ORIGIN}/upgrade?u=<token>`
2. Vercel `/upgrade` loads user context via backend (token resolve) → Plus card + masked phone
3. CTA → Vercel `POST /api/checkout` (proxy) → Railway creates session → browser redirects to Checkout URL
4. Success → Vercel `/upgrade/done`
5. Stripe → Railway `POST /api/stripe/webhook` (signature verified) → set `plan=plus`, store `stripe_customer_id`, `subscription_status=active` → Linq: `you're on plus 🚆 plan away.`
6. `customer.subscription.deleted` → `plan=free`

### 3.3 Person C implements

**Railway (source of truth for Stripe):**

- `POST /api/checkout` — `mode: 'subscription'`, `client_reference_id: userId`, success/cancel URLs → Vercel
- `POST /api/stripe/webhook` — `stripe.webhooks.constructEvent` (required)
- Token resolve against `magic_tokens` / users

**Vercel:**

- `/pricing`, `/upgrade`, `/upgrade/done` — UI only; **no** `STRIPE_SECRET_KEY`
- Thin `POST /api/checkout` proxy → Railway (forwards token; returns `{ url }`)
- Hosted Checkout redirect only — **do not** add `@stripe/stripe-js` / Elements

**Person D applies schema** (`plan`, `plans_used`, `stripe_customer_id`, `subscription_status`, `magic_tokens`) per `websitebuild.md` §12.1.

---

## 4. Hero

Follow `websitebuild.md` §7.

- Phone frame 278px mobile / 300px desktop on `grid-bg`; device chrome + red `R` avatar.
- CSS timeline ~4s via `animation-delay` (see websitebuild table). Climax: proactive reminder bubble (white + `--line`) + annotation `SENT WITHOUT BEING ASKED`.
- **Replay required:** remount thread with `key` counter.
- Bubble treatments: grey inbound / blue outbound / white+border proactive; asymmetric tail corners.
- Motion: `pop`, `typingIn`, `phoneIn`, `fadeUp` only — **no framer-motion**.
- `prefers-reduced-motion`: static final frame; hide typing.

---

## 5. Map page `/map/[sessionId]`

### 5.1 Rendering

- `page.tsx` — **Server Component**: fetch trip, render header + meta + Buy as static HTML + `<noscript>` fallback.
- `<RouteMap>` — `'use client'`, Leaflet only (`dynamic(..., { ssr: false })`).

### 5.2 Data

```
GET ${BACKEND_URL}/api/trips/[sessionId]
```

Expected fields (adapt once to D’s real shape): origin/dest labels, departure, duration, price, polyline or stop coordinates, platform, DSB / ticket URL if any.

### 5.3 UI

1. Top: `origin → dest` · time · price (mono numbers)  
2. Map: route + stop beacons  
3. Bottom: summary + red **Buy on DSB** (or Open ticket)  
4. Buy opens DSB URL; optional finish event to backend — **do not block ship on confetti**

### 5.4 Failures / degrade

| Case | Behavior |
|---|---|
| Unknown id | “Trip not found” on paper |
| Backend down | Error/meta only; hide map |
| No polyline | Origin + destination markers only |
| After ~17:50, Leaflet at risk | Server meta + Buy + static map link; no beacons |

**Agent App card URL:** `https://<vercel>/map/<sessionId>`

---

## 6. File structure & build order

### 6.1 Vercel (this app)

```
src/app/
  layout.tsx
  page.tsx
  globals.css
  pricing/page.tsx
  upgrade/page.tsx
  upgrade/done/page.tsx
  map/[sessionId]/page.tsx
  api/checkout/route.ts    # thin proxy → Railway only; no Stripe SDK
src/components/site/
  Reveal.tsx
  Nav.tsx
  Hero.tsx
  Bento.tsx
  Pricing.tsx
  Coverage.tsx
  Footer.tsx
src/components/map/
  RouteMap.tsx
src/content/copy.ts
public/og.png
```

### 6.2 Railway (Person C Stripe additions)

```
src/app/api/checkout/route.ts
src/app/api/stripe/webhook/route.ts
```

(Match existing backend layout if A/B/D already diverged from App Router paths.)

Webhook URL registered in Stripe Dashboard = **Railway**. Checkout success/cancel = **Vercel**.

### 6.3 Build order

1. `create-next-app` + tokens + fonts + Vercel deploy  
2. `Reveal` → `Hero` + CTA env  
3. `Nav` → `Bento` → `Pricing` → `Coverage` → `Footer`  
4. `/map/[sessionId]` + `RouteMap`  
5. `/upgrade*` UI → Railway checkout + webhook  
6. QR / polish / screenshot swap if time  

Stop and verify the page renders after each step.

### 6.4 Dependencies

| Where | Packages |
|---|---|
| Vercel | `leaflet`, `react-leaflet`; optional `qrcode` |
| Railway | `stripe` |

No framer-motion. No `@stripe/stripe-js` unless requirements change.

---

## 7. Teammate contracts, cuts, definition of done

### 7.1 Needs from others

| From | Need |
|---|---|
| A | Linq number + profile URL; card links use Vercel origin |
| D | `GET /api/trips/[id]` JSON; plan/`magic_tokens` migration |
| B | Lock copy with `/upgrade?u=`; `plans_used` rules; Plus outbound send callable from webhook |
| C → group | Vercel URL; Stripe webhook on Railway; ownership of map + payment API |

### 7.2 Cut list (after ~17:30)

1. **Never cut:** Vercel live, hero CTA, map meta + Buy  
2. **Cut next:** Bento cells, QR, replay polish, Fig. captions  
3. **Cut last:** Live Stripe → static Plus pricing + verbal fallback  

### 7.3 Definition of done (demo)

- [ ] `/` animates ~4s (or static final frame); CTA opens Linq  
- [ ] `/map/<realSessionId>` shows route or at least meta + Buy  
- [ ] `/upgrade?u=…` → Checkout (test) → Plus ping on phone, or documented fallback  
- [ ] `prefers-reduced-motion` sane; no shadows; red rationed  
- [ ] Pitch ready: vertical vs Poke; 25‑min leave-now; never say Sendblue  

### 7.4 Doc conflicts resolved (for C)

| Conflict | Resolution |
|---|---|
| Vercel vs Railway | Site on Vercel; backend (+ Stripe API) on Railway |
| Sendblue / BlueBubbles | Linq only in product + pitch |
| 20 vs 25 min reminder | **25 min** |
| framer-motion vs CSS | **CSS only** |
| Map RSC vs client | Server page + client `RouteMap` |
| Design.md three-panel strip vs websitebuild hero | **Animated CSS thread** |
| Stripe in Next on Vercel (`websitebuild` §12) | **Stripe SDK + webhook on Railway**; Vercel UI + thin checkout proxy |

---

## 8. Out of scope for Person C

- Agent prompt / Haiku tooling (B)  
- Linq webhook inbound handler & Mac bridge (A)  
- Supabase schema ownership beyond requesting D’s migration (D)  
- Login / blog / FAQ / dark mode / tablet breakpoints  
- Migrating the site to Railway (later, not today)
