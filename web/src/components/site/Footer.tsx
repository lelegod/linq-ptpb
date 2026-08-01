import { copy } from "@/content/copy";

export function Footer() {
  return (
    <footer className="flex flex-col gap-3 border-t border-[var(--line)] bg-[var(--paper)] px-4 py-6 text-[12px] text-[var(--slate)] sm:px-6 md:flex-row md:items-center md:justify-between md:px-10">
      <p>
        <span className="font-display italic text-[var(--ink)]">rejsy</span>
        <span className="mx-2 text-[var(--line)]">·</span>
        {copy.footerLeft}
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <a href="/login" className="hover:text-[var(--ink)]">
          Login
        </a>
        <a href="#product" className="hover:text-[var(--ink)]">
          Product
        </a>
        <a href="#pricing" className="hover:text-[var(--ink)]">
          Pricing
        </a>
        <p>{copy.footerRight}</p>
      </div>
    </footer>
  );
}
