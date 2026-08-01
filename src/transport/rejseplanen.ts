// [B] Rejseplanen wrapper. The ONLY file that knows hafas-client exists.
//
// TRANSPORT_MODE:
//   'auto'  (default) — try Rejseplanen; on error/timeout fall back to canned data and log loudly
//   'hafas'           — Rejseplanen only; failures return ok:false
//   'mock'            — canned data only (Phase-2 kill switch / offline dev)
//
// Every exported function returns null / empty rather than throwing, so the
// agent degrades gracefully instead of 500-ing the webhook. (Rules §5.2)

import type { StationRef, TripOption, TripLeg, DepartureInfo, LegMode } from '../agent/types';
import { mockFindStation, mockJourneys, mockDepartures } from './mock';

const MODE = (process.env.TRANSPORT_MODE ?? 'auto') as 'auto' | 'hafas' | 'mock';
const TIMEOUT_MS = Number(process.env.TRANSPORT_TIMEOUT_MS ?? 9000);

let clientPromise: Promise<any> | null = null;
let hafasDead = false;

/**
 * hafas-client 6.3.6's Rejseplanen profile only declares five products —
 * national-train(1), national-train-2(2), local-train(4), o(8), s-tog(16).
 * Bus and metro are missing entirely, so the router could not use them: a
 * Bella Center → DTU query answered with a 16-minute WALK to Ørestad rather
 * than two minutes on the M1, and no bus ever appeared in any result.
 *
 * These bitmasks were verified empirically against the live API on 2026-08-01
 * (Kongens Nytorv → Christianshavn returns Metro M1/M2; Bella Center → DTU
 * returns Metro M1 + Bus 150S). Do not guess at new ones — test them the same
 * way, because a wrong mask silently changes which journeys come back.
 */
const EXTRA_PRODUCTS = [
  { id: 'bus', mode: 'bus', bitmasks: [32], name: 'Bus', short: 'Bus', default: true },
  { id: 'express-bus', mode: 'bus', bitmasks: [64], name: 'Expressbus', short: 'X', default: true },
  { id: 'night-bus', mode: 'bus', bitmasks: [128], name: 'Natbus', short: 'N', default: true },
  { id: 'telebus', mode: 'bus', bitmasks: [256], name: 'Telebus', short: 'T', default: true },
  { id: 'ferry', mode: 'watercraft', bitmasks: [512], name: 'Færge', short: 'F', default: true },
  { id: 'metro', mode: 'train', bitmasks: [1024], name: 'Metro', short: 'M', default: true },
];

async function getClient(): Promise<any> {
  if (!clientPromise) {
    clientPromise = (async () => {
      // dynamic import: hafas-client v6 is ESM-only, and this keeps mock mode
      // from ever loading it.
      const { createClient } = await import('hafas-client');
      const { profile } = await import('hafas-client/p/rejseplanen/index.js');
      const extended = {
        ...(profile as any),
        products: [...(profile as any).products, ...EXTRA_PRODUCTS],
      };
      return createClient(extended as any, 'ptpb-rejsy-hackathon');
    })();
  }
  return clientPromise;
}

function withTimeout<T>(p: Promise<T>, ms = TIMEOUT_MS): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error('rejseplanen timeout')), ms)),
  ]);
}

function useMock(): boolean {
  return MODE === 'mock' || (MODE === 'auto' && hafasDead);
}

function markDead(where: string, err: unknown) {
  if (MODE === 'auto' && !hafasDead) {
    hafasDead = true;
    console.error(`[B][transport] Rejseplanen failed at ${where} → switching to canned data for the rest of this process.`, err);
  } else {
    console.error(`[B][transport] ${where} failed:`, err);
  }
}

// ---------------------------------------------------------------------------

function toStationRef(loc: any): StationRef | null {
  if (!loc) return null;
  const id = String(loc.id ?? loc.station?.id ?? '');
  const name = String(loc.name ?? loc.station?.name ?? '');
  if (!id || !name) return null;
  const l = loc.location ?? loc.station?.location ?? {};
  return { id, name, lat: l.latitude, lon: l.longitude };
}

