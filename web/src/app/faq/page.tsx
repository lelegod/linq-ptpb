import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { faqs } from "@/content/copy";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Rejsy FAQs — Denmark transit coverage, iPhone/Linq, free tier, 25-minute reminders, Stripe Plus, privacy, and DSB handoff.",
};

export default function FaqPage() {
  return (
    <PageShell>
      <p className="font-data text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
        Resources
      </p>
      <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.035em] sm:text-[34px] md:text-[42px]">
        Frequently asked questions
      </h1>
      <p className="mt-3 text-[15px] leading-[1.65] text-[var(--slate)] sm:text-[16px]">
        Straight answers about coverage, Messages, pricing, and privacy.
      </p>

      <dl className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)] sm:mt-10">
        {faqs.map((item) => (
          <div key={item.q} className="py-5 sm:py-6">
            <dt className="text-[16px] font-semibold tracking-[-0.02em] sm:text-[17px]">
              {item.q}
            </dt>
            <dd className="mt-2 text-[15px] leading-[1.65] text-[var(--slate)]">
              {item.a}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-10 text-[14px] text-[var(--slate)]">
        Still stuck?{" "}
        <a href="/docs" className="font-medium text-[var(--red)] underline-offset-2 hover:underline">
          Read the docs
        </a>{" "}
        or{" "}
        <a href="/start" className="font-medium text-[var(--red)] underline-offset-2 hover:underline">
          join the waitlist
        </a>
        .
      </p>
    </PageShell>
  );
}
