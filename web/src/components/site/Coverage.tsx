import { copy } from "@/content/copy";

export function Coverage() {
  return (
    <section
      id="coverage"
      className="scroll-mt-20 bg-[var(--ink)] px-4 py-12 sm:px-6 md:px-10 md:py-14"
      aria-labelledby="coverage-heading"
    >
      <div className="mx-auto max-w-4xl text-center">
        <h2 id="coverage-heading" className="sr-only">
          Coverage
        </h2>
        <p className="font-data text-[11px] uppercase tracking-[0.06em] text-[var(--slate-inv)]">
          {copy.coverageLabel}
        </p>
        <p className="mt-4 font-data text-[13px] leading-relaxed text-[var(--slate-inv)] sm:text-[14px] md:text-[16px]">
          {copy.coverageOps}
        </p>
      </div>
    </section>
  );
}
