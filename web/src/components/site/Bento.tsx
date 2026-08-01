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

function IconDatabase() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse
        cx="12"
        cy="6"
        rx="7"
        ry="3"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function OutBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 max-w-[260px] rounded-[17px] rounded-bl-[6px] bg-[var(--bubble)] px-3 py-2 font-data text-[11px] leading-relaxed text-white">
      {children}
    </div>
  );
}

function ProactiveBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 max-w-[260px] rounded-[17px] rounded-bl-[6px] border border-white/35 bg-white/10 px-3 py-2 font-data text-[11px] leading-relaxed text-white">
      {children}
    </div>
  );
}

export function Bento() {
  return (
    <section className="bg-[var(--ink)] px-4 py-12 sm:px-6 md:px-10 md:py-20">
      <div className="mx-auto max-w-5xl">
        <p className="font-data text-[11px] uppercase tracking-[0.06em] text-[var(--slate-inv)]">
          {copy.bentoLabel}
        </p>
        <h2 className="mt-3 text-[22px] font-semibold tracking-[-0.03em] text-white sm:text-[24px]">
          {copy.bentoHeading}
        </h2>

        <div className="mt-8 grid gap-[10px]">
          <div className="grid gap-[10px] md:grid-cols-[1.45fr_1fr]">
            <div className="rounded-[14px] bg-[var(--card-dark)] p-5 text-white">
              <div className="mb-3 text-white">
                <IconMessage />
              </div>
              <h3 className="text-[16px] font-semibold tracking-[-0.02em]">
                React for later trains.
              </h3>
              <p className="mt-2 text-[14px] leading-[1.55] text-[var(--slate-inv)]">
                Tap 🔽 on the options and it pages forward. No retyping your
                search, no starting over.
              </p>
              <OutBubble>
                4. 10:33 → 13:47 · dsb · 149 kr
                <br />
                5. 11:03 → 14:17 · dsb · 89 kr
                <br />
                <span className="mt-1 inline-block rounded bg-white/20 px-1.5 py-0.5">
                  🔽
                </span>
              </OutBubble>
            </div>

            <div className="grid gap-[10px]">
              <div className="rounded-[14px] bg-[var(--red)] p-5 text-white">
                <div className="mb-3">
                  <IconBell />
                </div>
                <h3 className="text-[16px] font-semibold tracking-[-0.02em]">
                  It texts you first.
                </h3>
                <p className="mt-2 text-[14px] leading-[1.55] text-[var(--red-soft)]">
                  25 minutes before departure, with your platform. You didn&apos;t
                  ask.
                </p>
                <ProactiveBubble>
                  🕘 leave in 25 min — platform 3, københavn h
                </ProactiveBubble>
              </div>
              <div className="rounded-[14px] bg-[var(--card-dark)] p-5 text-white">
                <div className="mb-3">
                  <IconDatabase />
                </div>
                <h3 className="text-[16px] font-semibold tracking-[-0.02em]">
                  Never a guess.
                </h3>
                <p className="mt-2 text-[14px] leading-[1.55] text-[var(--slate-inv)]">
                  Every price, platform and delay comes from Rejseplanen. If we
                  don&apos;t have it, we say so.
                </p>
                <OutBubble>
                  on time · platform 3
                  <br />
                  149 kr · dsb · direct
                </OutBubble>
              </div>
            </div>
          </div>

          <div className="grid gap-[10px] md:grid-cols-2">
            <div className="rounded-[14px] bg-[var(--card-dark)] p-5 text-white">
              <div className="mb-3">
                <IconMessage />
              </div>
              <h3 className="text-[16px] font-semibold tracking-[-0.02em]">
                Plan by text.
              </h3>
              <p className="mt-2 text-[14px] leading-[1.55] text-[var(--slate-inv)]">
                &ldquo;odense before 5&rdquo; is a complete search.
              </p>
              <OutBubble>
                got it — 3 options to odense before 17:00
              </OutBubble>
            </div>
            <div className="rounded-[14px] bg-[var(--card-dark)] p-5 text-white">
              <div className="mb-3">
                <IconTicket />
              </div>
              <h3 className="text-[16px] font-semibold tracking-[-0.02em]">
                One tap to book.
              </h3>
              <p className="mt-2 text-[14px] leading-[1.55] text-[var(--slate-inv)]">
                Straight into DSB. We never touch your card.
              </p>
              <OutBubble>
                🗺️ københavn h → aarhus h
                <br />
                sat 09:03 · [ See route → ]
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
