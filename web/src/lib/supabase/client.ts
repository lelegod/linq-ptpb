import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null | undefined;

export function getSupabaseEnv(): {
  url: string | undefined;
  anonKey: string | undefined;
  configured: boolean;
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || undefined;
  const configured = Boolean(
    url &&
      anonKey &&
      !/YOUR-|XXXX|placeholder|example\.com/i.test(url) &&
      !/YOUR-|XXXX|placeholder/i.test(anonKey),
  );
  return { url, anonKey, configured };
}

/** Browser Supabase client, or null when env is missing / placeholder. */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (browserClient !== undefined) return browserClient;
  const { url, anonKey, configured } = getSupabaseEnv();
  if (!configured || !url || !anonKey) {
    browserClient = null;
    return null;
  }
  browserClient = createClient(url, anonKey);
  return browserClient;
}
