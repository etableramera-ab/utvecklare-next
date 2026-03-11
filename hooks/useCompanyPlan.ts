'use client'
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const JOB_LIMITS: Record<string, number> = {
  starter: 3,
  professional: 10,
  enterprise: Infinity,
};

export function useCompanyPlan() {
  const { user } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [activeJobCount, setActiveJobCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const load = async () => {
      const { data: comp } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!comp) { setLoading(false); return; }
      setCompany(comp);

      const [subRes, jobCountRes] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("*")
          .eq("company_id", comp.id)
          .in("status", ["active", "trialing"])
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("jobs")
          .select("id", { count: "exact" })
          .eq("company_id", comp.id)
          .eq("is_active", true),
      ]);

      setSubscription(subRes.data);
      setActiveJobCount(jobCountRes.count || 0);
      setLoading(false);
    };

    load();
  }, [user]);

  const plan = subscription?.plan || company?.plan || null;
  const jobLimit = plan ? (JOB_LIMITS[plan] ?? 0) : 0;
  const canPublishJob = plan ? activeJobCount < jobLimit : false;
  const canFeatureJob = plan === "professional" || plan === "enterprise";
  const isTrialing = subscription?.status === "trialing";
  const trialEnd = subscription?.trial_end ? new Date(subscription.trial_end) : null;

  return {
    company,
    subscription,
    plan,
    jobLimit,
    activeJobCount,
    canPublishJob,
    canFeatureJob,
    isTrialing,
    trialEnd,
    loading,
  };
}
