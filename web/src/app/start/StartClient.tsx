"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { copy } from "@/content/copy";
import { getSupabaseBrowser, getSupabaseEnv } from "@/lib/supabase/client";

const NAME_KEY = "rejsy_onboarding_name";

type Step = "name" | "email";

export function StartClient() {
  const router = useRouter();
  const { configured } = getSupabaseEnv();
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const persistNameMeta = useCallback(async (fullName: string) => {
    const sb = getSupabaseBrowser();
    if (!sb || !fullName.trim()) return;
    await sb.auth.updateUser({
      data: { full_name: fullName.trim(), name: fullName.trim() },
    });
  }, []);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(NAME_KEY);
      if (saved) setName(saved);
    } catch {
      /* ignore */
    }

    if (!configured) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const err = params.get("error");
    if (err && err !== "auth_config") {
      setError(decodeURIComponent(err));
      setStep("email");
    }

    let cancelled = false;
    (async () => {
      if (code) {
        const { error: exchangeErr } =
          await sb.auth.exchangeCodeForSession(code);
        if (!cancelled && exchangeErr) {
          setError(exchangeErr.message);
          setStep("email");
        } else if (!cancelled) {
          const stored =
            sessionStorage.getItem(NAME_KEY) || name.trim() || "";
          if (stored) await persistNameMeta(stored);
          window.history.replaceState({}, "", "/start");
          router.replace("/dashboard");
          return;
        }
      }
      const { data } = await sb.auth.getSession();
      if (!cancelled && data.session) {
        const stored = sessionStorage.getItem(NAME_KEY);
        if (stored) await persistNameMeta(stored);
        router.replace("/dashboard");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [configured, name, persistNameMeta, router]);

  function onNameContinue(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name.");
      return;
    }
    setError(null);
    try {
      sessionStorage.setItem(NAME_KEY, trimmed);
    } catch {
      /* ignore */
    }
    setStep("email");
  }

  async function onMagic(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setStatus(null);
    const sb = getSupabaseBrowser();
    if (!sb) {
      setBusy(false);
      return;
    }
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/dashboard")}`;
    const { error: err } = await sb.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        data: { full_name: name.trim(), name: name.trim() },
      },
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setStatus("Check your email for a magic link.");
  }

  async function onGoogle() {
    setBusy(true);
    setError(null);
    const sb = getSupabaseBrowser();
    if (!sb) {
      setBusy(false);
      return;
    }
    try {
      sessionStorage.setItem(NAME_KEY, name.trim());
    } catch {
      /* ignore */
    }
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/dashboard")}`;
    const { error: err } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (err) {
      setBusy(false);
      setError(err.message);
    }
  }

  return (
    <div className="relative mx-auto flex min-h-[calc(100svh-8rem)] max-w-md flex-col px-1 py-6 sm:py-10">
      <div className="flex items-start justify-between">
        <div>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--red)] text-[15px] font-semibold text-white"
            aria-hidden
          >
            R
          </div>
          <p className="mt-5 font-display text-[20px] font-medium tracking-[-0.02em] text-[var(--ink)] sm:text-[22px]">
            {copy.onboardingWelcome}
          </p>
          <h1 className="mt-1 font-display text-[28px] font-medium tracking-[-0.03em] text-[var(--slate)] sm:text-[32px]">
            {step === "name"
              ? copy.onboardingNamePrompt
              : copy.onboardingEmailTitle}
          </h1>
          {step === "email" && (
            <p className="mt-2 text-[14px] leading-[1.55] text-[var(--muted)]">
              Nice to meet you, {name.trim() || "there"}.{" "}
              {copy.onboardingEmailSub}
            </p>
          )}
        </div>
        <a
          href="/"
          className="shrink-0 pt-1 text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
        >
          {copy.onboardingLater}
        </a>
      </div>

      <div className="mt-10 flex-1">
        {step === "name" ? (
          <form onSubmit={onNameContinue} className="space-y-8">
            <input
              type="text"
              name="name"
              autoComplete="given-name"
              autoFocus
              required
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-full border border-[var(--line)] bg-white px-6 py-4 text-[17px] text-[var(--ink)] outline-none transition-[border-color,box-shadow] placeholder:text-[var(--muted)] focus:border-[var(--red)]/40 focus:shadow-[0_0_0_3px_var(--red-soft)]"
            />
            {error && (
              <p className="text-[13px] text-[var(--red)]" role="alert">
                {error}
              </p>
            )}
            <div className="space-y-4">
              <p className="text-center text-[12px] leading-[1.5] text-[var(--muted)]">
                By continuing, you agree to our{" "}
                <a href="/terms" className="underline underline-offset-2">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="underline underline-offset-2">
                  Privacy Policy
                </a>
                .
              </p>
              <button
                type="submit"
                className="w-full rounded-full bg-[var(--red)] py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                {copy.onboardingContinue}
              </button>
            </div>
          </form>
        ) : !configured ? (
          <div className="rounded-[16px] border border-dashed border-[var(--line)] bg-white p-6">
            <h2 className="text-[18px] font-semibold tracking-[-0.02em]">
              Supabase not configured
            </h2>
            <p className="mt-2 text-[14px] leading-[1.6] text-[var(--slate)]">
              Add these to{" "}
              <code className="font-data text-[12px]">web/.env.local</code> and
              restart:
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-[var(--paper)] p-4 font-data text-[12px] leading-relaxed ring-1 ring-[var(--line)]">
              {`NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`}
            </pre>
            <p className="mt-4 text-[13px] text-[var(--muted)]">
              Hi {name.trim() || "there"} — your name is saved locally. Auth
              unlocks once env vars are set. You can still{" "}
              <a href="/" className="underline underline-offset-2">
                explore the site
              </a>{" "}
              or text Rejsy.
            </p>
            <button
              type="button"
              onClick={() => setStep("name")}
              className="mt-5 text-[13px] font-medium text-[var(--slate)] hover:text-[var(--ink)]"
            >
              ← Back
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <button
              type="button"
              disabled={busy}
              onClick={() => void onGoogle()}
              className="flex w-full items-center justify-center gap-2.5 rounded-full border border-[var(--line)] bg-white py-3.5 text-[15px] font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--paper)] disabled:opacity-60"
            >
              <GoogleGlyph />
              Continue with Google
            </button>

            <div className="flex items-center gap-3 text-[12px] text-[var(--muted)]">
              <span className="h-px flex-1 bg-[var(--line)]" />
              or email magic link
              <span className="h-px flex-1 bg-[var(--line)]" />
            </div>

            <form onSubmit={onMagic} className="space-y-4">
              <input
                type="email"
                required
                autoComplete="email"
                autoFocus
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-[var(--line)] bg-white px-6 py-4 text-[17px] outline-none transition-[border-color,box-shadow] placeholder:text-[var(--muted)] focus:border-[var(--red)]/40 focus:shadow-[0_0_0_3px_var(--red-soft)]"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-[var(--red)] py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {busy ? "Working…" : "Send magic link"}
              </button>
            </form>

            {status && (
              <p className="text-[13px] text-[var(--ontime)]" role="status">
                {status}
              </p>
            )}
            {error && (
              <p className="text-[13px] text-[var(--red)]" role="alert">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep("name");
              }}
              className="text-[13px] font-medium text-[var(--slate)] hover:text-[var(--ink)]"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}
