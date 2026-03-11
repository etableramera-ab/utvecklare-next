'use client';
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Star, ExternalLink, ThumbsUp, ThumbsDown, Globe, Calendar, Code, Monitor, ChevronRight, Award, Loader2, Building2, MapPin, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AffiliateLink from "@/components/AffiliateLink";
import ToolCard from "@/components/tools/ToolCard";
import ToolSEO from "@/components/tools/ToolSEO";
import RatingBreakdown from "@/components/tools/RatingBreakdown";
import ReviewCard from "@/components/tools/ReviewCard";
import ReviewForm from "@/components/tools/ReviewForm";
import { useToolDetail, useToolReviews } from "@/hooks/useTools";
import { useAuth } from "@/hooks/useAuth";

const pricingStyle: Record<string, { label: string; cls: string }> = {
  free: { label: "Gratis", cls: "bg-success/10 text-success border-success/20" },
  freemium: { label: "Freemium", cls: "bg-primary/10 text-primary border-primary/20" },
  "open-source": { label: "Open Source", cls: "bg-[hsl(270_70%_60%)]/10 text-[hsl(270_70%_60%)] border-[hsl(270_70%_60%)]/20" },
  paid: { label: "Betald", cls: "bg-warning/10 text-warning border-warning/20" },
  enterprise: { label: "Enterprise", cls: "bg-destructive/10 text-destructive border-destructive/20" },
};

