'use client'
import SEOHead from "@/components/SEOHead";
import { JobFilters } from "@/types/jobs";

interface Props {
  filters: JobFilters;
  jobCount: number;
}

const JobSEOHead = ({ filters, jobCount }: Props) => {
  const category = filters.categories.length === 1 ? filters.categories[0] : null;
  const city = filters.cities.length === 1 ? filters.cities[0] : null;

  let title = "AI-jobb i Sverige 2026 — Lediga tjänster för ML Engineers & Data Scientists";
  if (category && city) title = `${category}-jobb i ${city} 2026`;
  else if (category) title = `${category}-jobb i Sverige 2026`;
  else if (city) title = `AI-jobb i ${city} 2026`;

  const cityLabel = city || "Sverige";
  const catLabel = category || "AI-roller";
  const description = `Sök bland ${jobCount} lediga AI-jobb i ${cityLabel}. ML Engineer, Data Scientist, ${catLabel} och fler roller hos företag som Spotify, Klarna och Ericsson.`;

  const canonicalParams = new URLSearchParams();
  if (category) canonicalParams.set("cat", category);
  if (city) canonicalParams.set("city", city);
  const canonical = `/jobb${canonicalParams.toString() ? `?${canonicalParams}` : ""}`;

  return (
    <SEOHead
      title={title}
      description={description}
      canonical={canonical}
    />
  );
};

export default JobSEOHead;
