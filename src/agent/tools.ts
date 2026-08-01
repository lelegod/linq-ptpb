// [B] The six tools. Schemas + implementations in one place (Rules §3.2).
//
// Implementations take a Deps object (see ports.ts) so Person A's linq.ts and
// Person D's db helpers plug in without this file importing either.

import type { ToolSpec, TripOption, StationRef } from './types';
import type { Deps } from './ports';
import { findStation, journeys, departures } from '../transport/rejseplanen';
import { parseWhen } from './when';
import { buildTicketLink, ticketVendor } from './dsb';
import { renderOptions, cardCopy, renderReminder, renderStatus, renderTripList, time, minutesFromNow } from './format';

// ---------------------------------------------------------------------------
// Per-user scratch state: the last set of options we showed them.
// In-process is fine — Railway keeps one long-lived Node process. A redeploy
// mid-conversation drops it, and book_trip then tells the user to re-plan.
// ---------------------------------------------------------------------------

const lastPlan = new Map<string, { options: TripOption[]; at: number }>();

export function rememberPlan(userId: string, options: TripOption[]) {
  lastPlan.set(userId, { options, at: Date.now() });
}
export function recallPlan(userId: string): TripOption[] | null {
  const e = lastPlan.get(userId);
  if (!e) return null;
  if (Date.now() - e.at > 60 * 60_000) return null; // an hour old, times are stale
  return e.options;
}

const REMINDER_MINUTES_DEFAULT = Number(process.env.REMINDER_MINUTES ?? 25);

// ---------------------------------------------------------------------------
// Schemas — what the LLM sees
// ---------------------------------------------------------------------------

export const TOOLS: ToolSpec[] = [
  {
    name: 'plan_trip',
    description:
      'Find real public-transport options in Denmark between two places. Use whenever the user hints at travelling somewhere. Returns a ready-to-send "display" string you must relay verbatim.',
    parameters: {
      type: 'object',
      properties: {
        from: {
          type: 'string',
          description:
            'Origin as the user said it, or a saved place label like "home". If the user did not say an origin, use their saved "home" label, else "København H".',
        },
        to: { type: 'string', description: 'Destination as the user said it, or a saved place label.' },
        when: {
          type: 'string',
          description:
            'Free text time exactly as the user phrased it, e.g. "tomorrow around 9", "in 20 minutes", "friday evening", "now". Do NOT convert to a date yourself.',
        },
      },
      required: ['to'],
    },
  },
  {
    name: 'book_trip',
    description:
      'Lock in one of the options from the most recent plan_trip. Only call after the user picks. Sends the route card to the user itself — after this succeeds, reply with no text at all.',
    parameters: {
      type: 'object',
      properties: {
        option_index: { type: 'integer', description: 'The 1-based number the user picked.' },
      },
      required: ['option_index'],
    },
  },
  {
    name: 'get_status',
    // No parameters on purpose: asking Llama to echo a uuid is how you get a
    // malformed tool call. It always means "the next upcoming trip".
    description:
      "Live status of the user's next booked trip: on time or delayed, platform, minutes until departure, arrival time. Use for 'will i make it', 'is my train on time', 'what's next'. Takes no arguments.",
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'set_reminder',
    description: 'Change the departure reminder on the next booked trip.',
    parameters: {
      type: 'object',
      properties: {
        minutes_before: { type: 'integer', description: 'How many minutes before departure to ping.' },
      },
      required: ['minutes_before'],
    },
  },
  {
    name: 'remember_place',
    description:
      'Save a station under a nickname so "take me home" works later. Use when the user says "call this home" or agrees when offered.',
    parameters: {
      type: 'object',
      properties: {
        label: { type: 'string', description: 'Short nickname: home, work, gym, mom.' },
        place: { type: 'string', description: 'The station or place name to resolve and save.' },
      },
      required: ['label', 'place'],
    },
  },
  {
    name: 'list_trips',
    description: "What the user has booked. Use for 'what do i have coming up'.",
    parameters: {
      type: 'object',
      properties: {
        window: { type: 'string', enum: ['upcoming', 'past'], description: 'Defaults to upcoming.' },
      },
    },
  },
];

// ---------------------------------------------------------------------------
// Implementations
// ---------------------------------------------------------------------------

export type ToolContext = {
  deps: Deps;
  userId: string;
  phone: string;
  chatId: string | null;
  now: Date;
};

type ToolFn = (args: Record<string, unknown>, ctx: ToolContext) => Promise<Record<string, unknown>>;

const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
const int = (v: unknown): number | undefined => {
  const n = typeof v === 'number' ? v : Number(str(v));
  return Number.isFinite(n) ? Math.round(n) : undefined;
};

/** Resolve "home"/"work" against saved places first, then Rejseplanen. */
async function resolvePlace(text: string, ctx: ToolContext): Promise<StationRef | null> {
  const places = await ctx.deps.db.getUserPlaces(ctx.userId);
  const hit = places.find((p) => p.label.toLowerCase() === text.toLowerCase().replace(/^my\s+/, ''));
  if (hit) return { id: hit.station_id, name: hit.station_name };
  return findStation(text);
}

