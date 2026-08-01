// [B, covering D] Demo-time controls. Two endpoints, both token-gated.
//
//   POST /api/admin/seed-demo      queue a proactive push N minutes from now
//   POST /api/admin/fire-reminders send every due reminder immediately
//
// Why an endpoint and not a seed script: the store is in-process, so a separate
// script writes to a different memory and nothing fires. When D's Supabase layer
// lands, a script becomes possible — until then this is the only thing that works.
//
// fire-reminders is also the Phases.md kill switch: if the timer misbehaves
// mid-demo, someone curls this and the push still lands on cue.

import type { Request, Response } from 'express';
import { getDeps } from '../agent/deps';
import { runReminderJob } from '../cron';
import { findStation, journeys } from '../transport/rejseplanen';
import { renderReminder } from '../agent/format';

function authed(req: Request, res: Response): boolean {
  const expected = process.env.ADMIN_TOKEN ?? 'rejsy';
  if (req.headers['x-admin-token'] !== expected) {
    res.status(403).json({ error: 'bad or missing x-admin-token' });
    return false;
  }
  return true;
}

export async function fireReminders(req: Request, res: Response): Promise<void> {
  if (!authed(req, res)) return;
  try {
    const sent = await runReminderJob(getDeps());
    res.json({ ok: true, sent });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}

/**
 * Body: { phone: "+45...", chatId: "...", minutes?: 3, from?: "København H", to?: "Aarhus H" }
 * Books a real Rejseplanen trip and schedules its reminder to fire in `minutes`.
 */
export async function seedDemo(req: Request, res: Response): Promise<void> {
  if (!authed(req, res)) return;

  const { phone, chatId, minutes = 3, from = 'København H', to = 'Aarhus H' } = req.body ?? {};
  if (!phone || !chatId) {
    res.status(400).json({ error: 'phone and chatId are required' });
    return;
  }

  try {
    const deps = getDeps();
    const [origin, destination] = await Promise.all([findStation(from), findStation(to)]);
    if (!origin || !destination) {
      res.status(400).json({ error: `could not resolve "${from}" or "${to}"` });
      return;
    }

    const leadMinutes = Number(process.env.REMINDER_MINUTES ?? 25);
    // Depart far enough out that (departure - lead) lands `minutes` from now.
    const departTarget = new Date(Date.now() + (Number(minutes) + leadMinutes) * 60_000);
    const { options } = await journeys(origin, destination, { when: departTarget, results: 1 });
    if (options.length === 0) {
      res.status(502).json({ error: 'no journeys returned' });
      return;
    }

    const option = options[0];
    const user = await deps.db.getOrCreateUser(phone, chatId);
    const trip = await deps.db.createTrip({
      user_id: user.id,
      from_station_id: option.origin.id,
      to_station_id: option.destination.id,
      depart_at: option.departAt,
      arrive_at: option.arriveAt,
      legs_json: option.legs,
      deep_link_url: null,
    });

    const fireAt = new Date(Date.now() + Number(minutes) * 60_000).toISOString();
    await deps.db.createReminder(trip.id, fireAt, renderReminder(option, leadMinutes));

    console.log(`[B][admin] seeded trip ${trip.id}, reminder fires ${fireAt}`);
    res.json({ ok: true, trip_id: trip.id, fires_at: fireAt, departs_at: option.departAt });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}
