import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { docsGuide, copy } from "@/content/copy";
import { getMessagesHref } from "@/lib/env";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Rejsy guide — text Rejsy, pick a route, open the map card, leave-now reminders, and upgrade to Plus after 3 trips.",
};

export default function DocsPage() {
  const messagesHref = getMessagesHref();

  return (
    <PageShell>
      <p className="font-data text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
        Docs
      </p>
      <h1 className="mt-3 text-[34px] font-semibold tracking-[-0.035em] sm:text-[42px]">
        Getting started with Rejsy
      </h1>
      <p className="mt-3 text-[16px] leading-[1.65] text-[var(--slate)]">
        A short guide to planning Denmark transit in Messages — from first text
        to leave-now.
      </p>

      <ol className="mt-10 space-y-8">
        {docsGuide.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="font-data text-[13px] text-[var(--red)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="text-[20px] font-semibold tracking-[-0.02em]">
                {step.title}
              </h2>
              <p className="mt-2 text-[15px] leading-[1.65] text-[var(--slate)]">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-12 rounded-[12px] border border-[var(--line)] bg-white px-5 py-6">
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">
          Try it now
        </h2>
        <p className="mt-2 text-[14px] text-[var(--slate)]">
          Open Messages or join the waitlist for upcoming DSB integrations.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={messagesHref}
            className="rounded-[10px] bg-[var(--red)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90"
          >
            {copy.cta}
          </a>
          <a
            href="/start"
            className="rounded-[10px] px-5 py-2.5 text-[14px] font-semibold ring-1 ring-[var(--line)] hover:bg-[var(--paper)]"
          >
            {copy.navGetStarted}
          </a>
        </div>
      </div>
    </PageShell>
  );
}
