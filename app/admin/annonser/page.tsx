'use client';
import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Eye } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdFormModal from "@/components/admin/AdFormModal";
import AdStatsModal from "@/components/admin/AdStatsModal";

interface AdRow {
  id: string;
  title: string;
  advertiser_name: string;
  placement: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  impressions: number;
  clicks: number;
  image_url: string | null;
  destination_url: string;
  description: string | null;
  format: string;
  target_categories: string[];
  target_pages: string[];
  cost_model: string;
  cost_amount: number;
  priority: number;
  advertiser_email: string | null;
}

type TabFilter = "all" | "active" | "scheduled" | "ended";

const AdminAds = () => {
  const [ads, setAds] = useState<AdRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabFilter>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdRow | null>(null);
  const [statsAd, setStatsAd] = useState<AdRow | null>(null);

  const fetchAds = async () => {
    const { data } = await supabase
      .from("ads")
      .select("*")
      .order("is_active", { ascending: false })
      .order("created_at", { ascending: false });
    setAds((data as AdRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAds(); }, []);

  const today = new Date().toISOString().split("T")[0];

  const filtered = useMemo(() => {
    let list = [...ads];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a => a.title.toLowerCase().includes(q) || a.advertiser_name.toLowerCase().includes(q));
    }
    if (tab === "active") list = list.filter(a => a.is_active && a.start_date <= today && a.end_date >= today);
    else if (tab === "scheduled") list = list.filter(a => a.start_date > today);
    else if (tab === "ended") list = list.filter(a => a.end_date < today);
    return list;
  }, [ads, tab, search, today]);

  const ctrColor = (imp: number, clk: number) => {
    if (imp === 0) return "text-muted-foreground";
    const ctr = (clk / imp) * 100;
    if (ctr > 2) return "text-emerald-400";
    if (ctr > 1) return "text-amber-400";
    return "text-destructive";
  };

  const handleEdit = (ad: AdRow) => { setEditingAd(ad); setFormOpen(true); };
  const handleCreate = () => { setEditingAd(null); setFormOpen(true); };
  const handleSaved = () => { setFormOpen(false); setEditingAd(null); fetchAds(); };

  const tabs: { key: TabFilter; label: string }[] = [
    { key: "all", label: "Alla" },
    { key: "active", label: "Aktiva" },
    { key: "scheduled", label: "Schemalagda" },
    { key: "ended", label: "Avslutade" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Annonshantering</h1>
            <p className="text-sm text-muted-foreground mt-1">{ads.length} annonser totalt</p>
          </div>
          <Button onClick={handleCreate} className="gradient-bg text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> Skapa ny annons
          </Button>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                  tab === t.key ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 flex-1 max-w-xs">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Sök titel eller annonsör…"
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
            />
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground animate-pulse">Laddar annonser...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">Inga annonser hittades.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Titel</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Placement</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Annonsör</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Period</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Impr.</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Klick</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">CTR</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ad) => {
                  const isLive = ad.is_active && ad.start_date <= today && ad.end_date >= today;
                  const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={ad.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs ${isLive ? "text-emerald-400" : "text-muted-foreground"}`}>
                          <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                          {isLive ? "Aktiv" : ad.end_date < today ? "Avslutad" : "Schemalagd"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">{ad.title}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-accent text-accent-foreground">{ad.placement}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{ad.advertiser_name}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{ad.start_date} – {ad.end_date}</td>
                      <td className="px-4 py-3 text-right text-foreground">{ad.impressions.toLocaleString("sv-SE")}</td>
                      <td className="px-4 py-3 text-right text-foreground">{ad.clicks.toLocaleString("sv-SE")}</td>
                      <td className={`px-4 py-3 text-right font-medium ${ctrColor(ad.impressions, ad.clicks)}`}>{ctr}%</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setStatsAd(ad)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEdit(ad)} className="px-2 py-1 text-xs text-primary hover:underline">
                            Redigera
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {formOpen && <AdFormModal ad={editingAd} onClose={() => { setFormOpen(false); setEditingAd(null); }} onSaved={handleSaved} />}
      {statsAd && <AdStatsModal ad={statsAd} onClose={() => setStatsAd(null)} />}
    </AdminLayout>
  );
};

export default AdminAds;
