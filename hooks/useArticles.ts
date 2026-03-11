'use client'
import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string;
  tags: string[] | null;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  author_name: string | null;
  author_slug: string | null;
  author_avatar_url: string | null;
  author_bio: string | null;
  author_linkedin_url: string | null;
  author_github_url: string | null;
  reading_time_minutes: number | null;
  is_featured: boolean;
  is_published: boolean;
  published_at: string | null;
  updated_at: string | null;
  views_count: number;
  likes_count: number;
  meta_title: string | null;
  meta_description: string | null;
}

const CATEGORY_MAP: Record<string, string> = {
  "alla": "Alla",
  "maskininlarning": "Maskininlärning",
  "nlp-llm": "NLP & LLM",
  "datorseende": "Datorseende",
  "mlops": "MLOps & Infrastruktur",
  "karriar-lon": "Karriär & Lön",
  "ai-nyheter": "AI-nyheter",
  "nyborjarguider": "Nybörjarguider",
};

const SLUG_TO_CATEGORY: Record<string, string> = {
  "maskininlarning": "Maskininlärning",
  "nlp-llm": "NLP & LLM",
  "datorseende": "Datorseende",
  "mlops": "MLOps & Infrastruktur",
  "karriar-lon": "Karriär & Lön",
  "ai-nyheter": "AI-nyheter",
  "nyborjarguider": "Nybörjarguider",
};

export const ARTICLE_CATEGORIES = Object.entries(CATEGORY_MAP).map(([slug, label]) => ({ slug, label }));

export function getCategoryLabel(slug: string) {
  return CATEGORY_MAP[slug] || slug;
}

export function getCategorySlug(category: string) {
  return Object.entries(SLUG_TO_CATEGORY).find(([, v]) => v === category)?.[0] || "alla";
}

export function useArticles(categorySlug: string, search: string, selectedTags: string[]) {
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    let query = supabase
      .from("articles")
      .select("*", { count: "exact" })
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (categorySlug && categorySlug !== "alla") {
      const categoryName = SLUG_TO_CATEGORY[categorySlug];
      if (categoryName) query = query.eq("category", categoryName);
    }

    query.then(({ data, count }) => {
      setArticles((data as ArticleRow[]) || []);
      setTotalCount(count || 0);
      setLoading(false);
    });
  }, [categorySlug]);

  const filtered = useMemo(() => {
    let result = articles;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.excerpt || "").toLowerCase().includes(q) ||
        (a.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    if (selectedTags.length) {
      result = result.filter(a => (a.tags || []).some(t => selectedTags.includes(t)));
    }
    return result;
  }, [articles, search, selectedTags]);

  const featured = filtered.find(a => a.is_featured);
  const gridArticles = filtered.filter(a => a !== featured);

  return { articles: filtered, featured, gridArticles, loading, totalCount };
}

export function usePopularArticles() {
  const [articles, setArticles] = useState<ArticleRow[]>([]);

  useEffect(() => {
    supabase
      .from("articles")
      .select("id, title, slug, category, views_count, reading_time_minutes, hero_image_url, author_slug")
      .eq("is_published", true)
      .order("views_count", { ascending: false })
      .limit(5)
      .then(({ data }) => setArticles((data as ArticleRow[]) || []));
  }, []);

  return articles;
}

export function useAllTags() {
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from("articles")
      .select("tags")
      .eq("is_published", true)
      .then(({ data }) => {
        const tagSet = new Set<string>();
        (data || []).forEach(a => (a.tags || []).forEach((t: string) => tagSet.add(t)));
        setTags(Array.from(tagSet).sort());
      });
  }, []);

  return tags;
}

export function useArticleDetail(slug: string | undefined) {
  const [article, setArticle] = useState<ArticleRow | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle()
      .then(({ data }) => {
        setArticle(data as ArticleRow | null);
        setLoading(false);
        // Track view
        if (data) {
          const key = `article_viewed_${data.id}`;
          if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, "1");
            supabase.rpc("increment_article_views" as any, { article_id: data.id }).then(() => {});
          }
          // Track reading history
          if (user) {
            supabase
              .from("reading_history")
              .upsert({ user_id: user.id, article_id: data.id, read_at: new Date().toISOString(), scroll_percentage: 0 }, { onConflict: "user_id,article_id" })
              .then(() => {});
          }
        }
      });
  }, [slug, user]);

  return { article, loading };
}

export function useArticleLike(articleId: string | undefined) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!articleId) return;
    if (user) {
      supabase
        .from("article_likes")
        .select("id")
        .eq("article_id", articleId)
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => setLiked(!!data));
    }
  }, [articleId, user]);

  const toggle = useCallback(async () => {
    if (!user || !articleId) return;
    setLoading(true);
    if (liked) {
      setLiked(false);
      setCount(c => c - 1);
      await supabase.from("article_likes").delete().eq("article_id", articleId).eq("user_id", user.id);
    } else {
      setLiked(true);
      setCount(c => c + 1);
      await supabase.from("article_likes").insert({ article_id: articleId, user_id: user.id });
    }
    setLoading(false);
  }, [liked, user, articleId]);

  return { liked, count, toggle, setCount, loading };
}

export function useBookmark(articleId: string | undefined) {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (!user || !articleId) return;
    supabase
      .from("bookmarks")
      .select("id")
      .eq("article_id", articleId)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setBookmarked(!!data));
  }, [articleId, user]);

  const toggle = useCallback(async () => {
    if (!user || !articleId) return;
    if (bookmarked) {
      setBookmarked(false);
      await supabase.from("bookmarks").delete().eq("article_id", articleId).eq("user_id", user.id);
    } else {
      setBookmarked(true);
      await supabase.from("bookmarks").insert({ article_id: articleId, user_id: user.id });
    }
  }, [bookmarked, user, articleId]);

  return { bookmarked, toggle };
}

export function useComments(articleId: string | undefined) {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!articleId) return;
    const { data } = await supabase
      .from("comments")
      .select("*, profiles:user_id(full_name, avatar_url)")
      .eq("article_id", articleId)
      .order("created_at", { ascending: true });
    setComments(data || []);
    setLoading(false);
  }, [articleId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const addComment = async (content: string, parentId?: string) => {
    if (!user || !articleId) return;
    const insert: any = { article_id: articleId, user_id: user.id, content };
    if (parentId) insert.parent_comment_id = parentId;
    await supabase.from("comments").insert(insert);
    fetchComments();
  };

  const editComment = async (commentId: string, content: string) => {
    await supabase.from("comments").update({ content, is_edited: true }).eq("id", commentId);
    fetchComments();
  };

  const deleteComment = async (commentId: string) => {
    await supabase.from("comments").delete().eq("id", commentId);
    fetchComments();
  };

  return { comments, loading, addComment, editComment, deleteComment, user };
}

export async function subscribeNewsletter(email: string, source: string = "website") {
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email, source });
  if (error && error.code === "23505") return "already_subscribed";
  if (error) return "error";
  return "success";
}
