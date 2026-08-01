# Rejsy Person C Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Person C’s demo-critical stack — Vercel landing (websitebuild language), `/map/[sessionId]`, and Stripe upgrade (Railway SDK + Vercel proxy/UI) — ready for a 19:00 submission.

**Architecture:** One Next.js App Router repo. Vercel serves pages + a thin checkout proxy. Railway holds Stripe secrets, webhook, and (with A/B/D) agent/trip APIs. Map Server Component fetches `BACKEND_URL`; landing proves the product with a CSS-animated iMessage thread.

**Tech Stack:** Next.js (App Router) · TypeScript · Tailwind · Leaflet/react-leaflet · Stripe (Railway) · Archivo + IBM Plex Mono · Vercel + Railway

**Spec:** `docs/superpowers/specs/2026-08-01-rejsy-person-c-design.md`  
**Visual source:** `websitebuild.md`

## Global Constraints

- Product name: **Rejsy** (locked). Reminder copy: **25 minutes**.
- Hosts: site **Vercel**; backend + Stripe SDK/webhook **Railway**; dev **localhost**.
- No framer-motion. No `@stripe/stripe-js`. No lucide-react (inline SVG only). Allowed deps: `leaflet`, `react-leaflet`, `qrcode` (optional), `stripe`, `@supabase/supabase-js` (Stripe token/plan writes on Railway).
- Design tokens only from `websitebuild.md` `:root` — never hardcode hex in React/TSX (Leaflet pathOptions may use the same hex values as `--red`/`--ink` because the library needs concrete colors); no `shadow*` classes.
- Red rationed (~2 hits/viewport). Bubble blue only inside iMessage bubbles.
- Sentence case. Fonts: Archivo 400/600 + IBM Plex Mono for labels/numbers.
- `websitebuild.md` forbids adding a test suite — verify with `npm run build`, `curl`, and visual checks instead of Jest/Playwright.
- Kill order: scaffold → hero CTA → map → Stripe → coverage/polish. After ~17:30 cut Bento/QR/polish before map or CTA.
- Never say Sendblue on stage. Pitch: vertical vs Poke.

## File map

| Path | Responsibility |
|---|---|
| `src/app/globals.css` | Tokens, keyframes, grid-bg, reduced-motion |
| `src/app/layout.tsx` | Fonts, metadata |
| `src/app/page.tsx` | Compose Nav → Hero → Bento → Pricing → Coverage → Footer |
| `src/content/copy.ts` | All user-facing strings |
| `src/components/site/Reveal.tsx` | Scroll reveal |
| `src/components/site/Hero.tsx` | Animated thread + CTA + replay |
| `src/components/site/Nav.tsx` | Wordmark + Pricing + Get started |
| `src/components/site/Bento.tsx` | Dark capability grid |
| `src/components/site/Pricing.tsx` | Free / Plus cards |
| `src/components/site/Coverage.tsx` | Operator line |
| `src/components/site/Footer.tsx` | Attribution |
| `src/app/map/[sessionId]/page.tsx` | Server trip fetch + meta + Buy |
| `src/components/map/RouteMap.tsx` | Client Leaflet |
| `src/lib/trips.ts` | `fetchTrip(id)` against `BACKEND_URL` |
| `src/lib/stripe/checkout.ts` | Create Checkout session (server) |
| `src/app/api/checkout/route.ts` | Real Stripe if `STRIPE_SECRET_KEY`, else proxy to Railway |
| `src/app/api/stripe/webhook/route.ts` | Signature verify + plan update + Linq ping |
| `src/app/pricing/page.tsx` | Pricing route (or anchor — prefer section on `/` + thin page) |
| `src/app/upgrade/page.tsx` | Token UI → POST `/api/checkout` |
| `src/app/upgrade/done/page.tsx` | Success |
| `.env.example` | Documented env keys |
| `public/og.png` | OG image (placeholder OK) |

---

### Task 1: Scaffold Next.js in this repo + design tokens

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `src/app/*` (via create-next-app)
- Create: `.env.example`, `.gitignore` (merge if needed)
- Modify: `src/app/globals.css`, `src/app/layout.tsx`, `README.md`
- Keep: all existing `*.md` docs

