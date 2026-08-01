import type { Metadata } from "next";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Pricing } from "@/components/site/Pricing";
import { copy } from "@/content/copy";
import { getMessagesHref } from "@/lib/env";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Rejsy pricing — 3 free trips, then Rejsy Plus at 29 kr/mo for unlimited planning and leave-now reminders.",
};

export default function PricingPage() {
  const messagesHref = getMessagesHref();

  return (
    <main className="min-h-[100svh] bg-[var(--paper)]">
      <Nav messagesHref={messagesHref} />
      <div className="page-enter mx-auto max-w-4xl px-4 pt-10 sm:px-6 md:pt-14">
        <p className="font-data text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
          Pricing
        </p>
        <h1 className="mt-3 text-[34px] font-semibold tracking-[-0.035em] sm:text-[44px]">
          Simple plans
        </h1>
        <p className="mt-3 max-w-xl text-[16px] leading-[1.65] text-[var(--slate)]">
          {copy.pricingEyebrow}
        </p>
      </div>
      <Pricing messagesHref={messagesHref} showEyebrow={false} />
      <Footer />
    </main>
  );
}
