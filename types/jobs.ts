export interface Job {
  id: string;
  slug: string;
  title: string;
  company_name: string;
  company_logo_url: string | null;
  company_slug?: string | null;
  location: string;
  work_model: "remote" | "hybrid" | "onsite";
  salary_min: number | null;
  salary_max: number | null;
  tech_tags: string[];
  experience_level: string;
  category: string;
  description: string;
  full_description: string;
  requirements: string[];
  about_company: string;
  apply_url: string;
  is_featured: boolean;
  is_sponsored: boolean;
  is_external?: boolean;
  created_at: string;
  views_count?: number;
  applications_count?: number;
}

export interface JobFilters {
  search: string;
  categories: string[];
  techTags: string[];
  experienceLevels: string[];
  workModels: string[];
  cities: string[];
  salaryMin: number;
  salaryMax: number;
  showNoSalary: boolean;
  sort: string;
}
