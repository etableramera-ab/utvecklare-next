'use client';
import Link from "next/link";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Users, Megaphone, Link2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StatCard {
  label: string;
  value: string;
  change?: number;
  icon: React.ElementType;
}

interface RevenueEntry {
  id: string;
  source: string;
  description: string | null;
  amount: number;
  created_at: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<RevenueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

      const [revenueThisMonth, revenueLastMonth, activeSubs, recentTxns, dailyRevenue] = await Promise.all([
        supabase.from("revenue_log").select("amount, source").gte("created_at", startOfMonth),
        supabase.from("revenue_log").select("amount, source").gte("created_at", startOfLastMonth).lte("created_at", endOfLastMonth),
        supabase.from("subscriptions").select("id").eq("status", "active"),
        supabase.from("revenue_log").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("revenue_log").select("amount, source, created_at").gte("created_at", new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()).order("created_at", { ascending: true }),
      ]);

      const thisMonthTotal = (revenueThisMonth.data || []).reduce((s, r) => s + r.amount, 0);
      const lastMonthTotal = (revenueLastMonth.data || []).reduce((s, r) => s + r.amount, 0);
      const changePct = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

      const adRevenue = (revenueThisMonth.data || []).filter(r => r.source === "ad").reduce((s, r) => s + r.amount, 0);
      const affRevenue = (revenueThisMonth.data || []).filter(r => r.source === "affiliate").reduce((s, r) => s + r.amount, 0);

      setStats([
        { label: "Intäkter denna månad", value: `${thisMonthTotal.toLocaleString("sv-SE")} SEK`, change: Math.round(changePct), icon: DollarSign },
        { label: "Aktiva prenumerationer", value: String((activeSubs.data || []).length), icon: Users },
        { label: "Annonsintäkter", value: `${adRevenue.toLocaleString("sv-SE")} SEK`, icon: Megaphone },
        { label: "Affiliate-intäkter", value: `${affRevenue.toLocaleString("sv-SE")} SEK`, icon: Link2 },
      ]);

      setTransactions((recentTxns.data as RevenueEntry[]) || []);

      const dailyMap: Record<string, { total: number; sub: number; adAff: number }> = {};
      (dailyRevenue.data || []).forEach((r: any) => {
        const day = r.created_at.split("T")[0];
        if (!dailyMap[day]) dailyMap[day] = { total: 0, sub: 0, adAff: 0 };
        dailyMap[day].total += r.amount;
        if (r.source === "subscription") dailyMap[day].sub += r.amount;
        else dailyMap[day].adAff += r.amount;
      });
      setRevenueData(Object.entries(dailyMap).map(([date, v]) => ({ date: date.slice(5), ...v })));

      setLoading(false);
    };
    fetchData();
  }, []);

  const sourceBadge = (source: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      subscription: { label: "Prenumeration", cls: "bg-indigo-500/20 text-indigo-400" },
      ad: { label: "Annons", cls: "bg-cyan-500/20 text-cyan-400" },
      affiliate: { label: "Affiliate", cls: "bg-emerald-500/20 text-emerald-400" },
      job: { label: "Jobb", cls: "bg-amber-500/20 text-amber-400" },
      other: { label: "Övrigt", cls: "bg-muted text-muted-foreground" },
    };
    const m = map[source] || map.other;
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.cls}`}>{m.label}</span>;
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Intäktsöversikt och senaste aktivitet</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(loading ? Array.from({ length: 4 }) : stats).map((stat, i) => {
            if (loading) return <div key={i} className="h-28 rounded-xl bg-card border border-border animate-pulse" />;
            const s = stat as StatCard;
            return (
              <div key={i} className="rounded-xl bg-card border border-border p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <s.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                {s.change !== undefined && s.change !== 0 && (
                  <div className={`flex items-center gap-1 mt-1 text-xs ${s.change > 0 ? "text-emerald-400" : "text-destructive"}`}>
                    {s.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {s.change > 0 ? "+" : ""}{s.change}% vs förra månaden
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-xl bg-card border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">Intäkter senaste 30 dagarna</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} name="Total" dot={false} />
                <Line type="monotone" dataKey="sub" stroke="#818cf8" strokeWidth={1.5} name="Prenumerationer" dot={false} />
                <Line type="monotone" dataKey="adAff" stroke="#22d3ee" strokeWidth={1.5} name="Annonser+Affiliate" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-12 text-center">Ingen intäktsdata att visa ännu.</p>
          )}
        </div>

        <div className="rounded-xl bg-card border border-border">
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-foreground">Senaste transaktioner</h3>
          </div>
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-xs text-muted-foreground font-medium">Datum</th>
                    <th className="text-left px-6 py-3 text-xs text-muted-foreground font-medium">Källa</th>
                    <th className="text-left px-6 py-3 text-xs text-muted-foreground font-medium">Beskrivning</th>
                    <th className="text-right px-6 py-3 text-xs text-muted-foreground font-medium">Belopp</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-3 text-muted-foreground">{new Date(tx.created_at).toLocaleDateString("sv-SE")}</td>
                      <td className="px-6 py-3">{sourceBadge(tx.source)}</td>
                      <td className="px-6 py-3 text-foreground">{tx.description || "—"}</td>
                      <td className="px-6 py-3 text-right font-medium text-foreground">{tx.amount.toLocaleString("sv-SE")} SEK</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">Inga transaktioner ännu.</p>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Hantera annonser", href: "/admin/annonser", icon: Megaphone },
            { label: "Prenumerationer", href: "/admin/prenumerationer", icon: Users },
            { label: "Affiliate-länkar", href: "/admin/affiliates", icon: Link2 },
            { label: "Nyhetsbrev", href: "/admin/nyhetsbrev", icon: DollarSign },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group">
              <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
              <p className="text-sm font-medium text-foreground">{item.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
