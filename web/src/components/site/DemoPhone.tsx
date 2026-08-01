"use client";

export function DemoPhone({
  compact = false,
}: {
  /** Centered demo-first layout (product page) */
  compact?: boolean;
} = {}) {
  return (
    <section
      id="demo"
      className={`scroll-mt-24 bg-[var(--paper)] px-4 sm:px-6 ${
        compact
          ? "border-t border-[var(--line)] py-12 md:py-16"
          : "border-t border-[var(--line)] py-16 md:px-10 md:py-20"
      }`}
      aria-labelledby="demo-heading"
    >
      <div
        className={`mx-auto flex max-w-5xl flex-col items-center ${
          compact
            ? "gap-8"
            : "gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16"
        }`}
      >
        <div
          className={`max-w-md ${compact ? "text-center" : "text-center lg:text-left"}`}
        >
          <p className="font-data text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
            Watch demo
          </p>
          <h2
            id="demo-heading"
            className={`mt-3 font-semibold tracking-[-0.03em] text-[var(--ink)] ${
              compact
                ? "text-[24px] sm:text-[28px]"
                : "text-[28px] sm:text-[34px]"
            }`}
          >
            Rejsy in Messages
          </h2>
          <p className="mt-2 text-[15px] leading-[1.6] text-[var(--slate)] sm:text-[16px]">
            Plan by text, pick a route, get the leave-now ping.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[240px] sm:max-w-[280px] md:max-w-[300px]">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-6 rounded-[40%] bg-[radial-gradient(ellipse_at_center,rgba(200,16,46,0.1),transparent_70%)] sm:-inset-8"
          />

          <div className="relative mx-auto aspect-[9/19.5] w-full rounded-[2.2rem] bg-[var(--ink)] p-[9px] shadow-[0_28px_60px_-18px_rgba(11,11,12,0.45),0_0_0_1px_rgba(11,11,12,0.08)] sm:rounded-[2.4rem] sm:p-[10px]">
            <div
              aria-hidden
              className="absolute -left-[2px] top-[18%] h-10 w-[2px] rounded-l-sm bg-[#2a2a2e]"
            />
            <div
              aria-hidden
              className="absolute -left-[2px] top-[28%] h-14 w-[2px] rounded-l-sm bg-[#2a2a2e]"
            />
            <div
              aria-hidden
              className="absolute -right-[2px] top-[24%] h-16 w-[2px] rounded-r-sm bg-[#2a2a2e]"
            />

            <div className="relative h-full w-full overflow-hidden rounded-[1.85rem] bg-black sm:rounded-[2rem]">
              <div
                aria-hidden
                className="absolute left-1/2 top-2.5 z-10 h-[20px] w-[84px] -translate-x-1/2 rounded-full bg-black sm:h-[22px] sm:w-[92px]"
              />

              <video
                className="h-full w-full object-cover object-top"
                src="/working-demo.mp4"
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="metadata"
                aria-label="Rejsy working demo in Messages"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
