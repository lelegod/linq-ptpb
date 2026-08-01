import { copy } from "@/content/copy";

export function Footer() {
  return (
    <footer className="flex flex-col gap-2 border-t border-[var(--line)] bg-[var(--paper)] px-6 py-6 text-[12px] text-[var(--slate)] md:flex-row md:items-center md:justify-between md:px-10">
      <p>{copy.footerLeft}</p>
      <p>{copy.footerRight}</p>
    </footer>
  );
}
