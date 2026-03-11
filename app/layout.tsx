import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "utvecklare.ai — Sveriges plattform för AI-utvecklare",
  description: "Hitta AI-jobb, läs artiklar, jämför verktyg och gå med i Sveriges största community för AI- och ML-utvecklare.",
  metadataBase: new URL("https://utvecklare.ai"),
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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
