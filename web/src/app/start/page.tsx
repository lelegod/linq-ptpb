import type { Metadata } from "next";
import { StartClient } from "@/app/start/StartClient";

export const metadata: Metadata = {
  title: "Join the waitlist",
  description:
    "Join the Rejsy waitlist — share your name, age, and email for early access to Denmark transit in Messages.",
};

export default function StartPage() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[var(--paper)]">
      <div
        className="pointer-events-none absolute inset-0 grid-bg opacity-80"
        aria-hidden
      />
      <div className="page-enter relative z-10 mx-auto max-w-lg px-4 pb-8 sm:px-6 safe-pb">
        <div className="flex min-h-12 items-center justify-between pt-4 sm:pt-5">
          <a
            href="/"
            className="flex min-h-11 items-center gap-2.5"
            aria-label="Rejsy home"
          >
            <span className="flex items-end gap-[3px]" aria-hidden>
              <span className="h-3 w-1 bg-[var(--red)] opacity-100" />
              <span className="h-3 w-1 bg-[var(--red)] opacity-55" />
              <span className="h-3 w-1 bg-[var(--red)] opacity-25" />
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.02em]">
              rejsy
            </span>
          </a>
        </div>
        <StartClient />
      </div>
    </main>
  );
}
