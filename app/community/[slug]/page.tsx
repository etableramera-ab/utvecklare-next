'use client';
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, MessageSquare, Eye, Clock, Share2, Linkedin, Twitter, LinkIcon, Check, Pencil, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import VoteButtons from "@/components/community/VoteButtons";
import ForumCommentItem from "@/components/community/ForumCommentItem";
import ArticleRenderer from "@/components/articles/ArticleRenderer";
import { useForumPost, useForumComments, useForumVote, FORUM_CATEGORIES, type ForumPostRow } from "@/hooks/useCommunity";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import { AffiliateCard } from "@/components/AffiliateCard";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just nu";
  if (mins < 60) return `${mins}m sedan`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h sedan`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d sedan`;
  return `${Math.floor(days / 7)}v sedan`;
}

const ThreadDetailPage = () => {
  const params = useParams<{ slug: string }>();
  const { slug } = params;
  const { user } = useAuth();
  const { post, loading: postLoading, setPost } = useForumPost(slug);
  const { comments, loading: commentsLoading, refetch: refetchComments } = useForumComments(post?.id);
  const { userVote, score, setScore, vote } = useForumVote("post", post?.id);

  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentSort, setCommentSort] = useState<"oldest" | "newest" | "top">("oldest");
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [copied, setCopied] = useState(false);

  // Related posts
  const [relatedPosts, setRelatedPosts] = useState<ForumPostRow[]>([]);

  useEffect(() => {
    if (!post) return;
    setScore((post.upvotes ?? 0) - (post.downvotes ?? 0));
    setEditContent(post.content);

    // Fetch related
    supabase
      .from("forum_posts")
      .select("id, title, slug, comment_count, upvotes, last_activity_at")
      .eq("category", post.category)
      .neq("id", post.id)
      .eq("is_published", true)
      .order("last_activity_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setRelatedPosts((data ?? []) as unknown as ForumPostRow[]));
  }, [post, setScore]);

  const profile = post?.profiles;
  const displayName = profile?.full_name || "Anonym";
  const catLabel = FORUM_CATEGORIES.find(c => c.slug === post?.category)?.label ?? post?.category;

  // Sort comments
  const sortedComments = useMemo(() => {
    // Separate accepted answer, top-level, and replies
    const topLevel = comments.filter(c => !c.parent_comment_id);
    const accepted = topLevel.filter(c => c.is_accepted_answer);
    const rest = topLevel.filter(c => !c.is_accepted_answer);

    let sorted: typeof rest;
    switch (commentSort) {
      case "newest":
        sorted = [...rest].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "top":
        sorted = [...rest].sort((a, b) => (b.upvotes - (b.downvotes ?? 0)) - (a.upvotes - (a.downvotes ?? 0)));
        break;
      default:
        sorted = [...rest].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    return [...accepted, ...sorted];
  }, [comments, commentSort]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user || !post) return;
    setSubmitting(true);
    const { error } = await supabase.from("forum_comments").insert({
      post_id: post.id,
      user_id: user.id,
      content: newComment.trim(),
    });
    if (error) {
      toast({ title: "Kunde inte publicera svar", variant: "destructive" });
    } else {
      await supabase.from("forum_posts").update({
        comment_count: (post.comment_count ?? 0) + 1,
        last_activity_at: new Date().toISOString(),
      }).eq("id", post.id);
      await supabase.rpc("upsert_reputation", { p_user_id: user.id });
      toast({ title: "Svar publicerat! 💬" });
      setNewComment("");
      refetchComments();
    }
    setSubmitting(false);
  };

  const handleEditPost = async () => {
    if (!editContent.trim() || !post) return;
    await supabase.from("forum_posts").update({
      content: editContent,
      updated_at: new Date().toISOString(),
    }).eq("id", post.id);
    setPost({ ...post, content: editContent, updated_at: new Date().toISOString() });
    setEditing(false);
    toast({ title: "Inlägg uppdaterat" });
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = post?.title || "";
    switch (platform) {
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({ title: "Länk kopierad!" });
        break;
    }
  };

  if (postLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Tråden hittades inte</h1>
          <Button asChild><Link href="/community">Tillbaka till community</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isOP = user?.id === post.user_id;
  const isLocked = post.is_locked ?? false;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* SEO */}
      {post.comment_count < 1 && <meta name="robots" content="noindex" />}

      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link href="/" className="hover:text-foreground transition-colors">Hem</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/community" className="hover:text-foreground transition-colors">Community</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-muted-foreground">{catLabel}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground line-clamp-1">{post.title}</span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">{catLabel}</Badge>
                {post.is_solved && (
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">✅ Löst</Badge>
                )}
                {isLocked && (
                  <Badge variant="outline" className="text-xs"><Lock className="w-3 h-3 mr-1" /> Låst</Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{post.title}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-2">
                  <Avatar className="w-7 h-7">
                    {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
                    <AvatarFallback className="text-[10px] bg-accent">
                      {displayName.split(" ").map(n => n[0]).join("").substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{displayName}</span>
                </div>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(post.created_at)}</span>
                {post.updated_at !== post.created_at && (
                  <span className="text-xs">(redigerad {timeAgo(post.updated_at)})</span>
                )}
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views} visningar</span>
              </div>
            </div>

            {/* Vote + Share bar */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
              <VoteButtons score={score} userVote={userVote} onVote={vote} vertical={false} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm"><Share2 className="w-4 h-4 mr-1" /> Dela</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleShare("linkedin")}>
                    <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("twitter")}>
                    <Twitter className="w-4 h-4 mr-2" /> X (Twitter)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("copy")}>
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                    Kopiera länk
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Post content */}
            <div className="mb-8">
              {editing ? (
                <div className="space-y-3">
                  <Textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    className="bg-card border-border min-h-[200px] font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleEditPost}>Spara</Button>
                    <Button variant="ghost" onClick={() => setEditing(false)}>Avbryt</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ArticleRenderer content={post.content} />
                  </div>
                  {isOP && (
                    <Button variant="ghost" size="sm" className="mt-3 text-muted-foreground" onClick={() => setEditing(true)}>
                      <Pencil className="w-3 h-3 mr-1" /> Redigera
                    </Button>
                  )}
                </>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Comments section */}
            <div className="border-t border-border pt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {post.comment_count} svar
                </h2>
                <Select value={commentSort} onValueChange={v => setCommentSort(v as any)}>
                  <SelectTrigger className="w-40 bg-card border-border h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oldest">Äldst först</SelectItem>
                    <SelectItem value="newest">Nyast först</SelectItem>
                    <SelectItem value="top">Mest uppröstade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {commentsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
                </div>
              ) : (
                <div className="space-y-1">
                  {sortedComments.map(comment => (
                    <ForumCommentItem
                      key={comment.id}
                      comment={comment}
                      replies={comments.filter(c => c.parent_comment_id === comment.id)}
                      allComments={comments}
                      postUserId={post.user_id}
                      postId={post.id}
                      isLocked={isLocked}
                      onRefetch={refetchComments}
                    />
                  ))}
                </div>
              )}

              {/* New comment form */}
              <div className="mt-8 pt-6 border-t border-border">
                {isLocked ? (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Denna tråd är låst och accepterar inga nya svar.
                  </p>
                ) : user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-accent">
                          {(user.user_metadata?.full_name || "U").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">Skriv ditt svar</span>
                    </div>
                    <Textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Skriv ditt svar... (markdown stöds)"
                      className="bg-card border-border min-h-[120px] font-mono text-sm"
                    />
                    <Button
                      className="gradient-bg text-primary-foreground hover:opacity-90"
                      onClick={handleSubmitComment}
                      disabled={submitting || !newComment.trim()}
                    >
                      {submitting ? "Publicerar..." : "Svara"}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-3">Logga in för att svara</p>
                    <Button asChild>
                      <Link href={`/logga-in?redirect=/community/${slug}`}>Logga in</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-6">
            {/* Thread info */}
            <div className="rounded-lg bg-card border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Om tråden</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kategori</span>
                  <span className="text-foreground">{catLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Svar</span>
                  <span className="text-foreground">{post.comment_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visningar</span>
                  <span className="text-foreground">{post.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Skapad</span>
                  <span className="text-foreground">{timeAgo(post.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Senaste aktivitet</span>
                  <span className="text-foreground">{timeAgo(post.last_activity_at || post.updated_at)}</span>
                </div>
              </div>
            </div>

            {/* Related threads */}
            {relatedPosts.length > 0 && (
              <div className="rounded-lg bg-card border border-border p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Relaterade trådar</h3>
                <div className="space-y-3">
                  {relatedPosts.map(rp => (
                    <Link
                      key={rp.id}
                      href={`/community/${rp.slug || rp.id}`}
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <p className="line-clamp-2 font-medium">{rp.title}</p>
                      <div className="flex gap-3 text-xs mt-0.5">
                        <span>{rp.comment_count} svar</span>
                        <span>{rp.upvotes} röster</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <AffiliateCard partner="confex" />
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ThreadDetailPage;
