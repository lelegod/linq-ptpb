import { logMessage } from '../db/messages';
import { sendChatText } from './linq';
import { splitIntoBubbles } from './bubbles';
import { rememberBubbles } from './choices';

// Log before the network call so a silent Linq failure still leaves a record of
// intent (Architecture.md §7). We log the whole reply once, not once per
// bubble — the bubble split is a presentation detail and lives in linq.ts, so
// that the tool layer and cron reminders get it too.
export async function sendMessage(
  userId: string,
  chatId: string,
  text: string,
  opts?: { effect?: string; toolCalls?: unknown }
): Promise<void> {
  await logMessage(userId, 'out', text, opts?.toolCalls);
  const ids = await sendChatText(chatId, text, opts?.effect ? { effect: opts.effect } : undefined);

  // splitIntoBubbles is deterministic, so re-running it here yields exactly the
  // bubbles sendChatText posted — index-aligned with the ids it returned.
  // Registers option bubbles so a tapback on one counts as picking it.
  rememberBubbles(userId, splitIntoBubbles(text), ids);
}
