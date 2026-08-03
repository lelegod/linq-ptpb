"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { copy } from "@/content/copy";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6A2.5 2.5 0 0 1 16.5 15H11l-4 3v-3H7.5A2.5 2.5 0 0 1 5 12.5v-6Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Soft locomotive mark — faces left; keep translucent, not neon. */
function MiniTrain({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/train-cta.webp"
      alt=""
      width={36}
      height={20}
      className={`h-5 w-9 object-contain object-center ${className}`}
      aria-hidden
      priority={false}
    />
  );
}

type Variant = "red" | "butter" | "ink" | "ghost";

export function TextRejsyCta({
  href,
  label,
  variant = "red",
  className = "",
  showTrain = true,
}: {
  href: string;
  label?: string;
  variant?: Variant;
  className?: string;
  showTrain?: boolean;
}) {
  const [exiting, setExiting] = useState(false);
  const lock = useRef(false);

  const styles: Record<Variant, string> = {
    red: "rounded-[10px] bg-[var(--red)] text-white hover:opacity-90",
    butter:
      "rounded-full bg-[var(--butter)] text-[var(--butter-ink)] soft-lift hover:brightness-[0.98]",
    ink: "rounded-[10px] bg-[var(--ink)] text-white hover:opacity-90",
    ghost:
      "rounded-[10px] bg-[var(--paper)] text-[var(--ink)] ring-1 ring-[var(--line)] hover:bg-white",
  };

  // Soft / see-through — muted, not neon red
  const trainClass =
    variant === "red"
      ? "opacity-[0.58] brightness-[1.7] saturate-[0.2] contrast-[0.9]"
      : variant === "ink"
        ? "opacity-[0.55] brightness-[1.35] saturate-[0.3]"
        : "opacity-[0.48] saturate-[0.4]";

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (lock.current) {
      e.preventDefault();
      return;
    }
    if (prefersReducedMotion()) return;
    e.preventDefault();
    lock.current = true;
    setExiting(true);
    window.setTimeout(() => {
      window.location.href = href;
      lock.current = false;
      setExiting(false);
    }, 750);
  }

  return (
    <a
      href={href}
      onClick={onClick}
      className={`inline-flex min-h-12 items-center justify-center gap-2.5 px-6 py-3.5 text-[15px] font-semibold tracking-[-0.01em] transition-[filter,opacity] active:opacity-90 ${styles[variant]} ${className}`}
      aria-label={label ?? copy.cta}
    >
      {showTrain ? (
        <span className="relative inline-flex h-5 w-9 overflow-hidden">
          <span
            className={`absolute inset-0 flex items-center justify-center ${
              exiting ? "train-exit" : "train-idle"
            }`}
          >
            <MiniTrain className={trainClass} />
          </span>
        </span>
      ) : (
        <span className={variant === "ink" ? "text-[var(--red)]" : "opacity-90"}>
          <ChatIcon />
        </span>
      )}
      <span>{label ?? copy.cta}</span>
    </a>
  );
}
