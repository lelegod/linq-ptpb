// [B] Date parsing. A 70B model cannot be trusted to do calendar arithmetic,
// so the tool takes free text ("tomorrow around 9") and WE resolve it, using
// Europe/Copenhagen as the reference clock.

const TZ = 'Europe/Copenhagen';

/** Current wall-clock parts in Copenhagen, regardless of server tz. */
function cphParts(d: Date) {
  const f = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => Number(f.find((p) => p.type === t)?.value ?? 0);
  return { y: get('year'), mo: get('month'), da: get('day'), h: get('hour'), mi: get('minute') };
}

/** Offset in minutes between UTC and Copenhagen at a given instant (+120 in summer). */
function cphOffsetMinutes(d: Date): number {
  const p = cphParts(d);
  const asUtc = Date.UTC(p.y, p.mo - 1, p.da, p.h, p.mi);
  return Math.round((asUtc - d.getTime()) / 60_000);
}

/** Build a Date from Copenhagen wall-clock components. */
function fromCph(y: number, mo: number, da: number, h: number, mi: number): Date {
  const guess = new Date(Date.UTC(y, mo - 1, da, h, mi));
  const off = cphOffsetMinutes(guess);
  return new Date(guess.getTime() - off * 60_000);
}

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export type WhenResult = { date: Date; arriveBy: boolean; assumed: boolean };

/**
 * Returns a departure (or arrival) instant. `assumed: true` means we defaulted
 * to "in a few minutes" because the text carried no usable time.
 */
export function parseWhen(text: string | undefined | null, now = new Date()): WhenResult {
  const raw = (text ?? '').trim().toLowerCase();
  const arriveBy = /\b(arrive|be there|get there|by)\b/.test(raw) && !/\bleave\b/.test(raw);

  if (!raw || raw === 'now' || raw === 'asap' || raw === 'right now') {
    return { date: new Date(now.getTime() + 3 * 60_000), arriveBy: false, assumed: !raw };
  }

  // ISO / parseable timestamp
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const d = new Date(raw.length <= 10 ? `${raw}T09:00:00` : raw);
    if (!Number.isNaN(d.getTime())) return { date: d, arriveBy, assumed: false };
  }

  // "in 20 minutes" / "in 2 hours"
  const rel = raw.match(/\bin\s+(\d{1,3})\s*(min|mins|minutes|h|hour|hours)\b/);
  if (rel) {
    const n = Number(rel[1]);
    const mult = rel[2].startsWith('h') ? 60 : 1;
    return { date: new Date(now.getTime() + n * mult * 60_000), arriveBy, assumed: false };
  }

  const p = cphParts(now);
  let y = p.y, mo = p.mo, da = p.da;
  let dayShift = 0;
  let sawDay = false;

  let saidToday = false;
  if (/\btomorrow\b|\bi morgen\b/.test(raw)) { dayShift = 1; sawDay = true; }
  else if (/\bday after tomorrow\b/.test(raw)) { dayShift = 2; sawDay = true; }
  else if (/\btonight\b|\btoday\b|\bi dag\b|\bthis (morning|afternoon|evening)\b/.test(raw)) {
    dayShift = 0; sawDay = true; saidToday = true;
  }
  else {
    for (let i = 0; i < 7; i++) {
      if (new RegExp(`\\b${WEEKDAYS[i]}\\b`).test(raw)) {
        const todayIdx = new Date(fromCph(y, mo, da, 12, 0)).getUTCDay();
        dayShift = (i - todayIdx + 7) % 7 || 7;
        sawDay = true;
        break;
      }
    }
  }

  // time of day: "9", "9am", "09:30", "half past" not supported (say so, don't guess)
  let hour: number | null = null;
  let minute = 0;
  const t24 = raw.match(/\b(\d{1,2})[:.](\d{2})\s*(am|pm)?\b/);
  const t12 = raw.match(/\b(\d{1,2})\s*(am|pm)\b/);
  const bare = raw.match(/\b(?:at|around|kl\.?|about)\s+(\d{1,2})\b/);

  if (t24) {
    hour = Number(t24[1]);
    minute = Number(t24[2]);
    if (t24[3] === 'pm' && hour < 12) hour += 12;
    if (t24[3] === 'am' && hour === 12) hour = 0;
  } else if (t12) {
    hour = Number(t12[1]);
    if (t12[2] === 'pm' && hour < 12) hour += 12;
    if (t12[2] === 'am' && hour === 12) hour = 0;
  } else if (bare) {
    hour = Number(bare[1]);
  } else if (/\bmorning\b/.test(raw)) hour = 8;
  else if (/\bnoon|lunch\b/.test(raw)) hour = 12;
  else if (/\bafternoon\b/.test(raw)) hour = 14;
  else if (/\bevening|tonight\b/.test(raw)) hour = 18;

  if (hour === null && !sawDay) {
    return { date: new Date(now.getTime() + 3 * 60_000), arriveBy, assumed: true };
  }
  if (hour === null) hour = 9; // a named day with no time → 09:00

  // "tonight at 8" / "this evening at 7" means 20:00 and 19:00, not morning.
  if (hour <= 11 && /\b(evening|tonight|afternoon)\b/.test(raw)) hour += 12;

  // apply day shift on the Copenhagen calendar
  const shifted = new Date(fromCph(y, mo, da, 12, 0).getTime() + dayShift * 86_400_000);
  const sp = cphParts(shifted);
  let out = fromCph(sp.y, sp.mo, sp.da, hour, minute);

  // A time that's already gone: "at 9" said at 14:00 means tomorrow;
  // "today at 8" said at 14:00 most likely means 20:00.
  if (out.getTime() < now.getTime() - 5 * 60_000) {
    if (saidToday && hour <= 11) {
      const bumped = new Date(out.getTime() + 12 * 3_600_000);
      if (bumped.getTime() > now.getTime()) out = bumped;
    } else if (!sawDay) {
      out = new Date(out.getTime() + 86_400_000);
    }
    // explicit "today"/"this afternoon" that's already past: leave it — the
    // planner will simply return the next departures after that time.
  }

  return { date: out, arriveBy, assumed: false };
}
