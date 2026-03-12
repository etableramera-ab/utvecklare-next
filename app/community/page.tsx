'use client';
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Plus, TrendingUp, Clock, MessageSquareOff, CheckCircle, Search } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ForumPostCard from "@/components/community/ForumPostCard";
import ShowcaseCard, { type ShowcaseProjectRow } from "@/components/community/ShowcaseCard";
import CommunitySidebar from "@/components/community/CommunitySidebar";
import LeaderboardTab from "@/components/community/LeaderboardTab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import communityHeroBg from "@/assets/community-hero-bg.jpg";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import { AnswerBlock } from "@/components/AnswerBlock";
import {
  useForumPosts,
  useCommunityStats,
  FORUM_CATEGORIES,
  type ForumCategory,
  type SortMode,
} from "@/hooks/useCommunity";

const CommunityPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const tab = searchParams.get("tab") || "forum";
  const catParam = (searchParams.get("kategori") || "alla") as ForumCategory;

  const [activeCategory, setActiveCategory] = useState<ForumCategory>(catParam);
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const stats = useCommunityStats();
  const { posts, loading, total, loadMore, hasMore } = useForumPosts(activeCategory, sortMode, debouncedSearch);

  // Showcase state
  const [showcaseProjects, setShowcaseProjects] = useState<ShowcaseProjectRow[]>([]);
  const [showcaseLoading, setShowcaseLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Update URL when category changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeCategory !== "alla") params.set("kategori", activeCategory);
    else params.delete("kategori");
    if (tab !== "forum") params.set("tab", tab);
    else params.delete("tab");
    router.replace(`/community?${params.toString()}`);
  }, [activeCategory, tab]);

  // Fetch showcase projects
  useEffect(() => {
    if (tab !== "showcase") return;
    setShowcaseLoading(true);
    supabase
      .from("showcase_projects")
      .select("*, profiles:user_id(full_name, avatar_url)")
      .eq("is_published", true)
      .eq("moderation_status", "approved")
      .order("upvotes", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setShowcaseProjects((data ?? []) as unknown as ShowcaseProjectRow[]);
        setShowcaseLoading(false);
      });
  }, [tab]);

  const handleCategoryChange = (cat: ForumCategory) => {
    setActiveCategory(cat);
  };

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value !== "forum") params.set("tab", value);
    else params.delete("tab");
    router.replace(`/community?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="AI-utvecklar-community — Diskutera & Dela projekt"
        description="Gå med i Sveriges AI-community. Diskutera ML, NLP och karriär, dela projekt och lär dig av andra utvecklare."
        canonical="/community"
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16">
        <div className="absolute inset-0 z-0">
          <img src={communityHeroBg.src} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Hem</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Community</span>
          </nav>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            AI-utvecklar-community
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            Diskutera, dela projekt och lär dig tillsammans med Sveriges AI-utvecklare
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            {user ? (
              <>
                <Button className="gradient-bg text-primary-foreground hover:opacity-90" asChild>
                  <Link href="/community/nytt"><Plus className="w-4 h-4 mr-1" /> Ny diskussion</Link>
                </Button>

              </>
            ) : (
              <>
                <Button className="gradient-bg text-primary-foreground hover:opacity-90" asChild>
                  <Link href="/registrera">Gå med i communityn →</Link>
                </Button>
                <Button variant="outline" className="border-border" onClick={() => {
                  document.getElementById("forum-content")?.scrollIntoView({ behavior: "smooth" });
                }}>
                  Utforska diskussioner
                </Button>
              </>
            )}
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span><strong className="text-foreground">{stats.members.toLocaleString()}</strong> medlemmar</span>
            <span><strong className="text-foreground">{stats.posts.toLocaleString()}</strong> diskussioner</span>
            <span><strong className="text-foreground">{stats.comments.toLocaleString()}</strong> svar</span>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section id="forum-content" className="container mx-auto px-4 py-10">
        <AnswerBlock text="Sveriges community för AI-utvecklare med diskussioner om maskininlärning, NLP, MLOps och karriär. Ställ frågor, dela projekt och nätverka med andra AI-utvecklare. Öppen för alla oavsett erfarenhetsnivå." />
        <Tabs value={tab} onValueChange={handleTabChange} className="space-y-8">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="forum">Diskussioner</TabsTrigger>
            <TabsTrigger value="showcase">Showcase</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          {/* Forum tab */}
          <TabsContent value="forum">
            <div className="grid lg:grid-cols-[1fr_280px] gap-8">
              <div className="space-y-4">
                {/* Mobile category dropdown */}
                <div className="lg:hidden">
                  <Select value={activeCategory} onValueChange={(v) => handleCategoryChange(v as ForumCategory)}>
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue placeholder="Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {FORUM_CATEGORIES.map(c => (
                        <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort + Search bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div className="flex gap-1 bg-muted rounded-lg p-0.5 shrink-0">
                    {([
                      { key: "latest" as SortMode, icon: Clock, label: "Senaste" },
                      { key: "popular" as SortMode, icon: TrendingUp, label: "Populärt" },
                      { key: "unanswered" as SortMode, icon: MessageSquareOff, label: "Obesvarade" },
                      { key: "solved" as SortMode, icon: CheckCircle, label: "Löst" },
                    ]).map(s => (
                      <button
                        key={s.key}
                        onClick={() => setSortMode(s.key)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          sortMode === s.key
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <s.icon className="w-3 h-3" />
                        <span className="hidden sm:inline">{s.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Sök i diskussioner..."
                      className="pl-9 bg-card border-border h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Posts */}
                <div className="space-y-2">
                  {loading && posts.length === 0 ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-28 rounded-lg" />
                    ))
                  ) : (
                    <>
                      {posts.map(post => (
                        <ForumPostCard key={post.id} post={post} />
                      ))}
                      {posts.length === 0 && (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground mb-4">Inga diskussioner hittades.</p>
                          {user && (
                            <Button className="gradient-bg text-primary-foreground" asChild>
                              <Link href="/community/nytt">Skapa ny diskussion →</Link>
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Load more */}
                {hasMore && (
                  <div className="text-center pt-4">
                    <Button variant="outline" onClick={loadMore} disabled={loading}>
                      {loading ? "Laddar..." : `Ladda fler · Visar ${posts.length} av ${total}`}
                    </Button>
                  </div>
                )}
              </div>

              <div className="hidden lg:block">
                <CommunitySidebar activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
              </div>
            </div>
          </TabsContent>

          {/* Showcase tab */}
          <TabsContent value="showcase">
            {showcaseLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            ) : showcaseProjects.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">Inga projekt har delats ännu.</p>
                {user && (
                  <Button className="gradient-bg text-primary-foreground" asChild>
                    <Link href="/community/showcase/nytt">Dela ditt projekt →</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {showcaseProjects.map(p => (
                  <ShowcaseCard key={p.id} project={p} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Leaderboard tab */}
          <TabsContent value="leaderboard">
            <LeaderboardTab />
          </TabsContent>
        </Tabs>
      </section>

      <Footer />
    </div>
  );
};

const CommunityPageWithSuspense = () => (
  <Suspense>
    <CommunityPage />
  </Suspense>
);

export default CommunityPageWithSuspense;
