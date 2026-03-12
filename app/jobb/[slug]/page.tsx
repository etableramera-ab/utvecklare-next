'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin, Calendar, Heart, ExternalLink, ArrowLeft,
  Briefcase, GraduationCap, Banknote, Check, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobCard from "@/components/jobs/JobCard";
import JobDetailSEO from "@/components/jobs/JobDetailSEO";
import JobShareDropdown from "@/components/jobs/JobShareDropdown";
import JobApplicationForm from "@/components/jobs/JobApplicationForm";
import { useJobDetail } from "@/hooks/useJobDetail";
import jobsHeroBg from "@/assets/jobs-hero-bg.jpg";

const workModelLabel: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

const JobDetailPage = () => {
  const router = useRouter();
  const {
    job, relatedJobs, saved, savedCount, toggleSave,
    copied, copyLink, shareUrl, daysAgo, user,
  } = useJobDetail();

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Jobbet hittades inte</h1>
          <Button asChild variant="outline" className="border-border text-foreground">
            <Link href="/jobb"><ArrowLeft className="w-4 h-4 mr-2" /> Tillbaka till jobb</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSave = () => {
    if (!user) {
      router.push(`/logga-in?redirect=/jobb/${job.slug}`);
      return;
    }
    toggleSave();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <JobDetailSEO job={job} />

      {/* Hero */}
      <section className="relative pt-16">
        <img src={jobsHeroBg.src} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background" />
        <div className="relative container mx-auto px-4 py-16 lg:py-20">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-xl gradient-bg flex items-center justify-center text-primary-foreground font-bold text-2xl shrink-0">
              {job.company_logo_url ? (
                <img src={job.company_logo_url} alt={job.company_name} className="w-full h-full rounded-xl object-cover" />
              ) : job.company_name[0]}
            </div>
            <div>
              <h1 className="text-2xl lg:text-4xl font-extrabold text-foreground">{job.title}</h1>
              <p className="text-lg text-muted-foreground mt-1">
                {job.company_slug ? (
                  <Link href={`/foretag/${job.company_slug}`} className="hover:text-primary transition-colors">
                    {job.company_name}
                  </Link>
                ) : job.company_name}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-accent border border-border">{workModelLabel[job.work_model]}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {daysAgo === 1 ? "Igår" : `${daysAgo} dagar sedan`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Hem</Link>
          <span className="mx-1.5">→</span>
          <Link href="/jobb" className="hover:text-foreground">Jobb</Link>
          <span className="mx-1.5">→</span>
          <Link href={`/jobb?category=${encodeURIComponent(job.category)}`} className="hover:text-foreground">{job.category}</Link>
          <span className="mx-1.5">→</span>
          <span className="text-foreground">{job.title}</span>
        </nav>
      </div>

      {/* Info bar */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg bg-card border border-border">
          <span className="flex items-center gap-1.5 text-sm"><Briefcase className="w-4 h-4 text-secondary" />{job.category}</span>
          <span className="w-px h-4 bg-border" />
          <span className="flex items-center gap-1.5 text-sm"><GraduationCap className="w-4 h-4 text-secondary" />{job.experience_level}</span>
          {job.salary_min && job.salary_max && (
            <>
              <span className="w-px h-4 bg-border" />
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Banknote className="w-4 h-4 text-secondary" />
                {job.salary_min.toLocaleString("sv-SE")}–{job.salary_max.toLocaleString("sv-SE")} kr/mån
              </span>
            </>
          )}
          <span className="w-px h-4 bg-border hidden sm:block" />
            <div className="flex flex-wrap gap-1.5 flex-1 overflow-x-auto">
              {job.tech_tags.map((t) => (
                <Link key={t} href={`/verktyg?sok=${encodeURIComponent(t)}`}
                  className="px-2 py-0.5 text-xs rounded-full bg-accent text-accent-foreground border border-border whitespace-nowrap hover:border-primary/50 transition-colors">
                  {t}
                </Link>
              ))}
            </div>
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <Button
              variant="outline"
              size="icon"
              className={`border-border ${saved ? "text-destructive border-destructive/30" : ""}`}
              onClick={handleSave}
            >
              <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
            </Button>
            <JobShareDropdown
              shareUrl={shareUrl}
              title={job.title}
              companyName={job.company_name}
              copied={copied}
              onCopyLink={copyLink}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 pb-20">
        <div className="flex gap-8 items-start">
          {/* Left 2/3 */}
          <div className="flex-1 min-w-0">
            {/* Description */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-foreground mb-4">Om tjänsten</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                {job.full_description.split("\n\n").map((para, i) => {
                  if (para.startsWith("## ")) {
                    return <h3 key={i} className="text-lg font-semibold text-foreground mt-6 mb-3">{para.replace("## ", "")}</h3>;
                  }
                  if (para.startsWith("- ")) {
                    return (
                      <ul key={i} className="space-y-2 ml-1">
                        {para.split("\n").map((line, li) => (
                          <li key={li} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full gradient-bg mt-2 shrink-0" />
                            <span>{line.replace("- ", "")}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={i}>{para}</p>;
                })}
              </div>
            </div>

            {/* Requirements */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-foreground mb-4">Kravprofil</h2>
              <ul className="space-y-3">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* About company */}
            <div className="mb-10 p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-bold text-foreground mb-3">Om {job.company_name}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{job.about_company}</p>
              <Link
                href={`/jobb?company=${encodeURIComponent(job.company_name)}`}
                className="text-sm text-primary hover:underline"
              >
                Se alla jobb hos {job.company_name} →
              </Link>
            </div>

            {/* Similar jobs */}
            {relatedJobs.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-6">Liknande jobb</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedJobs.slice(0, 4).map((j) => (
                    <Link key={j.id} href={`/jobb/${j.slug}`}>
                      <JobCard job={j} view="grid" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-20 space-y-6">
              {/* Apply card */}
              <div className="p-6 rounded-lg bg-card border border-border">
                <h3 className="font-semibold text-foreground mb-2">Intresserad?</h3>
                {job.is_external ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">Ansökan sker direkt hos arbetsgivaren via Arbetsförmedlingen</p>
                    <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full gradient-bg text-primary-foreground hover:opacity-90">
                        Ansök hos arbetsgivaren <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                    <p className="text-xs text-muted-foreground mt-3">Källa: Arbetsförmedlingen / JobTech Dev</p>
                  </>
                ) : job.apply_url && job.apply_url !== "#" ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">Ansök direkt hos {job.company_name}</p>
                    <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full gradient-bg text-primary-foreground hover:opacity-90">
                        Ansök hos {job.company_name} <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">Ansök direkt via formuläret</p>
                    <JobApplicationForm jobId={job.id} companyName={job.company_name} />
                  </>
                )}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {job.views_count || 0} har tittat
                  </span>
                  {savedCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" />
                      {savedCount} har sparat
                    </span>
                  )}
                </div>
              </div>

              {/* Job meta */}
              <div className="p-5 rounded-lg bg-card border border-border space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Publicerad</span>
                  <span className="text-foreground">{new Date(job.created_at).toLocaleDateString("sv-SE")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plats</span>
                  <span className="text-foreground">{job.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Arbetsmodell</span>
                  <span className="text-foreground">{workModelLabel[job.work_model]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nivå</span>
                  <span className="text-foreground">{job.experience_level}</span>
                </div>
              </div>

              {/* Ad */}
              <Link href="/foretag" className="block p-4 rounded-lg border border-border bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 hover:from-indigo-500/20 hover:to-cyan-500/20 transition-all text-center group">
                  <p className="text-xs font-semibold text-foreground">Annonsera här</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Nå Sveriges AI-utvecklare →</p>
                </Link>

              {/* Related jobs sidebar */}
              {relatedJobs.length > 0 && (
                <div className="p-5 rounded-lg bg-card border border-border">
                  <h4 className="font-semibold text-foreground text-sm mb-3">Relaterade jobb</h4>
                  <div className="space-y-3">
                    {relatedJobs.slice(0, 3).map((j) => (
                      <Link key={j.id} href={`/jobb/${j.slug}`} className="block group">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{j.title}</p>
                        <p className="text-xs text-muted-foreground">{j.company_name} · {j.location}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky apply bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-card/95 backdrop-blur-sm border-t border-border">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="icon"
            className={`border-border shrink-0 ${saved ? "text-destructive border-destructive/30" : ""}`}
            onClick={handleSave}
          >
            <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
          </Button>
          {job.apply_url && job.apply_url !== "#" ? (
            <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button className="w-full gradient-bg text-primary-foreground hover:opacity-90">
                Ansök nu <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          ) : (
            <Button
              className="flex-1 gradient-bg text-primary-foreground hover:opacity-90"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Ansök nu
            </Button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default JobDetailPage;
