"use client";

import { useEffect, useRef } from "react";

/** Subtle scroll-linked train on a track — CSS transform only. */
export function ScrollTrain() {
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
        const x = Math.min(y * 0.35, 220);
        el.style.transform = `translate3d(${x}px, ${y * 0.04}px, 0)`;
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
      className="pointer-events-none absolute inset-x-0 bottom-[18%] z-0 hidden overflow-hidden md:block"
      aria-hidden
    >
      <svg
        className="mx-auto w-full max-w-4xl opacity-40"
        viewBox="0 0 800 80"
        fill="none"
      >
        <line
          className="track-dash"
          x1="40"
          y1="52"
          x2="760"
          y2="52"
          stroke="var(--ink)"
          strokeWidth="1.5"
          opacity="0.35"
        />
        <line
          x1="40"
          y1="58"
          x2="760"
          y2="58"
          stroke="var(--ink)"
          strokeWidth="1"
          opacity="0.2"
        />
      </svg>
      <div
        ref={ref}
        className="scroll-train absolute left-[8%] top-0 will-change-transform"
      >
        <svg width="72" height="36" viewBox="0 0 72 36" fill="none">
          <rect
            x="4"
            y="6"
            width="48"
            height="18"
            rx="3"
            fill="var(--ink)"
            opacity="0.85"
          />
          <rect
            x="52"
            y="10"
            width="14"
            height="12"
            rx="2"
            fill="var(--red)"
            opacity="0.9"
          />
          <rect x="10" y="10" width="8" height="7" rx="1" fill="var(--sky)" />
          <rect x="22" y="10" width="8" height="7" rx="1" fill="var(--sky)" />
          <rect x="34" y="10" width="8" height="7" rx="1" fill="var(--sky)" />
          <circle cx="16" cy="28" r="3.5" fill="var(--ink)" opacity="0.7" />
          <circle cx="40" cy="28" r="3.5" fill="var(--ink)" opacity="0.7" />
        </svg>
      </div>
    </div>
  );
}
