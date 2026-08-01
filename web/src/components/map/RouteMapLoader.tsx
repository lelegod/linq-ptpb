"use client";

import dynamic from "next/dynamic";
import type { TripStop } from "@/types/trip";

const RouteMap = dynamic(
  () => import("@/components/map/RouteMap").then((m) => m.RouteMap),
  { ssr: false, loading: () => <div className="h-[50vh] bg-[var(--line)]" /> },
);

export function RouteMapLoader({ stops }: { stops: TripStop[] }) {
  return <RouteMap stops={stops} />;
}
