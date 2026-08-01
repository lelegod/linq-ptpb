import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { getMessagesHref } from "@/lib/env";

export function PageShell({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  const messagesHref = getMessagesHref();

  return (
    <main className="min-h-[100svh] bg-[var(--paper)]">
      <Nav messagesHref={messagesHref} />
      <div
        className={`page-enter mx-auto px-4 py-10 sm:px-6 md:py-14 ${
          wide ? "max-w-5xl" : "max-w-3xl"
        }`}
      >
        {children}
      </div>
      <Footer />
    </main>
  );
}
