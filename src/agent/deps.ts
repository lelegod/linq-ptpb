// [B] Wires the agent core to whatever the rest of the team has actually built.
//
// Today: A's real Linq client + an in-memory store for everything D hasn't
// shipped yet. When D lands /src/db/*.ts against the Supabase schema, swap the
// `db:` line for their module — nothing in tools.ts or runTurn.ts changes.

import type { Deps, Db } from './ports';
import { createMemoryDb } from './ports';
import { sendChatText, sendMapCard, startTyping, stopTyping } from './linq';

let cached: Deps | null = null;

// Survives across turns for the life of the process. A restart wipes places,
// trips and reminders — same limitation as A's existing db/users.ts.
const memoryDb: Db = createMemoryDb();

export function getDeps(): Deps {
  if (cached) return cached;

  cached = {
    db: memoryDb,
    linq: {
      // sendChatText now returns the per-bubble message ids (for tapbacks);
      // the port contract is void, so swallow them here. Callers that need the
      // ids — sendMessage.ts — import linq.ts directly.
      sendChatText: async (chatId, text, opts) => {
        await sendChatText(chatId, text, opts);
      },
      // A's sendMapCard builds the URL from PUBLIC_APP_URL itself, so we drop
      // the one the tool computed and pass the parts it wants.
      sendMapCard: (toPhone, card) =>
        sendMapCard(toPhone, {
          sessionId: card.sessionId,
          title: card.title,
          subtitle: card.subtitle,
          button: card.button,
        }),
      startTyping,
      stopTyping,
    },
    publicAppUrl: process.env.PUBLIC_APP_URL ?? 'http://localhost:3000',
  };

  return cached;
}
