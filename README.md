# linq-ptpb — Rejsy

Hackathon monorepo for Rejsy (iMessage transit agent for Denmark).

## Layout

| Path | Owner | Role |
|---|---|---|
| `src/` | A / B / D | Express backend (Linq inbound, agent, trips, cron) — Railway |
| `web/` | C | Next.js marketing site, map, upgrade UI — Vercel |
| `docs/` | — | Specs & implementation plans |
| `supabase/` | D | Schema / migrations |

## Frontend (`web/`)

```bash
cd web
cp .env.example .env.local   # fill placeholders
npm install
npm run dev                  # http://localhost:3000
```

Vercel project root must be **`web`**.

## Backend (Railway)

```bash
npm install
cp .env.example .env         # fill secrets
npm run dev                  # Express on configured port
```

Railway deploys from **repo root** via `Dockerfile` + `railway.toml` (not `web/`).

1. New Project → Deploy from GitHub → this repo, branch `main`
2. Root directory: `/` (default)
3. Generate a public domain under **Settings → Networking**
4. Set variables from `.env.example` (`LINQ_*`, `GROQ_*`, `SUPABASE_*`, `PUBLIC_APP_URL=https://web-gamma-sand-66.vercel.app`)
5. Health check: `curl https://<your>.up.railway.app/health`
6. Tell Person C the URL → set as `BACKEND_URL` on Vercel
