'use client'
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  destination_url: string;
  advertiser_name: string;
  format: string;
  placement: string;
}

interface UseAdBannerOptions {
  placement: string;
  category?: string;
  page?: string;
}

function getSessionId(): string {
  let sid = sessionStorage.getItem("ad_session_id");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("ad_session_id", sid);
  }
  return sid;
}

export function useAdBanner({ placement, category, page }: UseAdBannerOptions) {
  const [ad, setAd] = useState<Ad | null>(null);
  const impressionLogged = useRef(false);
  const adRef = useRef<HTMLDivElement>(null);

  // Fetch ad
  useEffect(() => {
    let cancelled = false;
    const fetchAd = async () => {
      let query = supabase
        .from("ads")
        .select("id, title, description, image_url, destination_url, advertiser_name, format, placement, priority, target_categories, target_pages")
        .eq("placement", placement)
        .eq("is_active", true)
        .lte("start_date", new Date().toISOString().split("T")[0])
        .gte("end_date", new Date().toISOString().split("T")[0])
        .order("priority", { ascending: false })
        .limit(10);

      const { data } = await query;
      if (cancelled || !data?.length) return;

      // Client-side filtering for targeting
      let candidates = data as any[];
      if (category) {
        candidates = candidates.filter(
          (a) => !a.target_categories?.length || a.target_categories.includes(category)
        );
      }
      if (page) {
        candidates = candidates.filter(
          (a) => !a.target_pages?.length || a.target_pages.includes(page)
        );
      }
      if (!candidates.length) return;

      // Pick highest priority, random among ties
      const maxPriority = candidates[0].priority;
      const topAds = candidates.filter((a) => a.priority === maxPriority);
      const picked = topAds[Math.floor(Math.random() * topAds.length)];

      setAd(picked);
    };

    fetchAd();
    return () => { cancelled = true; };
  }, [placement, category, page]);

  // Impression tracking with IntersectionObserver
  useEffect(() => {
    if (!ad || !adRef.current) return;

    const sessionKey = `ad_imp_${ad.id}`;
    if (sessionStorage.getItem(sessionKey)) {
      impressionLogged.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !impressionLogged.current) {
            impressionLogged.current = true;
            sessionStorage.setItem(sessionKey, "1");

            const sid = getSessionId();
            // Fire and forget
            supabase.from("ad_impressions").insert({
              ad_id: ad.id,
              page_url: window.location.pathname,
              user_agent: navigator.userAgent,
              session_id: sid,
            }).then(() => {});

            supabase.rpc("increment_ad_impressions", { p_ad_id: ad.id }).then(() => {});
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(adRef.current);
    return () => observer.disconnect();
  }, [ad]);

  // Click handler
  const handleClick = useCallback(() => {
    if (!ad) return;

    const sid = getSessionId();

    // Log click via beacon as fallback
    const payload = JSON.stringify({
      ad_id: ad.id,
      page_url: window.location.pathname,
      user_agent: navigator.userAgent,
      session_id: sid,
    });

    // Try supabase insert first
    supabase.from("ad_clicks").insert({
      ad_id: ad.id,
      page_url: window.location.pathname,
      user_agent: navigator.userAgent,
      session_id: sid,
    }).then(() => {});

    supabase.rpc("increment_ad_clicks", { p_ad_id: ad.id }).then(() => {});

    window.open(ad.destination_url, "_blank", "noopener");
  }, [ad]);

  return { ad, adRef, handleClick };
}
