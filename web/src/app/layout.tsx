import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rejsy — the friend who knows every train in Denmark",
  description:
    "Text a number. Get from A to B in Denmark. It plans, hands you the ticket, and pings you when to leave.",
  openGraph: { images: ["/og.png"] },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
