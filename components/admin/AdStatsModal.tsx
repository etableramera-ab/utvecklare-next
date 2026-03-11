'use client'
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/lib/supabase/client";

interface AdRow {
  id: string;
  title: string;
  advertiser_name: string;
  impressions: number;
  clicks: number;
  cost_model: string;
  cost_amount: number;
}

interface Props {
  ad: AdRow;
  onClose: () => void;
}

const AdStatsModal = ({ ad, onClose }: Props) => {
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<{ page: string; count: number }[]>([]);
  const [recentClicks, setRecentClicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [impRes, clickRes, clickList] = await Promise.all([
        supabase.from("ad_impressions").select("created_at, page_url").eq("ad_id", ad.id).gte("created_at", thirtyDaysAgo),
        supabase.from("ad_clicks").select("created_at, page_url").eq("ad_id", ad.id).gte("created_at", thirtyDaysAgo),
        supabase.from("ad_clicks").select("created_at, page_url, session_id").eq("ad_id", ad.id).order("created_at", { ascending: false }).limit(50),
      ]);

      // Daily aggregation
      const dayMap: Record<string, { impressions: number; clicks: number }> = {};
      (impRes.data || []).forEach((r: any) => {
        const day = r.created_at.split("T")[0];
        if (!dayMap[day]) dayMap[day] = { impressions: 0, clicks: 0 };
        dayMap[day].impressions++;
      });
      (clickRes.data || []).forEach((r: any) => {
        const day = r.created_at.split("T")[0];
        if (!dayMap[day]) dayMap[day] = { impressions: 0, clicks: 0 };
        dayMap[day].clicks++;
      });
      setDailyData(
        Object.entries(dayMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, v]) => ({
            date: date.slice(5),
            ...v,
            ctr: v.impressions > 0 ? Number(((v.clicks / v.impressions) * 100).toFixed(1)) : 0,
          }))
      );

      // Top pages
      const pageCount: Record<string, number> = {};
      (impRes.data || []).forEach((r: any) => {
        const p = r.page_url || "/";
        pageCount[p] = (pageCount[p] || 0) + 1;
      });
      setTopPages(
        Object.entries(pageCount)
          .map(([page, count]) => ({ page, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      );

      setRecentClicks(clickList.data || []);
      setLoading(false);
    };
    fetchStats();
  }, [ad.id]);

  const estimatedRevenue = (() => {
    if (ad.cost_model === "flat") return ad.cost_amount;
    if (ad.cost_model === "cpm") return Math.floor((ad.impressions / 1000) * ad.cost_amount);
    if (ad.cost_model === "cpc") return ad.clicks * ad.cost_amount;
    return 0;
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-card border border-border rounded-xl w-full max-w-3xl mx-4 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">{ad.title}</h2>
            <p className="text-sm text-muted-foreground">{ad.advertiser_name} · Beräknad intäkt: {estimatedRevenue.toLocaleString("sv-SE")} SEK</p>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground animate-pulse">Laddar statistik...</div>
          ) : (
            <>
              {/* Stat summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-background border border-border text-center">
                  <p className="text-2xl font-bold text-foreground">{ad.impressions.toLocaleString("sv-SE")}</p>
                  <p className="text-xs text-muted-foreground">Impressions</p>
                </div>
                <div className="p-4 rounded-lg bg-background border border-border text-center">
                  <p className="text-2xl font-bold text-foreground">{ad.clicks.toLocaleString("sv-SE")}</p>
                  <p className="text-xs text-muted-foreground">Klick</p>
                </div>
                <div className="p-4 rounded-lg bg-background border border-border text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : "0.0"}%
                  </p>
                  <p className="text-xs text-muted-foreground">CTR</p>
                </div>
              </div>

              {/* Charts */}
              {dailyData.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Impressions & Klick (30 dagar)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                      <Line type="monotone" dataKey="impressions" stroke="hsl(var(--primary))" strokeWidth={2} name="Impressions" dot={false} />
                      <Line type="monotone" dataKey="clicks" stroke="#22d3ee" strokeWidth={2} name="Klick" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top pages */}
              {topPages.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Bästa sidor</h3>
                  <div className="space-y-2">
                    {topPages.map((p) => (
                      <div key={p.page} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground truncate max-w-[300px]">{p.page}</span>
                        <span className="text-foreground font-medium">{p.count} impressions</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent clicks */}
              {recentClicks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Senaste klick</h3>
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left px-3 py-2 text-muted-foreground">Datum</th>
                          <th className="text-left px-3 py-2 text-muted-foreground">Sida</th>
                          <th className="text-left px-3 py-2 text-muted-foreground">Session</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentClicks.map((c: any, i: number) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="px-3 py-2 text-muted-foreground">{new Date(c.created_at).toLocaleString("sv-SE")}</td>
                            <td className="px-3 py-2 text-foreground">{c.page_url || "/"}</td>
                            <td className="px-3 py-2 text-muted-foreground truncate max-w-[120px]">{c.session_id?.slice(0, 8) || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdStatsModal;
