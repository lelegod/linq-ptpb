import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

export { getSupabaseEnv } from "@/lib/supabase/env";

let browserClient: SupabaseClient | null | undefined;

/** Browser Supabase client, or null when env is missing / placeholder. */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (browserClient !== undefined) return browserClient;
  const { url, anonKey, configured } = getSupabaseEnv();
  if (!configured || !url || !anonKey) {
    browserClient = null;
    return null;
  }
  browserClient = createBrowserClient(url, anonKey);
  return browserClient;
}
