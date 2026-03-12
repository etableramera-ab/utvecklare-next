'use client';
import { useState, useEffect } from "react";
import { MessageSquare, Pin, Lock, Unlock, Trash2, Star, StarOff, Check, X } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

const AdminCommunity = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [showcaseProjects, setShowcaseProjects] = useState<any[]>([]);
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [pendingShowcase, setPendingShowcase] = useState<any[]>([]);
  const [stats, setStats] = useState({ posts: 0, comments: 0, activeUsers: 0, showcaseCount: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [postsRes, commentsRes, activeRes, showcaseRes, postsListRes, showcaseListRes, pendingPostsRes, pendingShowcaseRes] = await Promise.all([
      supabase.from("forum_posts").select("id", { count: "exact", head: true }),
      supabase.from("forum_comments").select("id", { count: "exact", head: true }),
      supabase.from("forum_posts").select("user_id", { count: "exact", head: true }).gte("created_at", weekAgo),
      supabase.from("showcase_projects").select("id", { count: "exact", head: true }),
      supabase.from("forum_posts").select("*, profiles:user_id(full_name)").eq("moderation_status", "approved").order("created_at", { ascending: false }).limit(30),
      supabase.from("showcase_projects").select("*, profiles:user_id(full_name)").eq("moderation_status", "approved").order("created_at", { ascending: false }).limit(20),
      supabase.from("forum_posts").select("*, profiles:user_id(full_name)").eq("moderation_status", "pending").order("created_at", { ascending: false }),
      supabase.from("showcase_projects").select("*, profiles:user_id(full_name)").eq("moderation_status", "pending").order("created_at", { ascending: false }),
    ]);
    const pendingTotal = (pendingPostsRes.data?.length ?? 0) + (pendingShowcaseRes.data?.length ?? 0);
    setStats({
      posts: postsRes.count ?? 0,
      comments: commentsRes.count ?? 0,
      activeUsers: activeRes.count ?? 0,
      showcaseCount: showcaseRes.count ?? 0,
      pendingCount: pendingTotal,
    });
    setPosts(postsListRes.data ?? []);
    setShowcaseProjects(showcaseListRes.data ?? []);
    setPendingPosts(pendingPostsRes.data ?? []);
    setPendingShowcase(pendingShowcaseRes.data ?? []);
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

  const approvePost = async (id: string) => {
    await supabase.from("forum_posts").update({ moderation_status: "approved" }).eq("id", id);
    toast({ title: "Inlägg godkänt ✅" });
    fetchData();
  };

  const rejectPost = async (id: string) => {
    await supabase.from("forum_posts").update({ moderation_status: "rejected" }).eq("id", id);
    toast({ title: "Inlägg avvisat" });
    fetchData();
  };

  const approveShowcase = async (id: string) => {
    await supabase.from("showcase_projects").update({ moderation_status: "approved" }).eq("id", id);
    toast({ title: "Projekt godkänt ✅" });
    fetchData();
  };

  const rejectShowcase = async (id: string) => {
    await supabase.from("showcase_projects").update({ moderation_status: "rejected" }).eq("id", id);
    toast({ title: "Projekt avvisat" });
    fetchData();
  };

  const pendingTotal = pendingPosts.length + pendingShowcase.length;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Community</h1>
          <p className="text-sm text-muted-foreground mt-1">Moderera forum och showcase</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Trådar", value: stats.posts },
            { label: "Kommentarer", value: stats.comments },
            { label: "Aktiva denna vecka", value: stats.activeUsers },
            { label: "Showcase-projekt", value: stats.showcaseCount },
            { label: "Väntar granskning", value: stats.pendingCount, highlight: stats.pendingCount > 0 },
          ].map(s => (
            <Card key={s.label} className={`border-border ${"highlight" in s && s.highlight ? "border-amber-500/50 bg-amber-500/5" : "bg-card"}`}>
              <CardContent className="p-5">
                <p className={`text-2xl font-bold ${"highlight" in s && s.highlight ? "text-amber-400" : "text-foreground"}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue={pendingTotal > 0 ? "pending" : "posts"} className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="pending" className="relative">
              Väntande
              {pendingTotal > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">{pendingTotal}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="posts">Forumtrådar</TabsTrigger>
            <TabsTrigger value="showcase">Showcase</TabsTrigger>
          </TabsList>

          {/* Pending moderation tab */}
          <TabsContent value="pending">
            <div className="space-y-6">
              {pendingTotal === 0 ? (
                <div className="text-center py-16 rounded-xl bg-card border border-border">
                  <Check className="w-12 h-12 text-emerald-400 mx-auto mb-4 opacity-60" />
                  <p className="text-foreground font-medium">Inga väntande inlägg</p>
                  <p className="text-xs text-muted-foreground mt-1">Alla inlägg är granskade.</p>
                </div>
              ) : (
                <>
                  {pendingPosts.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3">Foruminlägg ({pendingPosts.length})</h3>
                      <div className="rounded-xl bg-card border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Titel</th>
                                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Författare</th>
                                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Kategori</th>
                                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Datum</th>
                                <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Åtgärder</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pendingPosts.map(p => (
                                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                                  <td className="px-4 py-3">
                                    <span className="text-foreground font-medium line-clamp-1">{p.title}</span>
                                    <span className="text-xs text-muted-foreground block line-clamp-2 mt-0.5 max-w-xs">{p.content?.substring(0, 100)}…</span>
                                  </td>
                                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.profiles?.full_name || "Anonym"}</td>
                                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.category}</td>
                                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{new Date(p.created_at).toLocaleDateString("sv-SE")}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex gap-1 justify-end">
                                      <Button size="sm" variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 h-7 px-2 text-xs" onClick={() => approvePost(p.id)}>
                                        <Check className="w-3 h-3 mr-1" /> Godkänn
                                      </Button>
                                      <Button size="sm" variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10 h-7 px-2 text-xs" onClick={() => rejectPost(p.id)}>
                                        <X className="w-3 h-3 mr-1" /> Avvisa
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {pendingShowcase.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3">Showcase-projekt ({pendingShowcase.length})</h3>
                      <div className="rounded-xl bg-card border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Projekt</th>
                                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Skapare</th>
                                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Datum</th>
                                <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Åtgärder</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pendingShowcase.map(p => (
                                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                                  <td className="px-4 py-3">
                                    <span className="text-foreground font-medium">{p.title}</span>
                                    <span className="text-xs text-muted-foreground block mt-0.5 line-clamp-1 max-w-xs">{p.description}</span>
                                  </td>
                                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.profiles?.full_name || "Anonym"}</td>
                                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{new Date(p.created_at).toLocaleDateString("sv-SE")}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex gap-1 justify-end">
                                      <Button size="sm" variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 h-7 px-2 text-xs" onClick={() => approveShowcase(p.id)}>
                                        <Check className="w-3 h-3 mr-1" /> Godkänn
                                      </Button>
                                      <Button size="sm" variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10 h-7 px-2 text-xs" onClick={() => rejectShowcase(p.id)}>
                                        <X className="w-3 h-3 mr-1" /> Avvisa
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          {/* Approved forum posts */}
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

          {/* Approved showcase */}
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
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminCommunity;
