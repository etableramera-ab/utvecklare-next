'use client'
import { useState, useEffect } from "react";
import Link from 'next/link'
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, Eye, Users, ChevronDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  companyId: string;
}

interface CompanyJob {
  id: string;
  slug: string;
  title: string;
  is_active: boolean;
  views_count: number;
  applications_count: number;
  created_at: string;
}

interface Application {
  id: string;
  full_name: string;
  email: string;
  linkedin_url: string | null;
  phone: string | null;
  message: string | null;
  resume_url: string | null;
  status: string;
  created_at: string;
}

const CompanyJobManager = ({ companyId }: Props) => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<CompanyJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [applications, setApplications] = useState<Record<string, Application[]>>({});

  const loadJobs = async () => {
    const { data } = await supabase
      .from("jobs")
      .select("id, slug, title, is_active, views_count, applications_count, created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    setJobs((data as CompanyJob[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
  }, [companyId]);

  const toggleActive = async (jobId: string, current: boolean) => {
    await supabase.from("jobs").update({ is_active: !current }).eq("id", jobId);
    toast({ title: current ? "Jobb avaktiverat" : "Jobb aktiverat" });
    loadJobs();
  };

  const loadApplications = async (jobId: string) => {
    if (expandedJob === jobId) {
      setExpandedJob(null);
      return;
    }
    const { data } = await supabase
      .from("applications")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });
    setApplications((prev) => ({ ...prev, [jobId]: (data as Application[]) || [] }));
    setExpandedJob(jobId);
  };

  const updateStatus = async (appId: string, jobId: string, status: string) => {
    await supabase.from("applications").update({ status }).eq("id", appId);
    toast({ title: `Status uppdaterad till ${status}` });
    // Reload
    const { data } = await supabase
      .from("applications")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });
    setApplications((prev) => ({ ...prev, [jobId]: (data as Application[]) || [] }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>Du har inga publicerade jobb ännu.</p>
        <Button className="gradient-bg text-primary-foreground mt-4" asChild>
          <Link href="/dashboard/publicera-jobb">Skapa jobbannons</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <div key={job.id} className="rounded-lg bg-card border border-border overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
            <div>
              <div className="flex items-center gap-2">
                <Link href={`/jobb/${job.slug}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                  {job.title}
                </Link>
                <Badge variant={job.is_active ? "default" : "secondary"} className="text-[10px]">
                  {job.is_active ? "Aktiv" : "Inaktiv"}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{job.views_count}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.applications_count} ansökningar</span>
                <span>{new Date(job.created_at).toLocaleDateString("sv-SE")}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-border text-xs"
                onClick={() => toggleActive(job.id, job.is_active)}
              >
                {job.is_active ? "Avaktivera" : "Aktivera"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-border text-xs"
                onClick={() => loadApplications(job.id)}
              >
                <ChevronDown className={`w-3 h-3 mr-1 transition-transform ${expandedJob === job.id ? "rotate-180" : ""}`} />
                Ansökningar
              </Button>
            </div>
          </div>

          {expandedJob === job.id && (
            <div className="border-t border-border p-4">
              {(applications[job.id] || []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Inga ansökningar ännu.</p>
              ) : (
                <div className="space-y-3">
                  {applications[job.id].map((app) => (
                    <div key={app.id} className="p-3 rounded-md bg-accent/50 border border-border">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground text-sm">{app.full_name}</p>
                          <p className="text-xs text-muted-foreground">{app.email}</p>
                          {app.linkedin_url && (
                            <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                              LinkedIn
                            </a>
                          )}
                          {app.phone && <p className="text-xs text-muted-foreground">{app.phone}</p>}
                          {app.message && <p className="text-xs text-muted-foreground mt-1">{app.message}</p>}
                          {app.resume_url && (
                            <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                              Ladda ner CV
                            </a>
                          )}
                        </div>
                        <Select value={app.status} onValueChange={(v) => updateStatus(app.id, job.id, v)}>
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="interview">Interview</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="hired">Hired</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        {new Date(app.created_at).toLocaleDateString("sv-SE")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CompanyJobManager;
