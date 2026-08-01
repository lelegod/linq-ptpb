"use client";

import { useEffect, useId, useRef, useState } from "react";
import { copy, productMenu, resourcesMenu } from "@/content/copy";

type MenuKey = "product" | "resources" | null;

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M3 4.5 6 7.5 9 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 4.5h7.5L18 8v11.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M14.5 4.5V8H18M9 12h6M9 15.5h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FaqIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9.75 9.5a2.25 2.25 0 1 1 3.4 1.93c-.7.45-1.15 1.05-1.15 1.82V14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.75" r="0.9" fill="currentColor" />
    </svg>
  );
}

function MenuIcon({ kind }: { kind: "docs" | "faq" }) {
  return kind === "docs" ? <DocsIcon /> : <FaqIcon />;
}

export function Nav({ messagesHref }: { messagesHref: string }) {
  const [menu, setMenu] = useState<MenuKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const productId = useId();
  const resourcesId = useId();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!menu && !mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(null);
        setMobileOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) {
        setMenu(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [menu, mobileOpen]);

  function toggle(key: Exclude<MenuKey, null>) {
    setMenu((m) => (m === key ? null : key));
  }

  return (
    <nav
      ref={root}
      className="relative z-40 border-b border-[var(--line)] bg-[var(--paper)]"
      aria-label="Primary"
    >
      <div className="flex min-h-14 items-center justify-between px-4 py-2.5 sm:px-5 md:px-8">
        <a
          href="/"
          className="flex min-h-11 items-center gap-2.5"
          aria-label="Rejsy home"
        >
          <span className="flex items-end gap-[3px]" aria-hidden>
            <span className="h-3 w-1 bg-[var(--red)] opacity-100" />
            <span className="h-3 w-1 bg-[var(--red)] opacity-55" />
            <span className="h-3 w-1 bg-[var(--red)] opacity-25" />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.02em]">
            rejsy
          </span>
        </a>

        {/* Desktop cluster — Product · Pricing · Resources */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 md:flex">
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[13px] font-medium text-[var(--ink)] transition-colors hover:bg-black/[0.04]"
              aria-expanded={menu === "product"}
              aria-controls={productId}
              onClick={() => toggle("product")}
            >
              {copy.navProduct}
              <Chevron open={menu === "product"} />
            </button>
            <div
              id={productId}
              role="menu"
              className={`product-dropdown absolute left-1/2 top-[calc(100%+10px)] w-[min(92vw,300px)] -translate-x-1/2 rounded-[12px] bg-[var(--paper)] p-2 ${
                menu === "product" ? "dropdown-open" : "dropdown-closed"
              }`}
            >
              <ul className="space-y-0.5">
                {productMenu.map((item) => (
                  <li key={item.href}>
                    <a
                      role="menuitem"
                      href={item.href}
                      className="block rounded-[8px] px-3 py-2.5 transition-colors hover:bg-white"
                      onClick={() => setMenu(null)}
                    >
                      <span className="block text-[14px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-[12px] leading-snug text-[var(--muted)]">
                        {item.description}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <a
            href="/pricing"
            className="rounded-[8px] px-3 py-1.5 text-[13px] font-medium text-[var(--ink)] transition-colors hover:bg-black/[0.04]"
          >
            {copy.navPricing}
          </a>

          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[13px] font-medium text-[var(--ink)] transition-colors hover:bg-black/[0.04]"
              aria-expanded={menu === "resources"}
              aria-controls={resourcesId}
              onClick={() => toggle("resources")}
            >
              {copy.navResources}
              <Chevron open={menu === "resources"} />
            </button>
            <div
              id={resourcesId}
              role="menu"
              className={`product-dropdown absolute left-1/2 top-[calc(100%+10px)] w-[min(92vw,280px)] -translate-x-1/2 rounded-[12px] bg-[var(--paper)] p-2 ${
                menu === "resources" ? "dropdown-open" : "dropdown-closed"
              }`}
            >
              <ul className="space-y-0.5">
                {resourcesMenu.map((item) => (
                  <li key={item.href}>
                    <a
                      role="menuitem"
                      href={item.href}
                      className="flex items-start gap-3 rounded-[8px] px-3 py-2.5 transition-colors hover:bg-white"
                      onClick={() => setMenu(null)}
                    >
                      <span className="mt-0.5 text-[var(--muted)]">
                        <MenuIcon kind={item.icon} />
                      </span>
                      <span>
                        <span className="block text-[14px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-[12px] leading-snug text-[var(--muted)]">
                          {item.description}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <a
            href="/login"
            className="hidden min-h-11 items-center text-[12px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--slate)] sm:inline-flex"
          >
            {copy.navLogin}
          </a>
          <a
            href="/start"
            className="inline-flex min-h-10 items-center rounded-[10px] bg-[var(--red)] px-3.5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 sm:min-h-11 sm:px-4"
          >
            {copy.navStart}
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] text-[var(--ink)] md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              {mobileOpen ? (
                <path
                  d="M5 5l10 10M15 5 5 15"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 6h12M4 10h12M4 14h12"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="safe-pb border-t border-[var(--line)] bg-[var(--paper)] md:hidden">
          <div className="page-enter max-h-[min(70vh,520px)] space-y-0.5 overflow-y-auto px-3 py-3">
            <p className="px-3 pb-1.5 font-data text-[10px] uppercase tracking-[0.08em] text-[var(--muted)]">
              Product
            </p>
            {productMenu.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block rounded-[10px] px-3 py-3"
                onClick={() => setMobileOpen(false)}
              >
                <span className="block text-[15px] font-semibold">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-[12px] leading-snug text-[var(--muted)]">
                  {item.description}
                </span>
              </a>
            ))}
            <a
              href="/pricing"
              className="block rounded-[10px] px-3 py-3.5 text-[15px] font-semibold"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </a>
            <p className="px-3 pb-1.5 pt-3 font-data text-[10px] uppercase tracking-[0.08em] text-[var(--muted)]">
              Resources
            </p>
            {resourcesMenu.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-start gap-3 rounded-[10px] px-3 py-3"
                onClick={() => setMobileOpen(false)}
              >
                <span className="mt-0.5 text-[var(--muted)]">
                  <MenuIcon kind={item.icon} />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-[var(--muted)]">
                    {item.description}
                  </span>
                </span>
              </a>
            ))}
            <a
              href="/login"
              className="mt-1 block rounded-[10px] px-3 py-3.5 text-[15px] font-semibold sm:hidden"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </a>
            <a
              href={messagesHref}
              className="mt-1 block rounded-[10px] px-3 py-3.5 text-[14px] font-medium text-[var(--red)]"
              onClick={() => setMobileOpen(false)}
            >
              Text Rejsy in Messages
            </a>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
