# Rejsy web (Person C)

Next.js App Router marketing site + map + upgrade UI.

## Local

```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

Mock map without Railway:

```bash
MOCK_TRIPS=1 npm run dev
# visit /map/test
```

## Vercel

Project root: **`web`** (not repo root).

```bash
cd web
npx vercel --yes
# then prod:
npx vercel --prod --yes
```

Set env in Vercel dashboard (or `vercel env add`):

| Key | Notes |
|---|---|
| `NEXT_PUBLIC_LINQ_URL` | Linq profile / open URL |
| `NEXT_PUBLIC_IMESSAGE_HREF` | optional `sms:` deep link |
| `BACKEND_URL` | Railway origin (no trailing slash) |
| `PUBLIC_APP_URL` | this Vercel URL |

Do **not** put `STRIPE_SECRET_KEY` on Vercel — Stripe SDK + webhook run on Railway. On Vercel, `/api/checkout` proxies to `${BACKEND_URL}/api/checkout`.

## Railway Stripe (same codebase paths)

When deploying Stripe routes on Railway (or running locally with secrets):

- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
- Webhook URL: `https://<railway>/api/stripe/webhook`
- Success/cancel URLs use `PUBLIC_APP_URL` (Vercel)