/**
 * Product ids seen live: national-train, national-train-2, local-train, o,
 * s-tog, bus, express-bus, night-bus, telebus, ferry, metro.
 *
 * The old version read `product ?? mode`, which was the bug behind "• Lokalbane
 * 910": that service is product 'o' with mode 'train', and `??` meant the
 * useless 'o' always won and the accurate 'train' was never consulted. Product
 * decides only where it's specific (metro, bus); otherwise mode does.
 */
function mapMode(leg: any): LegMode {
  if (leg.walking) return 'walk';

  const product = String(leg.line?.product ?? '').toLowerCase();
  const mode = String(leg.line?.mode ?? '').toLowerCase();
  const name = String(leg.line?.name ?? '').trim();

  if (product.includes('metro') || /^metro\b/i.test(name) || /^m\d/i.test(name)) return 'metro';
  if (product.includes('bus') || mode === 'bus') return 'bus';
  if (mode === 'watercraft' || product.includes('ferry')) return 'other';

  // s-tog, national-train, national-train-2, local-train — and 'o', which only
  // identifies itself through mode.
  if (product.includes('train') || product.includes('tog') || mode === 'train') return 'train';
  if (/^[a-fh]$/i.test(name)) return 'train'; // bare S-tog letter, product missing

  return 'other';
}

/**
 * Rejseplanen returns line names like "ICL 50063", "Re 52534", "A", "M2" and
 * often no operator object at all. "icl 50063" reads badly in a message, so
 * derive the operator the way a Dane would say it.
 */
function operatorFor(leg: any, mode: LegMode): string {
  const explicit = leg.line?.operator?.name;
  if (explicit) return String(explicit).toLowerCase();

  const name = String(leg.line?.name ?? '').trim();
  if (/^(ic|icl|il|re|rex?|l|ø?resund|ør)\b/i.test(name)) return 'dsb';
  if (/^[a-fh]\b/i.test(name)) return 's-tog';
  if (/^m\d/i.test(name)) return 'metro';
  if (mode === 'bus') return 'bus';
  if (mode === 'metro') return 'metro';
  if (mode === 'train') return 'train';
  return mode;
}

function minutesBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60_000);
}

