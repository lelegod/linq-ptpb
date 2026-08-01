import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { DashboardClient } from "@/app/dashboard/DashboardClient";
import { getMessagesHref } from "@/lib/env";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your Rejsy account — integrations placeholder for DSB and more. Plan trips in Messages.",
};

export default function DashboardPage() {
  const messagesHref = getMessagesHref();
  return (
    <PageShell>
      <DashboardClient messagesHref={messagesHref} />
    </PageShell>
  );
}
