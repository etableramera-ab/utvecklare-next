export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string;
  category_slug?: string;
  tags: string[] | null;
  hero_image_url: string | null;
  hero_image_alt?: string | null;
  author_name: string | null;
  author_slug?: string | null;
  author_avatar_url: string | null;
  author_bio: string | null;
  author_linkedin_url?: string | null;
  author_github_url?: string | null;
  reading_time_minutes: number | null;
  is_featured: boolean;
  is_published: boolean;
  published_at: string | null;
  updated_at?: string | null;
  views_count: number;
  likes_count: number;
  meta_title?: string | null;
  meta_description?: string | null;
}

export interface ArticleCategory {
  label: string;
  slug: string;
}
