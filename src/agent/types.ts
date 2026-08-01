// [B] Shared types for the agent brain + transport layer.
// Nothing in here imports anything. Keep it that way.

export type StationRef = {
  id: string; // HAFAS station id, e.g. "8600626"
  name: string; // "København H"
  lat?: number;
  lon?: number;
};

export type LegMode = 'train' | 'bus' | 'metro' | 'walk' | 'other';

export type TripLeg = {
  mode: LegMode;
  line?: string; // "IC 79", "Metro M2", null for walking
  operator?: string; // "DSB", "Metro", "Movia"
  origin: StationRef;
  destination: StationRef;
  departAt: string; // ISO
  arriveAt: string; // ISO
  departPlatform?: string;
  arrivePlatform?: string;
  delayMinutes?: number; // realtime delay on departure, if known
  polyline?: Array<[number, number]>; // [lat, lon] pairs, if HAFAS gave us one
};

/** One planned journey option. This is the unit the user picks by number. */
export type TripOption = {
  index: number; // 1-based, what the user types
  departAt: string; // ISO
  arriveAt: string; // ISO
  durationMinutes: number;
  transfers: number;
  priceKr?: number; // omit if unknown — NEVER invent
  operatorSummary: string; // "dsb", "dsb · metro"
  legs: TripLeg[];
  origin: StationRef;
  destination: StationRef;
};

export type PlanResult = {
  ok: boolean;
  origin?: StationRef;
  destination?: StationRef;
  options: TripOption[];
  /** Pre-rendered iMessage-shaped text. The LLM is told to send this near-verbatim. */
  display?: string;
  error?: string;
  source: 'rejseplanen' | 'mock';
};

export type DepartureInfo = {
  line: string;
  direction: string;
  plannedAt: string;
  actualAt: string;
  delayMinutes: number;
  platform?: string;
};

// ---------------------------------------------------------------------------
// Persistence shapes. These mirror Architecture.md §3 exactly.
// Person D owns the real implementation; see ports.ts for the contract.
// ---------------------------------------------------------------------------

export type User = {
  id: string;
  phone: string;
  display_name?: string | null;
  linq_chat_id?: string | null;
  created_at?: string;
};

export type UserPlace = {
  id?: string;
  user_id: string;
  label: string;
  station_id: string;
  station_name: string;
};

export type Trip = {
  id: string;
  user_id: string;
  from_station_id: string;
  to_station_id: string;
  depart_at: string;
  arrive_at: string;
  legs_json: TripLeg[];
  deep_link_url?: string | null;
  status: 'planned' | 'departed' | 'done' | 'cancelled';
  created_at?: string;
  // convenience, not columns — filled by the db layer when it can
  from_station_name?: string;
  to_station_name?: string;
};

export type MessageRow = {
  id?: string;
  user_id: string;
  direction: 'in' | 'out';
  body: string;
  tool_calls?: unknown;
  created_at?: string;
};

// ---------------------------------------------------------------------------
// LLM wire shapes (provider-agnostic — see llm.ts)
// ---------------------------------------------------------------------------

export type ToolSpec = {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema
};

export type ToolCall = {
  id: string;
  name: string;
  args: Record<string, unknown>;
};

export type LlmMessage =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string | null; toolCalls?: ToolCall[] }
  | { role: 'tool'; toolCallId: string; name: string; content: string };

export type LlmResult = {
  text: string | null;
  toolCalls: ToolCall[];
};
