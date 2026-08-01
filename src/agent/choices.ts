// [B] Tapback → option choice.
//
// Each trip option is its own bubble (bubbles.ts), so reacting to one is an
// unambiguous "I pick that train". We remember which Linq message id carried
// which option number, and a reaction resolves back to it.
//
// In-process, like everything else pre-Supabase: a restart forgets, and the
// user falls back to replying "1". That's an acceptable failure mode — the
// text path always works.

const TTL_MS = Number(process.env.CHOICE_TTL_MS ?? 30 * 60_000);
/** Plenty for a demo; keeps a long-lived process from growing without bound. */
const MAX_ENTRIES = 500;

type Choice = { userId: string; optionIndex: number; at: number };

const byMessageId = new Map<string, Choice>();

/** "1️⃣  19:03 → 19:20 · 17m · direct" → 1. Null for any other bubble. */
export function optionIndexInBubble(text: string): number | null {
  const m = text.trimStart().match(/^([1-9])️?⃣/);
  if (m) return Number(m[1]);

  // optionMarker() falls back to "10." past 9️⃣.
  const plain = text.trimStart().match(/^(\d{1,2})\.\s/);
  return plain ? Number(plain[1]) : null;
}

function evict(): void {
  const cutoff = Date.now() - TTL_MS;
  for (const [id, c] of byMessageId) {
    if (c.at < cutoff) byMessageId.delete(id);
  }
  while (byMessageId.size > MAX_ENTRIES) {
    const oldest = byMessageId.keys().next().value;
    if (oldest === undefined) break;
    byMessageId.delete(oldest);
  }
}

/**
 * Called after a reply is sent, with the bubbles and the message ids Linq
 * assigned them (same order). Only bubbles that actually lead with an option
 * marker get registered.
 */
export function rememberBubbles(
  userId: string,
  bubbles: string[],
  ids: Array<string | null>,
): void {
  bubbles.forEach((text, i) => {
    const id = ids[i];
    const optionIndex = optionIndexInBubble(text);
    if (!id || optionIndex === null) return;
    byMessageId.set(id, { userId, optionIndex, at: Date.now() });
  });
  evict();
}

/** The option a tapback on this message means, if we still know. */
export function optionForMessage(userId: string, messageId: string): number | null {
  const c = byMessageId.get(messageId);
  if (!c || c.userId !== userId) return null;
  if (Date.now() - c.at > TTL_MS) {
    byMessageId.delete(messageId);
    return null;
  }
  return c.optionIndex;
}

/** Tests only. */
export function _reset(): void {
  byMessageId.clear();
}
