'use client';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Star, ThumbsUp, ThumbsDown, ExternalLink, ChevronRight, Plus, Loader2 } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AffiliateLink from "@/components/AffiliateLink";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ToolRow } from "@/hooks/useTools";

const pricingLabels: Record<string, string> = {
  free: "Gratis", freemium: "Freemium", "open-source": "Open Source", paid: "Betald", enterprise: "Enterprise",
};

const toCategorySlug = (cat: string) =>
  cat.toLowerCase().replace(/ö/g, "o").replace(/å/g, "a").replace(/ä/g, "a")
    .replace(/&/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

const ToolComparePage = () => {
  const params = useParams<{ slugs: string }>();
  const { slugs } = params;
  const router = useRouter();
  const [tools, setTools] = useState<ToolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Record<string, any[]>>({});
  const [sameCatTools, setSameCatTools] = useState<ToolRow[]>([]);

  useEffect(() => {
    if (!slugs) return;
    const slugList = slugs.split("-vs-");
    const fetchTools = async () => {
      setLoading(true);
      const { data } = await supabase.from("tools").select("*").in("slug", slugList).eq("is_published", true);
      if (data) {
        const typed = data as unknown as ToolRow[];
        setTools(typed);
        // Fetch reviews for each
        const revMap: Record<string, any[]> = {};
        for (const t of typed) {
          const { data: revs } = await supabase.from("tool_reviews").select("*, profiles:user_id(full_name)").eq("tool_id", t.id).order("created_at", { ascending: false }).limit(3);
          if (revs) revMap[t.id] = revs;
        }
        setReviews(revMap);
        // Fetch same-category tools for "add third"
        if (typed.length > 0) {
          const { data: catTools } = await supabase.from("tools").select("*").eq("category", typed[0].category).eq("is_published", true).not("slug", "in", `(${slugList.join(",")})`).limit(10);
          if (catTools) setSameCatTools(catTools as unknown as ToolRow[]);
        }
      }
      setLoading(false);
    };
    fetchTools();
  }, [slugs]);

  // Save comparison
  useEffect(() => {
    if (tools.length >= 2 && slugs) {
      supabase.from("tool_comparisons").upsert({ slug: slugs, tool_ids: tools.map(t => t.id) }, { onConflict: "slug" }).then(() => {});
    }
  }, [tools, slugs]);

  const addTool = (slug: string) => {
    if (slugs && slug) router.push(`/verktyg/jamfor/${slugs}-vs-${slug}`);
  };

  // Find best value per numeric row
  const bestRating = useMemo(() => tools.reduce((best, t) => t.avg_rating > (best?.avg_rating || 0) ? t : best, tools[0]), [tools]);
  const bestReviews = useMemo(() => tools.reduce((best, t) => t.review_count > (best?.review_count || 0) ? t : best, tools[0]), [tools]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        <Footer />
      </div>
    );
  }

  if (tools.length < 2) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <p className="text-foreground text-lg mb-4">Kunde inte hitta verktygen för jämförelse.</p>
          <Link href="/verktyg" className="text-primary hover:underline">← Tillbaka till verktyg</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const metaTitle = `${tools.map(t => t.name).join(" vs ")} — Jämförelse 2026 | utvecklare.ai`;

  const rows: { label: string; render: (t: ToolRow) => React.ReactNode; highlight?: (t: ToolRow) => boolean }[] = [
    { label: "Betyg", render: t => <span className="flex items-center justify-center gap-1 text-warning"><Star className="w-4 h-4 fill-current" /> {Number(t.avg_rating).toFixed(1)} <span className="text-muted-foreground text-xs">({t.review_count})</span></span>, highlight: t => t.id === bestRating?.id && tools.length > 1 },
    { label: "Prismodell", render: t => <span className={`text-xs px-2 py-0.5 rounded-full border ${pricingLabels[t.pricing_model || "paid"] === "Gratis" || pricingLabels[t.pricing_model || "paid"] === "Open Source" ? "bg-success/10 text-success border-success/20" : "bg-card text-foreground border-border"}`}>{pricingLabels[t.pricing_model || "paid"] || t.pricing_model}</span> },
    { label: "Pris från", render: t => t.pricing_from || "–" },
    { label: "Kategori", render: t => t.category },
    { label: "Plattformar", render: t => <span className="text-xs">{t.platforms?.join(", ") || "–"}</span> },
    { label: "Språk", render: t => <span className="text-xs">{t.languages?.join(", ") || "–"}</span> },
    { label: "Grundat", render: t => <>{t.founded_year || "–"}</> },
    { label: "Företag", render: t => <>{t.company_name || "–"}</> },
    { label: "Bäst för", render: t => <span className="text-xs">{t.best_for || "–"}</span> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${tools.map(t => t.name).join(" vs ")} — Jämförelse 2026`}
        description={`Jämför ${tools.map(t => t.name).join(" och ")} sida vid sida. Se betyg, priser, fördelar och nackdelar. Läs svenska recensioner.`}
        canonical={`/verktyg/jamfor/${slugs}`}
      />
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-20">
        <nav className="text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Hem</Link>
          <ChevronRight className="w-3 h-3 inline mx-1" />
          <Link href="/verktyg" className="hover:text-foreground">Verktyg</Link>
          <ChevronRight className="w-3 h-3 inline mx-1" />
          <span className="text-foreground">Jämförelse</span>
        </nav>

        <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground mb-2">{tools.map(t => t.name).join(" vs ")}</h1>
        <p className="text-muted-foreground mb-8">Detaljerad jämförelse för AI-utvecklare</p>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 text-sm text-muted-foreground border-b border-border w-[160px]" />
                {tools.map(t => (
                  <th key={t.id} className="p-4 border-b border-border text-center">
                    <Link href={`/verktyg/${toCategorySlug(t.category)}/${t.slug}`} className="flex flex-col items-center gap-2 hover:opacity-80">
                      {t.logo_url ? (
                        <img src={t.logo_url} alt={t.name} className="w-12 h-12 rounded-lg bg-white p-1 object-contain" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-accent border border-border flex items-center justify-center text-sm font-bold">{t.name.substring(0, 2)}</div>
                      )}
                      <span className="font-bold text-foreground">{t.name}</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? "bg-card" : ""}>
                  <td className="p-4 text-sm font-medium text-muted-foreground border-b border-border">{row.label}</td>
                  {tools.map(t => (
                    <td key={t.id} className={`p-4 text-sm text-foreground text-center border-b border-border ${row.highlight?.(t) ? "bg-success/5" : ""}`}>
                      {row.render(t)}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Pros */}
              <tr>
                <td className="p-4 text-sm font-medium text-success border-b border-border"><span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> Fördelar</span></td>
                {tools.map(t => (
                  <td key={t.id} className="p-4 text-sm text-muted-foreground border-b border-border align-top">
                    <ul className="space-y-1 text-left">
                      {t.pros?.map((p, i) => <li key={i} className="flex items-start gap-1.5"><span className="mt-1.5 w-1 h-1 rounded-full bg-success shrink-0" />{p}</li>)}
                    </ul>
                  </td>
                ))}
              </tr>
              {/* Cons */}
              <tr className="bg-card">
                <td className="p-4 text-sm font-medium text-destructive border-b border-border"><span className="flex items-center gap-1"><ThumbsDown className="w-4 h-4" /> Nackdelar</span></td>
                {tools.map(t => (
                  <td key={t.id} className="p-4 text-sm text-muted-foreground border-b border-border align-top">
                    <ul className="space-y-1 text-left">
                      {t.cons?.map((c, i) => <li key={i} className="flex items-start gap-1.5"><span className="mt-1.5 w-1 h-1 rounded-full bg-destructive shrink-0" />{c}</li>)}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile: stacked cards */}
        <div className="md:hidden space-y-6">
          {tools.map(t => {
            const p = pricingLabels[t.pricing_model || "paid"] || t.pricing_model;
            return (
              <div key={t.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  {t.logo_url ? <img src={t.logo_url} alt={t.name} className="w-10 h-10 rounded-lg bg-white p-1 object-contain" /> : <div className="w-10 h-10 rounded-lg bg-accent border border-border flex items-center justify-center text-sm font-bold">{t.name.substring(0, 2)}</div>}
                  <div>
                    <h3 className="font-bold text-foreground">{t.name}</h3>
                    <span className="flex items-center gap-1 text-warning text-sm"><Star className="w-3.5 h-3.5 fill-current" /> {Number(t.avg_rating).toFixed(1)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span className="text-muted-foreground">Prismodell: <span className="text-foreground">{p}</span></span>
                  <span className="text-muted-foreground">Pris: <span className="text-foreground">{t.pricing_from || "–"}</span></span>
                  <span className="text-muted-foreground">Grundat: <span className="text-foreground">{t.founded_year || "–"}</span></span>
                  <span className="text-muted-foreground">Företag: <span className="text-foreground">{t.company_name || "–"}</span></span>
                </div>
                {t.best_for && <p className="text-xs text-muted-foreground">🎯 {t.best_for}</p>}
                {t.pros && t.pros.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {t.pros.slice(0, 3).map((pro, i) => <li key={i} className="flex items-start gap-1"><span className="text-success">✓</span>{pro}</li>)}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Recent reviews */}
        {Object.keys(reviews).length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-foreground mb-6">Senaste recensioner</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tools.map(t => (
                <div key={t.id}>
                  <h3 className="font-semibold text-foreground mb-3">{t.name}</h3>
                  <div className="space-y-3">
                    {(reviews[t.id] || []).slice(0, 3).map((r: any) => (
                      <div key={r.id} className="bg-card border border-border rounded-lg p-4 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-3 h-3 ${i <= r.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />)}
                          </div>
                          <span className="text-xs text-muted-foreground">{r.profiles?.full_name || "Anonym"}</span>
                        </div>
                        {r.title && <p className="font-medium text-foreground text-xs mb-1">{r.title}</p>}
                        <p className="text-xs text-muted-foreground line-clamp-2">{r.content}</p>
                      </div>
                    ))}
                  </div>
                  <Link href={`/verktyg/${toCategorySlug(t.category)}/${t.slug}`} className="text-xs text-primary hover:underline mt-2 inline-block">
                    Läs fullständig recension →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add third tool */}
        {tools.length < 4 && sameCatTools.length > 0 && (
          <div className="mt-8 flex items-center gap-3">
            <Plus className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Lägg till ett verktyg:</span>
            <Select onValueChange={addTool}>
              <SelectTrigger className="w-[200px] h-8 text-xs bg-card border-border">
                <SelectValue placeholder="Välj verktyg..." />
              </SelectTrigger>
              <SelectContent>
                {sameCatTools.map(t => <SelectItem key={t.slug} value={t.slug}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* CTA buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          {tools.map(t => (
            t.affiliate_url ? (
              <AffiliateLink key={t.id} toolSlug={t.slug} affiliateUrl={t.affiliate_url}>
                <Button className="gradient-bg text-primary-foreground hover:opacity-90">
                  Besök {t.name} <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </AffiliateLink>
            ) : (
              <a key={t.id} href={t.website_url || "#"} target="_blank" rel="noopener noreferrer">
                <Button className="gradient-bg text-primary-foreground hover:opacity-90">
                  Besök {t.name} <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </a>
            )
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ToolComparePage;
