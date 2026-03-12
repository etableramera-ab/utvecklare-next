'use client';
import { Suspense } from 'react';

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, LayoutGrid, List, Bell, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobFilterPanel from "@/components/jobs/JobFilterPanel";
import JobCard from "@/components/jobs/JobCard";
import JobAlertModal from "@/components/jobs/JobAlertModal";
import JobSEOHead from "@/components/jobs/JobSEOHead";
import { useJobFilters } from "@/hooks/useJobFilters";
import { POPULAR_SEARCHES, SORT_OPTIONS, CITIES } from "@/data/jobsData";
import { Job } from "@/types/jobs";
import { supabase } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import jobsHeroBg from "@/assets/jobs-hero-bg.jpg";
import { AnswerBlock } from "@/components/AnswerBlock";

const ITEMS_PER_PAGE = 20;

const JobsPage = () => {
  const { filters, setFilters, clearFilters, hasActiveFilters } = useJobFilters();
  const [view, setView] = useState<"grid" | "list">("list");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("jobs")
      .select("*, companies(name, logo_url, slug)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const mapped: Job[] = (data ?? []).map((j: any) => ({
          id: j.id,
          slug: j.slug,
          title: j.title,
          company_name: j.companies?.name ?? j.company_name_override ?? "Företag",
          company_logo_url: j.companies?.logo_url ?? j.company_logo_url_override ?? null,
          company_slug: j.companies?.slug ?? null,
          location: j.location,
          work_model: j.work_model as "remote" | "hybrid" | "onsite",
          salary_min: j.salary_min,
          salary_max: j.salary_max,
          tech_tags: j.tech_tags ?? [],
          experience_level: j.experience_level,
          category: j.category,
          description: j.description,
          full_description: j.description,
          requirements: [],
          about_company: "",
          apply_url: j.external_url ?? j.apply_url ?? "",
          is_featured: j.is_featured,
          is_sponsored: j.is_sponsored,
          is_external: j.is_external ?? false,
          created_at: j.created_at,
          views_count: j.views_count,
          applications_count: j.applications_count,
        }));
        setAllJobs(mapped);
        setLoading(false);
      });
  }, []);

  const filteredJobs = useMemo(() => {
    let jobs = [...allJobs];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company_name.toLowerCase().includes(q) ||
        j.tech_tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (filters.categories.length) jobs = jobs.filter(j => filters.categories.includes(j.category));
    if (filters.techTags.length) jobs = jobs.filter(j => j.tech_tags.some(t => filters.techTags.includes(t)));
    if (filters.experienceLevels.length) {
      const expMap: Record<string, string> = {
        "junior": "Junior (0–2 år)",
        "mid": "Mid-level (2–5 år)",
        "mid-level": "Mid-level (2–5 år)",
        "senior": "Senior (5–10 år)",
        "lead": "Lead/Principal (10+ år)",
        "lead/principal": "Lead/Principal (10+ år)",
        "principal": "Lead/Principal (10+ år)",
      };
      jobs = jobs.filter(j => {
        const normalized = expMap[j.experience_level?.toLowerCase()] ?? j.experience_level;
        return filters.experienceLevels.includes(normalized);
      });
    }
    if (filters.workModels.length) {
      const map: Record<string, string> = { "Remote": "remote", "Hybrid": "hybrid", "On-site": "onsite" };
      const models = filters.workModels.map(w => map[w]);
      jobs = jobs.filter(j => models.includes(j.work_model));
    }
    if (filters.cities.length) {
      const mainCities = CITIES.filter(c => c !== "Övriga Sverige");
      jobs = jobs.filter(j =>
        filters.cities.some(c => {
          if (c === "Övriga Sverige") return !mainCities.some(m => j.location.includes(m));
          return j.location.includes(c);
        })
      );
    }
    jobs = jobs.filter(j => {
      if (!j.salary_min || !j.salary_max) return filters.showNoSalary;
      return j.salary_max >= filters.salaryMin && j.salary_min <= filters.salaryMax;
    });

    jobs.sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      if (a.is_sponsored !== b.is_sponsored) return a.is_sponsored ? -1 : 1;
      if (filters.sort === "Högst lön") return (b.salary_max || 0) - (a.salary_max || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return jobs;
  }, [filters, allJobs]);

  const paginatedJobs = filteredJobs.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = paginatedJobs.length < filteredJobs.length;

  const breadcrumbs = [
    { label: "Hem", href: "/" },
    { label: "Jobb", href: "/jobb" },
  ];
  if (filters.categories.length === 1) breadcrumbs.push({ label: filters.categories[0], href: `/jobb?cat=${encodeURIComponent(filters.categories[0])}` });
  if (filters.cities.length === 1) breadcrumbs.push({ label: filters.cities[0], href: `/jobb?city=${encodeURIComponent(filters.cities[0])}` });

  const jobsWithAds: (Job | "ad")[] = [];
  paginatedJobs.forEach((job, i) => {
    if (i > 0 && i % 6 === 0) jobsWithAds.push("ad");
    jobsWithAds.push(job);
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <JobSEOHead filters={filters} jobCount={filteredJobs.length} />
      <main>
        {/* Hero */}
        <section className="relative pt-16">
          <img src={jobsHeroBg.src} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background" />
          <div className="relative container mx-auto px-4 py-20 lg:py-28 text-center">
            <h1 className="text-3xl lg:text-5xl font-extrabold text-foreground mb-4">AI-jobb i Sverige</h1>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Hitta din nästa roll inom artificiell intelligens och maskininlärning
            </p>
            <div className="max-w-xl mx-auto">
              <div className="flex items-center bg-card border border-border rounded-lg overflow-hidden focus-within:border-primary/50 transition-colors">
                <Search className="w-5 h-5 text-muted-foreground ml-4 shrink-0" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={e => setFilters({ search: e.target.value })}
                  placeholder="Sök jobbtitel, företag eller teknik…"
                  className="flex-1 bg-transparent px-3 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                {filters.search && (
                  <button onClick={() => setFilters({ search: "" })} className="p-2 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <Button className="m-1 gradient-bg text-primary-foreground hover:opacity-90 rounded-md px-5">
                  Sök
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <nav className="container mx-auto px-4 py-4" aria-label="Brödsmulor">
          <ol className="flex items-center text-xs text-muted-foreground">
            {breadcrumbs.map((bc, i) => (
              <li key={bc.href} className="flex items-center">
                {i > 0 && <span className="mx-1.5">→</span>}
                {i < breadcrumbs.length - 1 ? (
                  <Link href={bc.href} className="hover:text-foreground">{bc.label}</Link>
                ) : (
                  <span className="text-foreground">{bc.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Content */}
        <div className="container mx-auto px-4 pb-20">
          <AnswerBlock text="Sök bland AI- och ML-jobb i Sverige. Filtrera på roll (ML Engineer, Data Scientist, NLP-utvecklare m.fl.), stad, erfarenhetsnivå och remote-möjlighet. Nya tjänster läggs till dagligen från ledande svenska techbolag." />
          <div className="flex gap-8">
            {/* Desktop sidebar */}
            <div className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-20 space-y-6">
                <div className="p-5 rounded-lg bg-card border border-border">
                  <JobFilterPanel filters={filters} setFilters={setFilters} clearFilters={clearFilters} hasActiveFilters={hasActiveFilters} />
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      className="w-full border-border text-foreground hover:bg-accent"
                      onClick={() => setAlertOpen(true)}
                    >
                      <Bell className="w-4 h-4 mr-2" /> Bevaka denna sökning
                    </Button>
                  </div>
                </div>

                <div className="p-5 rounded-lg bg-card border border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Populära sökningar</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SEARCHES.map(s => (
                      <button key={s} onClick={() => setFilters({ search: s })} className="px-2.5 py-1 text-xs rounded-full bg-accent text-accent-foreground border border-border hover:border-primary/50 transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <Link href="/foretag" className="block p-4 rounded-lg border border-border bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 hover:from-indigo-500/20 hover:to-cyan-500/20 transition-all text-center group">
                  <p className="text-xs font-semibold text-foreground">Annonsera här</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Nå Sveriges AI-utvecklare →</p>
                </Link>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <p className="text-sm text-muted-foreground">
                  Visar <span className="text-foreground font-medium">{Math.min(paginatedJobs.length, filteredJobs.length)}</span> av <span className="text-foreground font-medium">{filteredJobs.length}</span> AI-jobb
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden border-border text-foreground"
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-1.5" /> Filter
                  </Button>

                  <Select value={filters.sort} onValueChange={v => setFilters({ sort: v })}>
                    <SelectTrigger className="w-[160px] h-9 text-sm bg-card border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {SORT_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex border border-border rounded-md overflow-hidden">
                    <button onClick={() => setView("list")} className={`p-2 transition-colors ${view === "list" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                      <List className="w-4 h-4" />
                    </button>
                    <button onClick={() => setView("grid")} className={`p-2 transition-colors ${view === "grid" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {mobileFiltersOpen && (
                <div className="lg:hidden mb-6 p-5 rounded-lg bg-card border border-border">
                  <JobFilterPanel filters={filters} setFilters={setFilters} clearFilters={clearFilters} hasActiveFilters={hasActiveFilters} />
                  <div className="mt-4 pt-4 border-t border-border flex gap-2">
                    <Button variant="outline" className="flex-1 border-border" onClick={() => setAlertOpen(true)}>
                      <Bell className="w-4 h-4 mr-2" /> Bevaka
                    </Button>
                    <Button className="flex-1 gradient-bg text-primary-foreground" onClick={() => setMobileFiltersOpen(false)}>
                      Visa {filteredJobs.length} jobb
                    </Button>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-lg" />
                  ))}
                </div>
              ) : filteredJobs.length > 0 ? (
                <>
                  <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col gap-3"}>
                    {jobsWithAds.map((item, idx) => {
                      if (item === "ad") {
                        return (
                          <Link key={`ad-${idx}`} href="/foretag" className={`block p-5 rounded-lg border border-dashed border-border hover:border-primary/50 transition-colors text-center group${view === "grid" ? " md:col-span-2" : ""}`}>
                            <p className="text-sm font-semibold text-foreground">Annonsera på utvecklare.ai</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Nå Sveriges AI-utvecklare →</p>
                          </Link>
                        );
                      }
                      return item.is_external ? (
                        <a key={item.id} href={item.apply_url} target="_blank" rel="noopener noreferrer">
                          <JobCard job={item} view={view} />
                        </a>
                      ) : (
                        <Link key={item.id} href={`/jobb/${item.slug}`}>
                          <JobCard job={item} view={view} />
                        </Link>
                      );
                    })}
                  </div>

                  {hasMore && (
                    <div className="text-center mt-8">
                      <Button variant="outline" onClick={() => setPage(p => p + 1)} className="border-border text-foreground hover:bg-accent">
                        Ladda fler jobb ({filteredJobs.length - paginatedJobs.length} kvar)
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 px-4 rounded-lg bg-card border border-border">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-lg font-medium text-foreground mb-2">Inga jobb matchade din sökning</p>
                  <p className="text-muted-foreground mb-2">Tips: Prova att bredda dina filter eller ändra sökord</p>
                  <div className="flex flex-wrap justify-center gap-3 mt-6">
                    <Button variant="outline" onClick={clearFilters} className="border-border text-foreground">Rensa filter</Button>
                    <Button className="gradient-bg text-primary-foreground hover:opacity-90" onClick={() => setAlertOpen(true)}>
                      <Bell className="w-4 h-4 mr-2" /> Skapa jobbbevakning
                    </Button>
                  </div>
                  <div className="mt-8">
                    <p className="text-sm text-muted-foreground mb-3">Populära sökningar</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {POPULAR_SEARCHES.map(s => (
                        <button key={s} onClick={() => setFilters({ search: s })} className="px-3 py-1.5 text-xs rounded-full bg-accent text-accent-foreground border border-border hover:border-primary/50 transition-colors">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <JobAlertModal open={alertOpen} onOpenChange={setAlertOpen} filters={filters} />
    </div>
  );
};

const JobsPageWithSuspense = () => (
  <Suspense>
    <JobsPage />
  </Suspense>
);

export default JobsPageWithSuspense;
