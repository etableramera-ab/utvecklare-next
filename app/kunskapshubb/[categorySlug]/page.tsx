'use client';
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Search, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleCardSupabase from "@/components/articles/ArticleCardSupabase";
import ArticleSEO from "@/components/articles/ArticleSEO";
import { useArticles, usePopularArticles, useAllTags, ARTICLE_CATEGORIES, getCategoryLabel, getCategorySlug } from "@/hooks/useArticles";
import { AffiliateCard } from "@/components/AffiliateCard";
import knowledgeHeroBg from "@/assets/knowledge-hero-bg.jpg";

const POPULAR_SEARCHES = ["RAG", "Fine-tuning", "MLOps", "PyTorch", "LLM", "Karriär"];
const ITEMS_PER_PAGE = 12;

const KnowledgeHubPage = () => {
  const params = useParams<{ categorySlug: string }>();
  const categorySlug = params?.categorySlug;
  const activeCategory = categorySlug || "alla";
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const { featured, gridArticles, loading, totalCount } = useArticles(activeCategory, search, selectedTags);
  const popularArticles = usePopularArticles();
  const allTags = useAllTags();

  const activeCategoryLabel = getCategoryLabel(activeCategory);

  const paginatedArticles = gridArticles.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = paginatedArticles.length < gridArticles.length;
  const shownCount = paginatedArticles.length + (featured ? 1 : 0);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    setPage(1);
  };

  const renderGrid = () => {
    const items: React.ReactNode[] = [];
    paginatedArticles.forEach((article, i) => {
      items.push(<ArticleCardSupabase key={article.id} article={article} />);

    });
    return items;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ArticleSEO isOverview categorySlug={activeCategory} categoryLabel={activeCategoryLabel} articleCount={totalCount} />

      <section className="relative pt-16">
        <img src={knowledgeHeroBg.src} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        <div className="relative container mx-auto px-4 py-20 lg:py-28 text-center">
          <h1 className="text-3xl lg:text-5xl font-extrabold text-foreground mb-4">AI-kunskapshubb</h1>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Guider, tutorials och djupdykningar för svenska AI-utvecklare — från nybörjare till expert
          </p>
          <div className="max-w-xl mx-auto">
            <div className="flex items-center bg-card border border-border rounded-lg overflow-hidden focus-within:border-primary/50 transition-colors">
              <Search className="w-5 h-5 text-muted-foreground ml-4 shrink-0" />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Sök bland artiklar och guider…"
                className="flex-1 bg-transparent px-3 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
              {search && <button onClick={() => setSearch("")} className="p-2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {POPULAR_SEARCHES.map(term => (
                <button key={term} onClick={() => setSearch(term)}
                  className="px-3 py-1 text-xs rounded-full bg-accent text-accent-foreground border border-border hover:border-primary/50 transition-colors">
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-4">
        <nav className="text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Hem</Link>
          <span className="mx-1.5">→</span>
          {activeCategory === "alla" ? (
            <span className="text-foreground">Kunskapshubb</span>
          ) : (
            <>
              <Link href="/kunskapshubb" className="hover:text-foreground">Kunskapshubb</Link>
              <span className="mx-1.5">→</span>
              <span className="text-foreground">{activeCategoryLabel}</span>
            </>
          )}
        </nav>
      </div>

      <div className="container mx-auto px-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {ARTICLE_CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={cat.slug === "alla" ? "/kunskapshubb" : `/kunskapshubb/${cat.slug}`}
              className={`px-4 py-2 text-sm rounded-full border transition-all ${
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

      <div className="container mx-auto px-4 pb-20">
        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="space-y-6">
                <div className="h-64 rounded-lg bg-muted animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-72 rounded-lg bg-muted animate-pulse" />)}
                </div>
              </div>
            ) : (
              <>
                {featured && <div className="mb-8"><ArticleCardSupabase article={featured} featured /></div>}

                {paginatedArticles.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {renderGrid()}
                    </div>
                    <div className="flex items-center justify-between mt-8">
                      <p className="text-sm text-muted-foreground">
                        Visar {shownCount} av {gridArticles.length + (featured ? 1 : 0)} artiklar
                      </p>
                      {hasMore && (
                        <Button variant="outline" onClick={() => setPage(p => p + 1)} className="border-border text-foreground hover:bg-accent">
                          Ladda fler artiklar
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 rounded-lg bg-card border border-border">
                    <p className="text-lg font-medium text-foreground mb-2">Inga artiklar hittades</p>
                    <p className="text-muted-foreground mb-4">Prova att ändra sökord eller kategori.</p>
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      <span className="text-sm text-muted-foreground">Populära ämnen:</span>
                      {ARTICLE_CATEGORIES.filter(c => c.slug !== "alla").slice(0, 4).map(c => (
                        <Link key={c.slug} href={`/kunskapshubb/${c.slug}`} className="px-3 py-1 text-xs rounded-full bg-accent text-accent-foreground border border-border hover:border-primary/50">
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-20 space-y-6">
              <div className="p-5 rounded-lg bg-card border border-border">
                <h4 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-secondary" /> Populära artiklar
                </h4>
                <div className="space-y-3">
                  {popularArticles.map((a, i) => (
                    <Link key={a.id} href={`/kunskapshubb/${getCategorySlug(a.category)}/${a.slug}`} className="block group">
                      <div className="flex gap-3">
                        <span className="text-lg font-bold text-muted-foreground/40">{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">{a.title}</p>
                          <p className="text-xs text-tertiary mt-0.5">{(a.views_count || 0).toLocaleString("sv-SE")} visningar</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-lg bg-card border border-border">
                <h4 className="font-semibold text-foreground text-sm mb-3">Taggar</h4>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                        selectedTags.includes(tag) ? "gradient-bg text-primary-foreground border-transparent" : "bg-accent text-accent-foreground border-border hover:border-primary/50"
                      }`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

<AffiliateCard partner="keytive" />

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default KnowledgeHubPage;
