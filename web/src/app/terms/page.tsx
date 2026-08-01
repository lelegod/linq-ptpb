import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Rejsy terms of service — planning in Messages, free tier limits, and Plus billing.",
};

export default function TermsPage() {
  return (
    <PageShell>
      <h1 className="text-[34px] font-semibold tracking-[-0.035em] sm:text-[42px]">
        Terms of Service
      </h1>
      <p className="mt-3 text-[15px] text-[var(--muted)]">Last updated: August 2026</p>
      <div className="mt-8 space-y-5 text-[15px] leading-[1.7] text-[var(--slate)]">
        <p>
          By using Rejsy you agree to these terms. Rejsy provides trip planning
          and reminders via Messages. Tickets are purchased from operators (for
          example DSB); Rejsy does not sell tickets and is not liable for
          operator delays, cancellations, or fare errors.
        </p>
        <p>
          The free tier includes a limited number of trip plans. Rejsy Plus is
          billed monthly via Stripe when you upgrade. Cancel anytime through the
          Stripe customer portal after purchase.
        </p>
        <p>
          The service is provided as-is while we iterate. Do not misuse the
          agent or attempt to abuse free quotas. We may update these terms; the
          date above reflects the latest version.
        </p>
      </div>
    </PageShell>
  );
}
