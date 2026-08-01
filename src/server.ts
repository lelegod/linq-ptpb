import 'dotenv/config';
import express from 'express';
import { handleInbound } from './routes/inbound';
import { fireReminders, seedDemo } from './routes/admin';   // [B]
import { getTripBySession } from './routes/trips';          // [B]
import { startCrons } from './cron';                        // [B]
import { getDeps } from './agent/deps';                     // [B]

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    linqKey: Boolean(process.env.LINQ_API_KEY),
    fromNumber: Boolean(process.env.LINQ_FROM_NUMBER),
    publicAppUrl: process.env.PUBLIC_APP_URL ?? null,
  });
});

// Must match the target_url registered on the Linq webhook subscription.
app.post('/api/inbound', handleInbound);

// [B] consumed by C's map page (web/src/lib/trips.ts)
app.get('/api/trips/:sessionId', getTripBySession);

// [B] demo-time controls — token-gated via x-admin-token
app.post('/api/admin/fire-reminders', fireReminders);
app.post('/api/admin/seed-demo', seedDemo);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`[server] listening on :${port}`);
  startCrons(getDeps()); // [B] reminders + delay warnings
});
