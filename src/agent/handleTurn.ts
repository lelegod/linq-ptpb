import type { User } from '../db/users';
import { sendMessage } from './sendMessage';
import { startTyping, stopTyping } from './linq';

// TODO(B): replace with the Claude Haiku + tool-calling loop (Architecture.md §2.2).
// Keep this signature — the inbound webhook calls this and nothing else.
const PLACEHOLDER_REPLY =
  "hey! i'm rejsy — this is a placeholder reply, the trip planner isn't wired up yet.";

export async function handleTurn(user: User, _text: string): Promise<void> {
  void startTyping(user.linq_chat_id); // fire-and-forget, don't block the reply

  try {
    await sendMessage(user.id, user.linq_chat_id, PLACEHOLDER_REPLY);
  } finally {
    void stopTyping(user.linq_chat_id);
  }
}
