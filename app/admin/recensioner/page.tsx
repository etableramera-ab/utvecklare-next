'use client';
import { useState, useEffect, useMemo } from "react";
import { Search, Star, Check, Trash2, Shield } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ReviewAdminRow {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_verified: boolean | null;
  created_at: string;
  experience_level: string | null;
  tool_id: string;
  user_id: string;
  tool_name?: string;
  user_name?: string;
}

const AdminReviews = () => {
  const [reviews, setReviews] = useState<ReviewAdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "unverified">("all");

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("tool_reviews")
      .select("*, tools:tool_id(name), profiles:user_id(full_name)")
      .order("created_at", { ascending: false });

    if (data) {
      setReviews(data.map((r: any) => ({
        ...r,
        tool_name: r.tools?.name || "Okänt",
        user_name: r.profiles?.full_name || "Anonym",
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const filtered = useMemo(() => {
    let list = [...reviews];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        (r.title?.toLowerCase().includes(q)) ||
        (r.content?.toLowerCase().includes(q)) ||
        (r.tool_name?.toLowerCase().includes(q)) ||
        (r.user_name?.toLowerCase().includes(q))
      );
    }
    if (filter === "verified") list = list.filter(r => r.is_verified);
    if (filter === "unverified") list = list.filter(r => !r.is_verified);
    return list;
  }, [reviews, search, filter]);

  const toggleVerify = async (id: string, current: boolean) => {
    await supabase.from("tool_reviews").update({ is_verified: !current }).eq("id", id);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, is_verified: !current } : r));
    toast({ title: current ? "Verifiering borttagen" : "Recension verifierad" });
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Vill du verkligen ta bort denna recension?")) return;
    const review = reviews.find(r => r.id === id);
    await supabase.from("tool_reviews").delete().eq("id", id);
    setReviews(prev => prev.filter(r => r.id !== id));

    if (review) {
      const { data: remaining } = await supabase
        .from("tool_reviews")
        .select("rating")
        .eq("tool_id", review.tool_id);
      const count = remaining?.length || 0;
      const avg = count > 0 ? remaining!.reduce((s, r) => s + r.rating, 0) / count : 0;
      await supabase.from("tools").update({
        avg_rating: Math.round(avg * 100) / 100,
        review_count: count,
      }).eq("id", review.tool_id);
    }

    toast({ title: "Recension borttagen" });
  };

  const tabs = [
    { key: "all" as const, label: "Alla" },
    { key: "unverified" as const, label: "Overifierade" },
    { key: "verified" as const, label: "Verifierade" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recensionshantering</h1>
          <p className="text-sm text-muted-foreground mt-1">{reviews.length} recensioner totalt</p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                  filter === t.key ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
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
              placeholder="Sök recension…"
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
            />
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground animate-pulse">Laddar recensioner...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">Inga recensioner hittades.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Verktyg</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Användare</th>
                  <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium">Betyg</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Titel</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium max-w-[300px]">Innehåll</th>
                  <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Datum</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{r.tool_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.user_name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="flex items-center justify-center gap-1 text-warning">
                        <Star className="w-3.5 h-3.5 fill-current" /> {r.rating}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground max-w-[150px] truncate">{r.title || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[300px] truncate">{r.content || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      {r.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                          <Shield className="w-3.5 h-3.5" /> Verifierad
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Overifierad</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(r.created_at).toLocaleDateString("sv-SE")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleVerify(r.id, !!r.is_verified)}
                          className={`p-1.5 rounded-md transition-all ${
                            r.is_verified
                              ? "text-emerald-400 hover:text-muted-foreground hover:bg-accent"
                              : "text-muted-foreground hover:text-emerald-400 hover:bg-emerald-400/10"
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteReview(r.id)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

export default AdminReviews;
