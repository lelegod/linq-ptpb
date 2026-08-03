"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { TRAIN_PLAY_EVENT } from "@/lib/trainPlay";

/** Soft centered train watermark — static by default; glides on Rejsy brand hover/tap. */
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
        // Faces left — scroll down moves forward (negative X)
        const x = -Math.min(y * 0.08, 40);
        const vy = Math.min(y * 0.015, 8);
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
      {/* Truly centered in the hero */}
      <div
        className="absolute left-1/2 top-[48%] w-[min(118vw,720px)] -translate-x-1/2 -translate-y-1/2 sm:top-[46%] sm:w-[min(92vw,900px)] md:w-[min(78vw,1040px)]"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 72% 78% at 50% 50%, #000 35%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 72% 78% at 50% 50%, #000 35%, transparent 100%)",
        }}
      >
        <div
          ref={glideRef}
          className={`will-change-transform ${playing ? "train-glide-play" : ""}`}
          onAnimationEnd={onGlideEnd}
        >
          <div
            ref={parallaxRef}
            className="scroll-train opacity-[0.13] will-change-transform sm:opacity-[0.15] md:opacity-[0.17]"
          >
            <Image
              src="/train-hero.webp"
              alt=""
              width={1600}
              height={273}
              priority
              className="train-hero-mark h-auto w-full select-none"
              sizes="(max-width: 640px) 118vw, (max-width: 768px) 92vw, 1040px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
