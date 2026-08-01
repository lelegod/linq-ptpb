import 'dotenv/config';
import express from 'express';
import { handleInbound } from './routes/inbound';

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

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`[server] listening on :${port}`));
