'use client';
import { useState, useEffect, useMemo } from "react";
import { Search, Download } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Subscriber {
  id: string;
  email: string;
  source: string | null;
  subscribed_at: string;
  is_active: boolean;
}

const COLORS = ["hsl(var(--primary))", "#22d3ee", "#818cf8", "#f59e0b", "#10b981"];

const AdminNewsletter = () => {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("newsletter_subscribers").select("*").order("subscribed_at", { ascending: false })
      .then(({ data }) => {
        setSubs((data as Subscriber[]) || []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    if (!search) return subs;
    return subs.filter(s => s.email.toLowerCase().includes(search.toLowerCase()));
  }, [subs, search]);

  const activeCount = subs.filter(s => s.is_active).length;

  const sourceData = useMemo(() => {
    const map: Record<string, number> = {};
    subs.filter(s => s.is_active).forEach(s => {
      const src = s.source || "website";
      map[src] = (map[src] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [subs]);

  const growthData = useMemo(() => {
    const now = Date.now();
    const weeks: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const end = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
      const label = `v${52 - i}`;
      weeks[label] = subs.filter(s => {
        const d = new Date(s.subscribed_at).getTime();
        return d >= start.getTime() && d < end.getTime();
      }).length;
    }
    return Object.entries(weeks).map(([week, count]) => ({ week, nya: count }));
  }, [subs]);

  const exportCSV = () => {
    const active = subs.filter(s => s.is_active);
    const csv = "email,source,subscribed_at\n" + active.map(s => `${s.email},${s.source || ""},${s.subscribed_at}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `${active.length} prenumeranter exporterade` });
  };

  const sourceBadge = (source: string | null) => {
    const map: Record<string, string> = {
      website: "bg-primary/20 text-primary",
      "kunskapshubb-inline": "bg-cyan-500/20 text-cyan-400",
      "kunskapshubb-sidebar": "bg-indigo-500/20 text-indigo-400",
      "article-bottom": "bg-emerald-500/20 text-emerald-400",
    };
    const s = source || "website";
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[s] || map.website}`}>{s}</span>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-foreground">Nyhetsbrev</h1>
          <Button onClick={exportCSV} variant="outline" className="border-border text-foreground">
            <Download className="w-4 h-4 mr-2" /> Exportera CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-card border border-border p-6">
            <p className="text-xs text-muted-foreground mb-1">Totalt prenumeranter</p>
            <p className="text-4xl font-bold text-foreground">{activeCount.toLocaleString("sv-SE")}</p>
            <p className="text-xs text-muted-foreground mt-1">{subs.length - activeCount} avslutade</p>
          </div>

          <div className="rounded-xl bg-card border border-border p-6">
            <p className="text-xs text-muted-foreground mb-3">Nya per vecka (12 veckor)</p>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={growthData}>
                <Line type="monotone" dataKey="nya" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <XAxis dataKey="week" hide />
                <YAxis hide />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl bg-card border border-border p-6">
            <p className="text-xs text-muted-foreground mb-3">Källfördelning</p>
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={80}>
                <PieChart>
                  <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={35} strokeWidth={0}>
                    {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-xs text-muted-foreground">Ingen data.</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 max-w-xs">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Sök e-post…"
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1" />
        </div>

        <div className="rounded-xl bg-card border border-border overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground animate-pulse">Laddar...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">E-post</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Källa</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Prenumererad</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(sub => (
                  <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                    <td className="px-4 py-3 text-foreground">{sub.email}</td>
                    <td className="px-4 py-3">{sourceBadge(sub.source)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(sub.subscribed_at).toLocaleDateString("sv-SE")}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${sub.is_active ? "text-emerald-400" : "text-muted-foreground"}`}>
                        {sub.is_active ? "Aktiv" : "Avslutad"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNewsletter;
