// [B, covering D] The proactive push. This is the companion story — without it
// Rejsy is a chatbot that answers questions.
//
// Two loops, both plain setInterval. Express keeps the process alive, so there
// is no need for node-cron or an external scheduler — and no new dependency
// (Rules §3.3).
//
//   every 30s  — send reminders whose fire_at has passed
//   every 2min — check booked trips departing soon, warn on real delays
//
// Neither loop ever calls the LLM. Reminder bodies are pre-rendered at booking
// time (Architecture.md §2.5); delay warnings are rendered here by a function.

import type { Deps } from './agent/ports';
import { departures } from './transport/rejseplanen';
import { time } from './agent/format';

const REMINDER_TICK_MS = Number(process.env.REMINDER_TICK_MS ?? 30_000);
const DELAY_TICK_MS = Number(process.env.DELAY_TICK_MS ?? 120_000);
const DELAY_THRESHOLD_MIN = Number(process.env.DELAY_THRESHOLD_MIN ?? 5);

let running = false;

/** Design.md §2.2 "Delay warning push". */
function renderDelay(destination: string, plannedIso: string, delayMinutes: number): string {
  const newTime = new Date(new Date(plannedIso).getTime() + delayMinutes * 60_000).toISOString();
  return `⚠️ heads up — your ${time(plannedIso)} to ${destination.toLowerCase()} is running ${delayMinutes} min late. new departure: ${time(newTime)}.`;
}

/** Exported so an admin route can fire it by hand if the timer misbehaves. */
export async function runReminderJob(deps: Deps): Promise<number> {
  const due = await deps.db.getDueReminders(new Date().toISOString());
  let sent = 0;

  for (const r of due) {
    try {
      await deps.linq.sendChatText(r.chat_id, r.message);
      await deps.db.markReminderFired(r.id);
      sent++;
      console.log(`[B][cron] reminder ${r.id} sent to chat ${r.chat_id}`);
    } catch (err) {
      // Leave it unfired — we'll retry on the next tick rather than lose it.
      console.error(`[B][cron] reminder ${r.id} failed to send:`, err);
    }
  }
  return sent;
}

export async function runDelayJob(deps: Deps): Promise<number> {
  const upcoming = await deps.db.getTripsDepartingWithin(60);
  let warned = 0;

  for (const { trip, chatId } of upcoming) {
    const first = trip.legs_json?.[0];
    if (!first) continue;

    try {
      const board = await departures(first.origin, new Date(new Date(trip.depart_at).getTime() - 30 * 60_000));
      const match = board.find(
        (d) => Math.abs(new Date(d.plannedAt).getTime() - new Date(trip.depart_at).getTime()) < 6 * 60_000,
      );
      if (!match || match.delayMinutes < DELAY_THRESHOLD_MIN) continue;

      // Only warn once per 5-minute delay bucket, so a train that slips from
      // 6 to 8 minutes doesn't produce two messages (Architecture.md §3).
      const bucket = Math.floor(match.delayMinutes / 5);
      if (!(await deps.db.claimDelayBucket(trip.id, bucket))) continue;

      const dest = trip.to_station_name ?? first.destination.name;
      await deps.linq.sendChatText(chatId, renderDelay(dest, trip.depart_at, match.delayMinutes));
      warned++;
      console.log(`[B][cron] delay warning sent for trip ${trip.id} (+${match.delayMinutes}min)`);
    } catch (err) {
      console.error(`[B][cron] delay check failed for trip ${trip.id}:`, err);
    }
  }
  return warned;
}

export function startCrons(deps: Deps): void {
  if (running) return;
  running = true;

  setInterval(() => {
    runReminderJob(deps).catch((err) => console.error('[B][cron] reminder loop:', err));
  }, REMINDER_TICK_MS).unref?.();

  setInterval(() => {
    runDelayJob(deps).catch((err) => console.error('[B][cron] delay loop:', err));
  }, DELAY_TICK_MS).unref?.();

  console.log(`[B][cron] started — reminders every ${REMINDER_TICK_MS / 1000}s, delay checks every ${DELAY_TICK_MS / 1000}s`);
}
