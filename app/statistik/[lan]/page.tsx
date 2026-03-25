import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LAN_MAP, LAN_SLUGS } from "@/lib/statistik-data";
import LanClient from "./LanClient";

interface Props {
  params: Promise<{ lan: string }>;
}

export async function generateStaticParams() {
  return LAN_SLUGS.map((lan) => ({ lan }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lan: slug } = await params;
  const lan = LAN_MAP[slug];
  if (!lan) return {};
  const fmt = (n: number) => n.toLocaleString("sv-SE");
  return {
    title: `IT-branschen i ${lan.name} — ${fmt(lan.latest)} företag | utvecklare.ai`,
    description: `${fmt(lan.latest)} IT-företag i ${lan.name} (${lan.yearly[lan.yearly.length - 1].year}). Trend sedan 2015, tillväxt och andel av Sverige. Källa: SCB.`,
    openGraph: {
      title: `IT-branschen i ${lan.name} — ${fmt(lan.latest)} företag`,
      description: `${fmt(lan.latest)} IT-företag i ${lan.name}. Se utvecklingen sedan 2015.`,
    },
  };
}

export default async function LanPage({ params }: Props) {
  const { lan: slug } = await params;
  const lan = LAN_MAP[slug];
  if (!lan) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `IT-branschen i ${lan.name}`,
    description: `${lan.latest.toLocaleString("sv-SE")} IT-företag i ${lan.name}. Statistik från SCB.`,
    author: { "@type": "Organization", name: "utvecklare.ai" },
    publisher: { "@type": "Organization", name: "utvecklare.ai" },
    datePublished: "2026-03-25",
    dateModified: "2026-03-25",
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <div className="pt-20">
        <LanClient lan={lan} />
      </div>
      <Footer />
    </div>
  );
}
