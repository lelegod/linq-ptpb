import type { Metadata } from "next";
import { Archivo, Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const siteUrl =
  process.env.PUBLIC_APP_URL || "https://web-gamma-sand-66.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rejsy — your favorite transport planner",
    template: "%s · Rejsy",
  },
  description:
    "Meet Rejsy, your favorite transport planner. Text a number. Get from A to B in Denmark — plans, tickets, and leave-now pings in Messages.",
  keywords: [
    "Rejsy",
    "Denmark transit",
    "DSB",
    "iMessage",
    "transport planner",
    "S-tog",
    "metro",
  ],
  openGraph: {
    title: "Meet Rejsy, your favorite transport planner",
    description:
      "Text where you're going. Rejsy plans the trip, hands you the ticket, and pings you when to leave.",
    url: siteUrl,
    siteName: "Rejsy",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Rejsy" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meet Rejsy, your favorite transport planner",
    description:
      "Denmark's trains in Messages — plan, pick, Buy on DSB, leave-now.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${fraunces.variable} ${plexMono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
