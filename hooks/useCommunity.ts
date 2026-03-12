'use client'
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

// ---------- Types ----------

export interface ForumPostRow {
  id: string;
  title: string;
  slug: string | null;
  content: string;
  category: string;
  tags: string[] | null;
  user_id: string;
  is_pinned: boolean;
  is_locked: boolean | null;
  is_solved: boolean | null;
  solved_comment_id: string | null;
  upvotes: number;
  downvotes: number | null;
  comment_count: number;
  views: number;
  last_activity_at: string | null;
  is_published: boolean | null;
  created_at: string;
  updated_at: string;
  // joined
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
  reputation?: { rank: string } | null;
}

export interface ForumCommentRow {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  upvotes: number;
  downvotes: number | null;
  is_accepted_answer: boolean | null;
  is_edited: boolean | null;
  created_at: string;
  updated_at: string | null;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
  reputation?: { rank: string } | null;
}

export type SortMode = "latest" | "popular" | "unanswered" | "solved";

// ---------- Categories ----------

export const FORUM_CATEGORIES = [
  { label: "🔥 Alla", slug: "alla", emoji: "🔥" },
  { label: "💬 Allmänt", slug: "allmant", emoji: "💬" },
  { label: "🧠 Maskininlärning", slug: "maskininlarning", emoji: "🧠" },
  { label: "🗣️ NLP & LLM", slug: "llm-nlp", emoji: "🗣️" },
  { label: "👁️ Datorseende", slug: "datorseende", emoji: "👁️" },
  { label: "⚙️ MLOps & Infrastruktur", slug: "mlops", emoji: "⚙️" },
  { label: "💼 Karriär & Jobb", slug: "karriar-jobb", emoji: "💼" },
  { label: "❓ Frågor & Svar", slug: "fragor-svar", emoji: "❓" },
  { label: "📢 Nyheter & Trender", slug: "nyheter-trender", emoji: "📢" },
] as const;

export type ForumCategory = typeof FORUM_CATEGORIES[number]["slug"];

// ---------- Slug helper ----------

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/å/g, "a").replace(/ä/g, "a").replace(/ö/g, "o")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .substring(0, 60)
    + "-" + Math.random().toString(36).substring(2, 6);
}

// ---------- Hook: Forum Posts List ----------

