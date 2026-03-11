'use client';
import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AffiliateRow {
  id: string;
  tool_name: string;
  tool_slug: string;
  tool_logo_url: string | null;
  tool_description: string | null;
  affiliate_url: string;
  category: string | null;
  commission_type: string | null;
  commission_value: number | null;
  clicks: number;
  conversions: number;
  revenue_total: number;
  is_active: boolean;
}

const AdminAffiliates = () => {
  const [links, setLinks] = useState<AffiliateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AffiliateRow | null>(null);
  const [statsLink, setStatsLink] = useState<AffiliateRow | null>(null);
  const [clickData, setClickData] = useState<any[]>([]);

  const fetchLinks = async () => {
    const { data } = await supabase.from("affiliate_links").select("*").order("clicks", { ascending: false });
    setLinks((data as AffiliateRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchLinks(); }, []);

  useEffect(() => {
    if (!statsLink) return;
    const fetchClicks = async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase.from("affiliate_clicks")
        .select("clicked_at")
        .eq("affiliate_link_id", statsLink.id)
        .gte("clicked_at", thirtyDaysAgo);
      const dayMap: Record<string, number> = {};
      (data || []).forEach((r: any) => {
        const day = (r.clicked_at || "").split("T")[0];
        dayMap[day] = (dayMap[day] || 0) + 1;
      });
      setClickData(Object.entries(dayMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date: date.slice(5), clicks: count })));
    };
    fetchClicks();
  }, [statsLink]);

  const filtered = links.filter(l => !search || l.tool_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-foreground">Affiliate-länkar</h1>
          <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gradient-bg text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> Ny affiliate-länk
          </Button>
        </div>

        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 max-w-xs">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Sök verktyg…"
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1" />
        </div>

        <div className="rounded-xl bg-card border border-border overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground animate-pulse">Laddar...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Verktyg</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Kategori</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Klick</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Konv.</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Intäkt</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Commission</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(link => (
                  <tr key={link.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {link.tool_logo_url && <img src={link.tool_logo_url} alt="" className="w-6 h-6 rounded" />}
                        <span className="text-foreground font-medium">{link.tool_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{link.category || "—"}</td>
                    <td className="px-4 py-3 text-right text-foreground">{link.clicks.toLocaleString("sv-SE")}</td>
                    <td className="px-4 py-3 text-right text-foreground">{link.conversions}</td>
                    <td className="px-4 py-3 text-right text-foreground">{Number(link.revenue_total).toLocaleString("sv-SE")} SEK</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {link.commission_type === "percentage" ? `${link.commission_value}%` :
                       link.commission_type === "flat" ? `${link.commission_value} SEK` :
                       link.commission_type === "recurring" ? `${link.commission_value} SEK/mån` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${link.is_active ? "text-emerald-400" : "text-muted-foreground"}`}>
                        <span className={`w-2 h-2 rounded-full ${link.is_active ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                        {link.is_active ? "Aktiv" : "Inaktiv"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setStatsLink(link)} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground">Stats</button>
                        <button onClick={() => { setEditing(link); setFormOpen(true); }} className="px-2 py-1 text-xs text-primary hover:underline">Redigera</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {statsLink && (
          <div className="rounded-xl bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{statsLink.tool_name} — Klickstatistik</h3>
              <button onClick={() => setStatsLink(null)} className="text-xs text-muted-foreground hover:text-foreground">Stäng</button>
            </div>
            {clickData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={clickData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                  <Line type="monotone" dataKey="clicks" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-8">Ingen klickdata de senaste 30 dagarna.</p>}
          </div>
        )}
      </div>

      {formOpen && <AffiliateFormModal link={editing} onClose={() => { setFormOpen(false); setEditing(null); }} onSaved={() => { setFormOpen(false); setEditing(null); fetchLinks(); }} />}
    </AdminLayout>
  );
};

const AffiliateFormModal = ({ link, onClose, onSaved }: { link: AffiliateRow | null; onClose: () => void; onSaved: () => void }) => {
  const [form, setForm] = useState({
    tool_name: link?.tool_name || "",
    tool_slug: link?.tool_slug || "",
    tool_logo_url: link?.tool_logo_url || "",
    tool_description: link?.tool_description || "",
    affiliate_url: link?.affiliate_url || "",
    category: link?.category || "",
    commission_type: link?.commission_type || "percentage",
    commission_value: link?.commission_value || 0,
    is_active: link?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.tool_name || !form.tool_slug || !form.affiliate_url) {
      toast({ title: "Fyll i obligatoriska fält", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      tool_name: form.tool_name,
      tool_slug: form.tool_slug,
      tool_logo_url: form.tool_logo_url || null,
      tool_description: form.tool_description || null,
      affiliate_url: form.affiliate_url,
      category: form.category || null,
      commission_type: form.commission_type || null,
      commission_value: form.commission_value || null,
      is_active: form.is_active,
    };
    const { error } = link
      ? await supabase.from("affiliate_links").update(payload).eq("id", link.id)
      : await supabase.from("affiliate_links").insert(payload);
    if (error) toast({ title: "Fel", description: error.message, variant: "destructive" });
    else { toast({ title: link ? "Uppdaterad" : "Skapad" }); onSaved(); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg mx-4 p-6 space-y-4">
        <h2 className="text-lg font-bold text-foreground">{link ? "Redigera" : "Ny"} affiliate-länk</h2>
        <div className="space-y-3">
          {[
            { label: "Verktygsnamn *", key: "tool_name" },
            { label: "Slug *", key: "tool_slug" },
            { label: "Logo-URL", key: "tool_logo_url" },
            { label: "Beskrivning", key: "tool_description" },
            { label: "Affiliate-URL *", key: "affiliate_url" },
            { label: "Kategori", key: "category" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
              <input value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Commission-typ</label>
              <select value={form.commission_type} onChange={e => setForm(f => ({ ...f, commission_type: e.target.value }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                <option value="percentage">Procent</option>
                <option value="flat">Fast belopp</option>
                <option value="recurring">Återkommande</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Värde</label>
              <input type="number" value={form.commission_value} onChange={e => setForm(f => ({ ...f, commission_value: Number(e.target.value) }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4" />
            <span className="text-sm text-foreground">Aktiv</span>
          </label>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="border-border text-foreground">Avbryt</Button>
          <Button onClick={handleSave} disabled={saving} className="gradient-bg text-primary-foreground">
            {saving ? "Sparar..." : "Spara"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAffiliates;
