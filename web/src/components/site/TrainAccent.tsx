"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { TRAIN_PLAY_EVENT } from "@/lib/trainPlay";

/** Blocky train watermark — static by default; glides on Rejsy brand hover/tap. */
export function TrainAccent() {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const glideRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const play = () => {
      if (reduce.matches || playingRef.current) return;
      playingRef.current = true;
      setPlaying(true);
    };

    window.addEventListener(TRAIN_PLAY_EVENT, play);
    return () => window.removeEventListener(TRAIN_PLAY_EVENT, play);
  }, []);

  useEffect(() => {
    const el = parallaxRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        // train-hero faces left — scroll down moves it forward (negative X)
        const x = -Math.min(y * 0.1, 40);
        const vy = Math.min(y * 0.02, 10);
        el.style.transform = `translate3d(${x}px, ${vy}px, 0)`;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function onGlideEnd() {
    playingRef.current = false;
    setPlaying(false);
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <filter id="train-blocky" colorInterpolationFilters="sRGB">
            <feComponentTransfer>
              <feFuncR type="discrete" tableValues="0 0.2 0.45 0.7 1" />
              <feFuncG type="discrete" tableValues="0 0.2 0.45 0.7 1" />
              <feFuncB type="discrete" tableValues="0 0.2 0.45 0.7 1" />
            </feComponentTransfer>
            <feConvolveMatrix
              order="3"
              kernelMatrix="0 -1 0 -1 5 -1 0 -1 0"
              preserveAlpha="true"
            />
          </filter>
        </defs>
      </svg>
      <div
        className="absolute left-1/2 top-[52%] w-[min(190vw,980px)] -translate-x-1/2 -translate-y-1/2 sm:top-[50%] sm:w-[min(150vw,1180px)] md:w-[min(120vw,1360px)]"
        style={{
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
          maskImage:
            "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
        }}
      >
        <div
          ref={glideRef}
          className={`will-change-transform ${playing ? "train-glide-play" : ""}`}
          onAnimationEnd={onGlideEnd}
        >
          <div
            ref={parallaxRef}
            className="scroll-train opacity-[0.14] will-change-transform sm:opacity-[0.17] md:opacity-[0.2]"
          >
            <Image
              src="/train-hero.webp"
              alt=""
              width={1600}
              height={273}
              priority
              className="train-hero-blocky h-auto w-full select-none"
              sizes="(max-width: 640px) 190vw, (max-width: 768px) 150vw, 1360px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
