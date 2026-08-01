import Link from "next/link";
import { RouteMapLoader } from "@/components/map/RouteMapLoader";
import { fetchTrip, staticMapUrl } from "@/lib/trips";

export default async function MapPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const trip = await fetchTrip(sessionId);

  if (!trip) {
    return (
      <main className="mx-auto min-h-screen max-w-lg bg-[var(--paper)] px-6 py-16">
        <p className="font-data text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
          rejsy · trip
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
          Trip not found
        </h1>
        <p className="mt-3 text-[16px] leading-[1.65] text-[var(--slate)]">
          We couldn&apos;t load session{" "}
          <span className="font-data text-[13px] text-[var(--ink)]">
            {sessionId}
          </span>
          . The backend may be down, or the link is stale.
        </p>
        <p className="mt-2 text-[14px] text-[var(--muted)]">
          Demo without Railway: open{" "}
          <Link href="/map/test" className="text-[var(--red)] underline">
            /map/test
          </Link>
          .
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-[10px] border border-[var(--line)] px-4 py-3 text-[14px] font-semibold"
        >
          back to rejsy
        </Link>
      </main>
    );
  }

  const buy = trip.buyUrl ?? "https://www.dsb.dk/";
  const osm = staticMapUrl(trip.stops);

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <header className="border-b border-[var(--line)] px-4 py-4">
        <p className="font-data text-[10px] uppercase tracking-[0.06em] text-[var(--muted)]">
          rejsy · route
        </p>
        <p className="mt-1 text-[18px] font-semibold tracking-[-0.03em]">
          {trip.origin} → {trip.destination}
        </p>
        <p className="mt-1 font-data text-[12px] text-[var(--slate)]">
          {trip.departure}
          {trip.arrival ? ` → ${trip.arrival}` : ""}
          {trip.duration ? ` · ${trip.duration}` : ""}
          {trip.priceKr != null ? ` · ${trip.priceKr} kr` : ""}
          {trip.platform ? ` · platform ${trip.platform}` : ""}
        </p>
      </header>

      {trip.stops.length > 0 ? (
        <RouteMapLoader stops={trip.stops} />
      ) : (
        <div className="border-b border-[var(--line)] px-4 py-10">
          <p className="text-[var(--slate)]">
            Map geometry unavailable — ticket link still works.
          </p>
          {osm ? (
            <a
              href={osm}
              className="mt-3 inline-block font-data text-[12px] text-[var(--red)] underline"
              target="_blank"
              rel="noreferrer"
            >
              Open static map
            </a>
          ) : null}
        </div>
      )}

      <div className="space-y-3 border-t border-[var(--line)] px-4 py-4">
        <ul className="space-y-1 font-data text-[12px] text-[var(--slate)]">
          {trip.stops.map((s) => (
            <li key={`${s.name}-${s.lat}`}>
              {s.at ? `${s.at} · ` : ""}
              {s.name}
            </li>
          ))}
        </ul>
        <a
          href={buy}
          className="flex w-full items-center justify-center rounded-[10px] bg-[var(--red)] px-4 py-3 font-semibold text-white"
        >
          Buy on DSB
        </a>
      </div>

      <noscript>
        <p className="p-4">
          {trip.origin} to {trip.destination} at {trip.departure}.{" "}
          <a href={buy}>Buy on DSB</a>
        </p>
      </noscript>
    </main>
  );
}
