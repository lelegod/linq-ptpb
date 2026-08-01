import type { Metadata } from "next";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ProductSection } from "@/components/site/ProductSection";
import { Coverage } from "@/components/site/Coverage";
import { TextRejsyCta } from "@/components/site/TextRejsyCta";
import { copy } from "@/content/copy";
import { getMessagesHref } from "@/lib/env";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How Rejsy works — text a destination, pick a route, open the map, Buy on DSB, and get a leave-now ping 25 minutes before.",
};

export default function ProductPage() {
  const messagesHref = getMessagesHref();

  return (
    <main className="min-h-[100svh] bg-[var(--paper)]">
      <Nav messagesHref={messagesHref} />
      <div className="page-enter mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
        <header className="max-w-2xl">
          <p className="font-data text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
            Product
          </p>
          <h1 className="mt-3 text-[34px] font-semibold tracking-[-0.035em] sm:text-[44px]">
            {copy.productHeading}
          </h1>
          <p className="mt-3 text-[16px] leading-[1.65] text-[var(--slate)]">
            {copy.productSub} Full walkthrough below — then text Rejsy or join
            the waitlist for upcoming integrations.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <TextRejsyCta href={messagesHref} variant="red" />
            <a
              href="/start"
              className="rounded-[10px] px-5 py-3.5 text-[14px] font-semibold text-[var(--ink)] ring-1 ring-[var(--line)] transition-colors hover:bg-white"
            >
              {copy.navGetStarted}
            </a>
          </div>
        </header>
      </div>

      <ProductSection />

      <section id="coverage" className="scroll-mt-24">
        <Coverage />
      </section>

      <div className="border-t border-[var(--line)] px-4 py-10 text-center sm:px-6">
        <p className="text-[15px] text-[var(--slate)]">Ready when you are.</p>
        <div className="mt-4 flex justify-center">
          <TextRejsyCta href={messagesHref} variant="red" />
        </div>
      </div>
      <Footer />
    </main>
  );
}
