import { copy } from "@/content/copy";

export function ProblemStrip() {
  return (
    <section className="border-y border-[var(--line)] bg-[var(--paper)] px-4 py-12 sm:px-6 md:px-10 md:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-data text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
          {copy.problemLabel}
        </p>
        <h2 className="mt-3 text-[22px] font-semibold tracking-[-0.03em] sm:text-[24px]">
          {copy.problemHeading}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-[1.6] text-[var(--slate)]">
          {copy.problemBody}
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {copy.problemApps.map((app) => (
              <span
                key={app}
                className="rounded-[10px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2 font-data text-[11px] uppercase tracking-[0.04em] text-[var(--muted)]"
              >
                {app}
              </span>
            ))}
          </div>

          <div className="font-data text-[12px] text-[var(--muted)]" aria-hidden>
            ↓
          </div>

          <div className="max-w-[280px] rounded-[17px] rounded-br-[6px] bg-[var(--inbound)] px-4 py-2.5 text-left text-[13px] leading-snug text-[var(--ink)]">
            {copy.problemResult}
          </div>
          <div className="max-w-[280px] self-start rounded-[17px] rounded-bl-[6px] bg-[var(--bubble)] px-4 py-2.5 text-left font-data text-[12px] leading-snug text-white sm:self-center">
            københavn h → aarhus h
            <br />
            1 · 2 · 3 — reply to lock in
          </div>
        </div>

        <p className="mt-8 font-data text-[11px] text-[var(--muted)]">
          {copy.problemCaption}
        </p>
      </div>
    </section>
  );
}
