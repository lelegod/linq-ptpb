import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Rejsy privacy policy — how we use Messages trip data, account info, and Stripe billing.",
};

export default function PrivacyPage() {
  return (
    <PageShell>
      <h1 className="text-[34px] font-semibold tracking-[-0.035em] sm:text-[42px]">
        Privacy
      </h1>
      <p className="mt-3 text-[15px] text-[var(--muted)]">Last updated: August 2026</p>
      <div className="mt-8 space-y-5 text-[15px] leading-[1.7] text-[var(--slate)]">
        <p>
          Rejsy helps you plan Denmark transit in Messages. We collect only what
          we need to run the product: messages you send to the Rejsy agent,
          account details you provide at signup (such as name and email), and
          billing metadata if you subscribe to Plus via Stripe.
        </p>
        <p>
          We do not sell your trip data. Operator tickets and payments stay with
          DSB and other carriers when you follow a Buy link. You can request
          deletion of your account data by contacting us through the product.
        </p>
        <p>
          Auth is handled by Supabase when configured. Payment processing is
          handled by Stripe. See their policies for those services.
        </p>
      </div>
    </PageShell>
  );
}
