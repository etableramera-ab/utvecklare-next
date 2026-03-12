'use client'
import { Job } from "@/types/jobs";
import { MapPin, Heart, ExternalLink, Clock, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import { useState } from "react";

const workModelLabel: Record<string, string> = { remote: "Remote", hybrid: "Hybrid", onsite: "On-site" };
const workModelIcon: Record<string, string> = { remote: "🏠", hybrid: "🔄", onsite: "🏢" };
const workModelStyle: Record<string, string> = {
  remote: "bg-success/10 text-success border-success/20",
  hybrid: "bg-warning/10 text-warning border-warning/20",
  onsite: "bg-secondary/10 text-secondary border-secondary/20",
};

interface Props {
  job: Job;
  view: "grid" | "list";
}

const timeAgo = (dateStr: string) => {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: sv });
  } catch { return ""; }
};

const JobCard = ({ job, view }: Props) => {
  const isFeatured = job.is_featured || job.is_sponsored;
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
  };

  if (view === "list") {
    return (
      <article className={`flex flex-col sm:flex-row items-start gap-4 p-5 rounded-lg bg-card border transition-all duration-300 hover:scale-[1.01] group ${
        isFeatured ? "border-l-2 border-l-primary border-t-border border-r-border border-b-border glow-primary" : "border-border hover:border-primary/50"
      }`}>
        <div className="w-12 h-12 rounded-md gradient-bg flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
          {job.company_logo_url ? (
            <img src={job.company_logo_url} alt={job.company_name} className="w-full h-full rounded-md object-cover" />
          ) : job.company_name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
              <p className="text-sm text-muted-foreground">{job.company_name}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isFeatured && (
                <span className="px-2 py-0.5 text-[10px] rounded-full gradient-bg text-primary-foreground font-medium">
                  {job.is_sponsored ? "Sponsrad" : "Utvald"}
                </span>
              )}
              {job.is_external && (
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-accent text-muted-foreground border border-border font-medium flex items-center gap-1">
                  <Building2 className="w-2.5 h-2.5" /> Arb.förmedlingen
                </span>
              )}
              <button onClick={handleSave} className="p-1.5 rounded-md hover:bg-accent transition-colors" aria-label="Spara jobb">
                <Heart className={`w-4 h-4 ${saved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              </button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{job.description}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{job.location}</span>
            <span className={`px-2 py-0.5 text-xs rounded-full border ${workModelStyle[job.work_model]}`}>
              {workModelIcon[job.work_model]} {workModelLabel[job.work_model]}
            </span>
            {job.tech_tags.slice(0, 5).map(t => (
              <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-accent text-accent-foreground border border-border">{t}</span>
            ))}
            {job.tech_tags.length > 5 && (
              <span className="text-xs text-muted-foreground">+{job.tech_tags.length - 5}</span>
            )}
          </div>
        </div>
        <div className="sm:text-right shrink-0 flex flex-col items-end gap-1">
          {job.salary_min && job.salary_max ? (
            <span className="text-sm font-medium text-foreground">{job.salary_min.toLocaleString("sv-SE")}–{job.salary_max.toLocaleString("sv-SE")} kr</span>
          ) : null}
          <span className="text-xs text-tertiary">{job.experience_level}</span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
            <Clock className="w-3 h-3" /> {timeAgo(job.created_at)}
          </span>
        </div>
      </article>
    );
  }

  return (
    <article className={`flex flex-col p-5 rounded-lg bg-card border transition-all duration-300 hover:scale-[1.02] group h-full ${
      isFeatured ? "border-l-2 border-l-primary border-t-border border-r-border border-b-border glow-primary" : "border-border hover:border-primary/50"
    }`}>
      <div className="flex items-start justify-between mb-3">
        {isFeatured ? (
          <span className="px-2 py-0.5 text-[10px] rounded-full gradient-bg text-primary-foreground font-medium">
            {job.is_sponsored ? "Sponsrad" : "Utvald"}
          </span>
        ) : <span />}
        <button onClick={handleSave} className="p-1.5 rounded-md hover:bg-accent transition-colors" aria-label="Spara jobb">
          <Heart className={`w-4 h-4 ${saved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>
      </div>

      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-md gradient-bg flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
          {job.company_logo_url ? (
            <img src={job.company_logo_url} alt={job.company_name} className="w-full h-full rounded-md object-cover" />
          ) : job.company_name[0]}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{job.title}</h3>
          <p className="text-sm text-muted-foreground">{job.company_name}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <MapPin className="w-3.5 h-3.5 shrink-0" />
        <span>{job.location}</span>
        <span className={`px-2 py-0.5 text-xs rounded-full border ${workModelStyle[job.work_model]}`}>
          {workModelIcon[job.work_model]} {workModelLabel[job.work_model]}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.tech_tags.slice(0, 5).map(t => (
          <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-accent text-accent-foreground border border-border">{t}</span>
        ))}
        {job.tech_tags.length > 5 && (
          <span className="text-xs text-muted-foreground">+{job.tech_tags.length - 5}</span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between text-sm">
        {job.salary_min && job.salary_max ? (
          <span className="font-medium text-foreground">{job.salary_min.toLocaleString("sv-SE")}–{job.salary_max.toLocaleString("sv-SE")} kr</span>
        ) : <span />}
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3" /> {timeAgo(job.created_at)}
        </span>
      </div>
    </article>
  );
};

export default JobCard;
