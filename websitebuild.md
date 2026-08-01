# BUILD.md — Rejsy website

Instructions for Claude Code. Read this whole file before writing anything.

**What you're building:** the marketing site for Rejsy, an iMessage agent that plans Danish public transport. Next.js App Router + Tailwind, deployed on Railway. One page, plus a paywall flow.

**Constraints:** this is a hackathon with ~4 hours left. Ship working over perfect. Do not refactor, do not add dependencies beyond what's listed, do not add tests.

---

## 1. Design philosophy

**Rejsy looks like a research lab that happens to run trains.** Not a startup landing page, not a government transit site — something between them, and more confident than either. The page is warm-white and rational, laid out on a visible grid, with red used so sparingly that every appearance of it means "do this." Content is presented as *evidence* — numbered sections, `Fig.` captions, specimen tiles — rather than as marketing claims. The product is a text message, so the site's job is to prove, not persuade.

Three rules that follow, in priority order:

1. **Rationed red.** Red is an action and emphasis color, never a background, never decoration. More than two red elements in a viewport means remove one.
2. **The grid is visible.** Hairline borders, tile edges, a faint background grid. Nothing floats, nothing has a shadow. Structure is the aesthetic.
3. **Show the bubble.** Every feature claim sits next to a real iMessage bubble. No feature is described in prose alone.

### Where it comes from

| Source | Taken | Left |
|---|---|---|
| **generalintelligencecompany.com** | Typographic register (large, tight-tracked, weight 600). `Fig. 1` captions. Specimen tiles. Visible pixel grid. Numbered sections. | Their manifesto framing. We're a product, not a lab. |
| **poke.com** | Warm off-white base rather than clinical white. `(1) (2) (3)` section markers. Pricing tier layout. | Testimonial wall (no users), logo marquee (one integration), the bouncer personality. |
| **emailed.chat** | Feature = headline + one sentence + one real bubble. Proof density over prose density. | Waitlist gating, referral program. |
| **flighty.com** | Bento grid with mixed cell sizes. Hard light/dark alternation for pacing. Domain-native vocabulary in UI chrome — they say "Gate," we say "Spor." | Their page length (11 sections; we run 5). Their floating cards around the phone — an animating thread and four static cards compete for the same attention, and the thread wins. |
| **tomo.ai** | Confidence in the headline. One claim, no hedging. | Dark hero, gradient orbs — they fight the rail credibility the red is buying. |
| **dsb.dk** | White-dominant page, red only on buttons and links. Restraint as the whole aesthetic. | Their dense utility nav. |

---

## 2. Before you start

```bash
npm i qrcode stripe @stripe/stripe-js
```

Nothing else. If you think you need another package, don't.

Add to `src/app/layout.tsx` inside `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

Set `metadata` in `layout.tsx`:
```ts
export const metadata = {
  title: 'Rejsy — the friend who knows every train in Denmark',
  description: 'Text a number. Get from A to B in Denmark. It plans, hands you the ticket, and pings you when to leave.',
  openGraph: { images: ['/og.png'] },
};
```

---

## 3. Design tokens — non-negotiable

Put these on `:root` in `globals.css`. Every component reads from them. Never hardcode a hex outside this block.

```css
:root {
  --red:        #C8102E;  /* CTA, accent rules. Max 2 per screen. */
  --ink:        #0B0B0C;  /* headings, dark sections, phone frame */
  --slate:      #6B6B70;  /* body, subheads */
  --muted:      #9A978F;  /* mono labels, Fig. captions */
  --paper:      #FDFBF7;  /* page base — warm, never pure white */
  --line:       #E8E4DC;  /* every border, 1px, warm not grey */
  --card-dark:  #17171A;  /* cards inside dark sections */
  --slate-inv:  #8A8A90;  /* body text inside dark sections */
  --bubble:     #007AFF;  /* iMessage blue — INSIDE MESSAGE BUBBLES ONLY */
  --ontime:     #1B8A4B;
  --delayed:    #E07B00;
}
```

**Typography.** Archivo for everything except data and labels, which use IBM Plex Mono.

| Role | Font | Size | Weight | Tracking |
|---|---|---|---|---|
| Display | Archivo | 54px / 36px mobile | 600 | −0.04em |
| Section heading | Archivo | 24px | 600 | −0.03em |
| Body | Archivo | 16px | 400 | normal, `line-height: 1.65` |
| Bubble | Archivo | 13px | 400 | normal |
| Bubble (data) | IBM Plex Mono | 12px | 400 | normal |
| Label / caption | IBM Plex Mono | 10–11px | 400 | 0.06em, uppercase |

Two weights only: 600 and 400. Never 500, never 700.

**Hard rules — enforce these while writing every component:**

| Always | Never |
|---|---|
| Sentence case | Title Case, ALL CAPS (except mono labels) |
| 1px borders for depth | Shadows, anywhere |
| Mono for any number | Gradients |
| `--paper` for page bg | Pure `#FFFFFF` page background |
| One red CTA per section | Red as a background fill (one bento cell excepted) |
| | Blue outside a message bubble |
| | A third font |

