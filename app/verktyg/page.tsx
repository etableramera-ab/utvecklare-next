'use client';
import { useState, useCallback, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Search, X, Star, ArrowRight, Award } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolCard from "@/components/tools/ToolCard";
import ToolsFilterBar from "@/components/tools/ToolsFilterBar";
import CompareBar from "@/components/tools/CompareBar";
import { useTools, TOOL_CATEGORIES, type ToolRow } from "@/hooks/useTools";
import toolsHeroBg from "@/assets/tools-hero-bg.jpg";
import { AnswerBlock } from "@/components/AnswerBlock";

const ToolsPage = () => {
  const params = useParams<{ categorySlug: string }>();
  const categorySlug = params?.categorySlug;
  const {
    tools, editorsChoiceTools, featuredTools,
    loading, search, setSearch,
    sortBy, setSortBy,
    pricingFilters, togglePricingFilter,
    minRating, setMinRating,
    clearFilters, hasMore, loadMore,
    totalCount, activeCategory, categoryLabel,
  } = useTools(categorySlug);

  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());

  const toggleCompare = useCallback((id: string) => {
    setCompareIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      return next;
    });
  }, []);

  const compareTools = tools.filter(t => compareIds.has(t.id));
  const hasActiveFilters = pricingFilters.length > 0 || minRating > 0 || search.length > 0 || sortBy !== "popular";

  // SEO meta
  const metaTitle = activeCategory === "alla"
    ? "Bästa AI-verktygen 2026 | Recensioner & Jämförelser | utvecklare.ai"
    : `Bästa ${categoryLabel}-verktygen 2026 | utvecklare.ai`;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={metaTitle}
        description="Jämför AI-verktyg, ML-ramverk och utvecklarverktyg. Läs svenska recensioner, se priser och hitta rätt verktyg."
        canonical={activeCategory === "alla" ? "/verktyg" : `/verktyg/${activeCategory}`}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16">
        <img src={toolsHeroBg.src} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background" />
        <div className="relative container mx-auto px-4 py-20 lg:py-28 text-center">
          <h1 className="text-3xl lg:text-5xl font-extrabold text-foreground mb-4">AI-verktyg & Resurser</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Kuraterade verktyg, ramverk och tjänster för AI-utvecklare — med svenska recensioner och jämförelser
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-6">
            <div className="flex items-center bg-card border border-border rounded-lg overflow-hidden focus-within:border-primary/50 transition-colors">
              <Search className="w-5 h-5 text-muted-foreground ml-4 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Sök bland AI-verktyg..."
                className="flex-1 bg-transparent px-3 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="p-2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {["LLM-verktyg", "ML-ramverk", "Gratis", "Editor's Choice"].map(chip => (
              <button
                key={chip}
                onClick={() => {
                  if (chip === "Gratis") togglePricingFilter("free");
                  else if (chip === "Editor's Choice") setSearch("editors choice");
                  else setSearch(chip.replace("-", " "));
                }}
                className="px-3 py-1.5 text-xs rounded-full bg-card/50 backdrop-blur border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Hem</Link>
          <span className="mx-1.5">→</span>
          {activeCategory === "alla" ? (
            <span className="text-foreground">Verktyg</span>
          ) : (
            <>
              <Link href="/verktyg" className="hover:text-foreground">Verktyg</Link>
              <span className="mx-1.5">→</span>
              <span className="text-foreground">{categoryLabel}</span>
            </>
          )}
        </nav>
      </div>

      {/* Answer block */}
      <div className="container mx-auto px-4 pt-6">
        <AnswerBlock text="De mest använda AI-verktygen bland svenska utvecklare 2026 är PyTorch och TensorFlow för ML, GitHub Copilot och Cursor för kodassistans, samt LangChain och Hugging Face för NLP/LLM-utveckling. Se recensioner och jämförelser nedan." />
      </div>

      {/* Category tabs */}
      <div className="container mx-auto px-4 mb-4">
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
          {TOOL_CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={cat.slug === "alla" ? "/verktyg" : `/verktyg/${cat.slug}`}
              className={`px-4 py-2 text-sm rounded-full border whitespace-nowrap transition-all ${
                activeCategory === cat.slug
                  ? "gradient-bg text-primary-foreground border-transparent"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div className="container mx-auto px-4 mb-8">
        <ToolsFilterBar
          pricingFilters={pricingFilters}
          onTogglePricing={togglePricingFilter}
          minRating={minRating}
          onSetMinRating={setMinRating}
          sortBy={sortBy}
          onSetSortBy={setSortBy}
          onClearAll={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      <div className="container mx-auto px-4 pb-20">
        {/* Editors Choice (only on "Alla") */}
        {activeCategory === "alla" && editorsChoiceTools.length > 0 && !search && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-warning" /> Editor's Choice
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 items-stretch">
              {editorsChoiceTools.map(tool => (
                <div key={tool.id} className="min-w-[280px] max-w-[320px] flex-shrink-0 flex">
                  <ToolCard tool={tool} showCompare onToggleCompare={toggleCompare} isCompareSelected={compareIds.has(tool.id)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured / Sponsored */}
        {activeCategory === "alla" && featuredTools.length > 0 && !search && (
          <div className="mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredTools.slice(0, 2).map(tool => (
                <ToolCard key={tool.id} tool={tool} showCompare onToggleCompare={toggleCompare} isCompareSelected={compareIds.has(tool.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Count */}
        <p className="text-sm text-muted-foreground mb-6">
          <span className="text-foreground font-medium">{totalCount}</span> verktyg
          {hasActiveFilters && " (filtrerade)"}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[260px] rounded-xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : tools.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tools.map(tool => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  showCompare
                  onToggleCompare={toggleCompare}
                  isCompareSelected={compareIds.has(tool.id)}
                />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-10">
                <Button onClick={loadMore} variant="outline" className="border-border text-foreground hover:bg-accent">
                  Ladda fler verktyg
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Visar {tools.length} av {totalCount} verktyg
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 rounded-lg bg-card border border-border">
            <p className="text-lg font-medium text-foreground mb-2">Inga verktyg hittades</p>
            <p className="text-muted-foreground">Prova ett annat sökord eller kategori.</p>
          </div>
        )}

        {/* Affiliate disclaimer */}
        <p className="text-xs text-muted-foreground text-center mt-12">
          Vissa länkar på denna sida är affiliate-länkar. Vi kan få en provision om du köper via dessa länkar, utan extra kostnad för dig.
        </p>
      </div>

      {/* Compare bar */}
      <CompareBar
        selectedTools={[...compareIds].map(id => tools.find(t => t.id === id)!).filter(Boolean)}
        onRemove={id => toggleCompare(id)}
        onClear={() => setCompareIds(new Set())}
      />

      <Footer />
    </div>
  );
};

const ToolsPageWithSuspense = () => (
  <Suspense>
    <ToolsPage />
  </Suspense>
);

export default ToolsPageWithSuspense;
