'use client';

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedJobs from "@/components/FeaturedJobs";
import KnowledgeHub from "@/components/KnowledgeHub";
import ToolsPreview from "@/components/ToolsPreview";
import CommunitySection from "@/components/CommunitySection";
import UpcomingEvents from "@/components/UpcomingEvents";
import NewsletterCTA from "@/components/NewsletterCTA";
import CompanyCTA from "@/components/CompanyCTA";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import Link from "next/link";

const homepageJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "utvecklare.ai",
    url: "https://utvecklare.ai",
    logo: "https://utvecklare.ai/logo.png",
    description: "Sveriges plattform för AI-utvecklare",
    foundingDate: "2026",
    founder: { "@type": "Person", name: "Kim Stockblom" },
    sameAs: [
      "https://linkedin.com/company/utvecklare-ai",
      "https://github.com/utvecklare-ai",
      "https://twitter.com/utvecklare_ai",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "utvecklare.ai",
    url: "https://utvecklare.ai",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://utvecklare.ai/jobb?sok={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  },
];

const Index = () => (
  <div className="min-h-screen bg-background">
    <SEOHead
      title="utvecklare.ai — Sveriges plattform för AI-utvecklare"
      description="Hitta AI-jobb, läs artiklar, jämför verktyg och gå med i Sveriges största community för AI- och ML-utvecklare."
      canonical="/"
      jsonLd={homepageJsonLd}
    />
    <Navbar />
    <main>
      <HeroSection />
      <FeaturedJobs />
      <div className="container mx-auto px-4 py-4">
        <Link href="/foretag" className="block p-4 rounded-lg border border-border bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 hover:from-indigo-500/20 hover:to-cyan-500/20 transition-all text-center group">
          <p className="text-sm font-semibold text-foreground">Annonsera på utvecklare.ai</p>
          <p className="text-xs text-muted-foreground mt-0.5">Nå Sveriges AI-utvecklare →</p>
        </Link>
      </div>
      <KnowledgeHub />
      <ToolsPreview />
      <UpcomingEvents />
      <CommunitySection />
      <NewsletterCTA />
      <CompanyCTA />
    </main>
    <Footer />
  </div>
);

export default Index;