**Interfaces:**
- Consumes: none
- Produces: runnable `npm run dev`; CSS variables on `:root`; metadata title/description

- [ ] **Step 1: Scaffold into the non-empty repo**

```bash
cd /Users/mrq/Documents/linq-ptpb
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --turbopack --yes
```

If create-next-app refuses non-empty dir:

```bash
npx create-next-app@latest /tmp/rejsy-scaffold --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
cp -R /tmp/rejsy-scaffold/* /tmp/rejsy-scaffold/.[!.]* /Users/mrq/Documents/linq-ptpb/ 2>/dev/null || true
# Manually ensure package.json, src/, configs landed; do not overwrite docs/*.md or websitebuild.md
```

- [ ] **Step 2: Replace `src/app/globals.css` with tokens + keyframes**

Use the exact `:root` block and keyframes from `websitebuild.md` §3 and §5 (`pop`, `typingIn`, `blink`, `fadeUp`, `phoneIn`, `grid-bg`, `prefers-reduced-motion`). Add Tailwind base layers:

```css
@import "tailwindcss";

:root {
  --red: #c8102e;
  --ink: #0b0b0c;
  --slate: #6b6b70;
  --muted: #9a978f;
  --paper: #fdfbf7;
  --line: #e8e4dc;
  --card-dark: #17171a;
  --slate-inv: #8a8a90;
  --bubble: #007aff;
  --ontime: #1b8a4b;
  --delayed: #e07b00;
}

body {
  background: var(--paper);
  color: var(--ink);
  font-family: Archivo, ui-sans-serif, system-ui, sans-serif;
}

/* …paste keyframes + utility classes from websitebuild §5… */
```

(If Tailwind v4 vs v3 differs after scaffold, keep `@tailwind base/components/utilities` instead of `@import "tailwindcss"` — match whatever create-next-app generated.)

