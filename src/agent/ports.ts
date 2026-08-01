// [B] The contract between the agent brain and the rest of the team.
//
// Person D implements `Db` in /src/db/*.ts.
// Person A implements `Linq` in /src/agent/linq.ts.
//
// Until they land, the in-memory implementations at the bottom of this file
// let the brain run standalone (see scripts/smoke-agent.ts). Nothing in
// /src/agent/tools.ts or handleTurn.ts knows which implementation it got.

import type { User, UserPlace, Trip, TripLeg, MessageRow } from './types';

export interface Db {
  getOrCreateUser(phone: string, chatId?: string | null): Promise<User>;
  setDisplayName(userId: string, name: string): Promise<void>;

  getUserPlaces(userId: string): Promise<UserPlace[]>;
  savePlace(userId: string, label: string, stationId: string, stationName: string): Promise<void>;

  createTrip(input: {
    user_id: string;
    from_station_id: string;
    to_station_id: string;
    depart_at: string;
    arrive_at: string;
    legs_json: TripLeg[];
    deep_link_url?: string | null;
  }): Promise<Trip>;
  getTripById(tripId: string): Promise<Trip | null>;
  getUpcomingTrips(userId: string): Promise<Trip[]>;
  getPastTrips(userId: string, limit: number): Promise<Trip[]>;

  createReminder(tripId: string, fireAt: string, message: string): Promise<void>;
  /** Reminders whose fire_at has passed and that we haven't sent yet. */
  getDueReminders(nowIso: string): Promise<DueReminder[]>;
  markReminderFired(reminderId: string): Promise<void>;

  /** Trips departing inside the next `minutes`, for the delay watcher. */
  getTripsDepartingWithin(minutes: number): Promise<Array<{ trip: Trip; chatId: string }>>;
  /** True the first time we see this delay bucket for this trip (dedupe). */
  claimDelayBucket(tripId: string, bucket: number): Promise<boolean>;

  /** Returns the new session id (uuid) — goes in the map-card URL. */
  createSession(tripId: string, chatId: string): Promise<string>;

  getRecentMessages(userId: string, n: number): Promise<MessageRow[]>;
  logMessage(userId: string, direction: 'in' | 'out', body: string, toolCalls?: unknown): Promise<void>;
}

export type DueReminder = {
  id: string;
  trip_id: string;
  message: string;
  chat_id: string;
};

export interface Linq {
  /** Plain text into an existing chat. POST /v3/chats/{chatId}/messages */
  sendChatText(chatId: string, text: string, opts?: { effect?: string }): Promise<void>;
  /** Action card. POST /v3/messages — HANDLE-targeted, not chat-targeted. */
  sendMapCard(
    toPhone: string,
    card: { sessionId: string; title: string; subtitle: string; button: string; url: string },
  ): Promise<void>;
  startTyping?(chatId: string): Promise<void>;
  stopTyping?(chatId: string): Promise<void>;
}

export type Deps = {
  db: Db;
  linq: Linq;
  publicAppUrl: string;
};

// ---------------------------------------------------------------------------
// Standalone fallbacks — no Supabase, no Linq, no network.
// These exist so B is never blocked on A or D.
// ---------------------------------------------------------------------------

