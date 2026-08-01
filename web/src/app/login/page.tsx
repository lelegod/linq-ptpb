import type { Metadata } from "next";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { LoginClient } from "@/app/login/LoginClient";
import { copy } from "@/content/copy";
import { getMessagesHref } from "@/lib/env";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to Rejsy — save trips and connect integrations when they ship.",
};

export default function LoginPage() {
  const messagesHref = getMessagesHref();

  return (
    <main className="min-h-[100svh] bg-[var(--paper)]">
      <Nav messagesHref={messagesHref} />
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 md:py-16">
        <h1 className="text-[32px] font-semibold tracking-[-0.03em]">
          {copy.loginTitle}
        </h1>
        <p className="mt-2 text-[15px] text-[var(--slate)]">{copy.loginSub}</p>
        <p className="mt-3 text-[14px]">
          <a
            href="/start"
            className="font-medium text-[var(--red)] underline-offset-2 hover:underline"
          >
            {copy.navGetStarted} →
          </a>
        </p>
        <div className="mt-8">
          <LoginClient />
        </div>
      </div>
      <Footer />
    </main>
  );
}
