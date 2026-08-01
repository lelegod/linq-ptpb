export function Footer() {
  return (
    <footer className="px-4 py-10 sm:px-6">
      <p className="text-center text-[13px] text-[var(--slate)]">
        <span>rejsy.app</span>
        <span className="mx-2 text-[var(--muted)]" aria-hidden>
          ·
        </span>
        <a
          href="/privacy"
          className="underline decoration-[var(--slate)]/50 underline-offset-[3px] transition-colors hover:text-[var(--ink)] hover:decoration-[var(--ink)]"
        >
          Privacy
        </a>
        <span className="mx-2 text-[var(--muted)]" aria-hidden>
          ·
        </span>
        <a
          href="/terms"
          className="underline decoration-[var(--slate)]/50 underline-offset-[3px] transition-colors hover:text-[var(--ink)] hover:decoration-[var(--ink)]"
        >
          Terms
        </a>
      </p>
    </footer>
  );
}
