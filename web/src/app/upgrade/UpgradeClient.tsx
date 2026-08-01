"use client";

import { useState } from "react";

export function UpgradeClient({
  token,
  maskedPhone,
}: {
  token: string | null;
  maskedPhone: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    if (!token) {
      setError("text rejsy to unlock — open the link from iMessage");
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
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? "checkout failed");
    } catch {
      setError("network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <p className="font-data text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
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
        <p className="mt-2 text-[14px] text-[var(--slate)]">
          {token
            ? "Your trips stay saved. Reminders keep working."
            : "Open the upgrade link from iMessage, or text rejsy to unlock."}
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
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center rounded-[10px] bg-[var(--red)] px-4 py-3 text-[14px] font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Redirecting…" : "Continue to checkout"}
        </button>
        {error && (
          <p className="mt-3 text-center text-[13px] text-[var(--red)]">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
