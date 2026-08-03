"use client";

import { useState } from "react";
import { copy } from "@/content/copy";
import { TextRejsyCta } from "@/components/site/TextRejsyCta";
import { TrainAccent } from "@/components/site/TrainAccent";
import { playHeroTrain } from "@/lib/trainPlay";

/** iPhone Messages–style type inside the phone only */
const imFont =
  'font-[system-ui,-apple-system,BlinkMacSystemFont,"SF_Pro_Text","SF_Pro_Display","Segoe_UI",sans-serif]';

function U({ children }: { children: React.ReactNode }) {
  return <span className="underline decoration-white/55 underline-offset-[2px]">{children}</span>;
}

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
      <div
        className={`max-w-[82%] rounded-[18px] rounded-br-[5px] bg-[#007aff] px-[11px] py-[7px] text-[14px] leading-[1.3] tracking-[-0.01em] text-white ${imFont}`}
      >
        {children}
      </div>
    </div>
  );
}

function Outbound({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <div
      className="pop flex justify-start"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`max-w-[92%] rounded-[18px] rounded-bl-[5px] bg-[#262629] px-[11px] py-[8px] text-[14px] leading-[1.35] tracking-[-0.01em] text-white ${imFont}`}
      >
        {children}
      </div>
    </div>
  );
}

