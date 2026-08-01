"use client";

import { useState } from "react";
import { copy } from "@/content/copy";

const thread = {
  user1: "aarhus tomorrow around 9",
  options: `københavn h → aarhus h, sat
1. 09:03 → 12:17 · dsb · 149 kr · direct
2. 09:33 → 12:47 · dsb · 149 kr · direct
3. 10:03 → 13:17 · dsb · 89 kr · orange`,
  hint: "reply 1, 2 or 3 — or react 🔽 for later",
  user2: "3",
  confirm: "🚆 locked in — i'll remind you 25 min before departure.",
  reminder:
    "🕘 leave in 25 min — head to københavn h, platform 3. train 79 to aarhus, 09:03.",
};

function Inbound({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <div
      className="pop flex justify-end"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="max-w-[85%] rounded-[17px] rounded-br-[6px] bg-[#E9E9EB] px-3 py-2 text-[13px] leading-snug text-[var(--ink)]">
        {children}
      </div>
    </div>
  );
}

function Outbound({
  children,
  delay,
  mono,
}: {
  children: React.ReactNode;
  delay: number;
  mono?: boolean;
}) {
  return (
    <div
      className="pop flex justify-start"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`max-w-[90%] rounded-[17px] rounded-bl-[6px] bg-[var(--bubble)] px-3 py-2 text-[13px] leading-snug text-white ${
          mono ? "font-data whitespace-pre-wrap text-[12px]" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Proactive({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <div
      className="pop mt-2 flex justify-start"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="max-w-[90%] rounded-[17px] rounded-bl-[6px] border border-[var(--line)] bg-white px-3 py-2 text-[13px] leading-snug text-[var(--ink)]">
        {children}
      </div>
    </div>
  );
}

function ThreadBody() {
  return (
    <div className="flex flex-col gap-1.5 px-3 pb-4 pt-2">
      <Inbound delay={620}>{thread.user1}</Inbound>

      <div
        className="typing flex justify-start"
        style={{ ["--hide" as string]: "1500ms", animationDelay: "900ms" }}
      >
        <div className="flex items-center gap-1 rounded-[17px] rounded-bl-[6px] bg-[#E9E9EB] px-3 py-2.5">
          <span className="dot" style={{ animationDelay: "0ms" }} />
          <span className="dot" style={{ animationDelay: "150ms" }} />
          <span className="dot" style={{ animationDelay: "300ms" }} />
        </div>
      </div>

      <Outbound delay={1900} mono>
        {thread.options}
      </Outbound>
      <Outbound delay={2150}>{thread.hint}</Outbound>
      <Inbound delay={2500}>{thread.user2}</Inbound>
      <Outbound delay={2900}>{thread.confirm}</Outbound>
      <Proactive delay={3500}>{thread.reminder}</Proactive>
    </div>
  );
}

export function Hero() {
  const [run, setRun] = useState(0);
  const linqUrl = process.env.NEXT_PUBLIC_LINQ_URL ?? "#";

  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-10 md:pt-14">
      <div className="pointer-events-none absolute inset-0 grid-bg" aria-hidden />

      <div className="relative mx-auto max-w-3xl text-center">
        <h1
          className="fadeUp text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] md:text-[54px]"
          style={{ animationDelay: "0ms" }}
        >
          {copy.headline[0]}
          <br />
          {copy.headline[1]}
        </h1>
        <p
          className="fadeUp mx-auto mt-4 max-w-xl text-[16px] leading-[1.65] text-[var(--slate)]"
          style={{ animationDelay: "110ms" }}
        >
          {copy.subhead}
        </p>

        <div className="relative mx-auto mt-10 flex w-[278px] flex-col items-center md:w-[300px]">
          <div
            className="phoneIn relative w-full rounded-[42px] border border-[var(--ink)] bg-[var(--ink)] p-[8px]"
            style={{ animationDelay: "260ms" }}
          >
            <div className="overflow-hidden rounded-[34px] bg-[var(--paper)]">
              <div className="relative flex items-center justify-center border-b border-[var(--line)] px-3 pb-2 pt-3">
                <div className="absolute left-1/2 top-1.5 h-4 w-20 -translate-x-1/2 rounded-full bg-[var(--ink)]" />
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--red)] text-[11px] font-semibold text-white">
                    R
                  </div>
                  <span className="text-[13px] font-semibold">{copy.name}</span>
                </div>
              </div>

              <div key={run}>
                <ThreadBody />
              </div>
            </div>

            {/* desktop annotation */}
            <div
              className="fadeUp pointer-events-none absolute -right-36 top-[72%] hidden w-28 sm:block"
              style={{ animationDelay: "3700ms" }}
            >
              <div className="mb-1.5 h-0.5 w-2 bg-[var(--red)]" />
              <p className="font-data text-left text-[10px] uppercase tracking-[0.06em] text-[var(--muted)]">
                {copy.annotation}
              </p>
            </div>
          </div>

          <p
            className="fadeUp mt-3 font-data text-[10px] uppercase tracking-[0.06em] text-[var(--muted)] sm:hidden"
            style={{ animationDelay: "3700ms" }}
          >
            ↑ sent without being asked
          </p>

          <button
            type="button"
            onClick={() => setRun((n) => n + 1)}
            className="mt-3 font-data text-[10px] uppercase tracking-[0.06em] text-[var(--muted)] hover:text-[var(--slate)]"
          >
            {copy.replay}
          </button>
        </div>

        <div
          className="fadeUp mt-8 flex flex-col items-center gap-2"
          style={{ animationDelay: "4000ms" }}
        >
          <a
            href={linqUrl}
            className="inline-flex items-center justify-center rounded-[10px] bg-[var(--red)] px-6 py-3 text-[15px] font-semibold text-white"
          >
            {copy.cta}
          </a>
          <p className="font-data text-[11px] text-[var(--muted)]">
            {copy.ctaNote}
          </p>
        </div>
      </div>
    </section>
  );
}
