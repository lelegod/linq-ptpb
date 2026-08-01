"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { copy } from "@/content/copy";
import {
  AGE_MAX,
  AGE_MIN,
  buildOnboardingMeta,
  parseAge,
  readPendingAge,
  readPendingName,
  savePendingAge,
  savePendingName,
} from "@/lib/auth/onboarding";
import { getSupabaseBrowser, getSupabaseEnv } from "@/lib/supabase/client";

const NAME_KEY = "rejsy_onboarding_name";
const AGE_KEY = "rejsy_onboarding_age";

type Step = "name" | "age" | "email";

export function StartClient() {
  const router = useRouter();
  const { configured } = getSupabaseEnv();
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  const persistOnboardingMeta = useCallback(
    async (fullName: string, ageValue: number | null) => {
      const sb = getSupabaseBrowser();
      if (!sb) return;
      const data = buildOnboardingMeta(fullName, ageValue);
      if (!data.full_name && data.age == null) return;
      await sb.auth.updateUser({ data });
    },
    [],
  );

  useEffect(() => {
    try {
      const savedName = sessionStorage.getItem(NAME_KEY);
      if (savedName) setName(savedName);
      const savedAge = sessionStorage.getItem(AGE_KEY);
      if (savedAge) setAge(savedAge);
    } catch {
      /* ignore */
    }

    if (!configured) return;
    const sb = getSupabaseBrowser();
    if (!sb) return;

    void (async () => {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (url && key) {
          const res = await fetch(`${url}/auth/v1/settings`, {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
          });
          if (res.ok) {
            const settings = (await res.json()) as {
              external?: { google?: boolean };
            };
            setGoogleEnabled(Boolean(settings.external?.google));
          }
        }
      } catch {
        /* ignore — Google button stays hidden */
      }
    })();

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const err = params.get("error");
    if (err && err !== "auth_config") {
      setError(decodeURIComponent(err));
      setStep("email");
    }

    let cancelled = false;
    (async () => {
      // Fallback if a code lands here; primary exchange is /auth/callback.
      if (code) {
        const { error: exchangeErr } =
          await sb.auth.exchangeCodeForSession(code);
        if (!cancelled && exchangeErr) {
          setError(exchangeErr.message);
          setStep("email");
        } else if (!cancelled) {
          const storedName =
            readPendingName() || name.trim() || "";
          const storedAge = readPendingAge();
          if (storedName || storedAge != null) {
            await persistOnboardingMeta(storedName, storedAge);
          }
          window.history.replaceState({}, "", "/start");
          router.replace("/dashboard");
          router.refresh();
          return;
        }
      }
      const { data } = await sb.auth.getSession();
      if (!cancelled && data.session) {
        const storedName = readPendingName();
        const storedAge = readPendingAge();
        if (storedName || storedAge != null) {
          await persistOnboardingMeta(storedName || "", storedAge);
        }
        router.replace("/dashboard");
        router.refresh();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [configured, name, persistOnboardingMeta, router]);

  function onNameContinue(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name.");
      return;
    }
    setError(null);
    savePendingName(trimmed);
    setStep("age");
  }

  function onAgeContinue(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseAge(age);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setError(null);
    savePendingAge(parsed.age);
    setAge(String(parsed.age));
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
    const parsedAge = parseAge(age);
    const ageValue = readPendingAge() ?? (parsedAge.ok ? parsedAge.age : null);
    if (ageValue == null) {
      setBusy(false);
      setError(`Please enter an age between ${AGE_MIN} and ${AGE_MAX}.`);
      setStep("age");
      return;
    }
    savePendingName(name.trim());
    savePendingAge(ageValue);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/dashboard")}`;
    const { error: err } = await sb.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        data: buildOnboardingMeta(name, ageValue),
      },
    });
    setBusy(false);
    if (err) {
      const msg = err.message.toLowerCase();
      if (msg.includes("rate limit")) {
        setError(
          "Too many emails sent recently. Wait a few minutes, then try again — or use Log in with email & password if you already have an account.",
        );
      } else {
        setError(err.message);
      }
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
    const parsedAge = parseAge(age);
    const ageValue = readPendingAge() ?? (parsedAge.ok ? parsedAge.age : null);
    if (!name.trim() || ageValue == null) {
      setBusy(false);
      setError("Please complete your name and age first.");
      setStep(!name.trim() ? "name" : "age");
      return;
    }
    savePendingName(name.trim());
    savePendingAge(ageValue);
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

  const stepTitle =
    step === "name"
      ? copy.onboardingNamePrompt
      : step === "age"
        ? copy.onboardingAgePrompt
        : copy.onboardingEmailTitle;

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
            {stepTitle}
          </h1>
          {step === "age" && (
            <p className="mt-2 text-[14px] leading-[1.55] text-[var(--muted)]">
              Nice to meet you, {name.trim() || "there"}.{" "}
              {copy.onboardingAgeSub}
            </p>
          )}
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
        ) : step === "age" ? (
          <form onSubmit={onAgeContinue} className="space-y-8">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name="age"
              autoComplete="bday-year"
              autoFocus
              required
              placeholder="Your age"
              value={age}
              onChange={(e) => setAge(e.target.value.replace(/[^\d]/g, ""))}
              className="w-full rounded-full border border-[var(--line)] bg-white px-6 py-4 text-[17px] text-[var(--ink)] outline-none transition-[border-color,box-shadow] placeholder:text-[var(--muted)] focus:border-[var(--red)]/40 focus:shadow-[0_0_0_3px_var(--red-soft)]"
              aria-describedby="age-hint"
            />
            <p id="age-hint" className="text-[12px] text-[var(--muted)]">
              Ages {AGE_MIN}–{AGE_MAX}. We use this to personalize your account.
            </p>
            {error && (
              <p className="text-[13px] text-[var(--red)]" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-full bg-[var(--red)] py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              {copy.onboardingContinue}
            </button>
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
              Hi {name.trim() || "there"} — your name and age are saved locally.
              Auth unlocks once env vars are set. You can still{" "}
              <a href="/" className="underline underline-offset-2">
                explore the site
              </a>{" "}
              or text Rejsy.
            </p>
            <button
              type="button"
              onClick={() => setStep("age")}
              className="mt-5 text-[13px] font-medium text-[var(--slate)] hover:text-[var(--ink)]"
            >
              ← Back
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {googleEnabled && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void onGoogle()}
                className="flex w-full items-center justify-center gap-2.5 rounded-full border border-[var(--line)] bg-white py-3.5 text-[15px] font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--paper)] disabled:opacity-60"
              >
                <GoogleGlyph />
                Continue with Google
              </button>
            )}

            {googleEnabled && (
              <div className="flex items-center gap-3 text-[12px] text-[var(--muted)]">
                <span className="h-px flex-1 bg-[var(--line)]" />
                or email magic link
                <span className="h-px flex-1 bg-[var(--line)]" />
              </div>
            )}

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

            <p className="text-[12px] text-[var(--muted)]">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-medium text-[var(--ink)] underline underline-offset-2"
              >
                Log in
              </a>
            </p>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep("age");
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
