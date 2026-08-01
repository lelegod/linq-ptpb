// [B] Everything that turns data into iMessage-shaped text.
// Kept out of the LLM's hands on purpose: a 70B model will not reliably
// reproduce Design.md §2.2 formatting, but a function will, every time.

import type { TripOption, Trip, TripLeg } from './types';

export const TZ = 'Europe/Copenhagen';

const hhmm = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false });
const dayShort = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' });
const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short' });

export function time(iso: string): string {
  return hhmm.format(new Date(iso));
}

export function dayLabel(iso: string): string {
  return dayShort.format(new Date(iso));
}

export function shortDay(iso: string): string {
  return weekday.format(new Date(iso));
}

export function duration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function minutesFromNow(iso: string, now = new Date()): number {
  return Math.round((new Date(iso).getTime() - now.getTime()) / 60_000);
}

export function relative(iso: string, now = new Date()): string {
  const m = minutesFromNow(iso, now);
  if (m < -1) return `${duration(Math.abs(m))} ago`;
  if (m <= 1) return 'now';
  if (m < 60) return `in ${m} min`;
  return `in ${duration(m)}`;
}

/** "direct" / "1 change" / "2 changes" */
function transferLabel(o: TripOption): string {
  if (o.transfers <= 0) return 'direct';
  return o.transfers === 1 ? '1 change' : `${o.transfers} changes`;
}

const MODE_ICON: Record<TripLeg['mode'], string> = {
  train: '🚆',
  bus: '🚌',
  metro: 'Ⓜ️',
  walk: '🚶',
  other: '•',
};

/** "(plat 3)" — only when Rejseplanen actually gave us one. */
function platform(p?: string): string {
  return p ? ` (plat ${p})` : '';
}

/**
 * operatorFor() lowercases everything, and Rejseplanen's own operator strings
 * are messy — the S-train comes back as "dsb s-tog". Match on substring, and
 * check s-tog BEFORE dsb, because that string contains both.
 */