export function useForumPosts(category: ForumCategory, sort: SortMode, search: string) {
  const [posts, setPosts] = useState<ForumPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const fetchPosts = useCallback(async (pageNum: number, append = false) => {
    setLoading(true);
    let query = supabase
      .from("forum_posts")
      .select("*, profiles:user_id(full_name, avatar_url)", { count: "exact" })
      .eq("is_published", true)
      .eq("moderation_status", "approved");

    if (category !== "alla") query = query.eq("category", category);

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    switch (sort) {
      case "popular":
        query = query.order("upvotes", { ascending: false });
        break;
      case "unanswered":
        query = query.eq("comment_count", 0).order("created_at", { ascending: false });
        break;
      case "solved":
        query = query.eq("is_solved", true).order("last_activity_at", { ascending: false });
        break;
      default:
        query = query.order("is_pinned", { ascending: false }).order("last_activity_at", { ascending: false });
    }

    query = query.range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    const { data, count, error } = await query;
    if (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as unknown as ForumPostRow[];
    setPosts(prev => append ? [...prev, ...rows] : rows);
    setTotal(count ?? 0);
    setPage(pageNum);
    setLoading(false);
  }, [category, sort, search]);

  useEffect(() => {
    fetchPosts(0);
  }, [fetchPosts]);

  const loadMore = () => fetchPosts(page + 1, true);

  return { posts, loading, total, loadMore, hasMore: posts.length < total, refetch: () => fetchPosts(0) };
}

// ---------- Hook: Single Post ----------

export function useForumPost(slug: string | undefined) {
  const [post, setPost] = useState<ForumPostRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabase
      .from("forum_posts")
      .select("*, profiles:user_id(full_name, avatar_url)")
      .eq("slug", slug)
      .single()
      .then(({ data, error }) => {
        if (error) console.error(error);
        setPost(data as unknown as ForumPostRow | null);
        setLoading(false);
      });
  }, [slug]);

  // Increment views
  useEffect(() => {
    if (!post) return;
    const key = `forum_viewed_${post.id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    supabase.rpc("increment_forum_post_views", { p_post_id: post.id });
  }, [post]);

  return { post, loading, setPost };
}

// ---------- Hook: Comments ----------

export function useForumComments(postId: string | undefined) {
  const [comments, setComments] = useState<ForumCommentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("forum_comments")
      .select("*, profiles:user_id(full_name, avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) console.error(error);
    setComments((data ?? []) as unknown as ForumCommentRow[]);
    setLoading(false);
  }, [postId]);

  useEffect(() => { fetch(); }, [fetch]);

  // Realtime
  useEffect(() => {
    if (!postId) return;
    const channel = supabase
      .channel(`forum-comments-${postId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "forum_comments", filter: `post_id=eq.${postId}` }, () => {
        fetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [postId, fetch]);

  return { comments, loading, refetch: fetch };
}

// ---------- Hook: Voting ----------

export function useForumVote(type: "post" | "comment", targetId: string | undefined) {
  const { user } = useAuth();
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!user || !targetId) return;
    const col = type === "post" ? "post_id" : "comment_id";
    supabase
      .from("forum_votes")
      .select("vote_type")
      .eq("user_id", user.id)
      .eq(col, targetId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setUserVote(data.vote_type as "up" | "down");
      });
  }, [user, targetId, type]);

  const vote = async (direction: "up" | "down") => {
    if (!user) {
      toast({ title: "Logga in för att rösta", variant: "destructive" });
      return;
    }
    if (!targetId) return;

    const col = type === "post" ? "post_id" : "comment_id";
    const otherCol = type === "post" ? "comment_id" : "post_id";

    if (userVote === direction) {
      // Remove vote
      await supabase.from("forum_votes").delete().eq("user_id", user.id).eq(col, targetId);
      setUserVote(null);
      setScore(prev => direction === "up" ? prev - 1 : prev + 1);
      // Update counter
      if (type === "post") {
        await supabase.from("forum_posts").update({
          [direction === "up" ? "upvotes" : "downvotes"]: Math.max(0, score + (direction === "up" ? -1 : 0))
        }).eq("id", targetId);
      }
    } else {
      // Upsert vote
      if (userVote) {
        await supabase.from("forum_votes").update({ vote_type: direction }).eq("user_id", user.id).eq(col, targetId);
        setScore(prev => direction === "up" ? prev + 2 : prev - 2);
      } else {
        await supabase.from("forum_votes").insert({
          user_id: user.id,
          [col]: targetId,
          [otherCol]: null,
          vote_type: direction,
        } as any);
        setScore(prev => direction === "up" ? prev + 1 : prev - 1);
      }
      setUserVote(direction);
    }
  };

  return { userVote, score, setScore, vote };
}

// ---------- Hook: Community Stats ----------

export function useCommunityStats() {
  const [stats, setStats] = useState({ members: 0, posts: 0, comments: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("forum_posts").select("id", { count: "exact", head: true }),
      supabase.from("forum_comments").select("id", { count: "exact", head: true }),
    ]).then(([profiles, posts, comments]) => {
      setStats({
        members: profiles.count ?? 0,
        posts: posts.count ?? 0,
        comments: comments.count ?? 0,
      });
    });
  }, []);

  return stats;
}

// ---------- Hook: Leaderboard ----------

export function useLeaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("user_reputation")
      .select("*, profiles:user_id(full_name, avatar_url)")
      .order("total_points", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setLeaders(data ?? []);
        setLoading(false);
      });
  }, []);

  return { leaders, loading };
}