const toCategorySlug = (cat: string) =>
  cat.toLowerCase().replace(/ö/g, "o").replace(/å/g, "a").replace(/ä/g, "a")
    .replace(/&/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

type ReviewSort = "newest" | "helpful" | "highest" | "lowest";
type ExpFilter = "all" | "beginner" | "intermediate" | "advanced";

const ToolDetailPage = () => {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { tool, loading, relatedTools } = useToolDetail(slug);
  const { reviews, loading: reviewsLoading, refetch: refetchReviews } = useToolReviews(tool?.id);
  const { user } = useAuth();

  const [reviewSort, setReviewSort] = useState<ReviewSort>("newest");
  const [expFilter, setExpFilter] = useState<ExpFilter>("all");

  const existingReview = useMemo(() =>
    user ? reviews.find((r: any) => r.user_id === user.id) : null, [reviews, user]);

  const sortedReviews = useMemo(() => {
    let filtered = [...reviews];
    if (expFilter !== "all") filtered = filtered.filter((r: any) => r.experience_level === expFilter);
    filtered.sort((a: any, b: any) => {
      switch (reviewSort) {
        case "helpful": return (b.helpful_count || 0) - (a.helpful_count || 0);
        case "highest": return b.rating - a.rating;
        case "lowest": return a.rating - b.rating;
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    return filtered;
  }, [reviews, reviewSort, expFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        <Footer />
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Verktyget hittades inte</h1>
          <Link href="/verktyg" className="text-primary hover:underline">← Tillbaka till verktyg</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const pricing = pricingStyle[tool.pricing_model || "paid"] || pricingStyle.paid;
  const categorySlug = toCategorySlug(tool.category);

  return (
    <div className="min-h-screen bg-background">
      <ToolSEO tool={tool} />
      <Navbar />

      {/* Hero */}
      <section className="pt-16 bg-gradient-to-b from-accent via-background to-background">
        <div className="container mx-auto px-4 py-16 lg:py-20">
          <nav className="text-xs text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground">Hem</Link>
            <ChevronRight className="w-3 h-3 inline mx-1" />
            <Link href="/verktyg" className="hover:text-foreground">Verktyg</Link>
            <ChevronRight className="w-3 h-3 inline mx-1" />
            <Link href={`/verktyg/${categorySlug}`} className="hover:text-foreground">{tool.category}</Link>
            <ChevronRight className="w-3 h-3 inline mx-1" />
            <span className="text-foreground">{tool.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row items-start gap-6">
            {tool.logo_url ? (
              <img src={tool.logo_url} alt={tool.name} className="w-20 h-20 rounded-xl bg-white p-2 border border-border object-contain shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-card border border-border flex items-center justify-center text-2xl font-bold text-foreground shrink-0">
                {tool.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground">{tool.name}</h1>
                {tool.is_editors_choice && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full bg-warning/20 text-warning border border-warning/30">
                    <Award className="w-3.5 h-3.5" /> Editor's Choice
                  </span>
                )}
              </div>
              <p className="text-lg text-muted-foreground mb-4">{tool.tagline || tool.description}</p>

              {/* Info chips */}
              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-sm px-3 py-1 rounded-full border ${pricing.cls}`}>{pricing.label}</span>
                <span className="text-sm px-3 py-1 rounded-full bg-accent text-accent-foreground border border-border">{tool.category}</span>
                <span className="flex items-center gap-1 text-warning">
                  <Star className="w-4 h-4 fill-current" /> {Number(tool.avg_rating).toFixed(1)}
                  <span className="text-muted-foreground text-sm ml-1">({tool.review_count} recensioner)</span>
                </span>
                {tool.platforms?.map(p => (
                  <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-border">{p}</span>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="shrink-0 flex flex-col gap-2">
              {tool.affiliate_url ? (
                <div>
                  <AffiliateLink toolSlug={tool.slug} affiliateUrl={tool.affiliate_url}>
                    <Button className="gradient-bg text-primary-foreground hover:opacity-90 transition-opacity text-base px-6 py-3 h-auto">
                      Besök {tool.name} <ExternalLink className="w-4 h-4 ml-1" />
                    </Button>
                  </AffiliateLink>
                  <p className="text-[10px] text-muted-foreground mt-1 text-center">Affiliate-länk</p>
                </div>
              ) : (
                <a href={tool.website_url || "#"} target="_blank" rel="noopener noreferrer">
                  <Button className="gradient-bg text-primary-foreground hover:opacity-90 transition-opacity text-base px-6 py-3 h-auto">
                    Besök {tool.name} <ExternalLink className="w-4 h-4 ml-1" />
                  </Button>
                </a>
              )}
              <a href="#reviews" className="text-center">
                <Button variant="outline" className="border-border text-foreground hover:bg-accent text-sm w-full">
                  <FileText className="w-4 h-4 mr-1" /> Skriv recension
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {(tool.long_description || tool.description) && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Om {tool.name}</h2>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line article-body">
                  {tool.long_description || tool.description}
                </div>
              </div>
            )}

            {/* Pros / Cons */}
            {(tool.pros?.length || tool.cons?.length) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tool.pros && tool.pros.length > 0 && (
                  <div className="bg-card border border-success/20 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-success mb-4 flex items-center gap-2">
                      <ThumbsUp className="w-5 h-5" /> Fördelar
                    </h3>
                    <ul className="space-y-2">
                      {tool.pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-success shrink-0" />{pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {tool.cons && tool.cons.length > 0 && (
                  <div className="bg-card border border-destructive/20 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-destructive mb-4 flex items-center gap-2">
                      <ThumbsDown className="w-5 h-5" /> Nackdelar
                    </h3>
                    <ul className="space-y-2">
                      {tool.cons.map((con, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />{con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}

            {/* Best for */}
            {tool.best_for && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
                <h3 className="text-base font-bold text-foreground mb-2">🎯 Bäst för</h3>
                <p className="text-sm text-muted-foreground">{tool.best_for}</p>
              </div>
            )}

            {/* Screenshots */}
            {tool.screenshot_urls && tool.screenshot_urls.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Skärmdumpar</h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {tool.screenshot_urls.map((url, i) => (
                    <img key={i} src={url} alt={`${tool.name} screenshot ${i + 1}`} className="h-48 rounded-lg border border-border object-cover shrink-0" />
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            {tool.pricing_details && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-3">Prissättning</h2>
                <p className="text-muted-foreground">{tool.pricing_details}</p>
                {tool.pricing_from && <p className="text-sm text-foreground mt-2 font-medium">{tool.pricing_from}</p>}
              </div>
            )}

            {/* Alternatives */}
            {relatedTools.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Alternativ till {tool.name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedTools.slice(0, 3).map(rt => (
                    <ToolCard key={rt.id} tool={rt} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {relatedTools.slice(0, 3).map(rt => (
                    <Link key={rt.id} href={`/verktyg/jamfor/${tool.slug}-vs-${rt.slug}`} className="text-xs text-primary hover:underline">
                      Jämför {tool.name} vs {rt.name} →
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div id="reviews" className="space-y-6">
              <h2 className="text-xl font-bold text-foreground">Recensioner ({reviews.length})</h2>

              {/* Rating breakdown */}
              {reviews.length > 0 && (
                <RatingBreakdown reviews={reviews} avgRating={tool.avg_rating} totalCount={reviews.length} />
              )}

              {/* Filter/sort */}
              {reviews.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={reviewSort} onValueChange={v => setReviewSort(v as ReviewSort)}>
                    <SelectTrigger className="w-[160px] h-8 text-xs bg-card border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Senaste</SelectItem>
                      <SelectItem value="helpful">Mest hjälpsamma</SelectItem>
                      <SelectItem value="highest">Högst betyg</SelectItem>
                      <SelectItem value="lowest">Lägst betyg</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={expFilter} onValueChange={v => setExpFilter(v as ExpFilter)}>
                    <SelectTrigger className="w-[160px] h-8 text-xs bg-card border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alla nivåer</SelectItem>
                      <SelectItem value="beginner">Nybörjare</SelectItem>
                      <SelectItem value="intermediate">Mellannivå</SelectItem>
                      <SelectItem value="advanced">Avancerad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Review list */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                {sortedReviews.length > 0 ? (
                  sortedReviews.map((review: any) => (
                    <ReviewCard key={review.id} review={review} userId={user?.id} />
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">Inga recensioner ännu. Bli den första!</p>
                )}
              </div>

              {/* Write review */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  {existingReview ? "Redigera din recension" : "Skriv en recension"}
                </h3>
                <ReviewForm
                  toolId={tool.id}
                  toolName={tool.name}
                  user={user}
                  existingReview={existingReview}
                  onSuccess={refetchReviews}
                />
              </div>
            </div>

            {/* Tags */}
            {tool.tags && tool.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tool.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 text-xs rounded-full bg-accent text-accent-foreground border border-border">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Quick facts */}
            <div className="bg-card border border-border rounded-xl p-5 sticky top-20">
              <h3 className="text-base font-bold text-foreground mb-4">Snabbfakta</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                  <dt className="text-muted-foreground">Webbplats</dt>
                  <dd className="ml-auto">
                    <a href={tool.website_url || "#"} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[140px] block text-right">
                      {(tool.website_url || "").replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  </dd>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`w-4 h-4 flex items-center justify-center rounded-full text-xs border ${pricing.cls}`}>$</span>
                  <dt className="text-muted-foreground">Prismodell</dt>
                  <dd className="ml-auto text-foreground">{pricing.label}</dd>
                </div>
                {tool.pricing_from && (
                  <div className="flex items-center gap-3">
                    <dt className="text-muted-foreground ml-7">Pris från</dt>
                    <dd className="ml-auto text-foreground text-xs">{tool.pricing_from}</dd>
                  </div>
                )}
                {tool.founded_year && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                    <dt className="text-muted-foreground">Grundat</dt>
                    <dd className="ml-auto text-foreground">{tool.founded_year}</dd>
                  </div>
                )}
                {tool.company_name && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                    <dt className="text-muted-foreground">Företag</dt>
                    <dd className="ml-auto text-foreground">{tool.company_name}</dd>
                  </div>
                )}
                {tool.company_hq && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                    <dt className="text-muted-foreground">HQ</dt>
                    <dd className="ml-auto text-foreground text-xs">{tool.company_hq}</dd>
                  </div>
                )}
                {tool.languages && tool.languages.length > 0 && (
                  <div className="flex items-center gap-3">
                    <Code className="w-4 h-4 text-muted-foreground shrink-0" />
                    <dt className="text-muted-foreground">Språk</dt>
                    <dd className="ml-auto text-foreground text-right text-xs">{tool.languages.join(", ")}</dd>
                  </div>
                )}
                {tool.platforms && tool.platforms.length > 0 && (
                  <div className="flex items-center gap-3">
                    <Monitor className="w-4 h-4 text-muted-foreground shrink-0" />
                    <dt className="text-muted-foreground">Plattformar</dt>
                    <dd className="ml-auto text-foreground text-right text-xs">{tool.platforms.join(", ")}</dd>
                  </div>
                )}
              </dl>

              {/* CTA */}
              {tool.affiliate_url ? (
                <div className="mt-5">
                  <AffiliateLink toolSlug={tool.slug} affiliateUrl={tool.affiliate_url} className="block">
                    <Button className="w-full gradient-bg text-primary-foreground hover:opacity-90 transition-opacity">
                      Testa {tool.name} → <ExternalLink className="w-4 h-4 ml-1" />
                    </Button>
                  </AffiliateLink>
                  <p className="text-[10px] text-muted-foreground mt-1 text-center">Affiliate-länk</p>
                </div>
              ) : (
                <a href={tool.website_url || "#"} target="_blank" rel="noopener noreferrer" className="block mt-5">
                  <Button className="w-full gradient-bg text-primary-foreground hover:opacity-90 transition-opacity">
                    Testa {tool.name} → <ExternalLink className="w-4 h-4 ml-1" />
                  </Button>
                </a>
              )}
              {tool.pricing_from && <p className="text-xs text-muted-foreground text-center mt-1">{tool.pricing_from}</p>}
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ToolDetailPage;
