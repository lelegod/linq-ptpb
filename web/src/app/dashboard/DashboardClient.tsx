"use client";

import { useCallback, useState } from "react";
import { AuthCodeHandler } from "@/components/auth/AuthCodeHandler";
import { readPendingName } from "@/lib/auth/onboarding";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function DashboardClient({ messagesHref }: { messagesHref: string }) {
  const [greeting, setGreeting] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const onAuthReady = useCallback(async (sessionEmail: string | null) => {
    setEmail(sessionEmail);
    const sb = getSupabaseBrowser();
    if (!sb) {
      const n = readPendingName();
      if (n) setGreeting(n);
      return;
    }
    const { data } = await sb.auth.getSession();
    const user = data.session?.user;
    if (user) {
      const meta = user.user_metadata as {
        full_name?: string;
        name?: string;
      };
      const fromMeta = meta.full_name || meta.name || null;
      if (fromMeta) {
        setGreeting(fromMeta);
        return;
      }
    }
    const n = readPendingName();
    if (n) setGreeting(n);
  }, []);

  return (
    <div className="space-y-8">
      <AuthCodeHandler onReady={onAuthReady} />
      <header>
        <p className="font-data text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
          Dashboard
        </p>
        <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.03em] sm:text-[40px]">
          {greeting ? `Welcome, ${greeting}` : "Welcome to Rejsy"}
        </h1>
        <p className="mt-2 text-[15px] text-[var(--slate)]">
          {email
            ? `Signed in as ${email}.`
            : "Your home base for trips and integrations."}{" "}
          Planning still happens in Messages — this page is for account &
          connections.
        </p>
      </header>

      <section className="rounded-[12px] border border-dashed border-[var(--red)]/35 bg-white p-6">
        <h2 className="text-[20px] font-semibold tracking-[-0.02em]">
          Connected integrations
        </h2>
        <p className="mt-2 text-[14px] leading-[1.55] text-[var(--slate)]">
          Link operator accounts here when they ship. Planning stays in
          Messages; tickets stay with the operators.
        </p>
        <ul className="mt-5 space-y-2">
          {[
            { name: "DSB", detail: "Tickets & travel card — coming soon" },
            { name: "Rejsekort", detail: "Coming soon" },
            { name: "DOT / Movia", detail: "Coming soon" },
          ].map((item) => (
            <li
              key={item.name}
              className="flex items-center justify-between rounded-[10px] border border-[var(--line)] bg-[var(--paper)] px-4 py-3"
            >
              <div>
                <p className="text-[14px] font-semibold">{item.name}</p>
                <p className="text-[12px] text-[var(--muted)]">{item.detail}</p>
              </div>
              <span className="rounded-[8px] bg-[var(--red-soft)] px-2.5 py-1 font-data text-[9px] uppercase tracking-[0.06em] text-[var(--red)]">
                Soon
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <a
          href={messagesHref}
          className="rounded-[10px] bg-[var(--red)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90"
        >
          Text Rejsy
        </a>
        <a
          href="/docs"
          className="rounded-[10px] px-5 py-2.5 text-[14px] font-semibold ring-1 ring-[var(--line)] hover:bg-white"
        >
          Read the docs
        </a>
      </div>
    </div>
  );
}