const planTrip: ToolFn = async (args, ctx) => {
  const toText = str(args.to);
  if (!toText) return { ok: false, error: 'no destination given — ask the user where they want to go' };

  const places = await ctx.deps.db.getUserPlaces(ctx.userId);
  const home = places.find((p) => p.label.toLowerCase() === 'home');
  const fromText = str(args.from) ?? home?.label ?? 'København H';

  const [from, to] = await Promise.all([resolvePlace(fromText, ctx), resolvePlace(toText, ctx)]);
  if (!from) return { ok: false, error: `couldn't find a station matching "${fromText}"`, unresolved: 'from' };
  if (!to) return { ok: false, error: `couldn't find a station matching "${toText}"`, unresolved: 'to' };
  if (from.id === to.id) return { ok: false, error: 'origin and destination are the same station' };

  const when = parseWhen(str(args.when), ctx.now);
  const { options, source } = await journeys(from, to, { when: when.date, arriveBy: when.arriveBy, results: 3 });

  if (options.length === 0) {
    return { ok: false, error: `no journeys found ${from.name} → ${to.name} around ${time(when.date.toISOString())}` };
  }

  rememberPlan(ctx.userId, options);
  console.log(`[B][tool] plan_trip ${ctx.userId} ${from.name}→${to.name} (${source}) ${options.length} options`);

  return {
    ok: true,
    source,
    terminal: true, // handleTurn sends `display` as-is; no second LLM round trip
    display: renderOptions(options),
    options: options.map((o) => ({
      index: o.index,
      depart: time(o.departAt),
      arrive: time(o.arriveAt),
      duration_minutes: o.durationMinutes,
      transfers: o.transfers,
      price_kr: o.priceKr ?? null,
    })),
  };
};

const bookTrip: ToolFn = async (args, ctx) => {
  const idx = int(args.option_index);
  const options = recallPlan(ctx.userId);
  if (!options) return { ok: false, error: 'no recent plan to book from — run plan_trip again first' };
  const chosen = options.find((o) => o.index === idx);
  if (!chosen) return { ok: false, error: `option ${idx} isn't on the list — the options are 1..${options.length}` };

  // Idempotency. Without this, any later turn that mentions the trip can talk
  // the model into re-booking it, and the user gets a second card out of
  // nowhere. Seen in testing on "will i make it?".
  const already = (await ctx.deps.db.getUpcomingTrips(ctx.userId)).find(
    (t) => t.depart_at === chosen.departAt && t.to_station_id === chosen.destination.id,
  );
  if (already) {
    return {
      ok: false,
      already_booked: true,
      trip_id: already.id,
      error:
        'this exact trip is already booked — do NOT send another card. if the user asked a question about it, call get_status now and answer from that.',
    };
  }

  const deepLink = buildTicketLink(chosen);

  const trip = await ctx.deps.db.createTrip({
    user_id: ctx.userId,
    from_station_id: chosen.origin.id,
    to_station_id: chosen.destination.id,
    depart_at: chosen.departAt,
    arrive_at: chosen.arriveAt,
    legs_json: chosen.legs,
    deep_link_url: deepLink,
  });

  const fireAt = new Date(new Date(chosen.departAt).getTime() - REMINDER_MINUTES_DEFAULT * 60_000);
  if (fireAt.getTime() > ctx.now.getTime()) {
    await ctx.deps.db.createReminder(trip.id, fireAt.toISOString(), renderReminder(chosen, REMINDER_MINUTES_DEFAULT));
  }

  if (!ctx.chatId) {
    return { ok: false, error: 'no chat id on file for this user — cannot send the route card' };
  }

  const sessionId = await ctx.deps.db.createSession(trip.id, ctx.chatId);
  const copy = cardCopy(chosen);
  const url = `${ctx.deps.publicAppUrl.replace(/\/$/, '')}/map/${sessionId}?s=${sessionId}`;

  try {
    await ctx.deps.linq.sendMapCard(ctx.phone, { sessionId, url, ...copy });
  } catch (err) {
    console.error('[B][tool] book_trip card send failed, falling back to plain link', err);
    await ctx.deps.linq.sendChatText(ctx.chatId, `locked in — ${copy.title.toLowerCase()}, ${copy.subtitle.toLowerCase()}.\ntickets: ${deepLink}`);
    return { ok: true, card_sent: false, reply_already_sent: true, trip_id: trip.id };
  }

  console.log(`[B][tool] book_trip ${ctx.userId} trip=${trip.id} session=${sessionId} vendor=${ticketVendor(chosen)}`);
  return {
    ok: true,
    card_sent: true,
    reply_already_sent: true,
    trip_id: trip.id,
    instruction: 'The route card has been delivered. Reply with an empty message — send no text.',
  };
};