- [ ] **Step 3: Set `src/app/layout.tsx` fonts + metadata**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rejsy — the friend who knows every train in Denmark",
  description:
    "Text a number. Get from A to B in Denmark. It plans, hands you the ticket, and pings you when to leave.",
  openGraph: { images: ["/og.png"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Add `.env.example`**

```bash
NEXT_PUBLIC_LINQ_URL=https://linq.app/rejsy
NEXT_PUBLIC_IMESSAGE_HREF=sms:+45XXXXXXXX&body=hi%20rejsy
BACKEND_URL=https://YOUR-RAILWAY.up.railway.app
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
PUBLIC_APP_URL=https://YOUR-VERCEL.vercel.app
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
LINQ_API_KEY=
LINQ_FROM_NUMBER=
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: compile success (empty/default page OK).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.* postcss.config.* eslint.config.* src .env.example .gitignore README.md
git commit -m "chore: scaffold Next.js app with Rejsy design tokens"
```

- [ ] **Step 7: Deploy Vercel (manual)**

```bash
npx vercel --yes
# Set env: NEXT_PUBLIC_LINQ_URL, NEXT_PUBLIC_IMESSAGE_HREF, BACKEND_URL (placeholder OK)
```

Share the Vercel URL in the team chat. Tell A: Agent App / upgrade links use this origin.

---

### Task 2: `copy.ts` + `Reveal` + page shell

**Files:**
- Create: `src/content/copy.ts`, `src/components/site/Reveal.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: CSS tokens from Task 1
- Produces: `copy` object; `<Reveal delay?: number>`; `/` renders a placeholder stack

- [ ] **Step 1: Create `src/content/copy.ts`**

```ts
export const copy = {
  name: "Rejsy",
  headline: ["The friend who knows", "every train in Denmark"] as const,
  subhead:
    "Text it where you're going. It plans, hands you the ticket, and tells you when to walk out the door.",
  cta: "Open Rejsy on Linq",
  ctaNote: "3 free trips · no card required · iPhone only",
  navPricing: "Pricing",
  navGetStarted: "Get started",
  bentoLabel: "(1) Everything it does",
  bentoHeading: "Four apps, one thread.",
  bentoCaption: "Fig. 1  Six capabilities, one conversation.",
  pricingEyebrow: "Cheaper than one København→Aarhus ticket, for every trip you ever take.",
  coverageLabel: "🇩🇰 works across denmark",
  coverageOps: "dsb · s-tog · metro · movia · dot · øresundståg",
  footerLeft: "cursor · linq · vibe coding network",
  footerRight: "copenhagen · aug 2026",
  annotation: "Sent without being asked",
  replay: "↻ replay",
  reminderLeadMin: 25,
} as const;
```

- [ ] **Step 2: Create `Reveal.tsx` exactly as `websitebuild.md` §6**

Path: `src/components/site/Reveal.tsx` — copy the component from the build doc (`'use client'`, IntersectionObserver, threshold 0.15).

- [ ] **Step 3: Wire a minimal `page.tsx`**

```tsx
import { Reveal } from "@/components/site/Reveal";
import { copy } from "@/content/copy";

export default function HomePage() {
  return (
    <main>
      <section className="px-6 py-20">
        <h1 className="text-[36px] font-semibold tracking-[-0.04em] md:text-[54px]">
          {copy.headline[0]}
          <br />
          {copy.headline[1]}
        </h1>
      </section>
      <Reveal>
        <p className="px-6 pb-20 text-[var(--slate)]">{copy.subhead}</p>
      </Reveal>
    </main>
  );
}
```

- [ ] **Step 4: Verify**

```bash
npm run dev
# Open http://localhost:3000 — headline + scroll fade
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/content/copy.ts src/components/site/Reveal.tsx src/app/page.tsx
git commit -m "feat: add copy module, Reveal, and page shell"
```

---

### Task 3: Hero + CTA (demo-critical)

**Files:**
- Create: `src/components/site/Hero.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `copy`, `NEXT_PUBLIC_LINQ_URL`
- Produces: `<Hero />` with ~4s CSS thread, replay, CTA

- [ ] **Step 1: Implement `Hero.tsx`**

Implement per `websitebuild.md` §7. Required behaviors:

1. `const linqUrl = process.env.NEXT_PUBLIC_LINQ_URL ?? "#";`
2. Timeline delays (ms): headline 0, subhead 110, phone 260, then bubbles at 620 / typing 900–1500 / options 1900 / reply hint 2150 / user `3` at 2500 / confirm 2900 / reminder 3500 / annotation 3700 / CTA 4000.
3. Bubble styles: inbound `#E9E9EB`, outbound `var(--bubble)`, proactive white + `1px solid var(--line)`.
4. Options + data lines use `font-[family-name:IBM_Plex_Mono]` or `font-mono` with class `font-[IBM_Plex_Mono],monospace` — set in layout/globals: `.font-data { font-family: "IBM Plex Mono", monospace; }`.
5. Replay: `const [run, setRun] = useState(0)` and `key={run}` on thread container.
6. Annotation desktop outside frame; mobile `↑ sent without being asked` under phone.
7. CTA button: `bg-[var(--red)] text-white rounded-[10px]`, href=`linqUrl`.

Thread copy (fixed for demo):

```ts
const thread = {
  user1: "aarhus tomorrow around 9",
  options: `københavn h → aarhus h, sat
1. 09:03 → 12:17 · dsb · 149 kr · direct
2. 09:33 → 12:47 · dsb · 149 kr · direct
3. 10:03 → 13:17 · dsb · 89 kr · orange`,
  hint: "reply 1, 2 or 3 — or react 🔽 for later",
  user2: "3",
  confirm: "🚆 locked in — i'll remind you 25 min before departure.",
  reminder: "🕘 leave in 25 min — head to københavn h, platform 3. train 79 to aarhus, 09:03.",
};
```

Use `animationDelay` style + classes `fadeUp` / `phoneIn` / `pop` / `typing` from globals.

- [ ] **Step 2: Mount Hero on `/`**

```tsx
import { Hero } from "@/components/site/Hero";

export default function HomePage() {
  return (
    <main>
      <Hero />
    </main>
  );
}
```

- [ ] **Step 3: Verify**

```bash
npm run dev
```

Checklist: thread completes ~4s; reminder visually distinct; replay remounts; CTA uses env; `prefers-reduced-motion` shows static end state.

```bash
npm run build
```

- [ ] **Step 4: Commit + redeploy**

```bash
git add src/components/site/Hero.tsx src/app/page.tsx src/app/globals.css
git commit -m "feat: add animated Rejsy hero thread and Linq CTA"
npx vercel --prod --yes
```

---

### Task 4: Map page `/map/[sessionId]` (demo-critical)

**Files:**
- Create: `src/lib/trips.ts`, `src/components/map/RouteMap.tsx`, `src/app/map/[sessionId]/page.tsx`
- Modify: `package.json` (add leaflet deps)
- Create: `src/types/trip.ts`

**Interfaces:**
- Consumes: `BACKEND_URL`, D’s trip JSON (adapter below)
- Produces: `fetchTrip(sessionId): Promise<Trip | null>`; server page + client map

- [ ] **Step 1: Install map deps**

```bash
npm i leaflet react-leaflet
npm i -D @types/leaflet
```

- [ ] **Step 2: Define `src/types/trip.ts`**

```ts
export type TripStop = { name: string; lat: number; lng: number; at?: string };

export type Trip = {
  id: string;
  origin: string;
  destination: string;
  departure: string;
  arrival?: string;
  duration?: string;
  priceKr?: number;
  platform?: string;
  buyUrl?: string;
  stops: TripStop[];
};
```

- [ ] **Step 3: Create `src/lib/trips.ts`**

```ts
import type { Trip } from "@/types/trip";

export async function fetchTrip(sessionId: string): Promise<Trip | null> {
  const base = process.env.BACKEND_URL;
  if (!base) {
    console.error("BACKEND_URL missing");
    return null;
  }
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/api/trips/${sessionId}`, {
      next: { revalidate: 0 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return normalizeTrip(sessionId, data);
  } catch (e) {
    console.error(e);
    return null;
  }
}

/** Adapt D's payload once — keep this the only mapping point. */
function normalizeTrip(id: string, raw: Record<string, unknown>): Trip {
  const stops = (raw.stops as Trip["stops"]) ?? [];
  return {
    id,
    origin: String(raw.origin ?? raw.from ?? "Origin"),
    destination: String(raw.destination ?? raw.to ?? "Destination"),
    departure: String(raw.departure ?? raw.departAt ?? ""),
    arrival: raw.arrival ? String(raw.arrival) : undefined,
    duration: raw.duration ? String(raw.duration) : undefined,
    priceKr: typeof raw.priceKr === "number" ? raw.priceKr : Number(raw.price) || undefined,
    platform: raw.platform ? String(raw.platform) : undefined,
    buyUrl: raw.buyUrl ? String(raw.buyUrl) : raw.dsbUrl ? String(raw.dsbUrl) : undefined,
    stops,
  };
}
```

- [ ] **Step 4: Create client `RouteMap.tsx`**

```tsx
"use client";

import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { TripStop } from "@/types/trip";

export function RouteMap({ stops }: { stops: TripStop[] }) {
  if (!stops.length) return null;
  const positions = stops.map((s) => [s.lat, s.lng] as [number, number]);
  const center = positions[Math.floor(positions.length / 2)] ?? positions[0];

  return (
    <MapContainer center={center} zoom={8} className="h-[50vh] w-full md:h-[60vh]" scrollWheelZoom={false}>
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {/* Leaflet requires concrete colors — match --red / --ink tokens */}
      {positions.length > 1 && <Polyline positions={positions} pathOptions={{ color: "#C8102E", weight: 4 }} />}
      {stops.map((s) => (
        <CircleMarker key={`${s.name}-${s.lat}`} center={[s.lat, s.lng]} radius={6} pathOptions={{ color: "#0B0B0C", fillColor: "#C8102E", fillOpacity: 1 }}>
          <Popup>{s.name}{s.at ? ` · ${s.at}` : ""}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
```

- [ ] **Step 5: Create `src/app/map/[sessionId]/page.tsx`**

```tsx
import dynamic from "next/dynamic";
import { fetchTrip } from "@/lib/trips";

const RouteMap = dynamic(
  () => import("@/components/map/RouteMap").then((m) => m.RouteMap),
  { ssr: false, loading: () => <div className="h-[50vh] bg-[var(--line)]" /> },
);

export default async function MapPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const trip = await fetchTrip(sessionId);

  if (!trip) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">Trip not found</h1>
        <p className="mt-3 text-[var(--slate)]">
          We couldn&apos;t load this session. Check the link from iMessage or try again.
        </p>
      </main>
    );
  }

  const buy = trip.buyUrl ?? "https://www.dsb.dk/";

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <header className="border-b border-[var(--line)] px-4 py-4">
        <p className="font-semibold tracking-[-0.03em]">
          {trip.origin} → {trip.destination}
        </p>
        <p className="mt-1 font-mono text-[12px] text-[var(--slate)]">
          {trip.departure}
          {trip.duration ? ` · ${trip.duration}` : ""}
          {trip.priceKr != null ? ` · ${trip.priceKr} kr` : ""}
          {trip.platform ? ` · platform ${trip.platform}` : ""}
        </p>
      </header>

      {trip.stops.length > 0 ? (
        <RouteMap stops={trip.stops} />
      ) : (
        <p className="px-4 py-8 text-[var(--slate)]">Map geometry unavailable — ticket link still works.</p>
      )}

      <div className="border-t border-[var(--line)] px-4 py-4">
        <a
          href={buy}
          className="flex w-full items-center justify-center rounded-[10px] bg-[var(--red)] px-4 py-3 text-white"
        >
          Buy on DSB
        </a>
      </div>

      <noscript>
        <p className="p-4">
          {trip.origin} to {trip.destination} at {trip.departure}.{" "}
          <a href={buy}>Buy on DSB</a>
        </p>
      </noscript>
    </main>
  );
}
```

- [ ] **Step 6: Local verify with mock**

Temporarily, if Railway has no trips yet, add a 5-minute mock only when `process.env.MOCK_TRIPS === "1"`: return a København H → Aarhus H polyline. Remove before submission if real API works.

```bash
BACKEND_URL=http://localhost:3001 MOCK_TRIPS=1 npm run dev
# Visit /map/test — expect meta + map or degrade copy
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/types/trip.ts src/lib/trips.ts src/components/map src/app/map
git commit -m "feat: add server-rendered map page with Leaflet route view"
```

Ping D with the `Trip` type and ask them to align `/api/trips/[id]`.

---

### Task 5: Landing sections — Nav, Bento, Pricing, Coverage, Footer

**Files:**
- Create: `Nav.tsx`, `Bento.tsx`, `Pricing.tsx`, `Coverage.tsx`, `Footer.tsx` under `src/components/site/`
- Modify: `src/app/page.tsx`
- Create: `src/app/pricing/page.tsx` (re-export or redirect to `/#pricing`)

**Interfaces:**
- Consumes: `copy`, `Reveal`, `NEXT_PUBLIC_LINQ_URL`
- Produces: full marketing page matching websitebuild sections

- [ ] **Step 1: `Nav.tsx`**

Thin bar, paper bg, 1px line bottom. Left: three 4×12px red bars (opacity 1 / 0.55 / 0.25) + `rejsy`. Right: anchor `#pricing`, red Get started → Linq. **No Log in.** Not sticky.

- [ ] **Step 2: `Bento.tsx`**

Dark `--ink` section. Cells per websitebuild §9. Drop “Remembers your places” unless B confirms it ships — then `grid-cols-2` on row 2. Inline SVG icons (message, ticket, bell, database). Red cell only for “It texts you first” / 25 minutes. Caption `Fig. 1…`.

- [ ] **Step 3: `Pricing.tsx`**

`id="pricing"`. Two cards Free / Plus 29 kr/mo. Plus: `border-[var(--red)]` + “Most popular” pill. Free CTA → Linq; Plus CTA → `/upgrade` (no token → show “text rejsy to unlock” note).

- [ ] **Step 4: `Coverage.tsx` + `Footer.tsx`**

Coverage dark; operators mono. Footer paper + top border; left/right copy from `copy.ts`.

- [ ] **Step 5: Compose `page.tsx`**

```tsx
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Bento } from "@/components/site/Bento";
import { Pricing } from "@/components/site/Pricing";
import { Coverage } from "@/components/site/Coverage";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";

export default function HomePage() {
  return (
    <main>
      <Nav />
      <Hero />
      <Reveal delay={80}><Bento /></Reveal>
      <Reveal delay={80}><Pricing /></Reveal>
      <Reveal delay={80}><Coverage /></Reveal>
      <Footer />
    </main>
  );
}
```

- [ ] **Step 6: Verify**

```bash
npm run build
# Visual: 375px width; grep -r "shadow" src/components && echo "remove hits"
# grep -E "#[0-9A-Fa-f]{3,8}" src/components | grep -v bubble || true
```

- [ ] **Step 7: Commit**

```bash
git add src/components/site src/app/page.tsx src/app/pricing
git commit -m "feat: complete marketing sections (nav, bento, pricing, coverage)"
```

---

### Task 6: Stripe on Railway path + Vercel upgrade UI

**Files:**
- Create: `src/lib/stripe/checkout.ts`, `src/lib/stripe/supabaseAdmin.ts` (minimal)
- Create: `src/app/api/checkout/route.ts`, `src/app/api/stripe/webhook/route.ts`
- Create: `src/app/upgrade/page.tsx`, `src/app/upgrade/done/page.tsx`
- Modify: `package.json` (`npm i stripe`)

**Interfaces:**
- Consumes: `STRIPE_*`, Supabase service key, Linq send helper (or fetch to existing outbound)
- Produces:
  - `POST /api/checkout` body `{ token: string }` → `{ url: string }`
  - `POST /api/stripe/webhook` Stripe events
  - Upgrade pages on Vercel

**Dual-host behavior for `/api/checkout`:**

```ts
// If STRIPE_SECRET_KEY set (Railway) → create session locally.
// Else if BACKEND_URL set (Vercel) → proxy POST to `${BACKEND_URL}/api/checkout`.
```

- [ ] **Step 1: Install Stripe**

```bash
npm i stripe
```

- [ ] **Step 2: `src/lib/stripe/checkout.ts`**

```ts
import Stripe from "stripe";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY missing");
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

export async function createCheckoutSession(opts: {
  userId: string;
  token: string;
  appOrigin: string;
}) {
  const stripe = getStripe();
  const price = process.env.STRIPE_PRICE_ID;
  if (!price) throw new Error("STRIPE_PRICE_ID missing");

  return stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    client_reference_id: opts.userId,
    success_url: `${opts.appOrigin}/upgrade/done`,
    cancel_url: `${opts.appOrigin}/upgrade?u=${encodeURIComponent(opts.token)}`,
  });
}
```

(If TypeScript complains about `apiVersion`, use the version your installed `stripe` package types expect.)

- [ ] **Step 3: Token resolve helper**

```ts
// src/lib/stripe/resolveUpgradeToken.ts
import { createClient } from "@supabase/supabase-js";

export async function resolveUpgradeToken(token: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Supabase env missing");
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("magic_tokens")
    .select("token, user_id, expires_at, used_at, users(phone)")
    .eq("token", token)
    .maybeSingle();
  if (error || !data) return null;
  if (data.used_at) return null;
  if (new Date(data.expires_at) < new Date()) return null;
  return { userId: data.user_id as string, phone: (data as { users?: { phone?: string } }).users?.phone };
}
```

Only add `@supabase/supabase-js` if not already in the repo — `npm i @supabase/supabase-js`. Coordinate join syntax with D’s schema; if join fails, two queries.

- [ ] **Step 4: `src/app/api/checkout/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import { resolveUpgradeToken } from "@/lib/stripe/resolveUpgradeToken";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = String(body.token ?? "");
  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });

  // Vercel proxy path
  if (!process.env.STRIPE_SECRET_KEY && process.env.BACKEND_URL) {
    const res = await fetch(`${process.env.BACKEND_URL.replace(/\/$/, "")}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }

  const resolved = await resolveUpgradeToken(token);
  if (!resolved) return NextResponse.json({ error: "invalid token" }, { status: 400 });

  const appOrigin =
    process.env.PUBLIC_APP_URL ?? req.headers.get("origin") ?? "http://localhost:3000";

  const session = await createCheckoutSession({
    userId: resolved.userId,
    token,
    appOrigin,
  });
  return NextResponse.json({ url: session.url });
}
```

- [ ] **Step 5: Webhook `src/app/api/stripe/webhook/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/checkout";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ error: "misconfigured" }, { status: 500 });

  const raw = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id;
    if (userId) {
      await supabase
        .from("users")
        .update({
          plan: "plus",
          stripe_customer_id: session.customer,
          subscription_status: "active",
        })
        .eq("id", userId);
      // Call existing Linq outbound if available:
      // await sendLinqMessage(userId, "you're on plus 🚆 plan away.")
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    await supabase
      .from("users")
      .update({ plan: "free", subscription_status: "canceled" })
      .eq("stripe_customer_id", sub.customer);
  }

  return NextResponse.json({ received: true });
}
```

Wire `sendLinqMessage` to whatever A/B already exported; if missing, `console.log` and ping them — Plus ping is the demo money-shot.

- [ ] **Step 6: Upgrade UI**

`src/app/upgrade/page.tsx` — client or server page reading `searchParams.u`. Show Plus card + masked phone (fetch resolve via server component calling `resolveUpgradeToken`, or show generic Plus if resolve only on checkout). Button:

```tsx
async function startCheckout(token: string) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
}
```

`src/app/upgrade/done/page.tsx` — “you’re on plus — check iMessage”.

- [ ] **Step 7: Verify**

```bash
# Local with Stripe CLI (Railway-like):
# stripe listen --forward-to localhost:3000/api/stripe/webhook
# STRIPE_SECRET_KEY=sk_test_... STRIPE_PRICE_ID=price_... PUBLIC_APP_URL=http://localhost:3000 npm run dev
# POST /api/checkout with a real magic_tokens row
npm run build
```

Register webhook in Stripe Dashboard → Railway URL `/api/stripe/webhook`.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json src/lib/stripe src/app/api/checkout src/app/api/stripe src/app/upgrade
git commit -m "feat: add Stripe checkout proxy/UI and Railway webhook handler"
```

