export type TripStop = { name: string; lat: number; lng: number; at?: string };

export type Trip = {
  id: string;
  origin: string;
  destination: string;
  departure: string;
  arrival?: string;
  duration?: string;
  priceKr?: number;
  platform?: string;
  buyUrl?: string;
  stops: TripStop[];
};
