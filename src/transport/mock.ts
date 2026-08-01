// [B] Canned Denmark trips. This is the Phase-2 "Red" kill switch, pre-built.
//
// Real station ids and real coordinates — so the map page renders correctly and
// nothing on stage looks fake. Times are generated relative to the requested
// departure so "tomorrow at 9" still produces 09:03 / 09:33 / 10:03.
//
// Activated by TRANSPORT_MODE=mock, or automatically when TRANSPORT_MODE=auto
// and Rejseplanen fails.

import type { StationRef, TripOption, TripLeg } from '../agent/types';

export const STATIONS: Record<string, StationRef> = {
  kbh: { id: '8600626', name: 'København H', lat: 55.6727, lon: 12.5641 },
  aarhus: { id: '8600053', name: 'Aarhus H', lat: 56.1500, lon: 10.2045 },
  odense: { id: '8600159', name: 'Odense St.', lat: 55.4028, lon: 10.3866 },
  norreport: { id: '8600646', name: 'Nørreport St.', lat: 55.6832, lon: 12.5714 },
  kastrup: { id: '8600858', name: 'Københavns Lufthavn Kastrup St.', lat: 55.6304, lon: 12.6503 },
  roskilde: { id: '8600625', name: 'Roskilde St.', lat: 55.6392, lon: 12.0845 },
  aalborg: { id: '8600020', name: 'Aalborg St.', lat: 57.0430, lon: 9.9169 },
};

const ALIASES: Array<[RegExp, string]> = [
  [/k[øo]benhavn\s*h|copenhagen\s*(central|h\b)|cph\s*h|hovedban/i, 'kbh'],
  [/k[øo]benhavn|copenhagen(?!\s*airport)|cph(?!\s*airport)/i, 'kbh'],
  [/[åa]rhus|aarhus/i, 'aarhus'],
  [/odense/i, 'odense'],
  [/n[øo]rreport/i, 'norreport'],
  [/kastrup|lufthavn|airport|cph\s*airport/i, 'kastrup'],
  [/roskilde/i, 'roskilde'],
  [/[åa]lborg|aalborg/i, 'aalborg'],
];

export function mockFindStation(query: string): StationRef | null {
  for (const [re, key] of ALIASES) if (re.test(query)) return STATIONS[key];
  return null;
}

function iso(base: Date, addMinutes: number): string {
  return new Date(base.getTime() + addMinutes * 60_000).toISOString();
}

/** Rough duration + price table between our canned stations. */
function legProfile(from: StationRef, to: StationRef): { minutes: number; priceKr: number; line: string; operator: string; mode: TripLeg['mode'] } {
  const pair = [from.id, to.id].sort().join('-');
  const table: Record<string, { minutes: number; priceKr: number; line: string; operator: string; mode: TripLeg['mode'] }> = {
    '8600053-8600626': { minutes: 194, priceKr: 149, line: 'IC 79', operator: 'DSB', mode: 'train' },
    '8600159-8600626': { minutes: 84, priceKr: 119, line: 'IC 37', operator: 'DSB', mode: 'train' },
    '8600053-8600159': { minutes: 105, priceKr: 129, line: 'IC 79', operator: 'DSB', mode: 'train' },
    '8600626-8600858': { minutes: 14, priceKr: 36, line: 'Re 1032', operator: 'DSB', mode: 'train' },
    '8600646-8600858': { minutes: 15, priceKr: 36, line: 'Metro M2', operator: 'Metro', mode: 'metro' },
    '8600625-8600626': { minutes: 23, priceKr: 60, line: 'Re 2534', operator: 'DSB', mode: 'train' },
    '8600020-8600626': { minutes: 279, priceKr: 199, line: 'IC 71', operator: 'DSB', mode: 'train' },
    '8600626-8600646': { minutes: 4, priceKr: 24, line: 'Metro M1', operator: 'Metro', mode: 'metro' },
  };
  return table[pair] ?? { minutes: 90, priceKr: 129, line: 'IC 41', operator: 'DSB', mode: 'train' };
}

/**
 * Three options departing at when, +30min, +60min. Third is cheaper ("orange billet").
 */
export function mockJourneys(from: StationRef, to: StationRef, when: Date): TripOption[] {
  const p = legProfile(from, to);
  const offsets = [3, 33, 63];
  return offsets.map((off, i) => {
    const departAt = iso(when, off);
    const arriveAt = iso(when, off + p.minutes);
    const leg: TripLeg = {
      mode: p.mode,
      line: p.line,
      operator: p.operator,
      origin: from,
      destination: to,
      departAt,
      arriveAt,
      departPlatform: ['3', '5', '3'][i],
      delayMinutes: 0,
    };
    return {
      index: i + 1,
      departAt,
      arriveAt,
      durationMinutes: p.minutes,
      transfers: 0,
      priceKr: i === 2 ? Math.round(p.priceKr * 0.6) : p.priceKr,
      operatorSummary: p.operator.toLowerCase(),
      legs: [leg],
      origin: from,
      destination: to,
    };
  });
}

export function mockDepartures(station: StationRef, when: Date) {
  return [0, 12, 27].map((m, i) => ({
    line: ['IC 79', 'Re 2534', 'IC 37'][i],
    direction: ['Aarhus H', 'Roskilde St.', 'Odense St.'][i],
    plannedAt: iso(when, m),
    actualAt: iso(when, m + (i === 0 ? 7 : 0)),
    delayMinutes: i === 0 ? 7 : 0,
    platform: ['3', '7', '5'][i],
  }));
}
