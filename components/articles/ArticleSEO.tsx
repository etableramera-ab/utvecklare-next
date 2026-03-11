'use client'
import { useMemo } from "react";
import SEOHead from "@/components/SEOHead";
import type { ArticleRow } from "@/hooks/useArticles";
import { getCategorySlug } from "@/hooks/useArticles";

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
      ],
    };
  }, [article, categorySlug, categoryLabel, isOverview, articleCount]);

  if (!seoProps) return null;

  return <SEOHead {...seoProps} />;
};

export default ArticleSEO;
