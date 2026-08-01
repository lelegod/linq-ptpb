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
      <h1 className="mt-3 text-[34px] font-semibold tracking-[-0.035em] sm:text-[42px]">
        Frequently asked questions
      </h1>
      <p className="mt-3 text-[16px] leading-[1.65] text-[var(--slate)]">
        Straight answers about coverage, Messages, pricing, and privacy.
      </p>

      <dl className="mt-10 divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {faqs.map((item) => (
          <div key={item.q} className="py-6">
            <dt className="text-[17px] font-semibold tracking-[-0.02em]">
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
          get started
        </a>
        .
      </p>
    </PageShell>
  );
}
