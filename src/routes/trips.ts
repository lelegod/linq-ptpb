// [B, covering D] GET /api/trips/:sessionId
//
// The other half of C's map page. web/src/lib/trips.ts fetches this and runs it
// through normalizeTrip(), so the field names below are chosen to match what
// that function reads — origin, destination, departure, arrival, duration,
// priceKr, platform, buyUrl, stops[{name, lat, lng, at}].
//
// Keyed by SESSION id, not trip id: that's what ends up in the card URL, and it
// means a stale link can't be used to enumerate trips.
//
// Note `lng` (not `lon`) in stops — C's Trip type uses lng.

import type { Request, Response } from 'express';
import { getDeps } from '../agent/deps';
import { time, duration } from '../agent/format';
import type { TripLeg } from '../agent/types';

/** Every distinct station along the route, in order, with its time. */
function stopsFrom(legs: TripLeg[]) {
  const out: Array<{ name: string; lat: number; lng: number; at: string }> = [];

  const push = (name: string, lat?: number, lng?: number, at?: string) => {
    if (lat == null || lng == null) return; // no coords → Leaflet can't place it
    if (out.length && out[out.length - 1].name === name) return; // transfer dedupe
    out.push({ name, lat, lng, at: at ? time(at) : '' });
  };

  legs.forEach((leg, i) => {
    if (i === 0) push(leg.origin.name, leg.origin.lat, leg.origin.lon, leg.departAt);
    else push(leg.origin.name, leg.origin.lat, leg.origin.lon, leg.departAt);
    if (i === legs.length - 1) {
      push(leg.destination.name, leg.destination.lat, leg.destination.lon, leg.arriveAt);
    }
  });

  return out;
}

export async function getTripBySession(req: Request, res: Response): Promise<void> {
  const sessionId = String(req.params.sessionId ?? '');

  try {
    const trip = await getDeps().db.getTripBySession(sessionId);
    if (!trip) {
      res.status(404).json({ error: 'session not found' });
      return;
    }

    const legs = trip.legs_json ?? [];
    const first = legs[0];
    const last = legs[legs.length - 1];
    const minutes = Math.round(
      (new Date(trip.arrive_at).getTime() - new Date(trip.depart_at).getTime()) / 60_000,
    );

    // Rejseplanen almost never returns a fare, and we never invent one
    // (Memory.md §10) — omitting priceKr makes C's page hide the field.
    res.json({
      origin: trip.from_station_name ?? first?.origin.name ?? '',
      destination: trip.to_station_name ?? last?.destination.name ?? '',
      departure: time(trip.depart_at),
      arrival: time(trip.arrive_at),
      duration: duration(minutes),
      platform: first?.departPlatform ?? undefined,
      buyUrl: trip.deep_link_url ?? undefined,
      stops: stopsFrom(legs),
    });
  } catch (err) {
    console.error('[B][trips] lookup failed:', err);
    res.status(500).json({ error: 'lookup failed' });
  }
}
