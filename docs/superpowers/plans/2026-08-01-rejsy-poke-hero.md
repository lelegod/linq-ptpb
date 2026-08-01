# Rejsy marketing redesign — Poke / emailed / Tomo composition

**Date:** 2026-08-01  
**Brand spelling:** **Rejsy** (Danish *rejse*). User “Resly” = typo.  
**Hero line:** Meet *Rejsy*, your favorite transport planner

## Prompt improvements (bake into future briefs)

- Lock brand spelling (**Rejsy**) and exact H1 with italic token.
- Name one primary composition (Poke airy hero) + two borrowed motifs (Tomo collage/CTA; emailed Product dropdown density) — forbid frankenstein of three full page systems.
- Explicitly override older bans (login was banned in websitebuild.md; login is in scope).
- List must-keep routes/behaviors before redesign (map, Stripe upgrade, Messages QR desktop / button mobile, `BACKEND_URL` trips).
- Require `prefers-reduced-motion` for every motion, and CSS-only (no framer-motion).
- Accept criteria: Lighthouse-minded (next/font, minimal client JS), one H1, SEO metadata, `.env.example` only for secrets, graceful empty state if Supabase unset.
- Cut scope: no 3D assets, no lucide, no dark orb/rainbow Tomo chrome — transit SVG collage only.

## Architecture

```
web/src/
  app/
    layout.tsx          # next/font Fraunces + Archivo, metadata/OG
    page.tsx            # Nav → Hero → Product → Pricing → Coverage → Footer
    login/              # magic-link + password; integrations placeholder
    auth/callback/      # Supabase exchangeCodeForSession
    sitemap.ts / robots.ts
  components/site/
    Nav.tsx             # wordmark · Product dropdown · Login/Start
    Hero.tsx            # airy BG, H1, dual CTAs, collage, phone peek, scroll train
    TransitCollage.tsx  # +16695776525 as transit motif tiles → sms:
    TextRejsyCta.tsx     # train-exit keyframes then open sms:
    ScrollTrain.tsx     # scroll-linked CSS transform
    ProductSection.tsx  # how-it-works bubbles + integrations coming
  lib/
    env.ts              # getMessagesHref() unchanged contract
    supabase/client.ts  # browser client; null if env missing
```

## Visual system

| Token | Role |
|-------|------|
| Warm paper `#fdfbf7` + soft sky wash | Hero atmosphere (CSS, not heavy photo) |
| Fraunces (display) | H1 / wordmark serif; italic brand |
| Archivo (UI) | Nav, body, CTAs |
| Ink `#0b0b0c` | Primary buttons / text |
| Butter `#f5d76e` | “Text your Rejsy” Tomo-energy CTA (one accent) |
| DSB red `#c8102e` | Rationed (badge, wordmark bars, Plus card) |

## Flows

1. **Text your Rejsy / Start / collage** → same `getMessagesHref()` (`sms:+16695776525&body=hi%20rejsy`); CTA plays ~700ms train-exit then navigates; reduced-motion skips anim.
2. **Login** → `/login` Supabase email magic-link or email+password; callback `/auth/callback`; missing env → setup empty state.
3. **Product dropdown** → anchors: How it works `#product`, Integrations `#integrations`, Pricing `#pricing`, Coverage `#coverage`.

## Non-goals

- Do not break `/map/[sessionId]`, `/upgrade`, Stripe API routes.
- Do not commit `.env.local`.
- No framer-motion / lucide / heavy 3D.
