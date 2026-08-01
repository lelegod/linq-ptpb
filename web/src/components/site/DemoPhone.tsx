"use client";

export function DemoPhone() {
  return (
    <section
      id="demo"
      className="scroll-mt-24 border-t border-[var(--line)] bg-[var(--paper)] px-4 py-16 sm:px-6 md:px-10 md:py-20"
      aria-labelledby="demo-heading"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div className="max-w-md text-center lg:text-left">
          <p className="font-data text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
            Live demo
          </p>
          <h2
            id="demo-heading"
            className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-[34px]"
          >
            Watch Rejsy in Messages
          </h2>
          <p className="mt-3 text-[15px] leading-[1.6] text-[var(--slate)] sm:text-[16px]">
            A real walkthrough — plan by text, pick a route, and get the
            leave-now ping.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[300px]">
          {/* Soft brand glow behind the phone */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-8 rounded-[40%] bg-[radial-gradient(ellipse_at_center,rgba(200,16,46,0.12),transparent_70%)]"
          />

          <div className="relative mx-auto aspect-[9/19.5] w-full rounded-[2.4rem] bg-[var(--ink)] p-[10px] shadow-[0_28px_60px_-18px_rgba(11,11,12,0.45),0_0_0_1px_rgba(11,11,12,0.08)]">
            {/* Side buttons (subtle) */}
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

            {/* Bezel / screen */}
            <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-black">
              {/* Dynamic Island */}
              <div
                aria-hidden
                className="absolute left-1/2 top-2.5 z-10 h-[22px] w-[92px] -translate-x-1/2 rounded-full bg-black"
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