Radii: buttons `10px`, cards `12px`, bubbles `17px` with `6px` on the tail corner, phone `42px` outer / `34px` inner.

---

## 4. File structure

Build exactly this. No extra files.

```
src/
  app/
    layout.tsx              # fonts, metadata
    page.tsx                # composes sections in order
    globals.css             # tokens + keyframes
    pricing/page.tsx
    upgrade/page.tsx        # ?u=<token>
    upgrade/done/page.tsx
    api/
      checkout/route.ts
      stripe/webhook/route.ts
  components/site/
    Reveal.tsx              # build FIRST — everything else uses it
    Nav.tsx
    Hero.tsx
    Bento.tsx
    Pricing.tsx
    Coverage.tsx
    Footer.tsx
  content/copy.ts           # all user-facing strings
public/
  og.png
```

Build order: `Reveal` → `Hero` → `Nav` → `Bento` → `Pricing` → `Coverage` → `Footer` → Stripe routes. **Stop and check the page renders after each one.**

---

## 5. globals.css — keyframes

```css
@keyframes pop {
  0%   { opacity:0; transform: translateY(12px) scale(.94) }
  60%  { opacity:1; transform: translateY(-2px) scale(1.012) }
  100% { opacity:1; transform: none }
}
.pop { opacity:0; animation: pop .5s cubic-bezier(.2,.8,.25,1) forwards }

@keyframes typingIn {
  0%   { opacity:0; transform: translateY(8px) scale(.94) }
  10%  { opacity:1; transform: none }
  90%  { opacity:1; transform: none }
  100% { opacity:0; transform: scale(.96) }
}
.typing { opacity:0; animation: typingIn var(--hide) ease forwards }

@keyframes blink {
  0%,60%,100% { opacity:.32; transform: translateY(0) }
  30%         { opacity:.9;  transform: translateY(-2px) }
}
.dot { width:6px; height:6px; border-radius:50%; background:#8E8E93; animation: blink 1.05s infinite }

@keyframes fadeUp { from { opacity:0; transform: translateY(12px) } to { opacity:1; transform:none } }
.fadeUp { opacity:0; animation: fadeUp .6s cubic-bezier(.16,1,.3,1) forwards }

@keyframes phoneIn { from { opacity:0; transform: translateY(26px) scale(.97) } to { opacity:1; transform:none } }
.phoneIn { opacity:0; animation: phoneIn .8s cubic-bezier(.16,1,.3,1) forwards }

.grid-bg {
  background-image:
    linear-gradient(rgba(11,11,12,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(11,11,12,.05) 1px, transparent 1px);
  background-size: 24px 24px;
  -webkit-mask-image: radial-gradient(ellipse 75% 65% at 50% 45%, #000 35%, transparent 100%);
  mask-image: radial-gradient(ellipse 75% 65% at 50% 45%, #000 35%, transparent 100%);
}

@media (prefers-reduced-motion: reduce) {
  .pop, .fadeUp, .phoneIn { animation: none; opacity: 1 }
  .typing { display: none }
  .dot { animation: none }
}
```

**Three motion curves, used consistently:**
- `pop` — bubbles only. The overshoot to `1.012` is what reads as iMessage. A pure fade feels wrong.
- `phoneIn` — the frame, once, no bounce. Must finish before the first bubble fires or it looks unstable.
- `Reveal` — every scroll section, no bounce. The hero performs; the rest of the page just arrives.

---

## 6. Reveal.tsx — build this first

