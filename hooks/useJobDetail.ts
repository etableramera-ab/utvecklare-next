'use client'
import { useMemo, useState, useEffect, useCallback } from "react";
import { useParams } from 'next/navigation'
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MOCK_JOBS } from "@/data/jobsData";
import { Job } from "@/types/jobs";
import { useToast } from "@/hooks/use-toast";

export const useJobDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [saved, setSaved] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [savingInProgress, setSavingInProgress] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dbJob, setDbJob] = useState<Job | null | undefined>(undefined); // undefined=loading

  // Try Supabase if not found in mock data
  const mockJob = useMemo(() => MOCK_JOBS.find((j) => j.slug === slug), [slug]);

  useEffect(() => {
    if (mockJob || !slug) { setDbJob(null); return; }
    supabase
      .from("jobs")
      .select("*, companies(name, logo_url, slug)")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data: j }) => {
        if (!j) { setDbJob(null); return; }
        setDbJob({
          id: j.id, slug: j.slug, title: j.title,
          company_name: (j as any).companies?.name ?? (j as any).company_name_override ?? "Företag",
          company_logo_url: (j as any).companies?.logo_url ?? (j as any).company_logo_url_override ?? null,
          company_slug: (j as any).companies?.slug ?? null,
          location: j.location, work_model: j.work_model as "remote" | "hybrid" | "onsite",
          salary_min: j.salary_min, salary_max: j.salary_max,
          tech_tags: j.tech_tags ?? [], experience_level: j.experience_level,
          category: j.category, description: j.description,
          full_description: j.description, requirements: [], about_company: "",
          apply_url: (j as any).external_url ?? j.apply_url ?? "",
          is_featured: j.is_featured, is_sponsored: j.is_sponsored,
          is_external: (j as any).is_external ?? false,
          created_at: j.created_at, views_count: j.views_count,
          applications_count: j.applications_count,
        });
      });
  }, [slug, mockJob]);

  const job = mockJob ?? dbJob ?? null;

  const relatedJobs = useMemo(() => {
    if (!job) return [];
    return MOCK_JOBS.filter(
      (j) =>
        j.id !== job.id &&
        (j.category === job.category ||
          j.tech_tags.some((t) => job.tech_tags.includes(t)))
    ).slice(0, 4);
  }, [job]);

  // Track view (once per session per job)
  useEffect(() => {
    if (!job) return;
    const key = `viewed_job_${job.id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    // Increment views in DB (fire-and-forget for mock data)
    supabase
      .from("jobs")
      .update({ views_count: (job.views_count || 0) + 1 })
      .eq("slug", job.slug)
      .then(() => {});
  }, [job]);

  // Check if user saved this job
  useEffect(() => {
    if (!user || !job) return;
    supabase
      .from("saved_jobs")
      .select("id")
      .eq("user_id", user.id)
      .eq("job_id", job.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSaved(true);
      });
  }, [user, job]);

  // Get saved count
  useEffect(() => {
    if (!job) return;
    supabase
      .from("saved_jobs")
      .select("id", { count: "exact", head: true })
      .eq("job_id", job.id)
      .then(({ count }) => {
        if (count !== null) setSavedCount(count);
      });
  }, [job]);

  const toggleSave = useCallback(async () => {
    if (!user || !job || savingInProgress) return false;
    setSavingInProgress(true);
    const wasSaved = saved;

    // Optimistic
    setSaved(!wasSaved);
    setSavedCount((c) => c + (wasSaved ? -1 : 1));

    try {
      if (wasSaved) {
        await supabase
          .from("saved_jobs")
          .delete()
          .eq("user_id", user.id)
          .eq("job_id", job.id);
        toast({ title: "Jobb borttaget från sparade" });
      } else {
        await supabase
          .from("saved_jobs")
          .insert({ user_id: user.id, job_id: job.id });
        toast({ title: "Jobb sparat!" });
      }
    } catch {
      // Rollback
      setSaved(wasSaved);
      setSavedCount((c) => c + (wasSaved ? 1 : -1));
    }
    setSavingInProgress(false);
    return true;
  }, [user, job, saved, savingInProgress, toast]);

  const shareUrl =
    typeof window !== "undefined" ? window.location.href : "";

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ title: "Länk kopierad!" });
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl, toast]);

  const daysAgo = job
    ? Math.max(
        1,
        Math.round(
          (Date.now() - new Date(job.created_at).getTime()) / 86400000
        )
      )
    : 0;

  return {
    job,
    relatedJobs,
    saved,
    savedCount,
    toggleSave,
    copied,
    copyLink,
    shareUrl,
    daysAgo,
    user,
  };
};
