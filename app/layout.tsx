import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import StickyCTA from "@/components/StickyCTA";
import Script from "next/script";

export const metadata: Metadata = {
  title: "utvecklare.ai — Sveriges plattform för AI-utvecklare",
  description: "Hitta AI-jobb, läs artiklar, jämför verktyg och gå med i Sveriges största community för AI- och ML-utvecklare.",
  metadataBase: new URL("https://utvecklare.ai"),
  alternates: { canonical: "./" },
  verification: { google: 'PgZbK_oY_r7pI0sZW_rLt7JzTOvfZ64hdx03q81Cus8' },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    url: "https://utvecklare.ai",
    siteName: "utvecklare.ai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <body>
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9148299323154794"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <GoogleAnalytics />
        <Providers>
          {children}
          <StickyCTA />
        </Providers>
      </body>
    </html>
  );
}
