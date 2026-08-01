"use client";

import { Reveal } from "@/components/site/Reveal";
import { howRejsyWorks, storyBeats } from "@/content/copy";

function Beat({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className={className}>
      {children}
    </Reveal>
  );
}

export function HowItWorksStory() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6">
      {/* Scene-setting beats */}
      <section
        className="border-t border-[var(--line)] py-16 md:py-24"
        aria-label="The problem"
      >
        <div className="space-y-10 md:space-y-14">
          {storyBeats.scene.map((line, i) => (
            <Beat key={line} delay={i * 40}>
              <p className="text-[22px] font-medium leading-[1.35] tracking-[-0.03em] text-[var(--ink)] sm:text-[26px] md:text-[28px]">
                {line}
              </p>
            </Beat>
          ))}
        </div>
      </section>

      {/* Maps friction */}
      <section
        className="border-t border-[var(--line)] py-16 md:py-24"
        aria-label="What Maps misses"
      >
        <div className="space-y-8 md:space-y-12">
          <Beat>
            <p className="text-[22px] font-medium leading-[1.35] tracking-[-0.03em] text-[var(--ink)] sm:text-[26px] md:text-[28px]">
              {storyBeats.mapsOpen}
            </p>
          </Beat>
          <Beat delay={60}>
            <p className="text-[17px] leading-[1.65] text-[var(--slate)] sm:text-[18px]">
              {storyBeats.mapsLag}
            </p>
          </Beat>
          <Beat delay={100}>
            <p className="text-[17px] leading-[1.65] text-[var(--slate)] sm:text-[18px]">
              {storyBeats.mapsBlind}
            </p>
          </Beat>
        </div>
      </section>

      {/* Four apps stack */}
      <section
        className="border-t border-[var(--line)] py-16 md:py-24"
        aria-label="Four apps"
      >
        <Beat>
          <p className="font-data text-[12px] uppercase tracking-[0.08em] text-[var(--muted)] sm:text-[13px]">
            {storyBeats.stack}
          </p>
        </Beat>

        <div className="mt-16 space-y-10 md:mt-24 md:space-y-14">
          <Beat delay={80}>
            <p className="punch-line text-[28px] font-semibold leading-[1.2] tracking-[-0.035em] text-[var(--ink)] sm:text-[34px] md:text-[40px]">
              {storyBeats.punchCoffee}
            </p>
          </Beat>

          <Beat delay={160}>
            <p className="punch-line text-[32px] font-semibold leading-[1.15] tracking-[-0.04em] text-[var(--red)] sm:text-[40px] md:text-[48px]">
              {storyBeats.punchFour}
            </p>
          </Beat>

          <Beat delay={220}>
            <p className="mt-4 text-[20px] font-medium leading-[1.4] tracking-[-0.03em] text-[var(--ink)] sm:text-[24px] md:text-[26px]">
              {storyBeats.friend}
            </p>
          </Beat>
        </div>
      </section>

      {/* How Rejsy works — brief */}
      <section
        id="how"
        className="scroll-mt-24 border-t border-[var(--line)] py-16 md:py-24"
        aria-labelledby="how-heading"
      >
        <Beat>
          <p className="font-data text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
            How Rejsy works
          </p>
          <h2
            id="how-heading"
            className="mt-3 text-[26px] font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-[32px]"
          >
            Text the agent. Get the trip.
          </h2>
        </Beat>

        <ol className="mt-10 space-y-8 md:mt-12 md:space-y-10">
          {howRejsyWorks.map((step, i) => (
            <Beat key={step.title} delay={i * 50}>
              <li className="flex gap-4 sm:gap-5">
                <span
                  className="mt-1 font-data text-[12px] text-[var(--red)]"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-[var(--ink)] sm:text-[18px]">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-[1.6] text-[var(--slate)] sm:text-[16px]">
                    {step.body}
                  </p>
                </div>
              </li>
            </Beat>
          ))}
        </ol>
      </section>
    </div>
  );
}
