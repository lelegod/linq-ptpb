/**
 * Shared Supabase public env resolution.
 * Accepts classic anon JWT keys and newer sb_publishable_ keys.
 * Also reads NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as an alias.
 */
export function getSupabaseEnv(): {
  url: string | undefined;
  anonKey: string | undefined;
  configured: boolean;
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    undefined;
  const configured = Boolean(
    url &&
      anonKey &&
      !/YOUR-|XXXX|placeholder|example\.com/i.test(url) &&
      !/YOUR-|XXXX|placeholder|your_anon_key/i.test(anonKey),
  );
  return { url, anonKey, configured };
}
