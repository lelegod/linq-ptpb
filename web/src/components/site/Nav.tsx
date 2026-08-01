import { copy } from "@/content/copy";

export function Nav({ messagesHref }: { messagesHref: string }) {
  return (
    <nav className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--paper)] px-4 py-3 sm:px-5 md:px-8">
      <a href="/" className="flex items-center gap-2.5">
        <span className="flex items-end gap-[3px]" aria-hidden>
          <span className="h-3 w-1 bg-[var(--red)] opacity-100" />
          <span className="h-3 w-1 bg-[var(--red)] opacity-55" />
          <span className="h-3 w-1 bg-[var(--red)] opacity-25" />
        </span>
        <span className="text-[15px] font-semibold tracking-[-0.02em]">
          rejsy
        </span>
      </a>
      <div className="flex items-center gap-3 sm:gap-4">
        <a
          href="#pricing"
          className="text-[12px] text-[var(--slate)] hover:text-[var(--ink)]"
        >
          {copy.navPricing}
        </a>
        <a
          href={messagesHref}
          className="rounded-[10px] bg-[var(--red)] px-3 py-2 text-[12px] font-semibold text-white active:opacity-90"
        >
          {copy.navGetStarted}
        </a>
      </div>
    </nav>
  );
}