function ItineraryOption({
  n,
  from,
  to,
  duration,
  changes,
}: {
  n: number;
  from: string;
  to: string;
  duration: string;
  changes: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-[1px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] bg-[#0a84ff] text-[11px] font-semibold leading-none text-white">
        {n}
      </span>
      <div className="min-w-0">
        <p>
          <U>{from}</U>
          <span className="text-white/70">{" → "}</span>
          <U>{to}</U>
          <span className="text-white/55">
            {" · "}
            {duration}
            {" · "}
            {changes}
          </span>
        </p>
      </div>
    </div>
  );
}

function ThreadBody() {
  return (
    <div className={`flex flex-col gap-[5px] px-2.5 pb-3 pt-2 ${imFont}`}>
      <Inbound delay={620}>aarhus tomorrow around 9</Inbound>

      <div
        className="typing flex justify-start"
        style={{ ["--hide" as string]: "1500ms", animationDelay: "900ms" }}
      >
        <div className="flex items-center gap-1 rounded-[18px] rounded-bl-[5px] bg-[#262629] px-3 py-2.5">
          <span className="dot" style={{ animationDelay: "0ms" }} />
          <span className="dot" style={{ animationDelay: "150ms" }} />
          <span className="dot" style={{ animationDelay: "300ms" }} />
        </div>
      </div>

      {/* Options list — iMessage itinerary style */}
      <Outbound delay={1900}>
        <div className="space-y-2.5">
          <p className="text-[13px] text-white/70">
            København H → Aarhus H · Sat
          </p>

          <div className="space-y-2 border-t border-white/10 pt-2">
            <ItineraryOption
              n={1}
              from="09:03"
              to="12:17"
              duration="3h 14m"
              changes="0 changes"
            />
            <p className="pl-[26px] text-[13px] leading-[1.4] text-white/90">
              <U>09:03</U>
              {" · København H"}
              <br />
              {"🚆 DSB IC · Track 5"}
              <br />
              <U>12:17</U>
              {" · Aarhus H"}
            </p>
          </div>

          <div className="space-y-1.5 border-t border-white/10 pt-2">
            <ItineraryOption
              n={2}
              from="09:33"
              to="12:47"
              duration="3h 14m"
              changes="0 changes"
            />
          </div>

          <div className="space-y-1.5 border-t border-white/10 pt-2">
            <ItineraryOption
              n={3}
              from="10:03"
              to="13:17"
              duration="3h 14m"
              changes="1 change"
            />
            <p className="pl-[26px] text-[13px] leading-[1.45] text-white/90">
              <U>10:03</U>
              {" · København H"}
              <br />
              {"🚶 Walk 4 min"}
              <br />
              <U>10:07</U>
              {" · København H · 🚆 DSB"}
              <br />
              <U>12:40</U>
              {" · Skanderborg"}
              <br />
              {"🚶 Walk 3 min"}
              <br />
              <U>12:48</U>
              {" · Skanderborg · Ⓜ️ Bus"}
              <br />
              <U>13:17</U>
              {" · Aarhus H"}
            </p>
          </div>
        </div>
      </Outbound>

      <Outbound delay={2300}>
        <span className="text-white/90">Reply 1, 2 or 3 to lock it in.</span>
      </Outbound>

      <Inbound delay={2700}>1</Inbound>

      <Outbound delay={3100}>
        {"🚆 Locked in — I'll remind you 25 min before departure."}
      </Outbound>

      <Outbound delay={3600}>
        <span>
          {"🕘 Leave in 25 min — head to "}
          <U>København H</U>
          {", platform 5. DSB IC to Aarhus, "}
          <U>09:03</U>
          {"."}
        </span>
      </Outbound>
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
      className="relative overflow-x-clip px-4 pb-12 pt-6 sm:px-6 sm:pt-8 md:pb-16 md:pt-14"
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden grid-bg"
        aria-hidden
      />
      <TrainAccent />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h1
          className="fadeUp text-[28px] font-semibold leading-[1.1] tracking-[-0.04em] sm:text-[36px] md:text-[54px]"
          style={{ animationDelay: "0ms" }}
        >
          {copy.meet}{" "}
          <button
            type="button"
            onMouseEnter={playHeroTrain}
            onFocus={playHeroTrain}
            onClick={playHeroTrain}
            className="font-display font-medium italic text-[var(--red)] underline decoration-transparent underline-offset-4 transition-[text-decoration-color] hover:decoration-[var(--red)]/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--red)]"
            aria-label="Play train animation"
          >
            {copy.brand}
          </button>
          {copy.meetRest}
        </h1>
        <p
          className="fadeUp mx-auto mt-3 max-w-xl text-[15px] leading-[1.55] text-[var(--slate)] sm:mt-4 sm:text-[16px] sm:leading-[1.65]"
          style={{ animationDelay: "110ms" }}
        >
          {copy.subhead}
        </p>
        <p
          className="fadeUp mx-auto mt-3 max-w-md px-1 font-data text-[10px] uppercase tracking-[0.06em] text-[var(--muted)] sm:text-[12px]"
          style={{ animationDelay: "160ms" }}
        >
          {copy.proactiveLine}
        </p>

        <div
          className="fadeUp mt-5 flex w-full flex-col items-center gap-2.5 md:hidden"
          style={{ animationDelay: "200ms" }}
        >
          <TextRejsyCta
            href={messagesHref}
            variant="red"
            className="w-full max-w-sm min-h-12"
          />
          <p className="font-data text-[10px] text-[var(--muted)] sm:text-[11px]">
            {copy.ctaNote}
          </p>
          <a
            href="/product"
            className="inline-flex min-h-11 items-center text-[14px] font-medium text-[var(--slate)] underline decoration-[var(--line)] underline-offset-4"
          >
            {copy.ctaExplore}
          </a>
        </div>

        <div className="relative mx-auto mt-7 flex w-full max-w-[270px] flex-col items-center sm:max-w-[300px] md:mt-10 md:max-w-[320px]">
          <div
            className="phoneIn relative w-full rounded-[36px] border border-[#1c1c1e] bg-[#1c1c1e] p-[7px] sm:rounded-[44px] sm:p-[9px]"
            style={{ animationDelay: "260ms" }}
          >
            {/* Dark-mode Messages chrome */}
            <div className="overflow-hidden rounded-[30px] bg-black sm:rounded-[36px]">
              <div
                className={`relative flex items-center justify-center border-b border-white/10 bg-[#1c1c1e] px-3 pb-2.5 pt-3 ${imFont}`}
              >
                <div className="absolute left-1/2 top-1.5 h-3 w-14 -translate-x-1/2 rounded-full bg-black sm:h-3.5 sm:w-[72px]" />
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--red)] text-[11px] font-semibold text-white">
                    R
                  </div>
                  <span className="text-[13px] font-semibold text-white">
                    {copy.name}
                  </span>
                </div>
              </div>

              <div key={run} className="min-h-[340px] bg-black sm:min-h-[380px]">
                <ThreadBody />
              </div>

              {/* Composer — matches screenshot */}
              <div
                className={`flex items-center gap-2 border-t border-white/10 bg-black px-2.5 py-2 ${imFont}`}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2c2c2e] text-[16px] leading-none text-white/80">
                  +
                </div>
                <div className="flex min-h-8 flex-1 items-center rounded-full bg-[#1c1c1e] px-3 text-[14px] text-white/90 ring-1 ring-white/10">
                  <span className="text-[#0a84ff]">|</span>
                </div>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0a84ff] text-[13px] font-bold text-white">
                  ↑
                </div>
              </div>
            </div>

            <div
              className="fadeUp pointer-events-none absolute top-[70%] left-[calc(100%+12px)] hidden w-[7.5rem] text-left md:block"
              style={{ animationDelay: "4000ms" }}
            >
              <div className="mb-1.5 h-[2px] w-2 bg-[var(--red)]" />
              <p className="font-data text-[10px] uppercase tracking-[0.06em] text-[var(--muted)]">
                {copy.annotation}
              </p>
            </div>
          </div>

          <p
            className="fadeUp mt-3 font-data text-[10px] uppercase tracking-[0.06em] text-[var(--muted)] md:hidden"
            style={{ animationDelay: "4000ms" }}
          >
            ↑ sent without being asked
          </p>

          <button
            type="button"
            onClick={() => setRun((n) => n + 1)}
            className="mt-2 inline-flex min-h-10 items-center font-data text-[10px] uppercase tracking-[0.06em] text-[var(--muted)] hover:text-[var(--slate)]"
          >
            {copy.replay}
          </button>
        </div>

        <div
          className="fadeUp mt-8 hidden flex-col items-center gap-3 md:flex"
          style={{ animationDelay: "4200ms" }}
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
