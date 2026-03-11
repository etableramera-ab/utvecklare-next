'use client'
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export interface SalaryRow {
  id: string;
  role: string;
  experience_level: string;
  city: string;
  salary_min: number;
  salary_median: number;
  salary_max: number;
  salary_p25: number | null;
  salary_p75: number | null;
  sample_size: number | null;
  year: number;
}

export const useSalaryData = (year?: number) =>
  useQuery({
    queryKey: ["salary-data", year],
    queryFn: async () => {
      let q = supabase.from("salary_data").select("*");
      if (year) q = q.eq("year", year);
      const { data, error } = await q;
      if (error) throw error;
      return data as SalaryRow[];
    },
  });

export const useAllSalaryData = () =>
  useQuery({
    queryKey: ["salary-data-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_data")
        .select("*")
        .order("year", { ascending: true });
      if (error) throw error;
      return data as SalaryRow[];
    },
  });

export const ROLES = [
  "ML Engineer",
  "Data Scientist",
  "AI Researcher",
  "MLOps Engineer",
  "NLP/LLM-utvecklare",
  "Computer Vision Engineer",
  "Prompt Engineer",
  "AI Product Manager",
];

export const LEVELS = ["junior", "mid", "senior", "lead"] as const;
export const LEVEL_LABELS: Record<string, string> = {
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  lead: "Lead",
};

export const CITIES = ["Stockholm", "Göteborg", "Malmö", "Uppsala", "Linköping", "Remote"];

export const ROLE_COLORS: Record<string, string> = {
  "ML Engineer": "hsl(239, 84%, 67%)",
  "Data Scientist": "hsl(187, 92%, 42%)",
  "AI Researcher": "hsl(263, 70%, 60%)",
  "MLOps Engineer": "hsl(160, 84%, 39%)",
  "NLP/LLM-utvecklare": "hsl(38, 92%, 50%)",
  "Computer Vision Engineer": "hsl(0, 84%, 60%)",
  "Prompt Engineer": "hsl(200, 80%, 55%)",
  "AI Product Manager": "hsl(320, 70%, 55%)",
};
