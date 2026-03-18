'use client';
import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Star, Eye, Pencil, Trash2, Award, Sparkles } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import AdminToolFormModal from "@/components/admin/AdminToolFormModal";

interface ToolAdminRow {
  id: string;
  name: string;
  slug: string;
  category: string;
  avg_rating: number;
  review_count: number;
  views_count: number | null;
  is_featured: boolean;
  is_editors_choice: boolean | null;
  is_published: boolean | null;
  logo_url: string | null;
  affiliate_link_id: string | null;
}

const AdminTools = () => {
  const [tools, setTools] = useState<ToolAdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingToolId, setEditingToolId] = useState<string | null>(null);

  const fetchTools = async () => {
    const { data } = await supabase
      .from("tools")
      .select("id, name, slug, category, avg_rating, review_count, views_count, is_featured, is_editors_choice, is_published, logo_url, affiliate_link_id")
      .order("created_at", { ascending: false });
    setTools((data as ToolAdminRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchTools(); }, []);

  const filtered = useMemo(() => {
    if (!search) return tools;
    const q = search.toLowerCase();
    return tools.filter(t => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
  }, [tools, search]);

  const toggleField = async (id: string, field: "is_featured" | "is_editors_choice" | "is_published", current: boolean) => {
    await supabase.from("tools").update({ [field]: !current }).eq("id", id);
    setTools(prev => prev.map(t => t.id === id ? { ...t, [field]: !current } : t));
    toast({ title: "Uppdaterat" });
  };

  const deleteTool = async (id: string, name: string) => {
    if (!confirm(`Vill du verkligen ta bort "${name}"?`)) return;
    await supabase.from("tools").delete().eq("id", id);
    setTools(prev => prev.filter(t => t.id !== id));
    toast({ title: "Verktyg borttaget" });
  };

  const handleEdit = (id: string) => { setEditingToolId(id); setFormOpen(true); };
  const handleCreate = () => { setEditingToolId(null); setFormOpen(true); };
  const handleSaved = () => { setFormOpen(false); setEditingToolId(null); fetchTools(); };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Verktygshantering</h1>
            <p className="text-sm text-muted-foreground mt-1">{tools.length} verktyg totalt</p>
          </div>
          <Button onClick={handleCreate} className="gradient-bg text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> Lägg till verktyg
          </Button>
        </div>

        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 max-w-xs">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sök verktyg…"
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
          />
        </div>

        <div className="rounded-xl bg-card border border-border overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground animate-pulse">Laddar verktyg...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">Inga verktyg hittades.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Verktyg</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Kategori</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Betyg</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Recensioner</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Visningar</th>
                  <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium">Featured</th>
                  <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium">Editor</th>
                  <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium">Aktiv</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {t.logo_url ? (
                          <img src={t.logo_url} alt={t.name} className="w-8 h-8 rounded-md bg-white p-0.5 border border-border object-contain" />
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-accent border border-border flex items-center justify-center text-xs font-bold text-foreground">
                            {t.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-foreground">{t.name}</span>
                          {t.affiliate_link_id && <span className="ml-1.5 text-xs text-primary">$</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-accent text-accent-foreground">{t.category}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="flex items-center justify-end gap-1 text-warning">
                        <Star className="w-3.5 h-3.5 fill-current" /> {Number(t.avg_rating).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">{t.review_count}</td>
                    <td className="px-4 py-3 text-right text-foreground">{(t.views_count || 0).toLocaleString("sv-SE")}</td>
                    <td className="px-4 py-3 text-center">
                      <Switch checked={t.is_featured} onCheckedChange={() => toggleField(t.id, "is_featured", t.is_featured)} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Switch checked={!!t.is_editors_choice} onCheckedChange={() => toggleField(t.id, "is_editors_choice", !!t.is_editors_choice)} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Switch checked={t.is_published !== false} onCheckedChange={() => toggleField(t.id, "is_published", t.is_published !== false)} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(t.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteTool(t.id, t.name)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
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

      {formOpen && (
        <AdminToolFormModal
          toolId={editingToolId}
          onClose={() => { setFormOpen(false); setEditingToolId(null); }}
          onSaved={handleSaved}
        />
      )}
    </AdminLayout>
  );
};

export default AdminTools;
