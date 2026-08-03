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

/** Clear blocky locomotive — faces left (same as train-hero). */
function MiniTrain({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="16"
      viewBox="0 0 24 16"
      fill="none"
      aria-hidden
    >
      {/* chimney */}
      <rect x="4" y="1" width="3" height="2" fill="currentColor" />
      {/* cab (nose / left) */}
      <rect x="1" y="3" width="7" height="8" fill="currentColor" />
      {/* windshield */}
      <rect x="2.5" y="4.5" width="4" height="3" fill="var(--paper)" />
      {/* coupler / bumper */}
      <rect x="0" y="8" width="1.5" height="2" fill="currentColor" />
      {/* body */}
      <rect x="8" y="4" width="13" height="7" fill="currentColor" />
      {/* passenger windows */}
      <rect x="10" y="5.5" width="2.5" height="2.5" fill="var(--paper)" />
      <rect x="14" y="5.5" width="2.5" height="2.5" fill="var(--paper)" />
      <rect x="18" y="5.5" width="2" height="2.5" fill="var(--paper)" />
      {/* wheels (square = blocky) */}
      <rect x="3" y="12" width="3" height="3" fill="currentColor" />
      <rect x="11" y="12" width="3" height="3" fill="currentColor" />
      <rect x="17" y="12" width="3" height="3" fill="currentColor" />
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

  const trainClass =
    variant === "butter"
      ? "text-[var(--butter-ink)]"
      : variant === "ghost"
        ? "text-[var(--ink)]"
        : "text-white";

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
        <span className="relative inline-flex h-4 w-8 overflow-hidden">
          <span
            className={`absolute inset-0 flex items-center justify-center ${
              exiting ? "train-exit" : ""
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
