import type { Metadata } from "next";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { DemoPhone } from "@/components/site/DemoPhone";
import { HowItWorksStory } from "@/components/site/HowItWorksStory";
import { Coverage } from "@/components/site/Coverage";
import { copy } from "@/content/copy";
import { getMessagesHref } from "@/lib/env";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How Rejsy works — Danish transit in iMessage. Four apps become one text. Watch the demo, then join the waitlist.",
};

export default function ProductPage() {
  const messagesHref = getMessagesHref();

  return (
    <main className="min-h-[100svh] overflow-x-clip bg-[var(--paper)]">
      <Nav messagesHref={messagesHref} />

      {/* 1. Short hero */}
      <header className="page-enter mx-auto max-w-2xl px-4 pb-4 pt-10 text-center sm:px-6 md:pt-14">
        <p className="font-data text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
          How it works
        </p>
        <h1 className="mt-3 text-[36px] font-semibold tracking-[-0.04em] text-[var(--ink)] sm:text-[44px] md:text-[52px]">
          <em className="font-display font-medium italic text-[var(--red)]">
            {copy.brand}
          </em>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[16px] leading-[1.6] text-[var(--slate)] sm:text-[17px]">
          {copy.howItWorksHero}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#demo"
            className="inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[var(--red)] px-5 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Watch demo
          </a>
          <a
            href="/start"
            className="inline-flex min-h-11 items-center justify-center rounded-[10px] px-5 py-3 text-[14px] font-semibold text-[var(--ink)] ring-1 ring-[var(--line)] transition-colors hover:bg-white"
          >
            {copy.navGetStarted}
          </a>
        </div>
      </header>

      {/* 2. Demo first */}
      <DemoPhone compact />

      {/* 3–4. Problem story + brief how it works */}
      <HowItWorksStory />

      {/* Soft coverage line — not a card grid */}
      <Coverage />

      {/* 5. CTA */}
      <section className="border-t border-[var(--line)] px-4 py-16 text-center sm:px-6 md:py-20">
        <p className="text-[22px] font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-[26px]">
          Ready when you are.
        </p>
        <p className="mx-auto mt-2 max-w-sm text-[15px] leading-[1.55] text-[var(--slate)]">
          Join the waitlist — we&apos;ll save you a spot before public launch.
        </p>
        <a
          href="/start"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-[10px] bg-[var(--red)] px-7 py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          {copy.navGetStarted}
        </a>
      </section>

      {/* 6. Minimal footer */}
      <Footer />
    </main>
  );
}
