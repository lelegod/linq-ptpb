import { copy } from "@/content/copy";

export function Coverage() {
  return (
    <section className="bg-[var(--ink)] px-6 py-14 md:px-10">
      <div className="mx-auto max-w-4xl text-center">
        <p className="font-data text-[11px] uppercase tracking-[0.06em] text-[var(--slate-inv)]">
          {copy.coverageLabel}
        </p>
        <p className="mt-4 font-data text-[14px] text-[var(--slate-inv)] md:text-[16px]">
          {copy.coverageOps}
        </p>
      </div>
    </section>
  );
}
