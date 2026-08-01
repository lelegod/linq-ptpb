import { RouteMapLoader } from "@/components/map/RouteMapLoader";
import { fetchTrip } from "@/lib/trips";

export default async function MapPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const trip = await fetchTrip(sessionId);

  if (!trip) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">
          Trip not found
        </h1>
        <p className="mt-3 text-[var(--slate)]">
          We couldn&apos;t load this session. Check the link from iMessage or
          try again.
        </p>
      </main>
    );
  }

  const buy = trip.buyUrl ?? "https://www.dsb.dk/";

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <header className="border-b border-[var(--line)] px-4 py-4">
        <p className="font-semibold tracking-[-0.03em]">
          {trip.origin} → {trip.destination}
        </p>
        <p className="mt-1 font-data text-[12px] text-[var(--slate)]">
          {trip.departure}
          {trip.duration ? ` · ${trip.duration}` : ""}
          {trip.priceKr != null ? ` · ${trip.priceKr} kr` : ""}
          {trip.platform ? ` · platform ${trip.platform}` : ""}
        </p>
      </header>

      {trip.stops.length > 0 ? (
        <RouteMapLoader stops={trip.stops} />
      ) : (
        <p className="px-4 py-8 text-[var(--slate)]">
          Map geometry unavailable — ticket link still works.
        </p>
      )}

      <div className="border-t border-[var(--line)] px-4 py-4">
        <a
          href={buy}
          className="flex w-full items-center justify-center rounded-[10px] bg-[var(--red)] px-4 py-3 text-white"
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
