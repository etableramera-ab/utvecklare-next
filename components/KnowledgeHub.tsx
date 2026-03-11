'use client'
import { useState, useEffect } from "react";
import Link from 'next/link'
import { ArrowRight, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface ArticlePreview {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  hero_image_url: string | null;
  author_name: string | null;
  published_at: string | null;
  reading_time_minutes: number | null;
}

const toCategorySlug = (cat: string) =>
  cat.toLowerCase().replace(/ö/g, "o").replace(/å/g, "a").replace(/ä/g, "a")
    .replace(/&/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

const KnowledgeHub = () => {
  const [articles, setArticles] = useState<ArticlePreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("articles")
      .select("id, title, slug, category, excerpt, hero_image_url, author_name, published_at, reading_time_minutes")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        setArticles((data ?? []) as ArticlePreview[]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="section-spacing bg-card/50">
        <div className="container mx-auto px-4">
          <div className="h-8 bg-muted rounded w-48 mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-72 rounded-lg bg-card border border-border animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) return null;

  return (
    <section className="section-spacing bg-card/50">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Lär dig AI-utveckling</h2>
          <Link href="/kunskapshubb" className="text-sm text-primary hover:underline hidden sm:flex items-center gap-1">
            Alla guider <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <Link key={a.id} href={`/kunskapshubb/${toCategorySlug(a.category)}/${a.slug}`} className="group">
              <article className="rounded-lg bg-card border border-border card-hover overflow-hidden flex flex-col h-full">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={a.hero_image_url || "/placeholder.svg"}
                    alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium rounded-full gradient-bg text-primary-foreground">
                    {a.category}
                  </span>
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">{a.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{a.excerpt}</p>
                  <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                    <span>{a.author_name} · {a.published_at ? new Date(a.published_at).toLocaleDateString("sv-SE") : ""}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.reading_time_minutes ?? 5} min</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KnowledgeHub;
