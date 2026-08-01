// TODO(D): replace with Supabase (Architecture.md §3, `users` table).
// In-memory only — a restart wipes it. Keep the signature.

export interface User {
  id: string;
  phone: string;
  linq_chat_id: string;
  display_name?: string | null;
}

const users = new Map<string, User>();

export async function getOrCreateUser(phone: string, chatId: string): Promise<User> {
  const existing = users.get(phone);
  if (existing) {
    existing.linq_chat_id = chatId; // chat id can change between conversations
    return existing;
  }

  const user: User = { id: `u_${users.size + 1}`, phone, linq_chat_id: chatId };
  users.set(phone, user);
  return user;
}
