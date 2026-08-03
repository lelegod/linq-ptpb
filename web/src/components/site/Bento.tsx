import { copy } from "@/content/copy";

function IconMessage() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H9l-4 3.5V6.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTicket() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 8.5A1.5 1.5 0 0 1 4.5 7h15A1.5 1.5 0 0 1 21 8.5v2a1.5 1.5 0 1 0 0 3v2A1.5 1.5 0 0 1 19.5 17h-15A1.5 1.5 0 0 1 3 15.5v-2a1.5 1.5 0 1 0 0-3v-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M10 19a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMap() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 4.5 3.5 7v12.5L9 17l6 2.5L20.5 17V4.5L15 7 9 4.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 4.5V17M15 7v12.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function OutBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 max-w-[min(100%,280px)] rounded-[17px] rounded-bl-[6px] bg-[var(--bubble)] px-3 py-2 font-data text-[11px] leading-relaxed text-white">
      {children}
    </div>
  );
}

function ProactiveBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 max-w-[min(100%,280px)] rounded-[17px] rounded-bl-[6px] border border-white/35 bg-white/10 px-3 py-2 font-data text-[11px] leading-relaxed text-white">
      {children}
    </div>
  );
}

export function Bento() {
  return (
    <section className="overflow-x-clip bg-[var(--ink)] px-4 py-12 sm:px-6 md:px-10 md:py-20">
      <div className="mx-auto max-w-5xl">
        <p className="font-data text-[11px] uppercase tracking-[0.06em] text-[var(--slate-inv)]">
          {copy.bentoLabel}
        </p>
        <h2 className="mt-3 text-[22px] font-semibold tracking-[-0.03em] text-white sm:text-[24px]">
          {copy.bentoHeading}
        </h2>

        <div className="mt-7 grid gap-2.5 sm:mt-8 sm:gap-[10px]">
          <div className="grid gap-2.5 sm:gap-[10px] md:grid-cols-[1.45fr_1fr]">
            <div className="rounded-[14px] bg-[var(--card-dark)] p-4 text-white sm:p-5">
              <div className="mb-3 text-white">
                <IconMessage />
              </div>
              <h3 className="text-[16px] font-semibold tracking-[-0.02em]">
                Plan in plain language.
              </h3>
              <p className="mt-2 text-[14px] leading-[1.55] text-[var(--slate-inv)]">
                Text where you&apos;re going. Rejsy answers with real options —
                times, operators, and how you get there.
              </p>
              <OutBubble>
                københavn h → aarhus h · sat
                <br />
                1. 09:03 → 12:17 · 🚆 dsb · 149 kr
                <br />
                2. 09:33 → 12:47 · 🚆 dsb · 149 kr
                <br />
                3. 10:03 → 13:17 · 🚶🚆Ⓜ️ · 89 kr
              </OutBubble>
            </div>

            <div className="grid gap-2.5 sm:gap-[10px]">
              <div className="rounded-[14px] bg-[var(--red)] p-4 text-white sm:p-5">
                <div className="mb-3">
                  <IconBell />
                </div>
                <h3 className="text-[16px] font-semibold tracking-[-0.02em]">
                  Leave-now, unprompted.
                </h3>
                <p className="mt-2 text-[14px] leading-[1.55] text-[var(--red-soft)]">
                  25 minutes before departure — station and platform included.
                  You never have to ask.
                </p>
                <ProactiveBubble>
                  🕘 leave in 25 min — københavn h, platform 5 · 09:03
                </ProactiveBubble>
              </div>
              <div className="rounded-[14px] bg-[var(--card-dark)] p-4 text-white sm:p-5">
                <div className="mb-3">
                  <IconMap />
                </div>
                <h3 className="text-[16px] font-semibold tracking-[-0.02em]">
                  Map + Buy on DSB.
                </h3>
                <p className="mt-2 text-[14px] leading-[1.55] text-[var(--slate-inv)]">
                  Lock a trip and get the route card. Tickets stay with the
                  operator — we never touch your card.
                </p>
                <OutBubble>
                  🗺️ københavn h → aarhus h
                  <br />
                  sat 09:03 · [ Buy on DSB → ]
                </OutBubble>
              </div>
            </div>
          </div>

          <div className="grid gap-2.5 sm:gap-[10px] md:grid-cols-2">
            <div className="rounded-[14px] bg-[var(--card-dark)] p-4 text-white sm:p-5">
              <div className="mb-3">
                <IconTicket />
              </div>
              <h3 className="text-[16px] font-semibold tracking-[-0.02em]">
                Live from Rejseplanen.
              </h3>
              <p className="mt-2 text-[14px] leading-[1.55] text-[var(--slate-inv)]">
                Prices, platforms, and delays come from the source. If we
                don&apos;t have it, we say so — never a guess.
              </p>
              <OutBubble>
                on time · platform 5
                <br />
                149 kr · 🚆 dsb · direct
              </OutBubble>
            </div>
            <div className="rounded-[14px] bg-[var(--card-dark)] p-4 text-white sm:p-5">
              <div className="mb-3">
                <IconMessage />
              </div>
              <h3 className="text-[16px] font-semibold tracking-[-0.02em]">
                Later trains, one tap.
              </h3>
              <p className="mt-2 text-[14px] leading-[1.55] text-[var(--slate-inv)]">
                React 🔽 on the options and Rejsy pages forward. No retyping
                your search.
              </p>
              <OutBubble>
                4. 10:33 → 13:47 · 🚆 dsb · 149 kr
                <br />
                5. 11:03 → 14:17 · 🚆 dsb · 89 kr
                <br />
                <span className="mt-1 inline-block rounded bg-white/20 px-1.5 py-0.5">
                  🔽
                </span>
              </OutBubble>
            </div>
          </div>
        </div>

        <p className="mt-5 font-data text-[11px] text-[var(--fig)]">
          {copy.bentoCaption}
        </p>
      </div>
    </section>
  );
}
