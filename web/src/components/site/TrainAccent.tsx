"use client";

import { useEffect, useRef } from "react";
import { DanishEmuHeroSvg } from "@/components/site/DanishEmuHeroSvg";

/** Soft Danish EMU watermark — smooth pass-by + light scroll parallax. */
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
        const x = Math.min(y * 0.08, 32);
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

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute left-1/2 top-[52%] w-[min(200vw,1040px)] -translate-x-1/2 -translate-y-1/2 sm:top-[50%] sm:w-[min(155vw,1200px)] md:w-[min(125vw,1280px)]"
        style={{
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%)",
          maskImage:
            "linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%)",
        }}
      >
        <div className="train-glide will-change-transform">
          <div
            ref={parallaxRef}
            className="scroll-train opacity-[0.1] will-change-transform sm:opacity-[0.13] md:opacity-[0.16]"
          >
            <DanishEmuHeroSvg className="h-auto w-full select-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
