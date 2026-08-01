import { createClient } from "@supabase/supabase-js";

export async function resolveUpgradeToken(token: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Supabase env missing");
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("magic_tokens")
    .select("token, user_id, expires_at, used_at, users(phone)")
    .eq("token", token)
    .maybeSingle();
  if (error || !data) return null;
  if (data.used_at) return null;
  if (new Date(data.expires_at) < new Date()) return null;
  const users = data.users as { phone?: string } | { phone?: string }[] | null;
  const phone = Array.isArray(users) ? users[0]?.phone : users?.phone;
  return { userId: data.user_id as string, phone };
}

export function maskPhone(phone?: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone;
  const last4 = digits.slice(-4);
  return `+45 •• •• ${last4.slice(0, 2)} ${last4.slice(2)}`;
}
