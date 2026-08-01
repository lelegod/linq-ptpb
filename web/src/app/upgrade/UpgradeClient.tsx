"use client";

import Link from "next/link";
import { useState } from "react";

function friendlyError(raw: string): string {
  if (/not configured|isn’t wired|isn't wired|BACKEND_URL|STRIPE_/i.test(raw)) {
    return "Checkout isn’t live yet (Stripe on Railway). Your trips stay saved — text rejsy when Plus is ready.";
  }
  if (/invalid|expired/i.test(raw)) {
    return "This unlock link is invalid or expired. Text rejsy for a fresh one.";
  }
  if (/token required|Missing unlock/i.test(raw)) {
    return "Open the upgrade link from iMessage (?u=…), or text rejsy to unlock.";
  }
  return raw;
}

export function UpgradeClient({
  token,
  maskedPhone,
}: {
  token: string | null;
  maskedPhone: string | null;
}) {
  const [error, setError] = useState<string | null>(
    token ? null : "Open the upgrade link from iMessage, or text rejsy to unlock.",
  );
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    if (!token) {
      setError("Open the upgrade link from iMessage (?u=…), or text rejsy to unlock.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(friendlyError(data.error ?? `Checkout failed (${res.status}).`));
    } catch {
      setError("Network error — try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Link
        href="/"
        className="font-data text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]"
      >
        ← rejsy
      </Link>
      <p className="mt-4 font-data text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
        Rejsy Plus · test mode
      </p>
      <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.03em]">
        Unlimited planning for 29 kr/mo
      </h1>
      {maskedPhone ? (
        <p className="mt-2 font-data text-[13px] text-[var(--slate)]">
          {maskedPhone}
        </p>
      ) : (
        <p className="mt-2 text-[14px] leading-[1.65] text-[var(--slate)]">
          {token
            ? "Your trips stay saved. Reminders keep working."
            : "No unlock token in this URL yet. Text rejsy when you hit the free-trip limit — we’ll send a link."}
        </p>
      )}

      <div className="mt-8 rounded-[12px] border border-[var(--red)] p-6">
        <p className="text-[16px] font-semibold">What you get</p>
        <ul className="mt-4 space-y-2 text-[14px] text-[var(--slate)]">
          <li>Unlimited trip plans</li>
          <li>Leave-now reminders (25 min)</li>
          <li>Live delay alerts</li>
        </ul>
        <button
          type="button"
          onClick={startCheckout}
          disabled={loading || !token}
          className="mt-6 flex w-full items-center justify-center rounded-[10px] bg-[var(--red)] px-4 py-3 text-[14px] font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Redirecting…" : token ? "Continue to checkout" : "Need unlock link"}
        </button>
        {error && (
          <p className="mt-3 text-center text-[13px] leading-snug text-[var(--red)]">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