const getStatus: ToolFn = async (args, ctx) => {
  const tripId = str(args.trip_id);
  // The model likes to echo the shortened id it saw in the prompt, so a miss
  // here falls back to the next upcoming trip rather than erroring.
  const trip =
    (tripId ? await ctx.deps.db.getTripById(tripId) : null) ??
    (await ctx.deps.db.getUpcomingTrips(ctx.userId))[0] ??
    null;

  if (!trip) return { ok: false, error: 'no upcoming trip on file for this user' };

  const first = trip.legs_json?.[0];
  let delayMinutes = 0;
  let platform = first?.departPlatform;

  if (first) {
    const board = await departures(first.origin, new Date(new Date(trip.depart_at).getTime() - 20 * 60_000));
    const match = board.find(
      (d) => Math.abs(new Date(d.plannedAt).getTime() - new Date(trip.depart_at).getTime()) < 6 * 60_000,
    );
    if (match) {
      delayMinutes = match.delayMinutes;
      platform = match.platform ?? platform;
    }
  }

  return {
    ok: true,
    display: renderStatus(trip, delayMinutes, platform),
    minutes_until_departure: minutesFromNow(trip.depart_at, ctx.now),
    delay_minutes: delayMinutes,
    arrive_at: time(trip.arrive_at),
  };
};

const setReminder: ToolFn = async (args, ctx) => {
  const minutes = int(args.minutes_before) ?? REMINDER_MINUTES_DEFAULT;
  const tripId = str(args.trip_id);
  const trip = tripId
    ? await ctx.deps.db.getTripById(tripId)
    : (await ctx.deps.db.getUpcomingTrips(ctx.userId))[0] ?? null;
  if (!trip) return { ok: false, error: 'no upcoming trip to attach a reminder to' };

  const fireAt = new Date(new Date(trip.depart_at).getTime() - minutes * 60_000);
  if (fireAt.getTime() <= ctx.now.getTime()) {
    return { ok: false, error: `that's already passed — departure is in ${minutesFromNow(trip.depart_at, ctx.now)} min` };
  }

  const options = recallPlan(ctx.userId);
  const chosen = options?.find((o) => o.departAt === trip.depart_at);
  const body = chosen
    ? renderReminder(chosen, minutes)
    : `🕘 leave in ${minutes} min — ${trip.from_station_name ?? 'your station'} ${time(trip.depart_at)}.`;

  await ctx.deps.db.createReminder(trip.id, fireAt.toISOString(), body);
  return {
    ok: true,
    terminal: true,
    fires_at: time(fireAt.toISOString()),
    minutes_before: minutes,
    display: `done — i'll ping you at ${time(fireAt.toISOString())}, ${minutes} min before you need to leave.`,
  };
};

const CPR = /\b\d{6}[-\s]?\d{4}\b/;
const CARD = /\b\d{13,19}\b/;

const rememberPlace: ToolFn = async (args, ctx) => {
  const label = str(args.label)?.toLowerCase();
  const place = str(args.place);
  if (!label || !place) return { ok: false, error: 'need both a label and a place' };
  // Memory.md §6 — never let sensitive patterns into long-term memory.
  if (CPR.test(label) || CPR.test(place) || CARD.test(label) || CARD.test(place)) {
    return { ok: false, error: 'that looks like personal id or card data — not saving it' };
  }

  const station = await findStation(place);
  if (!station) return { ok: false, error: `couldn't find a station matching "${place}"` };

  await ctx.deps.db.savePlace(ctx.userId, label, station.id, station.name);
  console.log(`[B][tool] remember_place ${ctx.userId} ${label}=${station.name}`);
  return {
    ok: true,
    terminal: true, // saves an LLM round trip — the confirmation writes itself
    label,
    station_name: station.name,
    display: `got it — ${station.name.toLowerCase()} is your ${label} now. say "take me ${label}" any time.`,
  };
};

const listTrips: ToolFn = async (args, ctx) => {
  const window = str(args.window) === 'past' ? 'past' : 'upcoming';
  const trips =
    window === 'past' ? await ctx.deps.db.getPastTrips(ctx.userId, 5) : await ctx.deps.db.getUpcomingTrips(ctx.userId);
  return { ok: true, terminal: true, count: trips.length, display: renderTripList(trips, window) };
};

export const TOOL_IMPLS: Record<string, ToolFn> = {
  plan_trip: planTrip,
  book_trip: bookTrip,
  get_status: getStatus,
  set_reminder: setReminder,
  remember_place: rememberPlace,
  list_trips: listTrips,
};

export async function runTool(name: string, args: Record<string, unknown>, ctx: ToolContext): Promise<Record<string, unknown>> {
  const impl = TOOL_IMPLS[name];
  if (!impl) return { ok: false, error: `unknown tool "${name}"` };
  try {
    return await impl(args, ctx);
  } catch (err) {
    console.error(`[B][tool] ${name} threw:`, err);
    return { ok: false, error: `${name} failed: ${err instanceof Error ? err.message : String(err)}` };
  }
}
