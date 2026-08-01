import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { ProductSection } from "@/components/site/ProductSection";
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
      <Reveal delay={60}>
        <ProductSection showIntegrations={false} />
      </Reveal>
      <Footer />
    </main>
  );
}