```tsx
'use client';
import { useEffect, useRef, useState } from 'react';

export function Reveal({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect(); }
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className={`transition-[opacity,transform] duration-[700ms] ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'} ${className}`}>
      {children}
    </div>
  );
}
```

Wrap every section below the hero: `<Reveal delay={80}><Bento /></Reveal>`.

---

## 7. Hero.tsx — the most important component

**An animated iMessage thread inside a phone frame.** The frame gets real device chrome: notch, contact header with a red `R` avatar circle, hairline divider. Phone is `278px` mobile / `300px` desktop, centred on the `grid-bg`.

### 7.1 Timeline

The thread plays on a timer via `animation-delay`. Hold this order exactly:

| t (ms) | Element |
|---|---|
| 0 | Headline — `fadeUp` |
| 110 | Subhead — `fadeUp` |
| 260 | Phone frame — `phoneIn` |
| 620 | User: `aarhus tomorrow around 9` |
| 900 → 1500 | Typing indicator (`--hide: 1500ms`) |
| 1900 | Rejsy: three options, **mono** |
| 2150 | Rejsy: `reply 1, 2 or 3 — or react 🔽 for later` |
| 2500 | User: `3` |
| 2900 | Rejsy: booking confirmation |
| 3500 | **The reminder** — white bubble + `--line` border, 8px gap above it |
| 3700 | Annotation outside the frame: red 8px rule + `SENT WITHOUT BEING ASKED` |
| 4000 | CTA |

**Total ~4s.** Do not stretch it — a judge scans the page for eight seconds and needs to see the ending.

**Why the last three rows matter:** everything before 3500ms is table stakes for any chatbot. The message that arrives *without a prompt* is what makes Rejsy a companion instead of a search box. Give it a gap above, a different bubble treatment, and a label pointing at it.

### 7.2 Bubble spec

| | Inbound (user) | Outbound (Rejsy) | Proactive push |
|---|---|---|---|
| Fill | `#E9E9EB` | `--bubble` | `#FFFFFF` + 1px `--line` |
| Text | `--ink` | white | `--ink` |
| Align | right (`justify-end`) | left | left |
| Tail | `rounded-br-[6px]` | `rounded-bl-[6px]` | `rounded-bl-[6px]` |

The asymmetric tail corner is what makes them read as iMessage rather than generic chat bubbles. Don't skip it.

### 7.3 The annotation

`SENT WITHOUT BEING ASKED` in mono, `--muted`, uppercase, `tracking-[0.06em]`, positioned **outside** the phone's right edge with a small red rule above it. This is the only element allowed to break the frame's bounding box — it's a diagram label, not UI.

Hide below `sm:`; on mobile render `↑ sent without being asked` centred under the phone instead.

### 7.4 Replay button — REQUIRED

The thread plays once on mount. A judge who arrives 30 seconds after page load sees a static thread and misses the entire point.

Add a muted `↻ replay` button under the phone. Implement by keying the thread container on a counter:

```tsx
const [run, setRun] = useState(0);
// ...
<div key={run}>{/* thread */}</div>
<button onClick={() => setRun(n => n + 1)}
  className="mt-3 font-mono text-[10px] uppercase tracking-[0.06em] text-[--muted] hover:text-[--slate]">
  ↻ replay
</button>
```

Changing the `key` remounts the subtree and re-fires every keyframe. Ten lines. Do not skip this.

### 7.5 Copy

```
Headline:  The friend who knows / every train in Denmark
Subhead:   Text it where you're going. It plans, hands you the ticket,
           and tells you when to walk out the door.
CTA:       Open Rejsy on Linq        → href = process.env.NEXT_PUBLIC_LINQ_URL
Under CTA: 3 free trips · no card required · iPhone only
```

---

## 8. Nav.tsx

Thin bar, `--paper`, 1px `--line` bottom border. Left: three 4×12px red bars in descending opacity (1 / .55 / .25) + `rejsy` at 15px/600. Right: `Pricing`, `Log in` as 12px `--slate` text, then a red `Get started` button.

Not sticky. There's nowhere to go on a one-page site.

---

## 9. Bento.tsx

Dark section, `--ink` background. Label `(1) EVERYTHING IT DOES` in mono `--slate-inv`, then heading `Four apps, one thread.`

Grid, `gap-[10px]`, `rounded-[14px]` cells:

**Row 1** — `grid-cols-[1.45fr_1fr]`
- Large cell, `--card-dark`: **React for later trains.** Body: "Tap 🔽 on the options and it pages forward. No retyping your search, no starting over." Include a small live bubble showing options 4 and 5 plus a 🔽 chip.
- Right column splits into two:
  - **Solid `--red`** cell: **It texts you first.** "25 minutes before departure, with your platform. You didn't ask." Secondary text `#FFD3D9`. *This is the only red background allowed in the entire site.*
  - `--card-dark`: **Never a guess.** "Every price, platform and delay comes from Rejseplanen. If we don't have it, we say so."

**Row 2** — `grid-cols-[1fr_1fr_1.45fr]`
- **Plan by text.** "'odense before 5' is a complete search."
- **One tap to book.** "Straight into DSB. We never touch your card."
- **Remembers your places.** "Say it once. 'Take me home' works forever." + small bubble.

Caption under the grid, mono `#4A4A4E`: `Fig. 1  Six capabilities, one conversation.`

**If "remembers your places" isn't built** (it's a should-have — check with the team), drop that cell and run row 2 as `grid-cols-2` full width. Do not leave a gap.

Icons: `lucide-react`, 19px, white. Use `MessageSquare`, `Ticket`, `Bell`, `Database`, `Home`.

