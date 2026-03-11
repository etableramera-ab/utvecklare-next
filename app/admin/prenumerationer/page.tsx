'use client';
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SubRow {
  id: string;
  plan: string;
  status: string;
  monthly_price: number;
  current_period_end: string | null;
  created_at: string;
  company_id: string;
}

const AdminSubscriptions = () => {
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [companies, setCompanies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false });
      const subList = (data as SubRow[]) || [];
      setSubs(subList);

      const companyIds = [...new Set(subList.map(s => s.company_id))];
      if (companyIds.length) {
        const { data: cData } = await supabase.from("companies").select("id, name").in("id", companyIds);
        const map: Record<string, string> = {};
        (cData || []).forEach((c: any) => { map[c.id] = c.name; });
        setCompanies(map);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const totalMRR = subs.filter(s => s.status === "active").reduce((s, sub) => s + sub.monthly_price, 0);

  const planCounts = subs.reduce((acc, s) => {
    if (s.status === "active") acc[s.plan] = (acc[s.plan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(planCounts).map(([plan, count]) => ({ plan, count }));

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-emerald-500/20 text-emerald-400",
      canceled: "bg-muted text-muted-foreground",
      past_due: "bg-destructive/20 text-destructive",
      trialing: "bg-amber-500/20 text-amber-400",
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.canceled}`}>{status}</span>;
  };

  const planBadge = (plan: string) => {
    const colors: Record<string, string> = {
      starter: "bg-muted text-muted-foreground",
      professional: "bg-indigo-500/20 text-indigo-400",
      enterprise: "bg-amber-500/20 text-amber-400",
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${colors[plan] || colors.starter}`}>{plan}</span>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Prenumerationer</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-card border border-border p-6">
            <p className="text-xs text-muted-foreground mb-1">Total MRR</p>
            <p className="text-3xl font-bold text-foreground">{totalMRR.toLocaleString("sv-SE")} SEK</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-6">
            <p className="text-xs text-muted-foreground mb-3">Antal per plan</p>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={chartData}>
                  <XAxis dataKey="plan" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis hide />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground">Ingen data.</p>}
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground animate-pulse">Laddar...</div>
          ) : subs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">Inga prenumerationer ännu.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Företag</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Plan</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">MRR</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Startdatum</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Nästa faktura</th>
                </tr>
              </thead>
              <tbody>
                {subs.map(sub => (
                  <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                    <td className="px-4 py-3 text-foreground font-medium">{companies[sub.company_id] || "—"}</td>
                    <td className="px-4 py-3">{planBadge(sub.plan)}</td>
                    <td className="px-4 py-3">{statusBadge(sub.status)}</td>
                    <td className="px-4 py-3 text-right text-foreground">{sub.monthly_price.toLocaleString("sv-SE")} SEK</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(sub.created_at).toLocaleDateString("sv-SE")}</td>
                    <td className="px-4 py-3 text-muted-foreground">{sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString("sv-SE") : "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border">
                  <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-foreground">Total MRR</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-foreground">{totalMRR.toLocaleString("sv-SE")} SEK</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSubscriptions;