function uuid(): string {
  // crypto.randomUUID exists on Node 18+; fall back for safety.
  const c: any = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function createMemoryDb(): Db {
  const users = new Map<string, User>();
  const places: UserPlace[] = [];
  const trips: Trip[] = [];
  const reminders: Array<{ id: string; trip_id: string; fire_at: string; message: string; fired_at: string | null }> = [];
  const delayBuckets = new Set<string>();
  const sessions = new Map<string, { trip_id: string; chat_id: string }>();
  const messages: MessageRow[] = [];

  return {
    async getOrCreateUser(phone, chatId) {
      let u = users.get(phone);
      if (!u) {
        u = { id: uuid(), phone, linq_chat_id: chatId ?? null, created_at: new Date().toISOString() };
        users.set(phone, u);
      } else if (chatId && !u.linq_chat_id) {
        u.linq_chat_id = chatId;
      }
      return u;
    },
    async setDisplayName(userId, name) {
      for (const u of users.values()) if (u.id === userId) u.display_name = name;
    },
    async getUserPlaces(userId) {
      return places.filter((p) => p.user_id === userId);
    },
    async savePlace(userId, label, stationId, stationName) {
      const existing = places.find((p) => p.user_id === userId && p.label === label);
      if (existing) {
        existing.station_id = stationId;
        existing.station_name = stationName;
      } else {
        places.push({ user_id: userId, label, station_id: stationId, station_name: stationName });
      }
    },
    async createTrip(input) {
      const t: Trip = {
        id: uuid(),
        status: 'planned',
        created_at: new Date().toISOString(),
        from_station_name: input.legs_json[0]?.origin.name,
        to_station_name: input.legs_json[input.legs_json.length - 1]?.destination.name,
        ...input,
      };
      trips.push(t);
      return t;
    },
    async getTripById(tripId) {
      return trips.find((t) => t.id === tripId) ?? null;
    },
    async getUpcomingTrips(userId) {
      const now = Date.now();
      return trips
        .filter((t) => t.user_id === userId && new Date(t.depart_at).getTime() > now - 30 * 60_000)
        .sort((a, b) => a.depart_at.localeCompare(b.depart_at));
    },
    async getPastTrips(userId, limit) {
      const now = Date.now();
      return trips
        .filter((t) => t.user_id === userId && new Date(t.depart_at).getTime() <= now)
        .sort((a, b) => b.depart_at.localeCompare(a.depart_at))
        .slice(0, limit);
    },
    async createReminder(trip_id, fire_at, message) {
      reminders.push({ id: uuid(), trip_id, fire_at, message, fired_at: null });
      console.log(`[B][memdb] reminder queued for ${fire_at}: ${message}`);
    },
    async getDueReminders(nowIso) {
      const now = new Date(nowIso).getTime();
      const out: DueReminder[] = [];
      for (const r of reminders) {
        if (r.fired_at || new Date(r.fire_at).getTime() > now) continue;
        const trip = trips.find((t) => t.id === r.trip_id);
        if (!trip) continue;
        const owner = [...users.values()].find((u) => u.id === trip.user_id);
        if (!owner?.linq_chat_id) continue;
        out.push({ id: r.id, trip_id: r.trip_id, message: r.message, chat_id: owner.linq_chat_id });
      }
      return out;
    },
    async markReminderFired(reminderId) {
      const r = reminders.find((x) => x.id === reminderId);
      if (r) r.fired_at = new Date().toISOString();
    },
    async getTripsDepartingWithin(minutes) {
      const now = Date.now();
      const out: Array<{ trip: Trip; chatId: string }> = [];
      for (const t of trips) {
        const dep = new Date(t.depart_at).getTime();
        if (dep < now || dep > now + minutes * 60_000) continue;
        if (t.status === 'cancelled' || t.status === 'done') continue;
        const owner = [...users.values()].find((u) => u.id === t.user_id);
        if (owner?.linq_chat_id) out.push({ trip: t, chatId: owner.linq_chat_id });
      }
      return out;
    },
    async claimDelayBucket(tripId, bucket) {
      const key = `${tripId}:${bucket}`;
      if (delayBuckets.has(key)) return false;
      delayBuckets.add(key);
      return true;
    },
    async createSession(trip_id, chat_id) {
      const id = uuid();
      sessions.set(id, { trip_id, chat_id });
      return id;
    },
    async getRecentMessages(userId, n) {
      return messages.filter((m) => m.user_id === userId).slice(-n);
    },
    async logMessage(user_id, direction, body, tool_calls) {
      messages.push({ user_id, direction, body, tool_calls, created_at: new Date().toISOString() });
    },
  };
}

export function createConsoleLinq(): Linq {
  return {
    async sendChatText(chatId, text, opts) {
      console.log(`\n[→ imessage ${chatId}${opts?.effect ? ` (${opts.effect})` : ''}]\n${text}\n`);
    },
    async sendMapCard(toPhone, card) {
      console.log(`\n[→ card to ${toPhone}]\n┌────────────────────────────────\n│ ${card.title}\n│ ${card.subtitle}\n│ [ ${card.button} → ] ${card.url}\n└────────────────────────────────\n`);
    },
    async startTyping() {},
    async stopTyping() {},
  };
}
