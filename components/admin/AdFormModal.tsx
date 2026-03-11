'use client'
import { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import AdBanner from "@/components/ads/AdBanner";

interface AdRow {
  id: string;
  title: string;
  advertiser_name: string;
  advertiser_email: string | null;
  description: string | null;
  image_url: string | null;
  destination_url: string;
  placement: string;
  format: string;
  target_categories: string[];
  target_pages: string[];
  start_date: string;
  end_date: string;
  cost_model: string;
  cost_amount: number;
  priority: number;
  is_active: boolean;
}

const PLACEMENTS = ["leaderboard", "sidebar", "in-feed", "between-sections", "sticky-sidebar", "article-bottom"];
const FORMATS = ["image", "text", "sponsored-card"];
const COST_MODELS = [
  { value: "flat", label: "Fastpris" },
  { value: "cpm", label: "CPM (per 1000 visningar)" },
  { value: "cpc", label: "CPC (per klick)" },
];
const CATEGORIES = ["Maskininlärning", "NLP & LLM", "Datorseende", "MLOps & Infrastruktur", "Karriär & Lön", "Nybörjarguider", "AI-nyheter"];
const PAGES = ["home", "jobs", "job-detail", "articles", "article-detail", "tools", "events", "community"];

interface Props {
  ad: AdRow | null;
  onClose: () => void;
  onSaved: () => void;
}

const AdFormModal = ({ ad, onClose, onSaved }: Props) => {
  const [form, setForm] = useState({
    advertiser_name: ad?.advertiser_name || "",
    advertiser_email: ad?.advertiser_email || "",
    title: ad?.title || "",
    description: ad?.description || "",
    image_url: ad?.image_url || "",
    destination_url: ad?.destination_url || "",
    placement: ad?.placement || "sidebar",
    format: ad?.format || "image",
    target_categories: ad?.target_categories || [],
    target_pages: ad?.target_pages || [],
    start_date: ad?.start_date || new Date().toISOString().split("T")[0],
    end_date: ad?.end_date || "",
    cost_model: ad?.cost_model || "flat",
    cost_amount: ad?.cost_amount || 0,
    priority: ad?.priority || 0,
    is_active: ad?.is_active ?? true,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("ad-images").upload(path, file);
    if (error) {
      toast({ title: "Uppladdning misslyckades", description: error.message, variant: "destructive" });
    } else {
      const { data } = supabase.storage.from("ad-images").getPublicUrl(path);
      setForm(f => ({ ...f, image_url: data.publicUrl }));
    }
    setUploading(false);
  };

  const toggleChip = (field: "target_categories" | "target_pages", value: string) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((v: string) => v !== value)
        : [...f[field], value],
    }));
  };

  const handleSave = async () => {
    if (!form.title || !form.destination_url || !form.advertiser_name || !form.end_date) {
      toast({ title: "Fyll i alla obligatoriska fält", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      advertiser_name: form.advertiser_name,
      advertiser_email: form.advertiser_email || null,
      title: form.title,
      description: form.description || null,
      image_url: form.image_url || null,
      destination_url: form.destination_url,
      placement: form.placement,
      format: form.format,
      target_categories: form.target_categories,
      target_pages: form.target_pages,
      start_date: form.start_date,
      end_date: form.end_date,
      cost_model: form.cost_model,
      cost_amount: form.cost_amount,
      priority: form.priority,
      is_active: form.is_active,
    };

    const { error } = ad
      ? await supabase.from("ads").update(payload).eq("id", ad.id)
      : await supabase.from("ads").insert(payload);

    if (error) {
      toast({ title: "Fel vid sparande", description: error.message, variant: "destructive" });
    } else {
      toast({ title: ad ? "Annons uppdaterad" : "Annons skapad" });
      onSaved();
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-card border border-border rounded-xl w-full max-w-3xl mx-4 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">{ad ? "Redigera annons" : "Skapa ny annons"}</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Row: name + email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Annonsörnamn *</label>
              <input value={form.advertiser_name} onChange={e => setForm(f => ({ ...f, advertiser_name: e.target.value }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">E-post</label>
              <input value={form.advertiser_email} onChange={e => setForm(f => ({ ...f, advertiser_email: e.target.value }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Titel *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Beskrivning</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none" />
          </div>

          {/* Image */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Bild</label>
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="text-xs text-muted-foreground" />
              {uploading && <span className="text-xs text-primary animate-pulse">Laddar upp...</span>}
            </div>
            {form.image_url && <img src={form.image_url} alt="Preview" className="mt-2 h-20 rounded-lg object-cover" />}
          </div>

          {/* Destination URL */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Destinations-URL *</label>
            <input value={form.destination_url} onChange={e => setForm(f => ({ ...f, destination_url: e.target.value }))}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
          </div>

          {/* Row: placement + format */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Placement</label>
              <select value={form.placement} onChange={e => setForm(f => ({ ...f, placement: e.target.value }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                {PLACEMENTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Format</label>
              <select value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Target categories */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Målkategorier (tom = alla)</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => toggleChip("target_categories", c)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                    form.target_categories.includes(c)
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-accent text-accent-foreground border-border hover:border-primary/50"
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Target pages */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Målsidor (tom = alla)</label>
            <div className="flex flex-wrap gap-1.5">
              {PAGES.map(p => (
                <button key={p} onClick={() => toggleChip("target_pages", p)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                    form.target_pages.includes(p)
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-accent text-accent-foreground border-border hover:border-primary/50"
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Row: dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Startdatum *</label>
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Slutdatum *</label>
              <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
            </div>
          </div>

          {/* Row: cost model + amount + priority */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Prismodell</label>
              <select value={form.cost_model} onChange={e => setForm(f => ({ ...f, cost_model: e.target.value }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                {COST_MODELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Pris (SEK)</label>
              <input type="number" value={form.cost_amount} onChange={e => setForm(f => ({ ...f, cost_amount: Number(e.target.value) }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Prioritet (0-10)</label>
              <input type="number" min={0} max={10} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
            </div>
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
              className="w-4 h-4 rounded border-border" />
            <span className="text-sm text-foreground">Aktiv</span>
          </label>

          {/* Live preview */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Förhandsgranskning</label>
            <div className="bg-background border border-border rounded-lg p-4">
              <PreviewAd form={form} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose} className="border-border text-foreground">Avbryt</Button>
          <Button onClick={handleSave} disabled={saving} className="gradient-bg text-primary-foreground">
            {saving ? "Sparar..." : ad ? "Uppdatera" : "Skapa annons"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Inline preview component
const PreviewAd = ({ form }: { form: any }) => {
  const placement = form.placement as string;

  if (placement === "in-feed") {
    return (
      <div className="p-4 rounded-lg bg-card/80 border border-border relative max-w-sm">
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary">Sponsrad</span>
        {form.image_url && <img src={form.image_url} alt="" className="w-full h-24 object-cover rounded mt-1" />}
        <p className="text-sm font-medium text-foreground mt-2">{form.title || "Annonssrubrik"}</p>
        {form.description && <p className="text-xs text-muted-foreground mt-1">{form.description}</p>}
      </div>
    );
  }

  if (placement === "leaderboard") {
    return (
      <div className="max-w-[728px] mx-auto rounded-lg border border-border overflow-hidden relative">
        <span className="absolute top-1 right-2 text-[10px] text-muted-foreground uppercase tracking-wider z-10">Annons</span>
        {form.image_url ? (
          <img src={form.image_url} alt="" className="w-full h-[60px] object-cover" />
        ) : (
          <div className="px-4 py-3 text-sm text-foreground">{form.title || "Annonstext"}</div>
        )}
      </div>
    );
  }

  // Default sidebar preview
  return (
    <div className="max-w-[300px] rounded-lg border border-border overflow-hidden bg-card">
      <div className="px-3 pt-2 text-[10px] text-muted-foreground uppercase tracking-wider">Annons</div>
      {form.image_url && <img src={form.image_url} alt="" className="w-full aspect-[6/5] object-cover px-3 pt-2 rounded-xl" />}
      <div className="p-3">
        <p className="text-sm font-medium text-foreground">{form.title || "Annonsrubrik"}</p>
        {form.description && <p className="text-xs text-muted-foreground mt-1">{form.description}</p>}
      </div>
    </div>
  );
};

export default AdFormModal;
