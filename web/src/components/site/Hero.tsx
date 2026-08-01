"use client";

import { useState } from "react";
import { copy } from "@/content/copy";
import { TextRejsyCta } from "@/components/site/TextRejsyCta";
import { TransitCollage } from "@/components/site/TransitCollage";
import { ScrollTrain } from "@/components/site/ScrollTrain";

const thread = {
  user1: "aarhus tomorrow around 9",
  options: `københavn h → aarhus h, sat
1. 09:03 → 12:17 · dsb · 149 kr
2. 09:33 → 12:47 · dsb · 149 kr
3. 10:03 → 13:17 · dsb · 89 kr`,
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
      <div className="max-w-[85%] rounded-[17px] rounded-br-[6px] bg-[var(--inbound)] px-3 py-2 text-[13px] leading-snug text-[var(--ink)]">
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
          mono ? "font-data whitespace-pre-wrap text-[11px] sm:text-[12px]" : ""
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
      <div className="max-w-[90%] rounded-[17px] rounded-bl-[6px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-[13px] leading-snug text-[var(--ink)]">
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
        <div className="flex items-center gap-1 rounded-[17px] rounded-bl-[6px] bg-[var(--inbound)] px-3 py-2.5">
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

export function Hero({
  qrDataUrl,
  messagesHref,
}: {
  qrDataUrl: string;
  messagesHref: string;
}) {
  const [run, setRun] = useState(0);

  return (
    <section
      id="start"
      className="relative overflow-x-clip px-4 pb-0 pt-2 sm:px-6 md:pt-4"
    >
      <ScrollTrain />

      <div className="relative mx-auto max-w-3xl text-center">
        <p
          className="fadeUp mx-auto inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-[12px] text-[var(--slate)] ring-1 ring-[var(--line)] backdrop-blur-sm"
          style={{ animationDelay: "0ms" }}
        >
          <span className="rounded bg-[var(--red)] px-1.5 py-0.5 font-data text-[9px] uppercase tracking-[0.06em] text-white">
            New
          </span>
          {copy.announcement}
        </p>

        <h1
          className="fadeUp font-display mx-auto mt-6 max-w-[18ch] text-[34px] font-medium leading-[1.12] tracking-[-0.03em] text-[var(--ink)] sm:text-[44px] md:mt-8 md:text-[56px]"
          style={{ animationDelay: "80ms" }}
        >
          {copy.meet}{" "}
          <em className="font-medium italic">{copy.brand}</em>
          {copy.meetRest}
        </h1>

        <p
          className="fadeUp mx-auto mt-4 max-w-xl text-[15px] leading-[1.65] text-[var(--slate)] sm:text-[17px]"
          style={{ animationDelay: "140ms" }}
        >
          {copy.subhead}
        </p>

        <div
          className="fadeUp mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-3"
          style={{ animationDelay: "200ms" }}
        >
          <TextRejsyCta href={messagesHref} variant="butter" className="w-full max-w-xs sm:w-auto" />
          <a
            href="#product"
            className="inline-flex w-full max-w-xs items-center justify-center rounded-full bg-white/80 px-6 py-3.5 text-[15px] font-semibold text-[var(--ink)] ring-1 ring-[var(--line)] soft-lift transition-colors hover:bg-white sm:w-auto"
          >
            {copy.ctaExplore}
          </a>
        </div>
        <p
          className="fadeUp mt-3 font-data text-[10px] text-[var(--muted)] sm:text-[11px]"
          style={{ animationDelay: "240ms" }}
        >
          {copy.ctaNote}
        </p>

        <div
          className="fadeUp mt-10 md:mt-12"
          style={{ animationDelay: "280ms" }}
        >
          <TransitCollage href={messagesHref} />
        </div>

        {/* Phone peek — Poke / emailed style */}
        <div className="relative mx-auto mt-10 flex w-full max-w-[280px] flex-col items-center md:mt-14 md:max-w-[300px]">
          <div
            className="phoneIn relative w-full rounded-[36px] border border-[var(--ink)] bg-[var(--ink)] p-[7px] sm:rounded-[42px] sm:p-[8px]"
            style={{ animationDelay: "320ms" }}
          >
            <div className="overflow-hidden rounded-[30px] bg-[var(--paper)] sm:rounded-[34px]">
              <div className="relative flex items-center justify-center border-b border-[var(--line)] px-3 pb-2 pt-3">
                <div className="absolute left-1/2 top-1.5 h-3.5 w-16 -translate-x-1/2 rounded-full bg-[var(--ink)] sm:h-4 sm:w-20" />
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--red)] text-[11px] font-semibold text-white">
                    R
                  </div>
                  <span className="text-[13px] font-semibold">{copy.name}</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                    <circle cx="7" cy="7" r="7" fill="#007aff" />
                    <path
                      d="M4 7.2 6 9.2 10 4.8"
                      stroke="#fff"
                      strokeWidth="1.4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <div key={run}>
                <ThreadBody />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setRun((n) => n + 1)}
            className="mt-3 font-data text-[10px] uppercase tracking-[0.06em] text-[var(--muted)] hover:text-[var(--slate)]"
          >
            {copy.replay}
          </button>
        </div>

        {/* Desktop QR — same sms payload */}
        <div
          className="fadeUp mt-8 hidden flex-col items-center gap-1.5 pb-10 md:flex"
          style={{ animationDelay: "400ms" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="QR code — scan on iPhone to open Rejsy in Messages"
            width={120}
            height={120}
            className="rounded-xl border border-[var(--line)] bg-white p-2"
          />
          <p className="font-data text-[10px] uppercase tracking-[0.06em] text-[var(--muted)]">
            {copy.qrHint}
          </p>
        </div>
      </div>
    </section>
  );
}
