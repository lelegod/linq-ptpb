"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/** Soft Danish EMU watermark — polished pass-by + light scroll parallax. */
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
        // Soft drift with the page — mostly lateral, tiny lift.
        const x = Math.min(y * 0.1, 40);
        const vy = Math.min(y * 0.025, 14);
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
      <div
        className="absolute left-1/2 top-[52%] w-[min(190vw,980px)] -translate-x-1/2 -translate-y-1/2 sm:top-[50%] sm:w-[min(150vw,1180px)] md:w-[min(120vw,1360px)]"
        style={{
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
          maskImage:
            "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
        }}
      >
        <div className="train-glide will-change-transform">
          <div
            ref={parallaxRef}
            className="scroll-train opacity-[0.09] will-change-transform sm:opacity-[0.12] md:opacity-[0.15]"
          >
            <Image
              src="/train-hero.webp"
              alt=""
              width={1600}
              height={273}
              priority
              className="h-auto w-full select-none"
              sizes="(max-width: 640px) 190vw, (max-width: 768px) 150vw, 1360px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
