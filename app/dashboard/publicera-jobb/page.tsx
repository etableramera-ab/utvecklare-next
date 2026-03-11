'use client';

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, ArrowLeft, Eye } from "lucide-react";
import { CATEGORIES, EXPERIENCE_LEVELS, CITIES, TECH_TAGS } from "@/data/jobsData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanyPlan } from "@/hooks/useCompanyPlan";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const slugify = (text: string) => {
  const base = text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-åäö]/g, "");
  const rand = Math.random().toString(36).slice(2, 6);
  return `${base}-${rand}`;
};

const PublishJobPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [company, setCompany] = useState<any>(null);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [preview, setPreview] = useState(false);
  const [limitModal, setLimitModal] = useState(false);
  const { canPublishJob, canFeatureJob, plan, jobLimit, activeJobCount } = useCompanyPlan();

  const [form, setForm] = useState({
    title: "",
    category: "",
    experience_level: "",
    description: "",
    location: "",
    work_model: "hybrid",
    salary_min: "",
    salary_max: "",
    hide_salary: false,
    apply_url: "",
    is_featured: false,
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setCompanyLoading(false);
      return;
    }
    supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setCompany(data);
        setCompanyLoading(false);
      });
  }, [user]);

  const handleTagInput = (value: string) => {
    setTagInput(value);
    if (value.length > 0) {
      setTagSuggestions(
        TECH_TAGS.filter(
          (t) =>
            t.toLowerCase().includes(value.toLowerCase()) &&
            !tags.includes(t)
        ).slice(0, 5)
      );
    } else {
      setTagSuggestions([]);
    }
  };

  const addTag = (tag: string) => {
    if (tags.length >= 10 || tags.includes(tag)) return;
    setTags([...tags, tag]);
    setTagInput("");
    setTagSuggestions([]);
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const handlePublish = async () => {
    if (!company) return;
    if (!plan) {
      router.push("/foretag/priser");
      return;
    }
    if (!canPublishJob) {
      setLimitModal(true);
      return;
    }
    if (!form.title.trim() || !form.category || !form.experience_level || !form.description.trim()) {
      toast({ title: "Fyll i alla obligatoriska fält", variant: "destructive" });
      return;
    }

    setPublishing(true);
    const slug = slugify(form.title);

    const { error } = await supabase.from("jobs").insert({
      company_id: company.id,
      title: form.title.trim(),
      slug,
      description: form.description.trim(),
      category: form.category,
      experience_level: form.experience_level,
      tech_tags: tags,
      location: form.location.trim() || "Stockholm",
      work_model: form.work_model,
      salary_min: form.hide_salary ? null : (parseInt(form.salary_min) || null),
      salary_max: form.hide_salary ? null : (parseInt(form.salary_max) || null),
      apply_url: form.apply_url.trim() || null,
      is_featured: form.is_featured,
    });

    setPublishing(false);
    if (error) {
      toast({ title: "Kunde inte publicera", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ditt jobb är nu publicerat!" });
      router.push(`/jobb/${slug}`);
    }
  };

  if (authLoading || companyLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    router.push("/logga-in");
    return null;
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Inget företag kopplat</h1>
          <p className="text-muted-foreground mb-6">Du behöver registrera ett företag först.</p>
          <Button className="gradient-bg text-primary-foreground" onClick={() => router.push("/foretag/registrera")}>
            Registrera företag
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-16">
        <div className="container mx-auto px-4 py-10 max-w-3xl">
          <Button variant="ghost" className="mb-6 text-muted-foreground" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Tillbaka till dashboard
          </Button>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Publicera nytt jobb</h1>
          <p className="text-muted-foreground mb-8">Fyll i uppgifterna nedan för att publicera en jobbannons.</p>

          <div className="space-y-6">
            <div>
              <Label className="text-foreground">Jobbtitel *</Label>
              <Input
                placeholder="t.ex. Senior ML Engineer"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={100}
                className="mt-1"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Kategori *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Välj kategori" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-foreground">Erfarenhetsnivå *</Label>
                <Select value={form.experience_level} onValueChange={(v) => setForm({ ...form, experience_level: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Välj nivå" /></SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-foreground">Beskrivning *</Label>
              <p className="text-xs text-muted-foreground mb-1">Stöder markdown: ## Rubrik, - Lista, **bold**</p>
              <Textarea
                placeholder="Beskriv rollen, ansvarsområden, och vad ni erbjuder..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={10}
                className="mt-1 font-mono text-sm"
              />
            </div>

            <div>
              <Label className="text-foreground">Teknikstack (max 10)</Label>
              <div className="flex flex-wrap gap-1.5 mb-2 mt-1">
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1 pr-1">
                    {t}
                    <button onClick={() => removeTag(t)} className="p-0.5 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="relative">
                <Input
                  placeholder="Skriv teknik + Enter"
                  value={tagInput}
                  onChange={(e) => handleTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  disabled={tags.length >= 10}
                />
                {tagSuggestions.length > 0 && (
                  <div className="absolute z-10 top-full mt-1 w-full bg-card border border-border rounded-md shadow-lg">
                    {tagSuggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => addTag(s)}
                        className="block w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Ort</Label>
                <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Välj ort" /></SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-foreground">Arbetsmodell</Label>
                <Select value={form.work_model} onValueChange={(v) => setForm({ ...form, work_model: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-foreground">Lön (SEK/mån)</Label>
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.hide_salary}
                    onChange={(e) => setForm({ ...form, hide_salary: e.target.checked })}
                    className="rounded border-border"
                  />
                  Visa ej lön
                </label>
              </div>
              {!form.hide_salary && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={form.salary_min}
                    onChange={(e) => setForm({ ...form, salary_min: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={form.salary_max}
                    onChange={(e) => setForm({ ...form, salary_max: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div>
              <Label className="text-foreground">Ansöknings-URL (valfritt)</Label>
              <p className="text-xs text-muted-foreground mb-1">Lämna tomt för att använda det inbyggda ansökningsformuläret</p>
              <Input
                placeholder="https://..."
                value={form.apply_url}
                onChange={(e) => setForm({ ...form, apply_url: e.target.value })}
                className="mt-1"
              />
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <label className={`flex items-center gap-3 p-4 rounded-lg bg-card border border-border ${canFeatureJob ? "cursor-pointer" : "opacity-60 cursor-not-allowed"}`}>
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => canFeatureJob && setForm({ ...form, is_featured: e.target.checked })}
                    disabled={!canFeatureJob}
                    className="rounded border-border"
                  />
                  <div>
                    <span className="text-sm font-medium text-foreground">Gör till utvalt jobb</span>
                    <p className="text-xs text-muted-foreground">Visas överst i jobblistan. Kräver Professional- eller Enterprise-plan.</p>
                  </div>
                </label>
              </TooltipTrigger>
              {!canFeatureJob && (
                <TooltipContent>Uppgradera till Professional för featured-placering</TooltipContent>
              )}
            </Tooltip>

            <Dialog open={limitModal} onOpenChange={setLimitModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Jobbgräns nådd</DialogTitle>
                  <DialogDescription>
                    Du har {activeJobCount} av {jobLimit} aktiva jobbannonser denna månad ({plan}-plan). Uppgradera för fler.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" onClick={() => setLimitModal(false)} className="border-border">Stäng</Button>
                  <Button className="gradient-bg text-primary-foreground flex-1" onClick={() => router.push("/foretag/priser")}>
                    Uppgradera →
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="border-border" onClick={() => setPreview(!preview)}>
                <Eye className="w-4 h-4 mr-2" /> {preview ? "Dölj förhandsgranskning" : "Förhandsgranska"}
              </Button>
              <Button
                className="flex-1 gradient-bg text-primary-foreground hover:opacity-90"
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Publicera jobb
              </Button>
            </div>

            {preview && (
              <div className="p-6 rounded-lg bg-card border border-border mt-4">
                <p className="text-xs text-muted-foreground mb-3">Förhandsgranskning</p>
                <h2 className="text-xl font-bold text-foreground">{form.title || "Jobbtitel"}</h2>
                <p className="text-muted-foreground mt-1">{company.name} · {form.location || "Stockholm"}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-accent text-accent-foreground border border-border">{t}</span>
                  ))}
                </div>
                {form.description && (
                  <div className="mt-4 text-sm text-muted-foreground whitespace-pre-line">
                    {form.description.slice(0, 300)}
                    {form.description.length > 300 ? "…" : ""}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PublishJobPage;
