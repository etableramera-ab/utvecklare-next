'use client'
import { useState, useEffect } from "react";
import Link from 'next/link'
import { Briefcase, MapPin, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface JobRow {
  id: string;
  title: string;
  slug: string;
  location: string;
  work_model: string;
  tech_tags: string[] | null;
  salary_min: number | null;
  salary_max: number | null;
  companies: { name: string; logo_url: string | null } | null;
}

const RelatedJobs = ({ tags, category }: { tags: string[]; category: string }) => {
  const [jobs, setJobs] = useState<JobRow[]>([]);

  const isCareerArticle = ["Karriär & Lön", "MLOps & Infrastruktur"].includes(category);

  useEffect(() => {
    if (!tags.length && !isCareerArticle) return;

    supabase
      .from("jobs")
      .select("id, title, slug, location, work_model, tech_tags, salary_min, salary_max, companies(name, logo_url)")
      .eq("is_active", true)
      .overlaps("tech_tags", tags.length ? tags : ["Python", "ML", "AI"])
      .limit(3)
      .then(({ data }) => {
        setJobs((data as unknown as JobRow[]) || []);
      });
  }, [tags, isCareerArticle]);

  if (jobs.length === 0) return null;

  const searchTags = tags.slice(0, 2).join(",");

  return (
    <div className="my-10 p-6 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          Relaterade jobb
        </h3>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/jobb?tags=${searchTags}`}>Se fler <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
        </Button>
      </div>
      <div className="grid gap-3">
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobb/${job.slug}`}
            className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/40 transition-all group"
          >
            {job.companies?.logo_url ? (
              <img src={job.companies.logo_url} alt="" className="w-10 h-10 rounded-lg object-contain bg-muted p-1" />
            ) : (
              <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center text-primary-foreground text-sm font-bold">
                {(job.companies?.name || "?")[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">{job.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <span>{job.companies?.name}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
              </p>
            </div>
            <div className="hidden sm:flex flex-wrap gap-1">
              {(job.tech_tags || []).slice(0, 2).map(t => (
                <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedJobs;
