import type { Metadata } from "next";
import { StartClient } from "@/app/start/StartClient";

export const metadata: Metadata = {
  title: "Get Started",
  description:
    "Welcome to Rejsy — tell us your name, then connect with Google or email to start planning Denmark transit in Messages.",
};

export default function StartPage() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[var(--paper)]">
      <div
        className="pointer-events-none absolute inset-0 grid-bg opacity-80"
        aria-hidden
      />
      <div className="page-enter relative z-10 mx-auto max-w-lg px-4 sm:px-6">
        <div className="flex items-center justify-between pt-5">
          <a
            href="/"
            className="flex items-center gap-2.5"
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
