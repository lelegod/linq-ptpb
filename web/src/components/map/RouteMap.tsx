"use client";

import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { TripStop } from "@/types/trip";

export function RouteMap({ stops }: { stops: TripStop[] }) {
  if (!stops.length) return null;
  const positions = stops.map((s) => [s.lat, s.lng] as [number, number]);
  const center = positions[Math.floor(positions.length / 2)] ?? positions[0];

  return (
    <MapContainer
      center={center}
      zoom={8}
      className="h-[50vh] w-full md:h-[60vh]"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Leaflet requires concrete colors — match --red / --ink tokens */}
      {positions.length > 1 && (
        <Polyline
          positions={positions}
          pathOptions={{ color: "#C8102E", weight: 4 }}
        />
      )}
      {stops.map((s) => (
        <CircleMarker
          key={`${s.name}-${s.lat}`}
          center={[s.lat, s.lng]}
          radius={6}
          pathOptions={{
            color: "#0B0B0C",
            fillColor: "#C8102E",
            fillOpacity: 1,
          }}
        >
          <Popup>
            {s.name}
            {s.at ? ` · ${s.at}` : ""}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
