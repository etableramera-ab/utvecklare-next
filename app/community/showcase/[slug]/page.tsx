'use client';
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Github, ExternalLink, ArrowBigUp, MessageSquare, Eye, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import ArticleRenderer from "@/components/articles/ArticleRenderer";

interface ShowcaseProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description: string | null;
  thumbnail_url: string | null;
  screenshot_urls: string[] | null;
  demo_url: string | null;
  github_url: string | null;
  tech_stack: string[] | null;
  category: string | null;
  upvotes: number;
  comment_count: number;
  views: number;
  is_featured: boolean;
  created_at: string;
  user_id: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
}

interface ShowcaseComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
}

const ShowcaseDetailPage = () => {
  const params = useParams<{ slug: string }>();
  const { slug } = params;
  const { user } = useAuth();
  const [project, setProject] = useState<ShowcaseProject | null>(null);
  const [comments, setComments] = useState<ShowcaseComment[]>([]);
  const [related, setRelated] = useState<ShowcaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(0);

  useEffect(() => {
    if (!slug) return;
    fetchProject();
  }, [slug]);

  const fetchProject = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("showcase_projects")
      .select("*, profiles:user_id(full_name, avatar_url)")
      .eq("slug", slug!)
      .single();
    if (data) {
      const p = data as unknown as ShowcaseProject;
      setProject(p);
      setVoteCount(p.upvotes ?? 0);
      fetchComments(p.id);
      fetchRelated(p.category, p.id);
      checkVote(p.id);
    }
    setLoading(false);
  };

  const fetchComments = async (projectId: string) => {
    const { data } = await supabase
      .from("showcase_comments")
      .select("*, profiles:user_id(full_name, avatar_url)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    setComments((data ?? []) as unknown as ShowcaseComment[]);
  };

  const fetchRelated = async (category: string | null, excludeId: string) => {
    let query = supabase
      .from("showcase_projects")
      .select("*, profiles:user_id(full_name, avatar_url)")
      .eq("is_published", true)
      .neq("id", excludeId)
      .order("upvotes", { ascending: false })
      .limit(3);
    if (category) query = query.eq("category", category);
    const { data } = await query;
    setRelated((data ?? []) as unknown as ShowcaseProject[]);
  };

  const checkVote = async (projectId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from("showcase_votes")
      .select("id")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .maybeSingle();
    setHasVoted(!!data);
  };

  const handleVote = async () => {
    if (!user || !project) {
      toast({ title: "Logga in för att rösta", variant: "destructive" });
      return;
    }
    if (hasVoted) {
      await supabase.from("showcase_votes").delete().eq("user_id", user.id).eq("project_id", project.id);
      setHasVoted(false);
      setVoteCount(v => v - 1);
      await supabase.from("showcase_projects").update({ upvotes: Math.max(0, voteCount - 1) }).eq("id", project.id);
    } else {
      await supabase.from("showcase_votes").insert({ user_id: user.id, project_id: project.id });
      setHasVoted(true);
      setVoteCount(v => v + 1);
      await supabase.from("showcase_projects").update({ upvotes: voteCount + 1 }).eq("id", project.id);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !user || !project) return;
    setSubmitting(true);
    const { error } = await supabase.from("showcase_comments").insert({
      project_id: project.id,
      user_id: user.id,
      content: commentText,
    });
    if (error) {
      toast({ title: "Kunde inte kommentera", variant: "destructive" });
    } else {
      toast({ title: "Kommentar publicerad!" });
      setCommentText("");
      await supabase.from("showcase_projects").update({
        comment_count: (project.comment_count ?? 0) + 1,
      }).eq("id", project.id);
      fetchComments(project.id);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
          <Skeleton className="h-8 w-2/3 mb-4" />
          <Skeleton className="h-64 rounded-lg mb-6" />
          <Skeleton className="h-40" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12 text-center">
          <p className="text-muted-foreground">Projektet hittades inte.</p>
          <Button className="mt-4" asChild><Link href="/community?tab=showcase">Tillbaka</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const authorName = project.profiles?.full_name || "Anonym";
  const initials = authorName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-16">
        <div className="container mx-auto px-4 py-12">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/community" className="hover:text-foreground transition-colors">Community</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/community?tab=showcase" className="hover:text-foreground transition-colors">Showcase</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground truncate">{project.title}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            <div className="space-y-6">
              {/* Hero image */}
              {project.thumbnail_url && (
                <div className="aspect-video rounded-lg overflow-hidden border border-border">
                  <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Title & meta */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{project.title}</h1>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-8 h-8">
                    {project.profiles?.avatar_url && <AvatarImage src={project.profiles.avatar_url} />}
                    <AvatarFallback className="text-xs bg-accent">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-foreground">{authorName}</span>
                  {project.category && (
                    <Badge variant="outline" className="text-xs">{project.category}</Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-invert prose-sm max-w-none">
                {project.long_description ? (
                  <ArticleRenderer content={project.long_description} />
                ) : (
                  <p className="text-muted-foreground">{project.description}</p>
                )}
              </div>

              {/* Screenshots gallery */}
              {project.screenshot_urls && project.screenshot_urls.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground text-sm">Screenshots</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {project.screenshot_urls.map((url, i) => (
                      <div key={i} className="aspect-video rounded-lg overflow-hidden border border-border">
                        <img src={url} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tech stack */}
              {project.tech_stack && project.tech_stack.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-2">Tech stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack.map(t => (
                      <Badge key={t} variant="secondary">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={hasVoted ? "default" : "outline"}
                  className={hasVoted ? "gradient-bg text-primary-foreground" : "border-border"}
                  onClick={handleVote}
                >
                  <ArrowBigUp className="w-4 h-4 mr-1" />
                  {voteCount} Upvotes
                </Button>
                {project.demo_url && (
                  <Button variant="outline" className="border-border" asChild>
                    <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-1" /> Live Demo
                    </a>
                  </Button>
                )}
                {project.github_url && (
                  <Button variant="outline" className="border-border" asChild>
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4 mr-1" /> GitHub
                    </a>
                  </Button>
                )}
              </div>

              {/* Comments */}
              <div className="space-y-4 pt-6 border-t border-border">
                <h3 className="font-semibold text-foreground">{comments.length} kommentarer</h3>
                {comments.map(c => {
                  const cName = c.profiles?.full_name || "Anonym";
                  return (
                    <div key={c.id} className="flex gap-3 p-4 rounded-lg bg-card border border-border">
                      <Avatar className="w-7 h-7">
                        {c.profiles?.avatar_url && <AvatarImage src={c.profiles.avatar_url} />}
                        <AvatarFallback className="text-[10px] bg-accent">
                          {cName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">{cName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(c.created_at).toLocaleDateString("sv-SE")}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/90">{c.content}</p>
                      </div>
                    </div>
                  );
                })}

                {user ? (
                  <div className="space-y-2">
                    <Textarea
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Skriv en kommentar..."
                      className="bg-card border-border min-h-[80px]"
                    />
                    <Button onClick={handleComment} disabled={submitting || !commentText.trim()} className="gradient-bg text-primary-foreground">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kommentera"}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Button variant="outline" asChild><Link href="/logga-in">Logga in för att kommentera</Link></Button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="rounded-lg bg-card border border-border p-5">
                <h3 className="font-semibold text-foreground text-sm mb-3">Info</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between"><span>Upvotes</span><span className="text-foreground font-medium">{voteCount}</span></div>
                  <div className="flex justify-between"><span>Kommentarer</span><span className="text-foreground font-medium">{project.comment_count}</span></div>
                  <div className="flex justify-between"><span>Visningar</span><span className="text-foreground font-medium">{project.views}</span></div>
                  <div className="flex justify-between"><span>Publicerad</span><span className="text-foreground font-medium">{new Date(project.created_at).toLocaleDateString("sv-SE")}</span></div>
                </div>
              </div>

              {related.length > 0 && (
                <div className="rounded-lg bg-card border border-border p-5">
                  <h3 className="font-semibold text-foreground text-sm mb-3">Relaterade projekt</h3>
                  <div className="space-y-3">
                    {related.map(r => (
                      <Link key={r.id} href={`/community/showcase/${r.slug}`} className="block group">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{r.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{r.description}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <Link href="/foretag" className="block p-4 rounded-lg border border-dashed border-border hover:border-primary/50 transition-colors text-center group">
                  <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">Din annons här</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">Annonsera på utvecklare.ai →</p>
                </Link>
            </aside>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ShowcaseDetailPage;
