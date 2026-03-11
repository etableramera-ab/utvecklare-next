'use client';
import { useState, useEffect } from "react";
import { MessageSquare, Pin, Lock, Unlock, Trash2, Star, StarOff, Eye } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

const AdminCommunity = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [showcaseProjects, setShowcaseProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({ posts: 0, comments: 0, activeUsers: 0, showcaseCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [postsRes, commentsRes, activeRes, showcaseRes, postsListRes, showcaseListRes] = await Promise.all([
      supabase.from("forum_posts").select("id", { count: "exact", head: true }),
      supabase.from("forum_comments").select("id", { count: "exact", head: true }),
      supabase.from("forum_posts").select("user_id", { count: "exact", head: true }).gte("created_at", weekAgo),
      supabase.from("showcase_projects").select("id", { count: "exact", head: true }),
      supabase.from("forum_posts").select("*, profiles:user_id(full_name)").order("created_at", { ascending: false }).limit(30),
      supabase.from("showcase_projects").select("*, profiles:user_id(full_name)").order("created_at", { ascending: false }).limit(20),
    ]);
    setStats({
      posts: postsRes.count ?? 0,
      comments: commentsRes.count ?? 0,
      activeUsers: activeRes.count ?? 0,
      showcaseCount: showcaseRes.count ?? 0,
    });
    setPosts(postsListRes.data ?? []);
    setShowcaseProjects(showcaseListRes.data ?? []);
    setLoading(false);
  };

  const togglePin = async (id: string, current: boolean) => {
    await supabase.from("forum_posts").update({ is_pinned: !current }).eq("id", id);
    toast({ title: current ? "Avpinnad" : "Pinnad" });
    fetchData();
  };

  const toggleLock = async (id: string, current: boolean) => {
    await supabase.from("forum_posts").update({ is_locked: !current }).eq("id", id);
    toast({ title: current ? "Upplåst" : "Låst" });
    fetchData();
  };

  const deletePost = async (id: string) => {
    if (!confirm("Ta bort detta inlägg permanent?")) return;
    await supabase.from("forum_posts").delete().eq("id", id);
    toast({ title: "Inlägg borttaget" });
    fetchData();
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from("showcase_projects").update({ is_featured: !current }).eq("id", id);
    toast({ title: current ? "Avmarkerad som featured" : "Markerad som featured" });
    fetchData();
  };

  const deleteShowcase = async (id: string) => {
    if (!confirm("Ta bort detta projekt permanent?")) return;
    await supabase.from("showcase_projects").delete().eq("id", id);
    toast({ title: "Projekt borttaget" });
    fetchData();
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Community</h1>
          <p className="text-sm text-muted-foreground mt-1">Moderera forum och showcase</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Trådar", value: stats.posts },
            { label: "Kommentarer", value: stats.comments },
            { label: "Aktiva denna vecka", value: stats.activeUsers },
            { label: "Showcase-projekt", value: stats.showcaseCount },
          ].map(s => (
            <Card key={s.label} className="bg-card border-border">
              <CardContent className="p-5">
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="posts" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="posts">Forumtrådar</TabsTrigger>
            <TabsTrigger value="showcase">Showcase</TabsTrigger>
            <TabsTrigger value="reported">Rapporterade</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="rounded-xl bg-card border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Titel</th>
                      <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Författare</th>
                      <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium">Status</th>
                      <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium">Svar</th>
                      <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map(p => (
                      <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-foreground font-medium line-clamp-1">{p.title}</span>
                          <span className="text-xs text-muted-foreground block">{p.category}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.profiles?.full_name || "Anonym"}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-1 justify-center">
                            {p.is_pinned && <Badge variant="outline" className="text-[10px]">📌</Badge>}
                            {p.is_locked && <Badge variant="outline" className="text-[10px]">🔒</Badge>}
                            {p.is_solved && <Badge className="bg-green-500/10 text-green-400 text-[10px]">✅</Badge>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{p.comment_count}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-end">
                            <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => togglePin(p.id, p.is_pinned)}>
                              <Pin className={`w-3.5 h-3.5 ${p.is_pinned ? "text-primary" : "text-muted-foreground"}`} />
                            </Button>
                            <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => toggleLock(p.id, p.is_locked)}>
                              {p.is_locked ? <Unlock className="w-3.5 h-3.5 text-warning" /> : <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => deletePost(p.id)}>
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="showcase">
            <div className="rounded-xl bg-card border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Projekt</th>
                      <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Skapare</th>
                      <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium">Upvotes</th>
                      <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showcaseProjects.map(p => (
                      <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-foreground font-medium">{p.title}</span>
                          {p.is_featured && <Badge className="ml-2 text-[10px] gradient-bg text-primary-foreground">Featured</Badge>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.profiles?.full_name || "Anonym"}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{p.upvotes}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-end">
                            <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => toggleFeatured(p.id, p.is_featured)}>
                              {p.is_featured ? <StarOff className="w-3.5 h-3.5 text-warning" /> : <Star className="w-3.5 h-3.5 text-muted-foreground" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => deleteShowcase(p.id)}>
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reported">
            <div className="text-center py-16 rounded-xl bg-card border border-border">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <p className="text-muted-foreground">Inga rapporterade inlägg.</p>
              <p className="text-xs text-muted-foreground mt-1">Rapporteringsfunktion kommer snart.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminCommunity;
