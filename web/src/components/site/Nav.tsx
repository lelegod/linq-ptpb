"use client";

import { useEffect, useId, useRef, useState } from "react";
import { copy, productMenu } from "@/content/copy";
import { TextRejsyCta } from "@/components/site/TextRejsyCta";

function LoginIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 7.5v5l3 1.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6A2.5 2.5 0 0 1 16.5 15H11l-4 3v-3H7.5A2.5 2.5 0 0 1 5 12.5v-6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Nav({ messagesHref }: { messagesHref: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <nav
      ref={root}
      className="relative z-30 flex items-center justify-between px-4 py-4 sm:px-6 md:px-10"
      aria-label="Primary"
    >
      <a href="/" className="flex items-center gap-2.5" aria-label="Rejsy home">
        <span className="flex items-end gap-[3px]" aria-hidden>
          <span className="h-3 w-1 bg-[var(--red)] opacity-100" />
          <span className="h-3 w-1 bg-[var(--red)] opacity-55" />
          <span className="h-3 w-1 bg-[var(--red)] opacity-25" />
        </span>
        <span className="font-display text-[22px] font-semibold italic tracking-[-0.03em]">
          rejsy
        </span>
      </a>

      <a
        href="#product"
        className="text-[13px] font-medium text-[var(--ink)] md:hidden"
      >
        {copy.navProduct}
      </a>

      <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-medium transition-colors ${
            open
              ? "bg-[var(--ink)] text-white"
              : "text-[var(--ink)] hover:bg-white/50"
          }`}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          {copy.navProduct}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path
              d="M3 4.5 6 7.5 9 4.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open && (
          <div
            id={panelId}
            role="menu"
            className="product-dropdown absolute left-1/2 top-[calc(100%+10px)] w-[min(92vw,340px)] -translate-x-1/2 rounded-[22px] bg-white p-5"
          >
            <ul className="space-y-4">
              {productMenu.map((item) => (
                <li key={item.href}>
                  <a
                    role="menuitem"
                    href={item.href}
                    className="block rounded-xl px-1 py-0.5 hover:bg-[var(--paper)]"
                    onClick={() => setOpen(false)}
                  >
                    <span className="block text-[15px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-[var(--muted)]">
                      {item.description}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Tomo-like Login / Start — restrained, no rainbow orbs */}
      <div className="flex items-center gap-3 sm:gap-4">
        <a
          href="/login"
          className="group flex flex-col items-center gap-1"
          aria-label="Log in"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--login-ring)]/35 text-[var(--ink)] ring-1 ring-[var(--login-ring)]/50 transition-transform group-hover:scale-[1.03] sm:h-11 sm:w-11">
            <LoginIcon />
          </span>
          <span className="hidden text-[10px] font-medium text-[var(--slate)] sm:block">
            {copy.navLogin}
          </span>
        </a>
        <a
          href="#start"
          className="group flex flex-col items-center gap-1"
          aria-label="Start — text Rejsy"
          onClick={(e) => {
            // Prefer direct messages on Start for mobile immediacy
            if (window.matchMedia("(max-width: 767px)").matches) {
              e.preventDefault();
              window.location.href = messagesHref;
            }
          }}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--start-ring)] text-white transition-transform group-hover:scale-[1.03] sm:h-11 sm:w-11">
            <StartIcon />
          </span>
          <span className="hidden text-[10px] font-medium text-[var(--slate)] sm:block">
            {copy.navStart}
          </span>
        </a>
        <div className="hidden lg:block">
          <TextRejsyCta
            href={messagesHref}
            label={copy.ctaShort}
            variant="ink"
            className="!px-4 !py-2.5 !text-[13px]"
            showTrain={false}
          />
        </div>
      </div>
    </nav>
  );
}
