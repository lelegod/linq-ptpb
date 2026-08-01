"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/** Soft Danish EMU watermark — slow glide + light scroll parallax behind hero copy. */
export function TrainAccent() {
  const parallaxRef = useRef<HTMLDivElement>(null);

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
        // Subtle pass-by feel: mostly horizontal, tiny vertical drift.
        const x = Math.min(y * 0.12, 48);
        const vy = Math.min(y * 0.03, 18);
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

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute left-1/2 top-[50%] w-[min(160vw,920px)] -translate-x-1/2 -translate-y-1/2 sm:top-[48%] sm:w-[min(130vw,1100px)] md:w-[min(110vw,1280px)]">
        <div className="train-glide will-change-transform">
          <div
            ref={parallaxRef}
            className="scroll-train opacity-[0.10] will-change-transform sm:opacity-[0.13] md:opacity-[0.16]"
          >
            <Image
              src="/train-hero.webp"
              alt=""
              width={1531}
              height={334}
              priority
              className="h-auto w-full select-none"
              sizes="(max-width: 640px) 160vw, (max-width: 768px) 130vw, 1280px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
