// TODO(D): replace with Supabase (Architecture.md §3, `messages` table).
// One row per inbound OR outbound, never batched (Memory.md §5).

export type Direction = 'in' | 'out';

export async function logMessage(
  userId: string,
  direction: Direction,
  body: string,
  toolCalls?: unknown
): Promise<void> {
  console.log(
    `[msg] ${direction === 'in' ? 'IN ' : 'OUT'} ${userId}: ${body}` +
      (toolCalls ? ` | tools=${JSON.stringify(toolCalls)}` : '')
  );
}
