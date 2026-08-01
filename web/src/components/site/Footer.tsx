export function Footer() {
  return (
    <footer className="safe-pb px-4 py-8 sm:px-6 sm:py-10">
      <nav
        className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-center text-[13px] text-[var(--slate)]"
        aria-label="Footer"
      >
        <span className="px-2 py-2">rejsy.app</span>
        <span className="text-[var(--muted)]" aria-hidden>
          ·
        </span>
        <a
          href="/privacy"
          className="inline-flex min-h-11 items-center px-2 underline decoration-[var(--slate)]/50 underline-offset-[3px] transition-colors hover:text-[var(--ink)] hover:decoration-[var(--ink)]"
        >
          Privacy
        </a>
        <span className="text-[var(--muted)]" aria-hidden>
          ·
        </span>
        <a
          href="/terms"
          className="inline-flex min-h-11 items-center px-2 underline decoration-[var(--slate)]/50 underline-offset-[3px] transition-colors hover:text-[var(--ink)] hover:decoration-[var(--ink)]"
        >
          Terms
        </a>
      </nav>
    </footer>
  );
}
