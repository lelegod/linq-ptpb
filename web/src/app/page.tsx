import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { ProblemStrip } from "@/components/site/ProblemStrip";
import { Bento } from "@/components/site/Bento";
import { Pricing } from "@/components/site/Pricing";
import { Coverage } from "@/components/site/Coverage";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { linqQrDataUrl } from "@/lib/qr";
import { getMessagesHref } from "@/lib/env";

export default async function HomePage() {
  const messagesHref = getMessagesHref();
  const qrDataUrl = await linqQrDataUrl();

  return (
    <main>
      <Nav messagesHref={messagesHref} />
      <Hero qrDataUrl={qrDataUrl} messagesHref={messagesHref} />
      <Reveal delay={80}>
        <ProblemStrip />
      </Reveal>
      <Reveal delay={80}>
        <Bento />
      </Reveal>
      <Reveal delay={80}>
        <Pricing messagesHref={messagesHref} />
      </Reveal>
      <Reveal delay={80}>
        <Coverage />
      </Reveal>
      <Footer />
    </main>
  );
}
