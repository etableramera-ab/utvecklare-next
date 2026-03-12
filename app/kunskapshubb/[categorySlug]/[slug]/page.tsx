'use client';
import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, Heart, Bookmark, Linkedin, Twitter, LinkIcon, Check, ArrowLeft, Calendar, Eye, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleCardSupabase from "@/components/articles/ArticleCardSupabase";
import ArticleRenderer from "@/components/articles/ArticleRenderer";
import CommentSection from "@/components/articles/CommentSection";
import NewsletterInlineCTA from "@/components/articles/NewsletterInlineCTA";
import ReadingProgress from "@/components/articles/ReadingProgress";
import RelatedJobs from "@/components/articles/RelatedJobs";
import RelatedTools from "@/components/articles/RelatedTools";
import ArticleSEO from "@/components/articles/ArticleSEO";
import { useArticleDetail, useArticleLike, useBookmark, getCategorySlug } from "@/hooks/useArticles";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { ArticleRow } from "@/hooks/useArticles";

interface TocItem { id: string; text: string; level: number; }

const ArticleDetailPage = () => {
  const params = useParams<{ slug: string; categorySlug: string }>();
  const { slug } = params;
  const router = useRouter();
  const { user } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);

  const { article, loading } = useArticleDetail(slug);
  const { liked, count: likeCount, toggle: toggleLike, setCount: setLikeCount } = useArticleLike(article?.id);
  const { bookmarked, toggle: toggleBookmark } = useBookmark(article?.id);

  const [copied, setCopied] = useState(false);
  const [activeHeading, setActiveHeading] = useState("");
  const [readPct, setReadPct] = useState(0);
  const [relatedArticles, setRelatedArticles] = useState<ArticleRow[]>([]);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  // Set initial like count
  useEffect(() => {
    if (article) setLikeCount(article.likes_count);
  }, [article, setLikeCount]);

  // Fetch related articles
  useEffect(() => {
    if (!article) return;
    supabase
      .from("articles")
      .select("*")
      .eq("is_published", true)
      .eq("category", article.category)
      .neq("id", article.id)
      .limit(3)
      .then(({ data }) => setRelatedArticles((data as ArticleRow[]) || []));
  }, [article]);

  // TOC
  const toc = useMemo((): TocItem[] => {
    if (!article?.content) return [];
    const headings: TocItem[] = [];
    article.content.split("\n").forEach(line => {
      const m2 = line.match(/^## (.+)/);
      const m3 = line.match(/^### (.+)/);
      if (m2) headings.push({ id: m2[1].toLowerCase().replace(/[^\wåäö]/g, "-").replace(/-+/g, "-"), text: m2[1], level: 2 });
      else if (m3) headings.push({ id: m3[1].toLowerCase().replace(/[^\wåäö]/g, "-").replace(/-+/g, "-"), text: m3[1], level: 3 });
    });
    return headings;
  }, [article?.content]);

  // Track active heading
  useEffect(() => {
    if (!toc.length) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveHeading(e.target.id); }),
      { rootMargin: "-80px 0px -70% 0px" }
    );
    toc.forEach(h => { const el = document.getElementById(h.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [toc]);

  // Update reading_history scroll percentage (throttled)
  const updateReadingHistory = useCallback((pct: number) => {
    setReadPct(pct);
    if (user && article && pct > 0 && pct % 10 === 0) {
      supabase
        .from("reading_history")
        .upsert({ user_id: user.id, article_id: article.id, scroll_percentage: pct, read_at: new Date().toISOString() }, { onConflict: "user_id,article_id" })
        .then(() => {});
    }
  }, [user, article]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ title: "Länk kopierad!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    if (!user) { router.push("/logga-in"); return; }
    toggleLike();
  };
  const handleBookmark = () => {
    if (!user) { router.push("/logga-in"); return; }
    toggleBookmark();
    toast({ title: bookmarked ? "Bokmärke borttaget" : "Sparad till läslista" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16">
          <div className="h-80 bg-muted animate-pulse" />
          <div className="container mx-auto px-4 max-w-4xl py-10 space-y-4">
            <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
            <div className="h-96 bg-muted animate-pulse rounded-lg mt-8" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Artikeln hittades inte</h1>
          <Button asChild variant="outline" className="border-border text-foreground">
            <Link href="/kunskapshubb"><ArrowLeft className="w-4 h-4 mr-2" /> Tillbaka</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const catSlug = getCategorySlug(article.category);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ArticleSEO article={article} />
      <ReadingProgress contentRef={contentRef as React.RefObject<HTMLDivElement>} onProgressChange={updateReadingHistory} />

      {/* Hero */}
      <section className="relative pt-16">
        <img src={article.hero_image_url || ""} alt={article.hero_image_alt || article.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />
        <div className="relative container mx-auto px-4 py-20 lg:py-28 max-w-4xl">
          <Link href={`/kunskapshubb/${catSlug}`} className="inline-block px-3 py-1 text-xs font-medium rounded-full gradient-bg text-primary-foreground mb-4 hover:opacity-90 transition-opacity">
            {article.category}
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-primary-foreground text-sm font-bold">
                {(article.author_name || "?").split(" ").map(n => n[0]).join("")}
              </div>
              <span className="text-foreground font-medium">{article.author_name}</span>
            </div>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(article.published_at || "").toLocaleDateString("sv-SE")}</span>
            {article.updated_at && article.updated_at !== article.published_at && (
              <span className="text-xs">(Uppdaterad {new Date(article.updated_at).toLocaleDateString("sv-SE")})</span>
            )}
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{article.reading_time_minutes || 5} min läsning</span>
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{article.views_count.toLocaleString("sv-SE")} visningar</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {(article.tags || []).map(t => (
              <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-muted text-secondary">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4 max-w-4xl lg:max-w-6xl">
        <nav className="text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Hem</Link>
          <span className="mx-1.5">→</span>
          <Link href="/kunskapshubb" className="hover:text-foreground">Kunskapshubb</Link>
          <span className="mx-1.5">→</span>
          <Link href={`/kunskapshubb/${catSlug}`} className="hover:text-foreground">{article.category}</Link>
          <span className="mx-1.5">→</span>
          <span className="text-foreground line-clamp-1">{article.title}</span>
        </nav>
      </div>

      {/* Mobile TOC */}
      {toc.length > 0 && (
        <div className="lg:hidden container mx-auto px-4 max-w-4xl mb-4">
          <button
            onClick={() => setMobileTocOpen(!mobileTocOpen)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-card border border-border text-sm font-medium text-foreground"
          >
            <span>Innehåll</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${mobileTocOpen ? "rotate-180" : ""}`} />
          </button>
          {mobileTocOpen && (
            <nav className="mt-1 p-4 rounded-lg bg-card border border-border space-y-1">
              {toc.map(h => (
                <a key={h.id} href={`#${h.id}`} onClick={() => setMobileTocOpen(false)}
                  className={`block text-sm py-1 transition-colors ${h.level === 3 ? "pl-4" : ""} ${
                    activeHeading === h.id ? "text-primary font-medium" : "text-muted-foreground"
                  }`}>
                  {h.text}
                </a>
              ))}
            </nav>
          )}
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 pb-24 lg:pb-20 max-w-4xl lg:max-w-6xl">
        <div className="flex gap-10 items-start">
          {/* Article body */}
          <div className="flex-1 min-w-0 max-w-[720px] mx-auto lg:mx-0 article-body" ref={contentRef}>
            <ArticleRenderer content={article.content || ""} />

            {/* Related jobs */}
            <RelatedJobs tags={article.tags || []} category={article.category} />

            {/* Engagement bar */}
            <div className="hidden lg:flex flex-wrap items-center gap-3 mb-10 pb-10 border-b border-border">
              <Button variant="outline" onClick={handleLike}
                className={`border-border ${liked ? "text-destructive border-destructive/30" : "text-foreground"}`}>
                <Heart className={`w-4 h-4 mr-2 ${liked ? "fill-current" : ""}`} /> {likeCount}
              </Button>
              <Button variant="outline" onClick={handleBookmark}
                className={`border-border ${bookmarked ? "text-primary border-primary/30" : "text-foreground"}`}>
                <Bookmark className={`w-4 h-4 mr-2 ${bookmarked ? "fill-current" : ""}`} /> {bookmarked ? "Sparad" : "Spara"}
              </Button>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground">Dela:</span>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Läs: ${article.title} på @utvecklare_ai`)}`} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
                <button onClick={copyLink} className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all">
                  {copied ? <Check className="w-4 h-4 text-success" /> : <LinkIcon className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-xs text-tertiary flex items-center gap-1"><Eye className="w-3 h-3" /> {article.views_count.toLocaleString("sv-SE")} visningar</span>
            </div>

            {/* Author bio */}
            <div className="p-6 rounded-xl bg-card border border-border mb-10 flex flex-col sm:flex-row gap-4">
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                {(article.author_name || "?").split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{article.author_name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{article.author_bio}</p>
                <div className="flex items-center gap-3 mt-3">
                  {article.author_linkedin_url && (
                    <a href={article.author_linkedin_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {article.author_github_url && (
                    <a href={article.author_github_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                    </a>
                  )}
                  {article.author_slug && (
                    <Link href={`/kunskapshubb?author=${article.author_slug}`} className="text-xs text-primary hover:underline">
                      Alla artiklar av {article.author_name} →
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Article-bottom CTA */}
            <div className="mb-10">
<Link href="/foretag" className="block relative rounded-lg overflow-hidden border border-border group h-[200px]">
                <img src="https://images.unsplash.com/photo-1531746790095-e5906b947fb1?w=1200&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center px-8">
                  <p className="text-lg font-bold text-white">Annonsera på utvecklare.ai</p>
                  <p className="text-sm text-white/80 mt-1">Nå Sveriges AI-utvecklare →</p>
                </div>
              </Link>
            </div>

            {/* Newsletter */}
            <div className="mb-10">
              <NewsletterInlineCTA source="article-bottom" variant="article-bottom" />
            </div>

            {/* Comments */}
            <CommentSection articleId={article.id} />

            {/* Related articles */}
            {relatedArticles.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-foreground mb-6">Fler artiklar du kanske gillar</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {relatedArticles.map(a => <ArticleCardSupabase key={a.id} article={a} />)}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20 space-y-6">
              {/* TOC */}
              {toc.length > 0 && (
                <div className="p-5 rounded-lg bg-card border border-border">
                  <h4 className="font-semibold text-foreground text-sm mb-3">Innehåll</h4>
                  <nav className="space-y-1">
                    {toc.map(h => (
                      <a key={h.id} href={`#${h.id}`}
                        className={`block text-xs py-1 transition-colors ${h.level === 3 ? "pl-3" : ""} ${
                          activeHeading === h.id ? "text-primary font-medium border-l-2 border-primary pl-3" : "text-muted-foreground hover:text-foreground"
                        }`}>
                        {h.text}
                      </a>
                    ))}
                  </nav>
                  <div className="mt-4 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">{readPct}% läst</p>
                    <Progress value={readPct} className="h-1" />
                  </div>
                </div>
              )}

              {/* Related tools */}
              <RelatedTools tags={article.tags || []} toolName={article.title} />

              {/* Ad */}
<Link href="/foretag" className="block relative rounded-lg overflow-hidden border border-border group" style={{ minHeight: "200px" }}>
              <img src="https://images.unsplash.com/photo-1531746790095-e5906b947fb1?w=400&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
              <div className="absolute inset-0 flex flex-col items-center justify-end p-5 text-center">
                <p className="text-sm font-bold text-white drop-shadow">Annonsera här</p>
                <p className="text-xs text-white/80 mt-1">Nå Sveriges AI-utvecklare →</p>
              </div>
            </Link>

              {/* Popular */}
              {relatedArticles.length > 0 && (
                <div className="p-5 rounded-lg bg-card border border-border">
                  <h4 className="font-semibold text-foreground text-sm mb-3">Populärt just nu</h4>
                  <div className="space-y-3">
                    {relatedArticles.map(a => (
                      <Link key={a.id} href={`/kunskapshubb/${getCategorySlug(a.category)}/${a.slug}`} className="block group">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">{a.title}</p>
                        <p className="text-xs text-tertiary mt-0.5">{a.reading_time_minutes || 5} min · {a.category}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {(article.tags || []).length > 0 && (
                <div className="p-5 rounded-lg bg-card border border-border">
                  <h4 className="font-semibold text-foreground text-sm mb-3">Taggar</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(article.tags || []).map(tag => (
                      <Link key={tag} href={`/kunskapshubb`}
                        className="px-2.5 py-1 text-xs rounded-full bg-accent text-accent-foreground border border-border hover:border-primary/50 transition-colors">
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile fixed engagement bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden glass border-t border-border">
        <div className="flex items-center justify-between px-4 py-2.5 max-w-lg mx-auto">
          <Button variant="ghost" size="sm" onClick={handleLike}
            className={`${liked ? "text-destructive" : "text-foreground"}`}>
            <Heart className={`w-4 h-4 mr-1.5 ${liked ? "fill-current" : ""}`} /> {likeCount}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleBookmark}
            className={`${bookmarked ? "text-primary" : "text-foreground"}`}>
            <Bookmark className={`w-4 h-4 mr-1.5 ${bookmarked ? "fill-current" : ""}`} /> {bookmarked ? "Sparad" : "Spara"}
          </Button>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
            className="p-2 text-muted-foreground hover:text-foreground">
            <Linkedin className="w-4 h-4" />
          </a>
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
            className="p-2 text-muted-foreground hover:text-foreground">
            <Twitter className="w-4 h-4" />
          </a>
          <button onClick={copyLink} className="p-2 text-muted-foreground hover:text-foreground">
            {copied ? <Check className="w-4 h-4 text-success" /> : <LinkIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ArticleDetailPage;
