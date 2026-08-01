"use client";

import { useState } from "react";
import { copy } from "@/content/copy";
import { AGE_MAX, AGE_MIN, parseAge } from "@/lib/auth/onboarding";

type Step = "details" | "email" | "done";

export function StartClient() {
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState<string>(copy.waitlistSuccess);

  function onDetailsContinue(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name.");
      return;
    }
    const parsed = parseAge(age);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setError(null);
    setAge(String(parsed.age));
    setStep("email");
  }

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const parsed = parseAge(age);
    if (!name.trim() || !parsed.ok) {
      setBusy(false);
      setError("Please complete your name and age.");
      setStep("details");
      return;
    }

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          age: parsed.age,
          email: email.trim(),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };

      if (!res.ok || !data.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }

      try {
        localStorage.setItem(
          "rejsy_waitlist",
          JSON.stringify({
            name: name.trim(),
            age: parsed.age,
            email: email.trim().toLowerCase(),
            at: new Date().toISOString(),
          }),
        );
      } catch {
        /* ignore */
      }

      setDoneMessage(data.message || copy.waitlistSuccess);
      setStep("done");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative mx-auto flex min-h-[calc(100svh-8rem)] max-w-md flex-col px-0 py-5 sm:px-1 sm:py-10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--red)] text-[15px] font-semibold text-white"
            aria-hidden
          >
            R
          </div>
          <p className="mt-5 font-display text-[18px] font-medium tracking-[-0.02em] text-[var(--ink)] sm:text-[22px]">
            {copy.waitlistWelcome}
          </p>
          <h1 className="mt-1 font-display text-[24px] font-medium tracking-[-0.03em] text-[var(--slate)] sm:text-[32px]">
            {step === "details"
              ? copy.waitlistDetailsTitle
              : step === "email"
                ? copy.waitlistEmailTitle
                : copy.waitlistSuccessTitle}
          </h1>
          {step === "details" && (
            <p className="mt-2 text-[14px] leading-[1.55] text-[var(--muted)]">
              {copy.waitlistDetailsSub}
            </p>
          )}
          {step === "email" && (
            <p className="mt-2 text-[14px] leading-[1.55] text-[var(--muted)]">
              Nice to meet you, {name.trim() || "there"}.{" "}
              {copy.waitlistEmailSub}
            </p>
          )}
          {step === "done" && (
            <p className="mt-2 text-[14px] leading-[1.55] text-[var(--muted)]">
              {doneMessage} {copy.waitlistSuccessSub}
            </p>
          )}
        </div>
        {step !== "done" && (
          <a
            href="/"
            className="inline-flex min-h-11 shrink-0 items-center pt-0.5 text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            {copy.waitlistLater}
          </a>
        )}
      </div>

      <div className="mt-10 flex-1">
        {step === "details" && (
          <form onSubmit={onDetailsContinue} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-[12px] font-medium text-[var(--slate)]">
                Name
              </span>
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
            </label>
            <label className="block">
              <span className="mb-2 block text-[12px] font-medium text-[var(--slate)]">
                Age
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                name="age"
                required
                placeholder="Your age"
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/[^\d]/g, ""))}
                className="w-full rounded-full border border-[var(--line)] bg-white px-6 py-4 text-[17px] text-[var(--ink)] outline-none transition-[border-color,box-shadow] placeholder:text-[var(--muted)] focus:border-[var(--red)]/40 focus:shadow-[0_0_0_3px_var(--red-soft)]"
                aria-describedby="age-hint"
              />
              <span
                id="age-hint"
                className="mt-2 block text-[12px] text-[var(--muted)]"
              >
                Ages {AGE_MIN}–{AGE_MAX}.
              </span>
            </label>
            {error && (
              <p className="text-[13px] text-[var(--red)]" role="alert">
                {error}
              </p>
            )}
            <div className="space-y-4 pt-2">
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
                className="min-h-12 w-full rounded-full bg-[var(--red)] py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                {copy.waitlistContinue}
              </button>
            </div>
          </form>
        )}

        {step === "email" && (
          <form onSubmit={onEmailSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-[12px] font-medium text-[var(--slate)]">
                Email
              </span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                autoFocus
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-[var(--line)] bg-white px-6 py-4 text-[17px] text-[var(--ink)] outline-none transition-[border-color,box-shadow] placeholder:text-[var(--muted)] focus:border-[var(--red)]/40 focus:shadow-[0_0_0_3px_var(--red-soft)]"
              />
            </label>
            {error && (
              <p className="text-[13px] text-[var(--red)]" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="min-h-12 w-full rounded-full bg-[var(--red)] py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Joining…" : copy.waitlistJoin}
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep("details");
              }}
              className="inline-flex min-h-11 items-center text-[13px] font-medium text-[var(--slate)] hover:text-[var(--ink)]"
            >
              ← Back
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="space-y-6">
            <div className="rounded-[20px] border border-[var(--line)] bg-white px-6 py-8 text-center">
              <div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--red-soft)] text-[var(--red)]"
                aria-hidden
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path
                    d="M5 11.5 9 15.5 17 6.5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="mt-5 font-display text-[22px] font-medium tracking-[-0.02em] text-[var(--ink)]">
                {copy.waitlistSuccessTitle}
              </p>
              <p className="mt-2 text-[14px] leading-[1.55] text-[var(--muted)]">
                We’ll email {email.trim() || "you"} when Rejsy is ready for more
                riders.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="/"
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-[var(--red)] py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Back to home
              </a>
              <a
                href="/product"
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-[var(--line)] bg-white py-3.5 text-[15px] font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--paper)]"
              >
                How it works
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
