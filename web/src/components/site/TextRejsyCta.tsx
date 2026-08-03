"use client";

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

/**
 * Minimal modern EMU mark (faces left) — monoline, currentColor.
 * Photo crops read muddy at 20px; this stays crisp like a premium product icon.
 */
function MiniTrain({ className = "" }: { className?: string }) {
  return (
    <svg
      width="22"
      height="14"
      viewBox="0 0 44 28"
      fill="none"
      aria-hidden
      className={className}
    >
      {/* Body */}
      <path
        d="M40 8.5c0-1.4-1-2.5-2.4-2.5H14.2c-1.1 0-2.1.5-2.7 1.4L8 13.2H4.8c-.7 0-1.3.6-1.3 1.3v2.2c0 .7.6 1.3 1.3 1.3H8l1.2 1.6c.4.5 1 .8 1.6.8h26.8c1.4 0 2.4-1.1 2.4-2.5V8.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      {/* Window band */}
      <path
        d="M12.5 10.2h24.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Nose light */}
      <circle cx="9.2" cy="12.4" r="1.15" fill="currentColor" opacity="0.85" />
      {/* Bogies */}
      <circle cx="16" cy="22.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="32.5" cy="22.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      {/* Track hint */}
      <path
        d="M3 26.2h38"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
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

  const iconTone =
    variant === "red" || variant === "ink"
      ? "opacity-80"
      : "opacity-70";

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
        <span className="relative inline-flex h-[14px] w-[22px] shrink-0 overflow-hidden">
          <span
            className={`absolute inset-0 flex items-center justify-center ${
              exiting ? "train-exit" : "train-idle"
            }`}
          >
            <MiniTrain className={iconTone} />
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
