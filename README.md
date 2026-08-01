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

## Backend

```bash
npm install
cp .env.example .env         # fill secrets
npm run dev                  # Express on configured port
```
