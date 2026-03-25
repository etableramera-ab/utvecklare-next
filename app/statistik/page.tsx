import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatistikClient from "./StatistikClient";

export const metadata: Metadata = {
  title: "IT-branschen i Sverige 2026 — Företag, löner & lediga jobb | utvecklare.ai",
  description:
    "Statistik om IT-branschen i Sverige: 80 000+ IT-företag, löner för utvecklare, lediga jobb. Baserat på SCB och JobTech API.",
  openGraph: {
    title: "IT-branschen i Sverige 2026 — Företag, löner & lediga jobb",
    description: "80 000+ IT-företag i Sverige. Se statistik per län, storleksklass och trend sedan 2015.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "IT-branschen i Sverige 2026 — Företag, löner & lediga jobb",
  description: "Statistik om IT-branschen i Sverige baserat på SCB och JobTech API.",
  author: { "@type": "Organization", name: "utvecklare.ai" },
  publisher: { "@type": "Organization", name: "utvecklare.ai" },
  datePublished: "2026-03-25",
  dateModified: "2026-03-25",
};

export default function StatistikPage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <div className="pt-20">
        <StatistikClient />
      </div>
      <Footer />
    </div>
  );
}
