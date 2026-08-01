import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

/** Server Supabase client for Route Handlers / Server Components, or null if unset. */
export async function getSupabaseServer(): Promise<SupabaseClient | null> {
  const { url, anonKey, configured } = getSupabaseEnv();
  if (!configured || !url || !anonKey) return null;

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — proxy refreshes sessions.
        }
      },
    },
  });
}
