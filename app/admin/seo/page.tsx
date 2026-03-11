'use client';
import { useState, useEffect } from "react";
import { Search, FileText, Image, Clock, CheckCircle, AlertTriangle, Copy, Download } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SEOStats {
  totalPages: number;
  articlesMissingMeta: number;
  eventsMissingHero: number;
  jobsExpiringSoon: number;
  toolsMissingDesc: number;
}

const seoChecklist = [
  { label: "robots.txt finns", status: true },
  { label: "sitemap.xml finns", status: true },
  { label: "SEOHead-komponent implementerad", status: true },
  { label: "JSON-LD på jobbannonser", status: true },
  { label: "JSON-LD på artiklar", status: true },
  { label: "JSON-LD på events", status: true },
  { label: "Breadcrumbs implementerade", status: true },
];

const STATIC_URLS = [
  { loc: "https://utvecklare.ai/", changefreq: "daily", priority: "1.0" },
  { loc: "https://utvecklare.ai/jobb", changefreq: "daily", priority: "0.9" },
  { loc: "https://utvecklare.ai/kunskapshubb", changefreq: "weekly", priority: "0.9" },
  { loc: "https://utvecklare.ai/verktyg", changefreq: "weekly", priority: "0.9" },
  { loc: "https://utvecklare.ai/community", changefreq: "daily", priority: "0.8" },
  { loc: "https://utvecklare.ai/events", changefreq: "daily", priority: "0.8" },
  { loc: "https://utvecklare.ai/lonestatistik", changefreq: "monthly", priority: "0.9" },
  { loc: "https://utvecklare.ai/om-oss", changefreq: "monthly", priority: "0.5" },
  { loc: "https://utvecklare.ai/kontakt", changefreq: "yearly", priority: "0.4" },
  { loc: "https://utvecklare.ai/integritetspolicy", changefreq: "yearly", priority: "0.3" },
  { loc: "https://utvecklare.ai/villkor", changefreq: "yearly", priority: "0.3" },
  { loc: "https://utvecklare.ai/cookies", changefreq: "yearly", priority: "0.2" },
];

const AdminSEO = () => {
  const [stats, setStats] = useState<SEOStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sitemapXml, setSitemapXml] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [
      { count: jobsCount },
      { count: articlesCount },
      { count: toolsCount },
      { count: eventsCount },
      { count: postsCount },
      { count: articlesMissingMeta },
      { count: eventsMissingHero },
      { count: toolsMissingDesc },
    ] = await Promise.all([
      supabase.from("jobs").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("articles").select("id", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("tools").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("forum_posts").select("id", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("articles").select("id", { count: "exact", head: true }).eq("is_published", true).is("meta_description", null),
      supabase.from("events").select("id", { count: "exact", head: true }).eq("is_published", true).is("hero_image_url", null),
      supabase.from("tools").select("id", { count: "exact", head: true }).is("description", null),
    ]);

    const staticPages = 13;
    setStats({
      totalPages: (jobsCount ?? 0) + (articlesCount ?? 0) + (toolsCount ?? 0) + (eventsCount ?? 0) + (postsCount ?? 0) + staticPages,
      articlesMissingMeta: articlesMissingMeta ?? 0,
      eventsMissingHero: eventsMissingHero ?? 0,
      jobsExpiringSoon: 0,
      toolsMissingDesc: toolsMissingDesc ?? 0,
    });
    setLoading(false);
  };

  const generateSitemap = async () => {
    setGenerating(true);

    const [
      { data: jobs },
      { data: articles },
      { data: events },
      { data: posts },
    ] = await Promise.all([
      supabase.from("jobs").select("slug").eq("is_active", true),
      supabase.from("articles").select("slug, category").eq("is_published", true),
      supabase.from("events").select("slug").eq("is_published", true),
      supabase.from("forum_posts").select("slug").eq("is_published", true).gt("comment_count", 0),
    ]);

    const urls = [...STATIC_URLS];

    (jobs ?? []).forEach(j => {
      urls.push({ loc: `https://utvecklare.ai/jobb/${j.slug}`, changefreq: "weekly", priority: "0.7" });
    });
    (articles ?? []).forEach(a => {
      urls.push({ loc: `https://utvecklare.ai/kunskapshubb/${a.category}/${a.slug}`, changefreq: "monthly", priority: "0.7" });
    });
    (events ?? []).forEach(e => {
      urls.push({ loc: `https://utvecklare.ai/events/${e.slug}`, changefreq: "weekly", priority: "0.6" });
    });
    (posts ?? []).forEach(p => {
      if (p.slug) urls.push({ loc: `https://utvecklare.ai/community/${p.slug}`, changefreq: "weekly", priority: "0.5" });
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`)
      .join("\n")}\n</urlset>`;

    setSitemapXml(xml);
    setGenerating(false);
    toast({ title: `Sitemap genererad med ${urls.length} URLs` });
  };

  const copySitemap = () => {
    navigator.clipboard.writeText(sitemapXml);
    toast({ title: "Sitemap kopierad!" });
  };

  const statCards = stats ? [
    { label: "Indexerbara sidor", value: stats.totalPages, icon: FileText, color: "text-primary" },
    { label: "Artiklar utan meta", value: stats.articlesMissingMeta, icon: AlertTriangle, color: stats.articlesMissingMeta > 0 ? "text-amber-400" : "text-green-400" },
    { label: "Events utan hero-bild", value: stats.eventsMissingHero, icon: Image, color: stats.eventsMissingHero > 0 ? "text-amber-400" : "text-green-400" },
    { label: "Verktyg utan beskrivning", value: stats.toolsMissingDesc, icon: Search, color: stats.toolsMissingDesc > 0 ? "text-amber-400" : "text-green-400" },
  ] : [];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SEO Dashboard</h1>
          <p className="text-muted-foreground mt-1">Övervaka och optimera sökmotoroptimering</p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="bg-card border-border animate-pulse"><CardContent className="p-5 h-20" /></Card>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(s => (
              <Card key={s.label} className="bg-card border-border">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">SEO-checklista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {seoChecklist.map(item => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-foreground">{item.label}</span>
                </div>
              ))}
              {stats && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    {stats.articlesMissingMeta === 0 ? (
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span className="text-foreground">
                      Alla artiklar har meta_description
                      {stats.articlesMissingMeta > 0 && (
                        <Badge variant="outline" className="ml-2 text-[10px]">{stats.articlesMissingMeta} saknar</Badge>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {stats.toolsMissingDesc === 0 ? (
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span className="text-foreground">
                      Alla verktyg har description
                      {stats.toolsMissingDesc > 0 && (
                        <Badge variant="outline" className="ml-2 text-[10px]">{stats.toolsMissingDesc} saknar</Badge>
                      )}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Sitemap-generator</CardTitle>
            <Button onClick={generateSitemap} disabled={generating} className="gradient-bg text-primary-foreground">
              {generating ? "Genererar..." : "Generera sitemap"}
            </Button>
          </CardHeader>
          <CardContent>
            {sitemapXml ? (
              <div className="space-y-3">
                <Textarea
                  value={sitemapXml}
                  readOnly
                  className="bg-background border-border font-mono text-xs min-h-[300px]"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copySitemap}>
                    <Copy className="w-4 h-4 mr-1" /> Kopiera
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Klistra in detta i <code className="text-primary">/public/sitemap.xml</code>
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Klicka "Generera sitemap" för att skapa en uppdaterad sitemap med alla dynamiska URLs.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSEO;
