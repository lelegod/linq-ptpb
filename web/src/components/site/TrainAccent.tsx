"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/** Soft red train watermark — centered, dominant but airy, behind hero copy/phone. */
export function TrainAccent() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        el.style.transform = `translate3d(${Math.min(y * 0.08, 36)}px, ${y * 0.04}px, 0)`;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {/* Outer: geometric center. Inner: parallax-only transform. */}
      <div className="absolute left-1/2 top-[48%] w-[min(118vw,560px)] -translate-x-1/2 -translate-y-1/2 sm:top-[46%] sm:w-[min(92vw,720px)] md:w-[min(78vw,860px)]">
        <div
          ref={ref}
          className="scroll-train opacity-[0.11] sm:opacity-[0.14] md:opacity-[0.17]"
        >
          <Image
            src="/train-hero.webp"
            alt=""
            width={541}
            height={494}
            priority
            className="h-auto w-full select-none"
            sizes="(max-width: 640px) 118vw, (max-width: 768px) 92vw, 860px"
          />
        </div>
      </div>
    </div>
  );
}
