'use client'
import { useState, useEffect } from "react";
import Link from 'next/link'
import { Star, Wrench } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface ToolPreview {
  id: string;
  name: string;
  slug: string;
  category: string;
  avg_rating: number;
  logo_url: string | null;
  pricing_model: string | null;
}

const toCategorySlug = (cat: string) =>
  cat.toLowerCase().replace(/ö/g, "o").replace(/å/g, "a").replace(/ä/g, "a")
    .replace(/&/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

const RelatedTools = ({ tags, toolName }: { tags: string[]; toolName?: string }) => {
  const [tools, setTools] = useState<ToolPreview[]>([]);

  useEffect(() => {
    if (!tags.length) return;
    supabase
      .from("tools")
      .select("id, name, slug, category, avg_rating, logo_url, pricing_model")
      .eq("is_published", true)
      .overlaps("tags", tags)
      .limit(4)
      .then(({ data }) => {
        if (data?.length) setTools(data as ToolPreview[]);
      });
  }, [tags]);

  if (!tools.length) return null;

  return (
    <div className="p-5 rounded-lg bg-card border border-border">
      <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
        <Wrench className="w-4 h-4 text-primary" /> Relaterade verktyg
      </h4>
      <div className="space-y-3">
        {tools.map(t => (
          <Link key={t.id} href={`/verktyg/${toCategorySlug(t.category)}/${t.slug}`} className="flex items-center gap-3 group">
            {t.logo_url ? (
              <img src={t.logo_url} alt={t.name} className="w-8 h-8 rounded-md bg-white p-0.5 border border-border object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-md bg-accent border border-border flex items-center justify-center text-xs font-bold text-foreground">
                {t.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{t.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5 text-warning"><Star className="w-3 h-3 fill-current" /> {Number(t.avg_rating).toFixed(1)}</span>
                <span>{t.pricing_model}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedTools;
