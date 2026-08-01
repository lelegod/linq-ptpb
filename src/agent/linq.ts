// Linq send API (Architecture.md §2.9, Rules.md §2.5).
// Actions go to handles (POST /v3/messages), text goes to chats (POST /v3/chats/{id}/messages).
// Mixing them up returns error 1005 — so does a chatId that isn't a UUID.

import { splitIntoBubbles } from './bubbles';

const LINQ_API_BASE = 'https://api.linqapp.com/api/partner/v3';

function linqHeaders(): Record<string, string> {
  const apiKey = process.env.LINQ_API_KEY;
  if (!apiKey) throw new Error('LINQ_API_KEY is not set');
  return { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
}

async function assertOk(res: Response, label: string): Promise<void> {
  if (!res.ok) {
    const body = await res.text().catch(() => '<no body>');
    throw new Error(`Linq ${label} failed: ${res.status} ${body}`);
  }
}

/** Back-to-back sends can land out of order in the thread. */
const bubbleGapMs = () => Number(process.env.BUBBLE_GAP_MS ?? 700);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * One POST, one bubble. Returns Linq's id for the created message so we can
 * tell which bubble a tapback landed on — Linq's exact response shape isn't
 * documented, so dig through the likely spots and return null rather than
 * failing the send.
 */
async function postOneBubble(
  chatId: string,
  text: string,
  opts?: { effect?: string }
): Promise<string | null> {
  const res = await fetch(`${LINQ_API_BASE}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: linqHeaders(),
    body: JSON.stringify({
      message: {
        parts: [{ type: 'text', value: text }],
        ...(opts?.effect ? { effect: opts.effect } : {}),
      },
    }),
  });
  await assertOk(res, 'sendChatText');

  try {
    const body: any = await res.json();
    const id = body?.data?.id ?? body?.id ?? body?.message?.id ?? body?.data?.message?.id;
    return id ? String(id) : null;
  } catch {
    return null; // send succeeded; we just can't track this one for tapbacks
  }
}

/**
 * Plain-text reply into an existing chat, split into bubbles.
 *
 * The split lives HERE, not in sendMessage(), because the tool layer and the
 * cron reminders call this directly and bypass sendMessage entirely —
 * book_trip returns an empty reply, so its confirmation never passes through
 * handleTurn. Splitting at the single choke point is what makes every path
 * behave the same.
 */
export async function sendChatText(
  chatId: string,
  text: string,
  opts?: { effect?: string }
): Promise<Array<string | null>> {
  const bubbles = splitIntoBubbles(text);
  if (bubbles.length === 0) return [];

  const ids: Array<string | null> = [];
  for (let i = 0; i < bubbles.length; i++) {
    // The effect rides the final bubble — confetti should land on the payoff,
    // not on the setup line.
    const isLast = i === bubbles.length - 1;
    ids.push(
      await postOneBubble(chatId, bubbles[i], isLast && opts?.effect ? { effect: opts.effect } : undefined),
    );
    if (!isLast) await sleep(bubbleGapMs());
  }
  return ids;
}

/**
 * Booking-flow action card that opens the map page (Architecture.md §2.10).
 * Handle-targeted — /v3/messages, NOT /v3/chats/{id}/messages.
 * UNTESTED. Linq may also reject ngrok-free domains as the card host.
 */
export async function sendMapCard(
  toPhone: string,
  opts: { sessionId: string; title: string; subtitle: string; button?: string }
): Promise<void> {
  const appUrl = process.env.PUBLIC_APP_URL;
  if (!appUrl) throw new Error('PUBLIC_APP_URL is not set');

  const res = await fetch(`${LINQ_API_BASE}/messages`, {
    method: 'POST',
    headers: linqHeaders(),
    body: JSON.stringify({
      to: [toPhone],
      message: {
        action: {
          experience: 'link',
          action: 'open',
          params: {
            url: `${appUrl}/map/${opts.sessionId}?s=${opts.sessionId}`,
            title: opts.title,
            subtitle: opts.subtitle,
            button: opts.button ?? 'See route',
          },
        },
      },
    }),
  });
  await assertOk(res, 'sendMapCard');
}

/**
 * Opens a brand-new chat (text only — a card here returns 1005).
 * UNTESTED and currently unused: the shared-line rule means the user texts first.
 */
export async function sendFirstMessage(toPhone: string, text: string): Promise<void> {
  const fromNumber = process.env.LINQ_FROM_NUMBER;
  if (!fromNumber) throw new Error('LINQ_FROM_NUMBER is not set');

  const res = await fetch(`${LINQ_API_BASE}/chats`, {
    method: 'POST',
    headers: linqHeaders(),
    body: JSON.stringify({
      from: fromNumber,
      to: [toPhone],
      message: { parts: [{ type: 'text', value: text }] },
    }),
  });
  await assertOk(res, 'sendFirstMessage');
}

// Cosmetic polish — swallow errors, these must never break a reply.
export async function startTyping(chatId: string): Promise<void> {
  await fetch(`${LINQ_API_BASE}/chats/${chatId}/typing`, {
    method: 'POST',
    headers: linqHeaders(),
  }).catch(() => {});
}

export async function stopTyping(chatId: string): Promise<void> {
  await fetch(`${LINQ_API_BASE}/chats/${chatId}/typing`, {
    method: 'DELETE',
    headers: linqHeaders(),
  }).catch(() => {});
}

export async function markRead(chatId: string): Promise<void> {
  await fetch(`${LINQ_API_BASE}/chats/${chatId}/read`, {
    method: 'POST',
    headers: linqHeaders(),
  }).catch(() => {});
}
