'use client'
import { useCallback, type ReactNode, type MouseEvent } from "react";
import { supabase } from "@/lib/supabase/client";

interface AffiliateLinkProps {
  toolSlug: string;
  affiliateUrl: string;
  affiliateLinkId?: string;
  children: ReactNode;
  className?: string;
}

const AffiliateLink = ({ toolSlug, affiliateUrl, affiliateLinkId, children, className }: AffiliateLinkProps) => {
  const handleClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();

      const sessionId = sessionStorage.getItem("sid") ?? crypto.randomUUID();
      if (!sessionStorage.getItem("sid")) sessionStorage.setItem("sid", sessionId);

      // Log click to affiliate_clicks
      const payload = {
        tool_id: toolSlug, // will be resolved server-side or use tool_slug
        affiliate_link_id: affiliateLinkId ?? null,
        page_url: window.location.pathname,
        session_id: sessionId,
      };

      // We need to find the tool UUID from slug for the FK, so use edge insert via REST
      // For now, log via supabase client with a lookup
      (async () => {
        try {
          // Get tool id from slug
          const { data: tool } = await supabase
            .from("tools")
            .select("id")
            .eq("slug", toolSlug)
            .maybeSingle();

          if (tool) {
            // Insert click
            supabase.from("affiliate_clicks").insert({
              tool_id: tool.id,
              affiliate_link_id: affiliateLinkId ?? null,
              page_url: window.location.pathname,
              session_id: sessionId,
            }).then(() => {});

            // Increment clicks on affiliate_links if we have an id
            if (affiliateLinkId) {
              supabase
                .from("affiliate_links")
                .update({ clicks: undefined }) // we'll use RPC or raw increment
                .eq("id", affiliateLinkId)
                .then(() => {});
            }
          }
        } catch {}
      })();

      // Also use sendBeacon as fallback for navigation reliability
      const beaconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/affiliate_clicks`;
      // We need tool UUID — sendBeacon can't do lookup, so skip if we don't have it
      // The async insert above will handle it

      window.open(affiliateUrl, "_blank", "noopener");
    },
    [toolSlug, affiliateUrl, affiliateLinkId]
  );

  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="sponsored noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
};

export default AffiliateLink;
