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
  return dayShort.format(new Date(iso)).toLowerCase();
}

export function shortDay(iso: string): string {
  return weekday.format(new Date(iso)).toLowerCase();
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

/**
 * Design.md §2.2 "Trip options reply". The LLM is instructed to send this
 * verbatim — never to re-render it.
 */
export function renderOptions(options: TripOption[]): string {
  if (options.length === 0) return '';
  const from = options[0].origin.name.toLowerCase();
  const to = options[0].destination.name.toLowerCase();
  const day = dayLabel(options[0].departAt);

  const lines = options.map((o) => {
    const bits = [
      `${time(o.departAt)} → ${time(o.arriveAt)}`,
      o.operatorSummary,
      o.priceKr ? `${o.priceKr} kr` : null,
      transferLabel(o),
    ].filter(Boolean);
    return `${o.index}. ${bits.join(' · ')}`;
  });

  const picker =
    options.length === 1
      ? 'reply with 1 to lock it in.'
      : `reply with ${options.map((o) => o.index).slice(0, -1).join(', ')} or ${options[options.length - 1].index} to lock it in.`;

  return `${from} → ${to}, ${day}\n\n${lines.join('\n')}\n\n${picker}`;
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
  const platform = first.departPlatform ? `, platform ${first.departPlatform}` : '';
  const line = first.line ? `${first.line.toLowerCase()} ` : '';
  return `🕘 leave in ${minutesBefore} min — head to ${first.origin.name.toLowerCase()}${platform}. ${line}to ${o.destination.name.toLowerCase()}, ${time(o.departAt)}.`;
}

/** Design.md §2.2 "Status query reply". */
export function renderStatus(trip: Trip, delayMinutes: number, platform?: string): string {
  const legs = trip.legs_json ?? [];
  const first: TripLeg | undefined = legs[0];
  const dest = trip.to_station_name ?? first?.destination.name ?? 'your destination';
  const origin = trip.from_station_name ?? first?.origin.name ?? '';
  const dep = trip.depart_at;

  const head = `your next: ${time(dep)} → ${dest.toLowerCase()} (${relative(dep)}).`;
  const state =
    delayMinutes > 0
      ? `running ${delayMinutes} min late — new departure ${time(new Date(new Date(dep).getTime() + delayMinutes * 60_000).toISOString())}.`
      : 'on time.';
  const where = platform ? `platform ${platform}, ${origin.toLowerCase()}.` : origin ? `${origin.toLowerCase()}.` : '';
  return [head, state, where].filter(Boolean).join(' ');
}

export function renderTripList(trips: Trip[], window: 'upcoming' | 'past'): string {
  if (trips.length === 0) {
    return window === 'upcoming'
      ? "nothing booked right now. tell me where you're headed and i'll sort it."
      : "no past trips on file yet.";
  }
  const lines = trips.map((t) => {
    const to = t.to_station_name ?? t.legs_json?.[0]?.destination.name ?? '—';
    return `· ${dayLabel(t.depart_at)} ${time(t.depart_at)} → ${to.toLowerCase()}`;
  });
  return `${window === 'upcoming' ? 'coming up' : 'recent trips'}:\n${lines.join('\n')}`;
}
