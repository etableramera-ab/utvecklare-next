'use client'
import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export interface ToolRow {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  long_description: string | null;
  logo_url: string | null;
  screenshot_urls: string[] | null;
  website_url: string | null;
  category: string;
  subcategory: string | null;
  tags: string[] | null;
  pricing_model: string | null;
  pricing_details: string | null;
  pricing_from: string | null;
  platforms: string[] | null;
  languages: string[] | null;
  founded_year: number | null;
  company_name: string | null;
  company_hq: string | null;
  avg_rating: number;
  review_count: number;
  views_count: number | null;
  affiliate_url: string | null;
  affiliate_link_id: string | null;
  is_featured: boolean;
  is_editors_choice: boolean | null;
  is_published: boolean | null;
  pros: string[] | null;
  cons: string[] | null;
  best_for: string | null;
  alternatives: string[] | null;
}

export const TOOL_CATEGORIES = [
  { label: "Alla", slug: "alla" },
  { label: "LLM & Generativ AI", slug: "llm-generativ-ai" },
  { label: "ML-ramverk", slug: "ml-ramverk" },
  { label: "MLOps & Deployment", slug: "mlops-deployment" },
  { label: "Data & Pipelines", slug: "data-pipelines" },
  { label: "Vektordatabaser", slug: "vektordatabaser" },
  { label: "Molntjänster", slug: "molntjanster" },
  { label: "Utvecklarverktyg", slug: "utvecklarverktyg" },
  { label: "Utbildningsplattformar", slug: "utbildningsplattformar" },
];

// Map category slugs to DB category names
const SLUG_TO_CATEGORY: Record<string, string> = {
  "llm-generativ-ai": "LLM & Generativ AI",
  "ml-ramverk": "ML-ramverk",
  "mlops-deployment": "MLOps & Deployment",
  "data-pipelines": "Data & Pipelines",
  "vektordatabaser": "Vektordatabaser",
  "molntjanster": "Molntjänster",
  "utvecklarverktyg": "Utvecklarverktyg",
  "utbildningsplattformar": "Utbildningsplattformar",
};

export type SortOption = "popular" | "rating" | "newest" | "alpha";
export type PricingFilter = "free" | "freemium" | "open-source" | "paid" | "enterprise";

export const useTools = (categorySlug?: string) => {
  const [tools, setTools] = useState<ToolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [pricingFilters, setPricingFilters] = useState<PricingFilter[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [visibleCount, setVisibleCount] = useState(16);

  const activeCategory = categorySlug || "alla";
  const dbCategory = SLUG_TO_CATEGORY[activeCategory];

  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true);
      let query = supabase
        .from("tools")
        .select("*")
        .eq("is_published", true);

      if (dbCategory) {
        query = query.eq("category", dbCategory);
      }

      const { data, error } = await query;
      if (!error && data) {
        setTools(data as unknown as ToolRow[]);
      }
      setLoading(false);
    };
    fetchTools();
  }, [dbCategory]);

  const categoryLabel = TOOL_CATEGORIES.find(c => c.slug === activeCategory)?.label || "Alla";

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { alla: tools.length };
    // We only have filtered tools if a category is active, so count from all tools for "alla"
    // For category-specific counts, we'd need all tools. Just show total for now.
    return counts;
  }, [tools]);

  const filteredTools = useMemo(() => {
    let result = [...tools];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q)) ||
        (t.tagline?.toLowerCase().includes(q)) ||
        (t.tags?.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    // Pricing filter
    if (pricingFilters.length > 0) {
      result = result.filter(t => t.pricing_model && pricingFilters.includes(t.pricing_model as PricingFilter));
    }

    // Min rating
    if (minRating > 0) {
      result = result.filter(t => t.avg_rating >= minRating);
    }

    // Sort
    result.sort((a, b) => {
      // Featured/editors choice always first
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      if (a.is_editors_choice !== b.is_editors_choice) return a.is_editors_choice ? -1 : 1;

      switch (sortBy) {
        case "popular": return b.review_count - a.review_count;
        case "rating": return b.avg_rating - a.avg_rating;
        case "newest": return 0; // Use DB order
        case "alpha": return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    return result;
  }, [tools, search, pricingFilters, minRating, sortBy]);

  const editorsChoiceTools = useMemo(() =>
    tools.filter(t => t.is_editors_choice), [tools]);

  const featuredTools = useMemo(() =>
    tools.filter(t => t.is_featured && t.affiliate_url), [tools]);

  const visibleTools = filteredTools.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTools.length;

  const loadMore = useCallback(() => {
    setVisibleCount(prev => prev + 16);
  }, []);

  const togglePricingFilter = useCallback((filter: PricingFilter) => {
    setPricingFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setPricingFilters([]);
    setMinRating(0);
    setSortBy("popular");
  }, []);

  return {
    tools: visibleTools,
    allTools: filteredTools,
    editorsChoiceTools,
    featuredTools,
    loading,
    search, setSearch,
    sortBy, setSortBy,
    pricingFilters, togglePricingFilter,
    minRating, setMinRating,
    clearFilters,
    hasMore, loadMore,
    totalCount: filteredTools.length,
    activeCategory, categoryLabel,
  };
};

// Fetch a single tool by slug
export const useToolDetail = (slug?: string) => {
  const [tool, setTool] = useState<ToolRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedTools, setRelatedTools] = useState<ToolRow[]>([]);

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (data) {
        setTool(data as unknown as ToolRow);
        // Increment views
        supabase.rpc("increment_tool_views", { p_tool_id: data.id }).then(() => {});

        // Fetch related
        const { data: related } = await supabase
          .from("tools")
          .select("*")
          .eq("category", data.category)
          .eq("is_published", true)
          .neq("id", data.id)
          .order("avg_rating", { ascending: false })
          .limit(4);
        if (related) setRelatedTools(related as unknown as ToolRow[]);
      }
      setLoading(false);
    };
    fetch();
  }, [slug]);

  return { tool, loading, relatedTools };
};

// Fetch reviews for a tool
export const useToolReviews = (toolId?: string) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    if (!toolId) return;
    setLoading(true);
    const { data } = await supabase
      .from("tool_reviews")
      .select("*, profiles:user_id(full_name, avatar_url)")
      .eq("tool_id", toolId)
      .order("created_at", { ascending: false });
    if (data) setReviews(data);
    setLoading(false);
  }, [toolId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  return { reviews, loading, refetch: fetchReviews };
};
