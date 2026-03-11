'use client'
import { useState, useEffect } from "react";
import Link from 'next/link'
import { MapPin, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

interface JobPreview {
  id: string;
  slug: string;
  title: string;
  location: string;
  work_model: string;
  salary_min: number | null;
  salary_max: number | null;
  tech_tags: string[] | null;
  experience_level: string;
  companies: { name: string; logo_url: string | null } | null;
}

const FeaturedJobs = () => {
  const [jobs, setJobs] = useState<JobPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("jobs")
      .select("id, slug, title, location, work_model, salary_min, salary_max, tech_tags, experience_level, companies(name, logo_url)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setJobs((data ?? []) as unknown as JobPreview[]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="section-spacing">
        <div className="container mx-auto px-4">
          <div className="h-8 bg-muted rounded w-48 mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-lg bg-card border border-border animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (jobs.length === 0) return null;

  return (
    <section className="section-spacing">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Senaste AI-jobben</h2>
          <Link href="/jobb" className="text-sm text-primary hover:underline hidden sm:flex items-center gap-1">
            Visa alla <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => {
            const companyName = job.companies?.name ?? "Företag";
            return (
              <Link key={job.id} href={`/jobb/${job.slug}`}>
                <article className="flex flex-col h-full p-5 rounded-lg bg-card border border-border card-hover">
                  <div className="flex items-start gap-3 mb-3">
                    {job.companies?.logo_url ? (
                      <img src={job.companies.logo_url} alt={`${companyName} logotyp`} className="w-10 h-10 rounded-md bg-white p-0.5 border border-border object-contain shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-md gradient-bg flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                        {companyName[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{companyName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{job.location}</span>
                    {job.work_model === "remote" && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-success/10 text-success border border-success/20">Remote</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(job.tech_tags ?? []).slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-accent text-accent-foreground border border-border">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between text-sm">
                    {job.salary_min && job.salary_max && (
                      <span className="text-foreground font-medium">
                        {job.salary_min.toLocaleString("sv-SE")}–{job.salary_max.toLocaleString("sv-SE")} kr
                      </span>
                    )}
                    <span className="text-muted-foreground ml-auto">{job.experience_level}</span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Button asChild variant="outline" className="border-border text-foreground hover:bg-accent">
            <Link href="/jobb">Utforska alla AI-jobb <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;
