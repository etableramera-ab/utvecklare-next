export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description: string;
  pros: string[];
  cons: string[];
  logo_initial: string;
  website_url: string;
  affiliate_url?: string;
  category: string;
  category_slug: string;
  tags: string[];
  pricing_model: "free" | "freemium" | "paid";
  pricing_details?: string;
  avg_rating: number;
  review_count: number;
  is_featured: boolean;
  is_affiliate: boolean;
  founded_year?: number;
  primary_language?: string;
  platforms?: string[];
}

export interface ToolReview {
  id: string;
  tool_id: string;
  user_name: string;
  rating: number;
  content: string;
  created_at: string;
}

export interface ToolCategory {
  label: string;
  slug: string;
}
