// [B] The turn loop. Person A calls handleTurn() from /api/inbound and sends
// whatever string comes back. An empty string means "we already replied"
// (book_trip sent a card) — A must NOT send anything in that case.

import type { LlmMessage, ToolCall } from './types';
import type { Deps } from './ports';
import { createMemoryDb, createConsoleLinq } from './ports';
import { chat } from './llm';
import { buildSystemPrompt, GREETING } from './systemPrompt';
import { TOOLS, runTool, type ToolContext } from './tools';

const MAX_ITERATIONS = 4;
// Memory.md §8 allows 20. Groq's free tier allows 12k tokens/MINUTE across all
// calls, and system prompt + tool schemas is already ~2k of that — so we ship 8.
// Raise it if you move to a paid tier.
const HISTORY_TURNS = Number(process.env.HISTORY_TURNS ?? 8);

let defaultDeps: Deps | null = null;

/** Person A / D: call this once at boot with the real db + linq implementations. */
export function configureAgent(deps: Deps) {
  defaultDeps = deps;
}

function fallbackDeps(): Deps {
  if (!defaultDeps) {
    console.warn('[B][agent] no deps configured — running on in-memory store, nothing will persist');
    defaultDeps = {
      db: createMemoryDb(),
      linq: createConsoleLinq(),
      publicAppUrl: process.env.PUBLIC_APP_URL ?? 'http://localhost:3000',
    };
  }
  return defaultDeps;
}

export type TurnResult = {
  /** Text for A to send. Empty string = already handled, send nothing. */
  reply: string;
  toolCalls: Array<{ name: string; args: Record<string, unknown> }>;
};

export async function handleTurnDetailed(
  fromHandle: string,
  message: string,
  chatId?: string | null,
  depsOverride?: Deps,
): Promise<TurnResult> {
  const deps = depsOverride ?? fallbackDeps();
  const now = new Date();
  const started = Date.now();

  const user = await deps.db.getOrCreateUser(fromHandle, chatId ?? null);
  const resolvedChatId = chatId ?? user.linq_chat_id ?? null;

  await deps.db.logMessage(user.id, 'in', message);

  // First ever message → fixed greeting, no LLM call. Fast and always on-brand.
  const history = await deps.db.getRecentMessages(user.id, HISTORY_TURNS + 1);
  const priorTurns = history.filter((m) => m.direction === 'out').length;
  if (priorTurns === 0 && /^\s*(hi|hey|hello|hej|yo|start|hi rejsy|hey rejsy)\b/i.test(message)) {
    await deps.db.logMessage(user.id, 'out', GREETING);
    return { reply: GREETING, toolCalls: [] };
  }

  const [places, upcomingTrips] = await Promise.all([
    deps.db.getUserPlaces(user.id),
    deps.db.getUpcomingTrips(user.id),
  ]);

  const system = buildSystemPrompt({ user, places, upcomingTrips, now });

  const messages: LlmMessage[] = history
    .filter((m) => m.body?.trim())
    .slice(-HISTORY_TURNS)
    .map((m): LlmMessage =>
      m.direction === 'in' ? { role: 'user', content: m.body } : { role: 'assistant', content: m.body },
    );
  // the current inbound is already in history via logMessage above; make sure it's last
  if (messages[messages.length - 1]?.role !== 'user') messages.push({ role: 'user', content: message });

  const ctx: ToolContext = { deps, userId: user.id, phone: user.phone, chatId: resolvedChatId, now };

  if (resolvedChatId && deps.linq.startTyping) {
    deps.linq.startTyping(resolvedChatId).catch(() => {});
  }

  const allToolCalls: Array<{ name: string; args: Record<string, unknown> }> = [];
  let reply = '';
  let alreadyReplied = false;

  try {
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const out = await chat({ system, messages, tools: TOOLS });

      if (out.toolCalls.length === 0) {
        reply = (out.text ?? '').trim();
        break;
      }

      messages.push({ role: 'assistant', content: out.text, toolCalls: out.toolCalls });

      let terminalDisplay: string | null = null;

      for (const call of out.toolCalls as ToolCall[]) {
        allToolCalls.push({ name: call.name, args: call.args });
        const result = await runTool(call.name, call.args, ctx);
        if (result.reply_already_sent) alreadyReplied = true;
        // A tool that pre-rendered the whole answer (option lists, trip lists)
        // short-circuits the loop: we send its text verbatim. That guarantees
        // Design.md formatting AND saves an entire LLM round trip — which on
        // Groq's free tier is the difference between a 1.5s reply and a 429.
        if (result.terminal && result.ok && typeof result.display === 'string' && !terminalDisplay) {
          terminalDisplay = result.display;
        }
        messages.push({
          role: 'tool',
          toolCallId: call.id,
          name: call.name,
          content: JSON.stringify(result).slice(0, 4000),
        });
      }

      // The card IS the reply — don't let the model tack text onto a booking.
      if (alreadyReplied) {
        reply = '';
        break;
      }

      if (terminalDisplay) {
        reply = terminalDisplay;
        break;
      }

      if (i === MAX_ITERATIONS - 1) {
        reply = "i got a bit tangled there — say that again and i'll take another run at it.";
      }
    }
  } catch (err) {
    console.error('[B][agent] turn failed:', err);
    reply = "my brain just dropped a connection — try that once more?";
  } finally {
    if (resolvedChatId && deps.linq.stopTyping) {
      deps.linq.stopTyping(resolvedChatId).catch(() => {});
    }
  }

  if (!alreadyReplied && !reply) {
    reply = "tell me where you're headed and roughly when — i'll take it from there.";
  }

  if (reply) await deps.db.logMessage(user.id, 'out', reply, allToolCalls);

  console.log(
    `[B][agent] turn done in ${Date.now() - started}ms · tools=${allToolCalls.map((t) => t.name).join(',') || 'none'} · replyLen=${reply.length}`,
  );

  return { reply, toolCalls: allToolCalls };
}

/**
 * The signature Phases.md promised Person A.
 * Returns '' when the reply was already delivered (booking card) — send nothing.
 */
export async function handleTurn(fromHandle: string, message: string, chatId?: string | null): Promise<string> {
  const { reply } = await handleTurnDetailed(fromHandle, message, chatId);
  return reply;
}
