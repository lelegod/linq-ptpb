"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser, getSupabaseEnv } from "@/lib/supabase/client";

type Mode = "magic" | "password";

function nextPath(): string {
  if (typeof window === "undefined") return "/dashboard";
  const n = new URLSearchParams(window.location.search).get("next");
  return n && n.startsWith("/") ? n : "/dashboard";
}

export function LoginClient() {
  const router = useRouter();
  const { configured } = getSupabaseEnv();
  const [mode, setMode] = useState<Mode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    const { data } = await sb.auth.getSession();
    setSessionEmail(data.session?.user.email ?? null);
  }, []);

  useEffect(() => {
    if (!configured) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;

    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err && err !== "auth_config") {
      setError(decodeURIComponent(err));
    }

    let cancelled = false;
    (async () => {
      // Fallback: older flows may land here with ?code= (primary exchange is /auth/callback).
      const code = params.get("code");
      if (code) {
        const { error: exchangeErr } =
          await sb.auth.exchangeCodeForSession(code);
        if (!cancelled && exchangeErr) setError(exchangeErr.message);
        else if (!cancelled) {
          window.history.replaceState({}, "", "/login");
          router.replace(nextPath());
          router.refresh();
          return;
        }
        window.history.replaceState({}, "", "/login");
      }
      if (!cancelled) await refreshSession();
    })();

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user.email ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [configured, refreshSession, router]);

  if (!configured) {
    return (
      <div className="rounded-[12px] border border-dashed border-[var(--line)] bg-white p-6 sm:p-8">
        <h2 className="text-[22px] font-semibold tracking-[-0.02em]">
          Supabase not configured
        </h2>
        <p className="mt-2 text-[14px] leading-[1.6] text-[var(--slate)]">
          Add these to{" "}
          <code className="font-data text-[12px]">web/.env.local</code> and
          restart the dev server:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-[var(--paper)] p-4 font-data text-[12px] leading-relaxed text-[var(--ink)] ring-1 ring-[var(--line)]">
          {`NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`}
        </pre>
        <p className="mt-4 text-[13px] text-[var(--muted)]">
          Auth stays off until both values are set — the rest of the site keeps
          working.
        </p>
      </div>
    );
  }

  async function onMagic(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setStatus(null);
    const sb = getSupabaseBrowser();
    if (!sb) return;
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath())}`;
    const { error: err } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setStatus("Check your email for a magic link.");
  }

  async function onPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setStatus(null);
    const sb = getSupabaseBrowser();
    if (!sb) return;
    const { error: signInErr } = await sb.auth.signInWithPassword({
      email,
      password,
    });
    if (!signInErr) {
      setBusy(false);
      setStatus("Signed in.");
      await refreshSession();
      router.replace(nextPath());
      router.refresh();
      return;
    }
    const { error: signUpErr } = await sb.auth.signUp({ email, password });
    setBusy(false);
    if (signUpErr) {
      setError(signInErr.message || signUpErr.message);
      return;
    }
    setStatus("Account created — check email if confirmation is required.");
    await refreshSession();
  }

  async function onSignOut() {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    await sb.auth.signOut();
    setSessionEmail(null);
    setStatus("Signed out.");
  }

  return (
    <div className="space-y-6">
      {sessionEmail ? (
        <div className="rounded-[20px] border border-[var(--line)] bg-white p-6">
          <p className="text-[14px] text-[var(--slate)]">
            Signed in as{" "}
            <span className="font-semibold text-[var(--ink)]">
              {sessionEmail}
            </span>
          </p>
          <button
            type="button"
            onClick={() => void onSignOut()}
            className="mt-4 rounded-full bg-[var(--ink)] px-5 py-2.5 text-[13px] font-semibold text-white"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="rounded-[20px] border border-[var(--line)] bg-white p-6 sm:p-8">
          <div className="flex gap-2 rounded-full bg-[var(--paper)] p-1 ring-1 ring-[var(--line)]">
            {(
              [
                ["magic", "Magic link"],
                ["password", "Email & password"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                className={`flex-1 rounded-full px-3 py-2 text-[13px] font-medium transition-colors ${
                  mode === id
                    ? "bg-[var(--ink)] text-white"
                    : "text-[var(--slate)] hover:text-[var(--ink)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              const sb = getSupabaseBrowser();
              if (!sb) {
                setBusy(false);
                return;
              }
              const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath())}`;
              const { error: err } = await sb.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo },
              });
              if (err) {
                setBusy(false);
                setError(err.message);
              }
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] py-3 text-[14px] font-semibold disabled:opacity-60"
          >
            Continue with Google
          </button>

          <div className="my-4 flex items-center gap-3 text-[12px] text-[var(--muted)]">
            <span className="h-px flex-1 bg-[var(--line)]" />
            or email
            <span className="h-px flex-1 bg-[var(--line)]" />
          </div>

          <form
            className="space-y-4"
            onSubmit={mode === "magic" ? onMagic : onPassword}
          >
            <label className="block">
              <span className="text-[12px] font-medium text-[var(--slate)]">
                Email
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-[15px] outline-none focus:border-[var(--ink)]"
              />
            </label>
            {mode === "password" && (
              <label className="block">
                <span className="text-[12px] font-medium text-[var(--slate)]">
                  Password
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5 text-[15px] outline-none focus:border-[var(--ink)]"
                />
              </label>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-[var(--ink)] px-5 py-3 text-[14px] font-semibold text-white disabled:opacity-60"
            >
              {busy
                ? "Working…"
                : mode === "magic"
                  ? "Send magic link"
                  : "Continue"}
            </button>
          </form>

          {status && (
            <p className="mt-4 text-[13px] text-[var(--ontime)]" role="status">
              {status}
            </p>
          )}
          {error && (
            <p className="mt-4 text-[13px] text-[var(--red)]" role="alert">
              {error}
            </p>
          )}
        </div>
      )}

      <div className="rounded-[12px] border border-dashed border-[var(--red)]/35 bg-white p-6">
        <h2 className="text-[20px] font-semibold tracking-[-0.02em]">
          Connected integrations
        </h2>
        <p className="mt-2 text-[13px] leading-[1.55] text-[var(--slate)]">
          Link operator accounts here when they ship. Planning stays in
          Messages.
        </p>
        <ul className="mt-4 space-y-2">
          {[
            { name: "DSB", detail: "Tickets & travel card — coming soon" },
            { name: "Rejsekort", detail: "Coming soon" },
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
      </div>
    </div>
  );
}
