import { isConfiguredUrl } from "@/lib/env";
import type { Trip } from "@/types/trip";

const MOCK: Trip = {
  id: "test",
  origin: "København H",
  destination: "Aarhus H",
  departure: "09:03",
  arrival: "12:17",
  duration: "3h 14m",
  priceKr: 149,
  platform: "3",
  buyUrl: "https://www.dsb.dk/",
  stops: [
    { name: "København H", lat: 55.6728, lng: 12.5645, at: "09:03" },
    { name: "Odense", lat: 55.3997, lng: 10.3883, at: "10:35" },
    { name: "Aarhus H", lat: 56.1501, lng: 10.2047, at: "12:17" },
  ],
};

function useMock(sessionId: string): boolean {
  if (process.env.MOCK_TRIPS === "1") return true;
  // Demo-friendly: /map/test always works without Railway
  if (sessionId === "test" || sessionId === "demo") return true;
  return false;
}

export async function fetchTrip(sessionId: string): Promise<Trip | null> {
  if (useMock(sessionId)) {
    return { ...MOCK, id: sessionId };
  }

  const base = process.env.BACKEND_URL;
  if (!isConfiguredUrl(base)) {
    console.error("BACKEND_URL missing or placeholder");
    return null;
  }

  try {
    const res = await fetch(
      `${base.replace(/\/$/, "")}/api/trips/${sessionId}`,
      {
        next: { revalidate: 0 },
        headers: { Accept: "application/json" },
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return normalizeTrip(sessionId, data as Record<string, unknown>);
  } catch (e) {
    console.error(e);
    return null;
  }
}

/** Adapt D's payload once — keep this the only mapping point. */
function normalizeTrip(id: string, raw: Record<string, unknown>): Trip {
  const stops = Array.isArray(raw.stops) ? (raw.stops as Trip["stops"]) : [];
  return {
    id,
    origin: String(raw.origin ?? raw.from ?? "Origin"),
    destination: String(raw.destination ?? raw.to ?? "Destination"),
    departure: String(raw.departure ?? raw.departAt ?? ""),
    arrival: raw.arrival ? String(raw.arrival) : undefined,
    duration: raw.duration ? String(raw.duration) : undefined,
    priceKr:
      typeof raw.priceKr === "number"
        ? raw.priceKr
        : Number(raw.price) || undefined,
    platform: raw.platform ? String(raw.platform) : undefined,
    buyUrl: raw.buyUrl
      ? String(raw.buyUrl)
      : raw.dsbUrl
        ? String(raw.dsbUrl)
        : undefined,
    stops,
  };
}

export function staticMapUrl(stops: Trip["stops"]): string | null {
  if (stops.length < 1) return null;
  const mid = stops[Math.floor(stops.length / 2)] ?? stops[0];
  return `https://www.openstreetmap.org/?mlat=${mid.lat}&mlon=${mid.lng}#map=8/${mid.lat}/${mid.lng}`;
}
