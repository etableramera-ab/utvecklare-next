'use client'
import { useMemo } from "react";
import SEOHead from "@/components/SEOHead";
import type { ArticleRow } from "@/hooks/useArticles";
import { getCategorySlug } from "@/hooks/useArticles";

function extractFaqJsonLd(content: string | null) {
  if (!content) return null;
  const lines = content.split("\n");
  const faqItems: { question: string; answer: string }[] = [];
  let inFaq = false;
  let currentQ = "";
  let answerLines: string[] = [];

  for (const line of lines) {
    if (/^##\s.*(FAQ|Frågor|Vanliga frågor)/i.test(line)) { inFaq = true; continue; }
    if (inFaq && /^##\s/.test(line) && !/^###\s/.test(line)) break;
    if (!inFaq) continue;
    const qMatch = line.match(/^\*\*(.+?)\*\*$/) || line.match(/^###\s(.+)/) || line.match(/^[0-9]+\.\s\*\*(.+?)\*\*/);
    if (qMatch) {
      if (currentQ && answerLines.length) faqItems.push({ question: currentQ, answer: answerLines.join(" ").replace(/\*\*/g, "").trim() });
      currentQ = qMatch[1].replace(/\?$/, "").trim() + "?";
      answerLines = [];
    } else if (currentQ && line.trim() && !line.startsWith("#")) {
      answerLines.push(line.replace(/^\s*[-*]\s*/, "").trim());
    }
  }
  if (currentQ && answerLines.length) faqItems.push({ question: currentQ, answer: answerLines.join(" ").replace(/\*\*/g, "").trim() });
  if (!faqItems.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.slice(0, 8).map(f => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer.slice(0, 400) },
    })),
  };
}

interface Props {
  article?: ArticleRow | null;
  categorySlug?: string;
  categoryLabel?: string;
  isOverview?: boolean;
  articleCount?: number;
}

const ArticleSEO = ({ article, categorySlug, categoryLabel, isOverview, articleCount }: Props) => {
  const seoProps = useMemo(() => {
    if (isOverview) {
      const isFiltered = categorySlug && categorySlug !== "alla";
      return {
        title: isFiltered
          ? `Lär dig ${categoryLabel} | AI-guider`
          : "AI-artiklar & Guider för utvecklare 2026",
        description: isFiltered
          ? `Utforska ${articleCount || ""} artiklar och guider om ${categoryLabel}. Från grunderna till avancerade tekniker — på svenska.`
          : "Lär dig maskininlärning, NLP, MLOps och mer. Artiklar, tutorials och guider skrivna för svenska AI-utvecklare.",
        canonical: isFiltered ? `/kunskapshubb/${categorySlug}` : "/kunskapshubb",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Hem", item: "https://utvecklare.ai/" },
            { "@type": "ListItem", position: 2, name: "Kunskapshubb", item: "https://utvecklare.ai/kunskapshubb" },
            ...(isFiltered && categoryLabel ? [{
              "@type": "ListItem", position: 3, name: categoryLabel,
              item: `https://utvecklare.ai/kunskapshubb/${categorySlug}`
            }] : []),
          ],
        },
      };
    }

    if (!article) return null;

    const catSlug = getCategorySlug(article.category);
    const url = `/kunskapshubb/${catSlug}/${article.slug}`;
    const faqSchema = extractFaqJsonLd(article.content);

    return {
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt || "",
      canonical: url,
      ogType: "article" as const,
      ogImage: article.hero_image_url || undefined,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.excerpt,
          image: article.hero_image_url,
          datePublished: article.published_at,
          dateModified: article.updated_at || article.published_at,
          author: { "@type": "Person", name: article.author_name, ...(article.author_linkedin_url ? { url: article.author_linkedin_url } : {}) },
          publisher: {
            "@type": "Organization", name: "utvecklare.ai",
            logo: { "@type": "ImageObject", url: "https://utvecklare.ai/logo.png" },
          },
          mainEntityOfPage: { "@type": "WebPage", "@id": `https://utvecklare.ai${url}` },
          wordCount: (article.content || "").split(/\s+/).length,
          articleSection: article.category,
          keywords: (article.tags || []).join(", "),
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Hem", item: "https://utvecklare.ai/" },
            { "@type": "ListItem", position: 2, name: "Kunskapshubb", item: "https://utvecklare.ai/kunskapshubb" },
            { "@type": "ListItem", position: 3, name: article.category, item: `https://utvecklare.ai/kunskapshubb/${catSlug}` },
            { "@type": "ListItem", position: 4, name: article.title },
          ],
        },
        ...(faqSchema ? [faqSchema] : []),
      ],
    };
  }, [article, categorySlug, categoryLabel, isOverview, articleCount]);

  if (!seoProps) return null;

  return <SEOHead {...seoProps} />;
};

export default ArticleSEO;