function normaliseJourney(j: any, index: number): TripOption | null {
  const legs: TripLeg[] = [];
  for (const leg of j.legs ?? []) {
    const origin = toStationRef(leg.origin);
    const destination = toStationRef(leg.destination);
    const departAt = leg.departure ?? leg.plannedDeparture;
    const arriveAt = leg.arrival ?? leg.plannedArrival;
    if (!origin || !destination || !departAt || !arriveAt) continue;

    let polyline: Array<[number, number]> | undefined;
    const feats = leg.polyline?.features;
    if (Array.isArray(feats) && feats.length > 1) {
      polyline = feats
        .map((f: any) => f?.geometry?.coordinates)
        .filter((c: any) => Array.isArray(c) && c.length === 2)
        .map((c: any) => [c[1], c[0]] as [number, number]);
    }

    legs.push({
      mode: mapMode(leg),
      line: leg.line?.name ?? undefined,
      operator: leg.line ? operatorFor(leg, mapMode(leg)) : undefined,
      origin,
      destination,
      departAt: new Date(departAt).toISOString(),
      arriveAt: new Date(arriveAt).toISOString(),
      departPlatform: leg.departurePlatform ?? leg.plannedDeparturePlatform ?? undefined,
      arrivePlatform: leg.arrivalPlatform ?? leg.plannedArrivalPlatform ?? undefined,
      delayMinutes: typeof leg.departureDelay === 'number' ? Math.round(leg.departureDelay / 60) : undefined,
      polyline,
    });
  }
  if (legs.length === 0) return null;

  const first = legs[0];
  const last = legs[legs.length - 1];
  const operators = Array.from(
    new Set(legs.filter((l) => l.mode !== 'walk').map((l) => (l.operator ?? l.mode).toLowerCase())),
  );

  // Price: Rejseplanen's HAFAS rarely returns fares. Only surface it if real.
  const amount = j.price?.amount;
  const priceKr = typeof amount === 'number' && amount > 0 ? Math.round(amount) : undefined;

  return {
    index,
    departAt: first.departAt,
    arriveAt: last.arriveAt,
    durationMinutes: minutesBetween(first.departAt, last.arriveAt),
    transfers: Math.max(0, legs.filter((l) => l.mode !== 'walk').length - 1),
    priceKr,
    operatorSummary: operators.join(' · ') || 'public transport',
    legs,
    origin: first.origin,
    destination: last.destination,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Resolve a free-text Danish place name to a station. Returns null if unknown. */
export async function findStation(query: string): Promise<StationRef | null> {
  const q = query.trim();
  if (!q) return null;

  if (useMock()) return mockFindStation(q);

  try {
    const client = await getClient();
    const results: any[] = await withTimeout<any>(client.locations(q, { results: 5, addresses: false, poi: false }));
    for (const r of results ?? []) {
      const ref = toStationRef(r);
      if (ref) return ref;
    }
    return null;
  } catch (err) {
    markDead('findStation', err);
    return MODE === 'auto' ? mockFindStation(q) : null;
  }
}

/** Plan a journey. `when` is departure time unless arriveBy is true. */
export async function journeys(
  from: StationRef,
  to: StationRef,
  opts: { when?: Date; arriveBy?: boolean; results?: number } = {},
): Promise<{ options: TripOption[]; source: 'rejseplanen' | 'mock' }> {
  const when = opts.when ?? new Date();
  const results = opts.results ?? 3;

  if (useMock()) return { options: mockJourneys(from, to, when).slice(0, results), source: 'mock' };

  try {
    const client = await getClient();
    // hafas-client rejects `departure` and `arrival` both being PRESENT, even
    // if one is undefined. Build the object with exactly one of them.
    const query: Record<string, unknown> = { results, stopovers: false, polylines: true };
    if (opts.arriveBy) query.arrival = when;
    else query.departure = when;

    const res: any = await withTimeout<any>(client.journeys(from.id, to.id, query));
    const options = (res?.journeys ?? [])
      .map((j: any, i: number) => normaliseJourney(j, i + 1))
      .filter((o: TripOption | null): o is TripOption => o !== null)
      .slice(0, results)
      .map((o: TripOption, i: number) => ({ ...o, index: i + 1 }));

    if (options.length === 0) throw new Error('rejseplanen returned zero usable journeys');
    return { options, source: 'rejseplanen' };
  } catch (err) {
    markDead('journeys', err);
    if (MODE === 'auto') return { options: mockJourneys(from, to, when).slice(0, results), source: 'mock' };
    return { options: [], source: 'rejseplanen' };
  }
}

/** Live departure board — used by get_status for delay-aware answers. */
export async function departures(station: StationRef, when: Date = new Date()): Promise<DepartureInfo[]> {
  if (useMock()) return mockDepartures(station, when);

  try {
    const client = await getClient();
    const res: any = await withTimeout<any>(client.departures(station.id, { when, duration: 60, results: 12 }));
    const list = Array.isArray(res) ? res : (res?.departures ?? []);
    return list.map((d: any) => {
      const planned = d.plannedWhen ?? d.when;
      const actual = d.when ?? d.plannedWhen;
      return {
        line: d.line?.name ?? '—',
        direction: d.direction ?? d.destination?.name ?? '—',
        plannedAt: new Date(planned).toISOString(),
        actualAt: new Date(actual).toISOString(),
        delayMinutes: typeof d.delay === 'number' ? Math.round(d.delay / 60) : 0,
        platform: d.platform ?? d.plannedPlatform ?? undefined,
      } as DepartureInfo;
    });
  } catch (err) {
    markDead('departures', err);
    return MODE === 'auto' ? mockDepartures(station, when) : [];
  }
}

/** For the health endpoint / smoke test. */
export function transportStatus() {
  return { mode: MODE, usingMock: useMock(), hafasDead };
}
