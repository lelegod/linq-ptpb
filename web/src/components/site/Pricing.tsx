import { copy } from "@/content/copy";

const freeFeatures = [
  "3 trip plans",
  "Booking hand-off",
  "Leave-now reminders",
  "No card required",
];

const plusFeatures = [
  "Unlimited planning",
  "Booking hand-off",
  "Leave-now reminders",
  "Live delay alerts",
  "Saved places",
  "Cancel anytime",
];

export function Pricing({
  messagesHref,
  showEyebrow = true,
}: {
  messagesHref: string;
  showEyebrow?: boolean;
}) {
  return (
    <section id="pricing" className="bg-[var(--paper)] px-4 py-12 sm:px-6 md:px-10 md:py-20">
      <div className="mx-auto max-w-4xl">
        {showEyebrow ? (
          <p className="max-w-xl text-[15px] leading-[1.6] text-[var(--slate)] sm:text-[16px] sm:leading-[1.65]">
            {copy.pricingEyebrow}
          </p>
        ) : null}

        <div
          className={`grid gap-4 md:grid-cols-2 ${showEyebrow ? "mt-8 md:mt-10" : ""}`}
        >
          <div className="rounded-[12px] border border-[var(--line)] p-5 sm:p-6">
            <h3 className="text-[20px] font-semibold tracking-[-0.03em]">Free</h3>
            <p className="mt-1 font-data text-[13px] text-[var(--muted)]">
              0 kr
            </p>
            <ul className="mt-6 space-y-2.5 text-[14px] text-[var(--slate)]">
              {freeFeatures.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <a
              href={messagesHref}
              className="mt-8 flex w-full items-center justify-center rounded-[10px] border border-[var(--line)] px-4 py-3 text-[14px] font-semibold text-[var(--ink)] hover:border-[var(--red)]/40"
            >
              {copy.cta}
            </a>
          </div>

          <div className="relative rounded-[12px] border border-[var(--red)] p-5 sm:p-6">
            <span className="absolute -top-2.5 right-4 rounded bg-[var(--red)] px-2 py-0.5 font-data text-[10px] uppercase tracking-[0.06em] text-white">
              Most popular
            </span>
            <h3 className="text-[20px] font-semibold tracking-[-0.03em]">
              Rejsy Plus
            </h3>
            <p className="mt-1 font-data text-[13px] text-[var(--muted)]">
              29 kr/mo
            </p>
            <ul className="mt-6 space-y-2.5 text-[14px] text-[var(--slate)]">
              {plusFeatures.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <a
              href="/upgrade"
              className="mt-8 flex w-full items-center justify-center rounded-[10px] bg-[var(--red)] px-4 py-3 text-[14px] font-semibold text-white"
            >
              {copy.plusCta}
            </a>
            <p className="mt-3 text-center font-data text-[10px] text-[var(--muted)]">
              {copy.plusNote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
