import type { Request, Response } from 'express';
import { getOrCreateUser } from '../db/users';
import { logMessage } from '../db/messages';
import { handleTurn } from '../agent/handleTurn';

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
  };
}

export async function handleInbound(req: Request, res: Response): Promise<void> {
  // Ack before doing any work — Linq retries on timeout and a turn can take seconds.
  res.status(200).send('ok');

  const body = req.body as LinqWebhookPayload;
  const d = body?.data ?? {};

  // Our own sends echo back here as direction:"outbound" / is_me:true.
  // Acting on those would infinite-loop.
  if (body.event_type && body.event_type !== 'message.received') return;
  if (d.direction !== 'inbound') return;
  if (d.sender_handle?.is_me) return;

  const from = d.sender_handle?.handle;
  const chatId = d.chat?.id;
  const text = d.parts?.find((p) => p.type === 'text')?.value?.trim() ?? '';

  if (!from || !chatId || !text) {
    console.warn('[inbound] no actionable content', { from, chatId, hasText: Boolean(text) });
    return;
  }

  try {
    const user = await getOrCreateUser(from, chatId);
    await logMessage(user.id, 'in', text);
    await handleTurn(user, text);
  } catch (err) {
    console.error('[inbound] turn failed:', err);
  }
}
