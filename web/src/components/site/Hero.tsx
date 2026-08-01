"use client";

import { useState } from "react";
import { copy } from "@/content/copy";
import { TextRejsyCta } from "@/components/site/TextRejsyCta";
import { TrainAccent } from "@/components/site/TrainAccent";

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
      className="relative overflow-x-clip px-4 pb-12 pt-8 sm:px-6 md:pb-16 md:pt-14"
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden grid-bg"
        aria-hidden
      />
      <TrainAccent />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h1
          className="fadeUp text-[32px] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-[36px] md:text-[54px]"
          style={{ animationDelay: "0ms" }}
        >
          {copy.meet}{" "}
          <em className="font-display font-medium italic text-[var(--red)]">
            {copy.brand}
          </em>
          {copy.meetRest}
        </h1>
        <p
          className="fadeUp mx-auto mt-3 max-w-xl text-[15px] leading-[1.6] text-[var(--slate)] sm:mt-4 sm:text-[16px] sm:leading-[1.65]"
          style={{ animationDelay: "110ms" }}
        >
          {copy.subhead}
        </p>
        <p
          className="fadeUp mx-auto mt-3 max-w-md font-data text-[11px] uppercase tracking-[0.06em] text-[var(--muted)] sm:text-[12px]"
          style={{ animationDelay: "160ms" }}
        >
          {copy.proactiveLine}
        </p>

        {/* Mobile: CTA first so the fold is clean */}
        <div
          className="fadeUp mt-6 flex flex-col items-center gap-2 md:hidden"
          style={{ animationDelay: "200ms" }}
        >
          <TextRejsyCta
            href={messagesHref}
            variant="red"
            className="w-full max-w-sm"
          />
          <p className="font-data text-[10px] text-[var(--muted)] sm:text-[11px]">
            {copy.ctaNote}
          </p>
        </div>

        <div className="relative mx-auto mt-8 flex w-full max-w-[278px] flex-col items-center md:mt-10 md:max-w-[300px]">
          <div
            className="phoneIn relative w-full rounded-[36px] border border-[var(--ink)] bg-[var(--ink)] p-[7px] sm:rounded-[42px] sm:p-[8px]"
            style={{ animationDelay: "260ms" }}
          >
            <div className="overflow-hidden rounded-[30px] bg-[var(--paper)] sm:rounded-[34px]">
              <div className="relative flex items-center justify-center border-b border-[var(--line)] px-3 pb-2 pt-3">
                <div className="absolute left-1/2 top-1.5 h-3.5 w-16 -translate-x-1/2 rounded-full bg-[var(--ink)] sm:h-4 sm:w-20" />
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

            <div
              className="fadeUp pointer-events-none absolute top-[70%] left-[calc(100%+12px)] hidden w-[7.5rem] text-left md:block"
              style={{ animationDelay: "3700ms" }}
            >
              <div className="mb-1.5 h-[2px] w-2 bg-[var(--red)]" />
              <p className="font-data text-[10px] uppercase tracking-[0.06em] text-[var(--muted)]">
                {copy.annotation}
              </p>
            </div>
          </div>

          <p
            className="fadeUp mt-3 font-data text-[10px] uppercase tracking-[0.06em] text-[var(--muted)] md:hidden"
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

        {/* Desktop: QR + Text CTA (same sms: payload) */}
        <div
          className="fadeUp mt-8 hidden flex-col items-center gap-3 md:flex"
          style={{ animationDelay: "4000ms" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="QR code — scan on iPhone to open Rejsy in Messages"
            width={140}
            height={140}
            className="border border-[var(--line)] bg-[var(--paper)] p-2"
          />
          <p className="font-data text-[10px] uppercase tracking-[0.06em] text-[var(--muted)]">
            {copy.qrHint}
          </p>
          <p className="max-w-xs text-[13px] text-[var(--slate)]">
            Point your iPhone camera at the code to text Rejsy.
          </p>
          <TextRejsyCta href={messagesHref} variant="red" />
          <p className="font-data text-[10px] text-[var(--muted)] sm:text-[11px]">
            {copy.ctaNote}
          </p>
          <a
            href="/product"
            className="mt-1 text-[13px] font-medium text-[var(--slate)] underline decoration-[var(--line)] underline-offset-4 hover:text-[var(--ink)]"
          >
            {copy.ctaExplore}
          </a>
        </div>
      </div>
    </section>
  );
}
