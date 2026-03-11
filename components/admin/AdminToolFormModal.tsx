'use client'
import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { TOOL_CATEGORIES } from "@/hooks/useTools";

interface Props {
  toolId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

interface AffiliateOption {
  id: string;
  tool_name: string;
}

const PRICING_MODELS = ["free", "freemium", "paid", "open-source", "enterprise"];

const AdminToolFormModal = ({ toolId, onClose, onSaved }: Props) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateOption[]>([]);

  const [form, setForm] = useState({
    name: "", slug: "", tagline: "", description: "", long_description: "",
    logo_url: "", website_url: "", category: "LLM & Generativ AI",
    subcategory: "", tags: "", pricing_model: "freemium", pricing_details: "",
    pricing_from: "", platforms: "", languages: "", founded_year: "",
    company_name: "", company_hq: "", pros: "", cons: "", best_for: "",
    alternatives: "", affiliate_link_id: "", affiliate_url: "",
    is_featured: false, is_editors_choice: false, is_published: true,
  });

  useEffect(() => {
    supabase.from("affiliate_links").select("id, tool_name").eq("is_active", true)
      .then(({ data }) => setAffiliateLinks((data as AffiliateOption[]) || []));

    if (toolId) {
      setLoading(true);
      supabase.from("tools").select("*").eq("id", toolId).single()
        .then(({ data }) => {
          if (data) {
            setForm({
              name: data.name || "", slug: data.slug || "",
              tagline: data.tagline || "", description: data.description || "",
              long_description: data.long_description || "", logo_url: data.logo_url || "",
              website_url: data.website_url || "", category: data.category || "",
              subcategory: data.subcategory || "", tags: (data.tags || []).join(", "),
              pricing_model: data.pricing_model || "freemium",
              pricing_details: data.pricing_details || "", pricing_from: data.pricing_from || "",
              platforms: (data.platforms || []).join(", "), languages: (data.languages || []).join(", "),
              founded_year: data.founded_year?.toString() || "",
              company_name: data.company_name || "", company_hq: data.company_hq || "",
              pros: (data.pros || []).join("\n"), cons: (data.cons || []).join("\n"),
              best_for: data.best_for || "", alternatives: (data.alternatives || []).join(", "),
              affiliate_link_id: data.affiliate_link_id || "",
              affiliate_url: data.affiliate_url || "",
              is_featured: data.is_featured, is_editors_choice: !!data.is_editors_choice,
              is_published: data.is_published !== false,
            });
          }
          setLoading(false);
        });
    }
  }, [toolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug || !form.category) {
      toast({ title: "Fyll i obligatoriska fält", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      name: form.name, slug: form.slug, tagline: form.tagline || null,
      description: form.description || null, long_description: form.long_description || null,
      logo_url: form.logo_url || null, website_url: form.website_url || null,
      category: form.category, subcategory: form.subcategory || null,
      tags: form.tags ? form.tags.split(",").map(s => s.trim()).filter(Boolean) : [],
      pricing_model: form.pricing_model, pricing_details: form.pricing_details || null,
      pricing_from: form.pricing_from || null,
      platforms: form.platforms ? form.platforms.split(",").map(s => s.trim()).filter(Boolean) : [],
      languages: form.languages ? form.languages.split(",").map(s => s.trim()).filter(Boolean) : [],
      founded_year: form.founded_year ? parseInt(form.founded_year) : null,
      company_name: form.company_name || null, company_hq: form.company_hq || null,
      pros: form.pros ? form.pros.split("\n").map(s => s.trim()).filter(Boolean) : [],
      cons: form.cons ? form.cons.split("\n").map(s => s.trim()).filter(Boolean) : [],
      best_for: form.best_for || null,
      alternatives: form.alternatives ? form.alternatives.split(",").map(s => s.trim()).filter(Boolean) : [],
      affiliate_link_id: form.affiliate_link_id || null,
      affiliate_url: form.affiliate_url || null,
      is_featured: form.is_featured, is_editors_choice: form.is_editors_choice,
      is_published: form.is_published,
    };

    if (toolId) {
      const { error } = await supabase.from("tools").update(payload).eq("id", toolId);
      if (error) { toast({ title: "Fel vid uppdatering", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Verktyg uppdaterat" }); onSaved(); }
    } else {
      const { error } = await supabase.from("tools").insert(payload);
      if (error) { toast({ title: "Fel vid skapande", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Verktyg skapat" }); onSaved(); }
    }
    setSaving(false);
  };

  const updateField = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const categories = TOOL_CATEGORIES.filter(c => c.slug !== "alla").map(c => c.label);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-y-auto py-8 px-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">{toolId ? "Redigera verktyg" : "Nytt verktyg"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Namn *</Label><Input value={form.name} onChange={e => updateField("name", e.target.value)} /></div>
              <div><Label>Slug *</Label><Input value={form.slug} onChange={e => updateField("slug", e.target.value)} /></div>
            </div>

            <div><Label>Tagline</Label><Input value={form.tagline} onChange={e => updateField("tagline", e.target.value)} /></div>
            <div><Label>Beskrivning</Label><Textarea value={form.description} onChange={e => updateField("description", e.target.value)} rows={2} /></div>
            <div><Label>Lång beskrivning (Markdown)</Label><Textarea value={form.long_description} onChange={e => updateField("long_description", e.target.value)} rows={6} /></div>

            <div className="grid grid-cols-2 gap-4">
              <div><Label>Logotyp URL</Label><Input value={form.logo_url} onChange={e => updateField("logo_url", e.target.value)} /></div>
              <div><Label>Webbplats URL</Label><Input value={form.website_url} onChange={e => updateField("website_url", e.target.value)} /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Kategori *</Label>
                <select value={form.category} onChange={e => updateField("category", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label>Prismodell</Label>
                <select value={form.pricing_model} onChange={e => updateField("pricing_model", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {PRICING_MODELS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div><Label>Pris från</Label><Input value={form.pricing_from} onChange={e => updateField("pricing_from", e.target.value)} placeholder="$20/mån" /></div>
              <div><Label>Grundat år</Label><Input value={form.founded_year} onChange={e => updateField("founded_year", e.target.value)} type="number" /></div>
              <div><Label>Subcategory</Label><Input value={form.subcategory} onChange={e => updateField("subcategory", e.target.value)} /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><Label>Företag</Label><Input value={form.company_name} onChange={e => updateField("company_name", e.target.value)} /></div>
              <div><Label>HQ</Label><Input value={form.company_hq} onChange={e => updateField("company_hq", e.target.value)} /></div>
            </div>

            <div><Label>Tags (kommaseparerade)</Label><Input value={form.tags} onChange={e => updateField("tags", e.target.value)} placeholder="LLM, Python, AI" /></div>
            <div><Label>Plattformar (kommaseparerade)</Label><Input value={form.platforms} onChange={e => updateField("platforms", e.target.value)} placeholder="Web, macOS, Linux" /></div>
            <div><Label>Språk (kommaseparerade)</Label><Input value={form.languages} onChange={e => updateField("languages", e.target.value)} placeholder="Python, JavaScript" /></div>

            <div><Label>Fördelar (en per rad)</Label><Textarea value={form.pros} onChange={e => updateField("pros", e.target.value)} rows={3} /></div>
            <div><Label>Nackdelar (en per rad)</Label><Textarea value={form.cons} onChange={e => updateField("cons", e.target.value)} rows={3} /></div>
            <div><Label>Bäst för</Label><Input value={form.best_for} onChange={e => updateField("best_for", e.target.value)} /></div>
            <div><Label>Alternativ (slugs, kommaseparerade)</Label><Input value={form.alternatives} onChange={e => updateField("alternatives", e.target.value)} /></div>
            <div><Label>Prisdetaljer</Label><Textarea value={form.pricing_details} onChange={e => updateField("pricing_details", e.target.value)} rows={2} /></div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Affiliate-länk</Label>
                <select value={form.affiliate_link_id} onChange={e => updateField("affiliate_link_id", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Ingen</option>
                  {affiliateLinks.map(a => <option key={a.id} value={a.id}>{a.tool_name}</option>)}
                </select>
              </div>
              <div><Label>Affiliate URL (direkt)</Label><Input value={form.affiliate_url} onChange={e => updateField("affiliate_url", e.target.value)} /></div>
            </div>

            <div className="flex items-center gap-8 pt-2">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_featured} onCheckedChange={v => updateField("is_featured", v)} />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_editors_choice} onCheckedChange={v => updateField("is_editors_choice", v)} />
                <Label>Editors Choice</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_published} onCheckedChange={v => updateField("is_published", v)} />
                <Label>Publicerad</Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose}>Avbryt</Button>
              <Button type="submit" disabled={saving} className="gradient-bg text-primary-foreground">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {toolId ? "Spara ändringar" : "Skapa verktyg"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminToolFormModal;
