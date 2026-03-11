'use client';

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Globe, MapPin, Users, Building2, Calendar, Heart,
  ExternalLink, Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CompanyRow {
  id: string;
  slug: string | null;
  name: string;
  logo_url: string | null;
  cover_image_url: string | null;
  industry: string | null;
  size: string | null;
  location: string | null;
  website: string | null;
  description: string | null;
  tech_stack: string[] | null;
  created_at: string;
}

interface JobRow {
  id: string;
  slug: string;
  title: string;
  location: string;
  experience_level: string;
  salary_min: number | null;
  salary_max: number | null;
  tech_tags: string[] | null;
  work_model: string;
}

const CompanyProfilePage = () => {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { toast } = useToast();
  const [following, setFollowing] = useState(false);
  const [company, setCompany] = useState<CompanyRow | null>(null);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetchCompany();
  }, [slug]);

  const fetchCompany = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", slug!)
      .single();

    if (error || !data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setCompany(data as unknown as CompanyRow);

    const { data: jobsData } = await supabase
      .from("jobs")
      .select("id, slug, title, location, experience_level, salary_min, salary_max, tech_tags, work_model")
      .eq("company_id", data.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    setJobs((jobsData ?? []) as unknown as JobRow[]);
    setLoading(false);
  };

  const avgSalary = useMemo(() => {
    const withSalary = jobs.filter((j) => j.salary_min && j.salary_max);
    if (!withSalary.length) return null;
    const min = Math.round(withSalary.reduce((s, j) => s + (j.salary_min || 0), 0) / withSalary.length);
    const max = Math.round(withSalary.reduce((s, j) => s + (j.salary_max || 0), 0) / withSalary.length);
    return `${(min / 1000).toFixed(0)}k – ${(max / 1000).toFixed(0)}k SEK/mån`;
  }, [jobs]);

  useEffect(() => {
    if (notFound) {
      router.replace("/jobb");
    }
  }, [notFound]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <Skeleton className="h-48 rounded-lg mb-8" />
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-40" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!company) return null;

  const handleFollow = () => {
    setFollowing(!following);
    toast({
      title: following ? "Du följer inte längre" : "Du följer nu " + company.name,
      description: following ? "" : "Du får notiser om nya jobb.",
    });
  };

  const initials = company.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  const coverUrl = company.cover_image_url || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16">
        <div className="h-48 md:h-64 overflow-hidden">
          <img src={coverUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 top-16 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl bg-card border-4 border-background flex items-center justify-center shrink-0 shadow-lg">
              {company.logo_url ? (
                <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <span className="text-2xl font-bold gradient-text">{initials}</span>
              )}
            </div>

            <div className="flex-1 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{company.name}</h1>
                <Button
                  variant={following ? "default" : "outline"}
                  size="sm"
                  onClick={handleFollow}
                  className={following ? "gradient-bg text-primary-foreground hover:opacity-90" : "border-border"}
                >
                  <Heart className={`w-3.5 h-3.5 mr-1 ${following ? "fill-current" : ""}`} />
                  {following ? "Följer" : "Följ företaget"}
                </Button>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                {company.industry && <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{company.industry}</span>}
                {company.size && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{company.size} anställda</span>}
                {company.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{company.location}</span>}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                    <Globe className="w-3.5 h-3.5" />{company.website.replace("https://", "")}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[1fr_320px] gap-10">
          <div className="space-y-10">
            {company.description && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Om {company.name}</h2>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {company.description}
                </div>
              </div>
            )}

            {company.tech_stack && company.tech_stack.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Tech Stack</h2>
                <div className="flex flex-wrap gap-2">
                  {company.tech_stack.map((t) => (
                    <Badge key={t} variant="secondary" className="px-3 py-1">{t}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">
                Lediga AI-jobb hos {company.name} ({jobs.length})
              </h2>
              {jobs.length > 0 ? (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/jobb/${job.slug}`}
                      className="block p-4 rounded-lg bg-card border border-border card-hover"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{job.title}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                            <span>{job.experience_level}</span>
                            {job.salary_min && job.salary_max && (
                              <span>{(job.salary_min / 1000).toFixed(0)}k – {(job.salary_max / 1000).toFixed(0)}k SEK/mån</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {(job.tech_tags ?? []).slice(0, 4).map((t) => (
                              <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0">{t}</Badge>
                            ))}
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Inga lediga jobb just nu.</p>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-lg bg-card border border-border p-5">
              <h3 className="font-semibold text-foreground mb-4">Nyckeltal</h3>
              <div className="space-y-3 text-sm">
                {company.size && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Anställda</span>
                    <span className="text-foreground font-medium">{company.size}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Aktiva jobbannonser</span>
                  <span className="text-foreground font-medium">{jobs.length}</span>
                </div>
                {avgSalary && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Snittlön</span>
                    <span className="text-foreground font-medium">{avgSalary}</span>
                  </div>
                )}
                {company.industry && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bransch</span>
                    <span className="text-foreground font-medium">{company.industry}</span>
                  </div>
                )}
              </div>
            </div>

            {company.website && (
              <Button variant="outline" className="w-full border-border" asChild>
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-4 h-4 mr-2" />
                  Besök {company.name}
                </a>
              </Button>
            )}

            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <span className="text-xs text-muted-foreground">Annons</span>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CompanyProfilePage;