---

## 10. Pricing.tsx

`--paper` background. Two cards side by side, `--line` borders, 12px radius. Poke's layout.

| Free | Rejsy Plus — 29 kr/mo |
|---|---|
| 3 trip plans | Unlimited planning |
| Booking hand-off | Booking hand-off |
| Leave-now reminders | Leave-now reminders |
| — | Live delay alerts |
| — | Saved places |
| No card required | Cancel anytime |

Plus card gets `border-[--red]` (1px, not 2) and a small `bg-[--red] text-white` pill reading `Most popular`. Its CTA is the red button; Free's CTA is the bordered secondary style.

Add one line under the heading: **"Cheaper than one København→Aarhus ticket, for every trip you ever take."** A single fare is ~179 kr — that's the whole pitch.

---

## 11. Coverage.tsx + Footer.tsx

**Coverage** — dark section. `🇩🇰 works across denmark` then operators as plain mono text, `--slate-inv`:
```
dsb · s-tog · metro · movia · dot · øresundståg
```
No logos. Licensing risk and they take longer to source than you have.

**Footer** — `--paper`, 1px top border. Left: `cursor · linq · vibe coding network`. Right: team names, `copenhagen · aug 2026`. Plain text, no logos unless someone hands you SVGs.

---

## 12. Stripe paywall

**The rule:** 3 free trip *plans* per user. The 4th locks. Trips already planned keep working — reminders still fire. That means the paywall can be demoed live without breaking the companion story.

### 12.1 Schema (Person D applies)

```sql
alter table users add column plan text not null default 'free';
alter table users add column plans_used int not null default 0;
alter table users add column stripe_customer_id text;
alter table users add column subscription_status text;

create table magic_tokens (
  token      text primary key,
  user_id    uuid references users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at    timestamptz
);
```

`plans_used` increments **only on a successful `plan_trip` that returned ≥1 option.** A failed Rejseplanen lookup must not burn a credit — that will bite you live on stage.

### 12.2 The lock message (agent side, Person B)

```
that's your 3 free trips used up 🚆

unlock unlimited planning + reminders for 29 kr/mo:
rejsy.app/upgrade?u=<token>

(your aarhus trip is still saved — reminders keep working)
```

### 12.3 `/upgrade`

Resolve `?u=<token>` → user. Render the pricing card with their number masked: `+45 •• •• 12 34`. One button → `POST /api/checkout`.

### 12.4 `/api/checkout/route.ts`

```ts
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
  client_reference_id: userId,
  success_url: `${origin}/upgrade/done`,
  cancel_url: `${origin}/upgrade?u=${token}`,
});
return Response.json({ url: session.url });
```

**Use Stripe Checkout, not Elements.** Hosted page, no card fields in your code, no PCI surface, ~30 minutes.

### 12.5 `/api/stripe/webhook/route.ts`

Verify the signature with `stripe.webhooks.constructEvent` — **do not skip this even in a hackathon.**

- `checkout.session.completed` → set `plan='plus'`, store `stripe_customer_id`, `subscription_status='active'`, then **send one proactive iMessage:** `you're on plus 🚆 plan away.`
- `customer.subscription.deleted` → set `plan='free'`.

That proactive message is the demo money-shot: pay on the laptop, phone buzzes unprompted. Rehearse it.

### 12.6 Env vars

```
NEXT_PUBLIC_LINQ_URL=
NEXT_PUBLIC_IMESSAGE_HREF=
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
```

Test mode for the demo. Say "test mode" out loud once during the pitch; pretending otherwise is worse than admitting it.

---

## 13. Do not build

- Login flow. The magic-link token in the upgrade URL is the only auth needed. Nobody logs in on stage.
- Nav bar with real links, blog, FAQ, testimonials, newsletter signup, "how it works" video.
- Tablet-specific breakpoints. Mobile ≤640px, desktop ≥1024px, that's it.
- Dark mode toggle.
- Any animation beyond the three curves in §5.

---

## 14. Definition of done

Check in order. Stop at the first failure and fix it.

- [ ] `npm run build` passes with no type errors
- [ ] Hero thread animates start to finish in ~4s
- [ ] Replay button re-fires the animation
- [ ] Every section below the hero fades in on scroll, once
- [ ] Loads and reads correctly at 375px wide
- [ ] `prefers-reduced-motion` shows everything statically, no typing bubble
- [ ] Red appears at most twice per viewport
- [ ] No shadows anywhere — grep the codebase for `shadow` and remove hits
- [ ] No hardcoded hex outside `globals.css` — grep for `#` in `/components`
- [ ] CTA points at the real Linq URL
- [ ] `/upgrade?u=test` renders without crashing
