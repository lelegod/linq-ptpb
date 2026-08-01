import { logMessage } from '../db/messages';
import { sendChatText } from './linq';

// Log before the network call so a silent Linq failure still leaves a record of
// intent (Architecture.md §7).
export async function sendMessage(
  userId: string,
  chatId: string,
  text: string,
  opts?: { effect?: string; toolCalls?: unknown }
): Promise<void> {
  await logMessage(userId, 'out', text, opts?.toolCalls);
  await sendChatText(chatId, text, opts?.effect ? { effect: opts.effect } : undefined);
}
