'use client'
import Link from 'next/link'
import { Star, ArrowRight, Award } from "lucide-react";
import type { ToolRow } from "@/hooks/useTools";

const pricingStyle: Record<string, { label: string; cls: string }> = {
  free: { label: "Gratis", cls: "bg-success/10 text-success border-success/20" },
  freemium: { label: "Freemium", cls: "bg-primary/10 text-primary border-primary/20" },
  "open-source": { label: "Open Source", cls: "bg-[hsl(270_70%_60%)]/10 text-[hsl(270_70%_60%)] border-[hsl(270_70%_60%)]/20" },
  paid: { label: "Betald", cls: "bg-warning/10 text-warning border-warning/20" },
  enterprise: { label: "Enterprise", cls: "bg-destructive/10 text-destructive border-destructive/20" },
};

// Generate a category slug from category name
const toCategorySlug = (cat: string) =>
  cat.toLowerCase()
    .replace(/ö/g, "o").replace(/å/g, "a").replace(/ä/g, "a")
    .replace(/&/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

interface ToolCardProps {
  tool: ToolRow;
  showCompare?: boolean;
  isCompareSelected?: boolean;
  onToggleCompare?: (id: string) => void;
}

const ToolCard = ({ tool, showCompare, isCompareSelected, onToggleCompare }: ToolCardProps) => {
  const pricing = pricingStyle[tool.pricing_model || "paid"] || pricingStyle.paid;
  const categorySlug = toCategorySlug(tool.category);

  return (
    <div className="relative flex flex-col h-full">
      {/* Compare checkbox */}
      {showCompare && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleCompare?.(tool.id); }}
          className={`absolute top-3 left-3 z-10 w-5 h-5 rounded border flex items-center justify-center text-xs transition-all ${
            isCompareSelected
              ? "bg-primary border-primary text-primary-foreground"
              : "border-border bg-card/80 text-muted-foreground hover:border-primary/50"
          }`}
          title="Jämför"
        >
          {isCompareSelected && "✓"}
        </button>
      )}

      {/* Editors choice badge */}
      {tool.is_editors_choice && (
        <div className="absolute top-3 right-3 z-10">
          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-warning/20 text-warning border border-warning/30">
            <Award className="w-3 h-3" /> Editor's Choice
          </span>
        </div>
      )}

      <Link href={`/verktyg/${categorySlug}/${tool.slug}`}
        className={`flex flex-col flex-1 p-5 rounded-xl bg-card border transition-all duration-300 hover:scale-[1.02] ${
          tool.is_featured && tool.affiliate_url
            ? "border-primary/40 shadow-[0_0_20px_hsl(239_84%_67%/0.15)]"
            : "border-border hover:border-primary/50"
        }`}
      >
        {/* Sponsored badge */}
        {tool.is_featured && tool.affiliate_url && (
          <span className="self-start mb-2 px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary border border-primary/20">
            Sponsrad
          </span>
        )}

        {/* Logo + Name */}
        <div className="flex items-center gap-3 mb-2">
          {tool.logo_url ? (
            <img
              src={tool.logo_url}
              alt={tool.name}
              className="w-12 h-12 rounded-lg object-contain bg-white p-1 border border-border shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-accent border border-border flex items-center justify-center text-sm font-bold text-foreground shrink-0">
              {tool.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-bold text-foreground truncate text-base">{tool.name}</h3>
            <div className="flex items-center gap-1 text-sm text-warning">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{Number(tool.avg_rating).toFixed(1)}</span>
              <span className="text-muted-foreground text-xs">({tool.review_count})</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {tool.tagline || tool.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${pricing.cls}`}>
            {pricing.label}
          </span>
          {tool.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-border">
              {tag}
            </span>
          ))}
        </div>

        {/* Pricing from */}
        {tool.pricing_from && (
          <p className="text-xs text-muted-foreground mb-2">{tool.pricing_from}</p>
        )}

        {/* CTA */}
        <div className="flex items-center justify-end mt-auto pt-2 border-t border-border">
          <span className="text-xs text-primary flex items-center gap-1">
            Läs recension <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </Link>
    </div>
  );
};

export default ToolCard;
