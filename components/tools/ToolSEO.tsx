'use client'
import { useMemo } from "react";
import SEOHead from "@/components/SEOHead";
import type { ToolRow } from "@/hooks/useTools";

const toCategorySlug = (cat: string) =>
  cat.toLowerCase().replace(/ö/g, "o").replace(/å/g, "a").replace(/ä/g, "a")
    .replace(/&/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

const ToolSEO = ({ tool }: { tool: ToolRow }) => {
  const title = `${tool.name} — Recension & Pris 2026`;
  const desc = `${tool.tagline || tool.description}. Betyg: ${Number(tool.avg_rating).toFixed(1)}/5 av ${tool.review_count} användare. Läs svenska recensioner och jämför alternativ.`;
  const catSlug = toCategorySlug(tool.category);

  const jsonLd = useMemo(() => {
    const data: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: tool.name,
      description: tool.description,
      applicationCategory: "DeveloperApplication",
      operatingSystem: tool.platforms?.join(", ") || "",
      url: tool.website_url,
      ...(tool.logo_url ? { image: tool.logo_url } : {}),
      offers: {
        "@type": "Offer",
        price: tool.pricing_from?.replace(/[^\d.]/g, "") || "0",
        priceCurrency: "USD",
      },
    };
    if (tool.review_count > 0) {
      data.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: Number(tool.avg_rating).toFixed(1),
        reviewCount: tool.review_count,
        bestRating: "5",
        worstRating: "1",
      };
    }
    return data;
  }, [tool]);

  return (
    <SEOHead
      title={title}
      description={desc}
      canonical={`/verktyg/${catSlug}/${tool.slug}`}
      ogImage={tool.logo_url || undefined}
      jsonLd={jsonLd}
    />
  );
};

export default ToolSEO;
