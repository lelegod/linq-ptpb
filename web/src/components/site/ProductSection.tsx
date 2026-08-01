import { copy, howItWorks } from "@/content/copy";

function YouBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="ml-auto max-w-[85%] rounded-[17px] rounded-br-[6px] bg-[var(--inbound)] px-3 py-2 text-[13px] leading-snug text-[var(--ink)]">
      {children}
    </div>
  );
}

function RejsyBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="mr-auto max-w-[90%] rounded-[17px] rounded-bl-[6px] bg-[var(--bubble)] px-3 py-2 text-[13px] leading-snug text-white">
      {children}
    </div>
  );
}

export function ProductSection() {
  return (
    <section
      id="product"
      className="scroll-mt-20 bg-[var(--paper)] px-4 py-16 sm:px-6 md:px-10 md:py-24"
      aria-labelledby="product-heading"
    >
      <div className="mx-auto max-w-5xl">
        <p className="font-data text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
          {copy.productLabel}
        </p>
        <h2
          id="product-heading"
          className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-[36px]"
        >
          {copy.productHeading}
        </h2>
        <p className="mt-3 max-w-xl text-[15px] leading-[1.6] text-[var(--slate)] sm:text-[16px]">
          {copy.productSub}
        </p>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((step) => (
            <li
              key={step.step}
              className="flex flex-col rounded-[12px] border border-[var(--line)] bg-[var(--paper)] p-4 sm:p-5"
            >
              <span className="font-data text-[11px] text-[var(--muted)]">
                {step.step}
              </span>
              <h3 className="mt-1 text-[16px] font-semibold tracking-[-0.02em]">
                {step.title}
              </h3>
              <div className="mt-4 flex min-h-[120px] flex-col justify-end gap-1.5">
                {step.you ? <YouBubble>{step.you}</YouBubble> : null}
                <RejsyBubble>{step.rejsy}</RejsyBubble>
              </div>
            </li>
          ))}
        </ol>

        <div
          id="integrations"
          className="scroll-mt-24 mt-12 rounded-[12px] border border-dashed border-[var(--red)]/35 bg-[var(--paper)] px-5 py-6 sm:px-8"
        >
          <h3 className="text-[20px] font-semibold tracking-[-0.02em]">
            {copy.integrationsHeading}
          </h3>
          <p className="mt-2 max-w-2xl text-[14px] leading-[1.6] text-[var(--slate)] sm:text-[15px]">
            {copy.integrationsBody}
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {["DSB account", "Rejsekort", "DOT / Movia"].map((name) => (
              <li
                key={name}
                className="rounded-[10px] border border-[var(--line)] bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--slate)]"
              >
                {name}
                <span className="ml-1.5 font-data text-[9px] uppercase tracking-[0.06em] text-[var(--red)]">
                  soon
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
