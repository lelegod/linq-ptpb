"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/** Soft red train watermark with light scroll parallax — stays behind the phone. */
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
        el.style.transform = `translate3d(${Math.min(y * 0.12, 48)}px, ${y * 0.06}px, 0)`;
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
        ref={ref}
        className="scroll-train absolute -right-[8%] top-[18%] w-[min(72vw,420px)] opacity-[0.14] sm:top-[12%] sm:w-[min(58vw,480px)] sm:opacity-[0.18] md:-right-[4%] md:top-[8%] md:w-[520px] md:opacity-[0.22]"
      >
        <Image
          src="/train-hero.webp"
          alt=""
          width={541}
          height={494}
          priority
          className="h-auto w-full select-none"
          sizes="(max-width: 768px) 72vw, 520px"
        />
      </div>
      {/* Soft left ghost for balance on wide screens */}
      <div className="absolute -left-[18%] bottom-[8%] hidden w-[380px] -scale-x-100 opacity-[0.08] lg:block">
        <Image
          src="/train-hero.webp"
          alt=""
          width={541}
          height={494}
          className="h-auto w-full select-none"
          sizes="380px"
        />
      </div>
    </div>
  );
}