---

### Task 7: Polish gate + pitch checklist

**Files:**
- Optional: QR under Hero via `qrcode`
- Modify: `public/og.png` (any 1200×630 placeholder)
- Modify: copy/screenshots if A delivers

- [ ] **Step 1: Definition-of-done grep**

```bash
npm run build
rg "shadow" src || true
rg -n "Sendblue|BlueBubbles" src && echo "REMOVE" || echo "ok"
```

- [ ] **Step 2: Optional QR**

```bash
npm i qrcode
npm i -D @types/qrcode
```

Server-generate data URL in Hero only if time; else skip.

- [ ] **Step 3: Pitch card (keep in `Memory.md` or notes — do not block ship)**

90s: (1) fragmentation → one thread (2) live text demo (3) map card + leave-now 25m (4) vs Poke = vertical (5) Plus test-mode buzz if ready.

- [ ] **Step 4: Final commit**

```bash
git add -A
git status
git commit -m "chore: polish landing for demo submission"
npx vercel --prod --yes
```

---

## Self-review (plan vs spec)

| Spec section | Task |
|---|---|
| §1 Split host / env / kill order | Tasks 1, 4, 6 + Global Constraints |
| §2 Landing visual + sections | Tasks 2, 3, 5 |
| §3 Stripe Railway + Vercel UI/proxy | Task 6 |
| §4 Hero animation + replay | Task 3 |
| §5 Map RSC + Leaflet | Task 4 |
| §6 File structure / build order | File map + task order |
| §7 Contracts / cuts / DoD | Task 7 + pings in Tasks 4–6 |

**Resolved dual-route issue:** one `api/checkout/route.ts` — Stripe key ⇒ create session; else proxy to `BACKEND_URL`.

**No automated test suite** per websitebuild; each task ends with build/visual/`curl` verification.
