"use client";

import { useEffect, useRef } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  clearPendingName,
  readPendingName,
} from "@/lib/auth/name";

/**
 * Exchanges ?code= for a session and persists pending onboarding name
 * into user_metadata when present.
 */
export function AuthCodeHandler({
  onReady,
}: {
  onReady?: (email: string | null) => void;
}) {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const sb = getSupabaseBrowser();
    if (!sb) {
      onReady?.(null);
      return;
    }

    (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        await sb.auth.exchangeCodeForSession(code);
        const clean = new URL(window.location.href);
        clean.searchParams.delete("code");
        clean.searchParams.delete("error");
        clean.searchParams.delete("error_description");
        window.history.replaceState({}, "", clean.pathname + clean.search);
      }

      const pending = readPendingName();
      if (pending) {
        const { data } = await sb.auth.getUser();
        if (data.user) {
          await sb.auth.updateUser({
            data: { full_name: pending, name: pending },
          });
          clearPendingName();
        }
      }

      const { data } = await sb.auth.getSession();
      onReady?.(data.session?.user.email ?? null);
    })();
  }, [onReady]);

  return null;
}
