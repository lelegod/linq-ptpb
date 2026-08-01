import type { Request, Response } from 'express';
import { getOrCreateUser } from '../db/users';
import { logMessage } from '../db/messages';
import { handleTurn } from '../agent/handleTurn';
import { optionForMessage } from '../agent/choices';

// Verified against a real Linq delivery (webhook version 2026-02-03).
// Corrects two fields Architecture.md §2.1 had wrong:
//   sender is `data.sender_handle.handle`, not `data.from`
//   text parts are `data.parts[]`, not `data.message.parts[]`
interface LinqWebhookPayload {
  event_type?: string;
  data?: {
    id?: string;
    direction?: 'inbound' | 'outbound';
    chat?: { id?: string; is_group?: boolean };
    sender_handle?: { handle?: string; is_me?: boolean; service?: string };
    parts?: Array<{ type?: string; value?: string }>;
    // Tapback fields. Linq's exact naming for these is NOT documented and has
    // not been seen on the wire yet, so we accept every plausible spelling and
    // log anything we fail to recognise. Set DEBUG_WEBHOOK=1 and react to a
    // message to capture the real shape, then delete the guesses that missed.
    reaction?: string;
    associated_message_id?: string;
    associated_message_guid?: string;
    target_message_id?: string;
    in_reply_to_id?: string;
    replied_to_message_id?: string;
  };
}

/** The message a tapback is attached to, whichever field Linq happens to use. */
function reactionTargetId(d: NonNullable<LinqWebhookPayload['data']>): string | undefined {
  return (
    d.associated_message_id ??
    d.associated_message_guid ??
    d.target_message_id ??
    d.in_reply_to_id ??
    d.replied_to_message_id
  );
}

function isReaction(body: LinqWebhookPayload): boolean {
  const type = String(body.event_type ?? '').toLowerCase();
  if (type.includes('reaction') || type.includes('tapback')) return true;
  const d = body.data ?? {};
  if (d.reaction) return true;
  return Boolean(reactionTargetId(d) && !d.parts?.some((p) => p.type === 'text' && p.value?.trim()));
}

export async function handleInbound(req: Request, res: Response): Promise<void> {
  // Ack before doing any work — Linq retries on timeout and a turn can take seconds.
  res.status(200).send('ok');

  const body = req.body as LinqWebhookPayload;
  const d = body?.data ?? {};

  // DEBUG_WEBHOOK=1 dumps the raw delivery. This is how you discover the
  // tapback payload shape: turn it on, react to a trip option, read the log.
  if (process.env.DEBUG_WEBHOOK === '1') {
    console.log('[inbound][raw]', JSON.stringify(body));
  }

  // Our own sends echo back here as direction:"outbound" / is_me:true.
  // Acting on those would infinite-loop.
  //
  // Reject only an EXPLICIT outbound: a reaction delivery may well omit
  // `direction` entirely, and the old `!== 'inbound'` test would have dropped
  // every tapback before we ever looked at it. is_me still stops the loop.
  if (d.sender_handle?.is_me) return;
  if (d.direction && d.direction !== 'inbound') return;

  const from = d.sender_handle?.handle;
  const chatId = d.chat?.id;
  if (!from || !chatId) {
    console.warn('[inbound] no sender or chat', { from, chatId });
    return;
  }

  const text = d.parts?.find((p) => p.type === 'text')?.value?.trim() ?? '';

  try {
    const user = await getOrCreateUser(from, chatId);

    // A tapback on a trip option means "I pick that one". Resolve it to the
    // option number and run the ordinary turn — replying "2" and reacting to
    // the 2️⃣ bubble take exactly the same path from here.
    if (isReaction(body)) {
      const targetId = reactionTargetId(d);
      const option = targetId ? optionForMessage(user.id, targetId) : null;

      if (option === null) {
        console.warn('[inbound] reaction ignored — no option for message', {
          targetId,
          reaction: d.reaction,
        });
        return;
      }

      console.log(`[inbound] reaction ${d.reaction ?? '?'} on ${targetId} → option ${option}`);
      await logMessage(user.id, 'in', `(reacted → ${option})`);
      await handleTurn(user, String(option));
      return;
    }

    if (!text) {
      console.warn('[inbound] no actionable content', { from, chatId });
      return;
    }

    await logMessage(user.id, 'in', text);
    await handleTurn(user, text);
  } catch (err) {
    console.error('[inbound] turn failed:', err);
  }
}
