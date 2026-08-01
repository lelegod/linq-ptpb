import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Bento } from "@/components/site/Bento";
import { Pricing } from "@/components/site/Pricing";
import { Coverage } from "@/components/site/Coverage";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { linqQrDataUrl } from "@/lib/qr";

export default async function HomePage() {
  const qrDataUrl = await linqQrDataUrl();

  return (
    <main>
      <Nav />
      <Hero qrDataUrl={qrDataUrl} />
      <Reveal delay={80}>
        <Bento />
      </Reveal>
      <Reveal delay={80}>
        <Pricing />
      </Reveal>
      <Reveal delay={80}>
        <Coverage />
      </Reveal>
      <Footer />
    </main>
  );
}
