// Bubble split: one agent reply becomes several iMessage bubbles, so Rejsy
// reads like a friend texting rather than a wall of chatbot text.
//
// Lives in its own module because linq.ts does the splitting and sendMessage.ts
// imports linq.ts — putting it in either would make a cycle.
//
// Set BUBBLE_SPLIT=0 to send everything as one bubble — the demo kill switch if
// Linq starts rate-limiting mid-stage.

const SPLIT_ENABLED = () => process.env.BUBBLE_SPLIT !== '0';
/** Past this many characters a paragraph gets broken at sentence boundaries. */
const maxChars = () => Number(process.env.BUBBLE_MAX_CHARS ?? 260);
/**
 * More bubbles than this reads as spam, not as texting. Six fits the worst
 * case we actually send: header + three itinerary options + picker.
 */
const maxBubbles = () => Number(process.env.BUBBLE_MAX_COUNT ?? 6);

/** Break one over-long paragraph after sentence enders, never mid-word. */
function splitSentences(paragraph: string, limit: number): string[] {
  const sentences = paragraph.match(/[^.!?…]+[.!?…]+\s*|[^.!?…]+$/g) ?? [paragraph];
  const out: string[] = [];

  for (const s of sentences) {
    const last = out[out.length - 1];
    if (last && (last + s).trim().length <= limit) {
      out[out.length - 1] = last + s;
    } else {
      out.push(s);
    }
  }
  return out.map((s) => s.trim()).filter(Boolean);
}

/**
 * Paragraphs first (a blank line is a deliberate break by the LLM or a
 * renderer), then sentence-split anything still too long.
 *
 * A bubble containing nothing but a URL is what makes iMessage render a rich
 * link preview, so callers that want the card put the link in its own
 * paragraph — see book_trip in tools.ts.
 */
export function splitIntoBubbles(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (!SPLIT_ENABLED()) return [trimmed];

  const limit = maxChars();
  const cap = maxBubbles();

  const paragraphs = trimmed.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const bubbles = paragraphs.flatMap((p) => {
    // Only ever sentence-split PROSE. A paragraph with its own newlines is a
    // pre-formatted block — an itinerary timeline — and breaking it is worse
    // than a long bubble. Danish stations abbreviate to "St.", which
    // splitSentences reads as a sentence end, so a Bella Center itinerary tore
    // in half at "Bella Center St. (Metro)".
    if (p.includes('\n')) return [p];
    return p.length > limit ? splitSentences(p, limit) : [p];
  });

  if (bubbles.length <= cap) return bubbles;

  // Overflow joins the last bubble rather than getting dropped — never lose
  // text the agent meant to send.
  return [...bubbles.slice(0, cap - 1), bubbles.slice(cap - 1).join('\n')];
}
