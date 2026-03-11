'use client'
import Link from 'next/link'
import { ArrowRight, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface ToolPreview {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  category: string;
  avg_rating: number;
  review_count: number;
}

const toCategorySlug = (cat: string) =>
  cat.toLowerCase().replace(/ö/g, "o").replace(/å/g, "a").replace(/ä/g, "a")
    .replace(/&/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

const ToolsPreview = () => {
  const [tools, setTools] = useState<ToolPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("tools")
      .select("id, name, slug, tagline, description, logo_url, category, avg_rating, review_count")
      .eq("is_published", true)
      .order("avg_rating", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (data) setTools(data as unknown as ToolPreview[]);
        setLoading(false);
      });
  }, []);

  return (
    <section className="section-spacing">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">AI-verktyg som svenska utvecklare älskar</h2>
          <Link href="/verktyg" className="text-sm text-primary hover:underline hidden sm:flex items-center gap-1">
            Alla verktyg <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.map((t) => (
              <Link
                key={t.id}
                href={`/verktyg/${toCategorySlug(t.category)}/${t.slug}`}
                className="p-5 rounded-lg bg-card border border-border card-hover flex flex-col"
              >
                {t.logo_url ? (
                  <img src={t.logo_url} alt={t.name} className="w-10 h-10 rounded-md bg-white p-0.5 border border-border object-contain mb-3" />
                ) : (
                  <div className="w-10 h-10 rounded-md bg-accent border border-border flex items-center justify-center text-sm font-bold text-foreground mb-3">
                    {t.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <h3 className="font-semibold text-foreground mb-1">{t.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 flex-1 line-clamp-2">{t.tagline || t.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-border">{t.category}</span>
                  <span className="flex items-center gap-1 text-sm text-warning">
                    <Star className="w-3.5 h-3.5 fill-current" /> {Number(t.avg_rating).toFixed(1)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Button asChild variant="outline" className="border-border text-foreground hover:bg-accent">
            <Link href="/verktyg">Alla verktyg och recensioner <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ToolsPreview;