function operatorLabel(raw?: string): string | undefined {
  if (!raw) return undefined;
  const k = raw.toLowerCase().trim();
  if (!k) return undefined;

  if (k.includes('s-tog') || k.includes('stog')) return 'S-tog';
  if (k.includes('metro')) return 'Metro';
  if (k.includes('movia')) return 'Movia';
  if (k.includes('dsb')) return 'DSB';
  if (k.includes('arriva')) return 'Arriva';
  if (k === 'bus') return 'Bus';
  if (k === 'train') return 'Train';

  return k.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * What to call the service you're boarding. A bare S-tog letter ("A") or metro
 * number ("M2") is meaningless alone, so those get the operator in front —
 * "S-tog A", "Metro M2". Anything self-describing ("IC 79") stands on its own.
 */
function serviceLabel(leg: TripLeg): string {
  if (leg.mode === 'walk') return 'Walk';

  const line = leg.line?.trim();
  const operator = operatorLabel(leg.operator);

  if (!line) return operator ?? leg.mode;
  return line.length <= 2 && operator ? `${operator} ${line}` : line;
}

/** 1️⃣ … 9️⃣, falling back to "10." past that. */
function optionMarker(index: number): string {
  const keycaps = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
  return keycaps[index - 1] ?? `${index}.`;
}

/**
 * Leg-by-leg timeline for one option: times down the left, the service you're
 * on indented between them, changes called out with how much slack you have.
 *
 * Single newlines only — a blank line here would split the option across two
 * bubbles (bubbles.ts), and a timeline broken in half is worse than no
 * timeline. Times are wall-clock Copenhagen, same as everything else.
 */
export function renderItinerary(o: TripOption): string {
  const lines: string[] = [];

  o.legs.forEach((leg, i) => {
    const prev = o.legs[i - 1];
    const next = o.legs[i + 1];

    // A "change" is waiting at a station between two rides. Walking to the
    // next stop is not a change, and a 0-minute one is noise — both produced
    // the "⏱ 0 min change" lines cluttering the Bella Center route.
    if (prev && prev.mode !== 'walk' && leg.mode !== 'walk') {
      const wait = Math.round(
        (new Date(leg.departAt).getTime() - new Date(prev.arriveAt).getTime()) / 60_000,
      );
      if (wait > 0) lines.push(`   ⏱ ${wait} min change`);
    }

    lines.push(`${time(leg.departAt)}  ${leg.origin.name}${platform(leg.departPlatform)}`);

    const label = serviceLabel(leg);
    const mins = Math.round(
      (new Date(leg.arriveAt).getTime() - new Date(leg.departAt).getTime()) / 60_000,
    );
    // "Walk" alone doesn't say whether it's 2 minutes or 20.
    lines.push(`   ${MODE_ICON[leg.mode]} ${label}${leg.mode === 'walk' ? ` ${mins} min` : ''}`);

    // Skip the arrival line when the next leg leaves this same stop within a
    // minute or two — otherwise the station prints twice in a row, once
    // without its platform ("19:25 Nørreport St." then "19:26 Nørreport St.
    // (plat 3)"). The next iteration's departure line carries the platform,
    // so it's the one worth keeping.
    const gapToNext = next
      ? Math.round((new Date(next.departAt).getTime() - new Date(leg.arriveAt).getTime()) / 60_000)
      : Infinity;
    const mergedIntoNext =
      !!next && next.origin.name === leg.destination.name && gapToNext <= 2;
    if (!mergedIntoNext) lines.push(`${time(leg.arriveAt)}  ${leg.destination.name}`);
  });

  return lines.join('\n');
}

/**
 * Design.md §2.2 "Trip options reply". The LLM is instructed to send this
 * verbatim — never to re-render it.
 */
export function renderOptions(options: TripOption[]): string {
  if (options.length === 0) return '';
  const from = options[0].origin.name;
  const to = options[0].destination.name;
  const day = dayLabel(options[0].departAt);

  const lines = options.map((o) => {
    const bits = [
      `${time(o.departAt)} → ${time(o.arriveAt)}`,
      duration(o.durationMinutes),
      o.priceKr ? `${o.priceKr} kr` : null,
      transferLabel(o),
    ].filter(Boolean);
    // Summary line, then the timeline underneath it — one bubble per option.
    return `${optionMarker(o.index)}  ${bits.join(' · ')}\n${renderItinerary(o)}`;
  });

  const picker =
    options.length === 1
      ? 'Reply 1 to lock it in.'
      : `Reply ${options.map((o) => o.index).slice(0, -1).join(', ')} or ${options[options.length - 1].index} to lock it in.`;

  // Blank line between options → each one lands as its own iMessage bubble
  // (bubbles.ts), which keeps a leg-by-leg list readable in a thread.
  return `${from} → ${to}\n${day}\n\n${lines.join('\n\n')}\n\n${picker}`;
}

/** Card title/subtitle for the Linq action card (Design.md §2.2). */
export function cardCopy(o: TripOption): { title: string; subtitle: string; button: string } {
  const bits = [
    `${shortDay(o.departAt)} ${time(o.departAt)}`,
    transferLabel(o),
    duration(o.durationMinutes),
    o.priceKr ? `${o.priceKr} kr` : null,
  ].filter(Boolean);
  return {
    title: `${o.origin.name} → ${o.destination.name}`,
    subtitle: bits.join(' · '),
    button: 'See route',
  };
}

/** Pre-rendered reminder body. Written at book time; cron never calls the LLM. */
export function renderReminder(o: TripOption, minutesBefore: number): string {
  const first = o.legs[0];
  const plat = first.departPlatform ? `, platform ${first.departPlatform}` : '';
  const service = first.line ? `${first.line} ` : '';
  return (
    `🕘 Leave in ${minutesBefore} min\n` +
    `Head to ${first.origin.name}${plat}.\n` +
    `${service}to ${o.destination.name}, ${time(o.departAt)}.\n` +
    `Tap in with your Rejsekort.`
  );
}

/** Design.md §2.2 "Status query reply". */
export function renderStatus(trip: Trip, delayMinutes: number, platform?: string): string {
  const legs = trip.legs_json ?? [];
  const first: TripLeg | undefined = legs[0];
  const dest = trip.to_station_name ?? first?.destination.name ?? 'your destination';
  const origin = trip.from_station_name ?? first?.origin.name ?? '';
  const dep = trip.depart_at;

  const head = `Your next: ${time(dep)} → ${dest} (${relative(dep)})`;
  const state =
    delayMinutes > 0
      ? `⚠️ Running ${delayMinutes} min late — new departure ${time(new Date(new Date(dep).getTime() + delayMinutes * 60_000).toISOString())}.`
      : '✅ On time.';
  const where = platform ? `Platform ${platform}, ${origin}.` : origin ? `${origin}.` : '';
  return [head, state, where].filter(Boolean).join('\n');
}

export function renderTripList(trips: Trip[], window: 'upcoming' | 'past'): string {
  if (trips.length === 0) {
    return window === 'upcoming'
      ? "Nothing booked right now. Tell me where you're headed and I'll sort it."
      : 'No past trips on file yet.';
  }
  const lines = trips.map((t) => {
    const to = t.to_station_name ?? t.legs_json?.[0]?.destination.name ?? '—';
    return `· ${dayLabel(t.depart_at)} ${time(t.depart_at)} → ${to}`;
  });
  return `${window === 'upcoming' ? 'Coming up' : 'Recent trips'}:\n${lines.join('\n')}`;
}
