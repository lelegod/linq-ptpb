// [B] Replaces the placeholder. Signature unchanged on purpose — routes/inbound.ts
// calls this and nothing else, so A's file needs no edit.
//
// The real loop lives in runTurn.ts; this is the adapter that plugs it into the
// team's User shape and A's sendMessage().

import type { User } from '../db/users';
import { sendMessage } from './sendMessage';
import { startTyping, stopTyping } from './linq';
import { handleTurnDetailed } from './runTurn';
import { getDeps } from './deps';

export async function handleTurn(user: User, text: string): Promise<void> {
  void startTyping(user.linq_chat_id); // fire-and-forget, don't block the reply

  try {
    const { reply, toolCalls } = await handleTurnDetailed(
      user.phone,
      text,
      user.linq_chat_id,
      getDeps(),
    );

    // An empty reply means the turn already answered — book_trip sent the map
    // card itself, and Design.md §2.2 says the card IS the reply. Sending
    // anything here staples a redundant text onto it.
    if (!reply) return;

    await sendMessage(user.id, user.linq_chat_id, reply, { toolCalls });
  } catch (err) {
    console.error('[B][handleTurn] fell over:', err);
    await sendMessage(
      user.id,
      user.linq_chat_id,
      'my brain just dropped a connection — try that once more?',
    ).catch(() => {});
  } finally {
    void stopTyping(user.linq_chat_id);
  }
}
