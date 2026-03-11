'use client'
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Send, CheckCircle2, Lock } from "lucide-react";
import { ROLES, LEVELS, LEVEL_LABELS, CITIES } from "@/hooks/useSalary";

const schema = z.object({
  role: z.string().min(1),
  experience_level: z.string().min(1),
  experience_years: z.number().min(0).max(40),
  city: z.string().min(1),
  monthly_salary: z.number().min(20000).max(200000),
  includes_bonus: z.boolean(),
  bonus_amount: z.number().optional(),
  company_size: z.string().optional(),
  company_type: z.string().optional(),
  remote_policy: z.string().optional(),
  education: z.string().optional(),
});

const SalarySubmissionForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    role: "", experience_level: "", experience_years: "", city: "",
    monthly_salary: "", includes_bonus: false, bonus_amount: "",
    company_size: "", company_type: "", remote_policy: "", education: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: any) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      ...form,
      experience_years: parseInt(form.experience_years) || 0,
      monthly_salary: parseInt(form.monthly_salary) || 0,
      bonus_amount: form.includes_bonus ? parseInt(form.bonus_amount) || undefined : undefined,
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("salary_submissions").insert({
      user_id: user?.id || null,
      role: form.role,
      experience_level: form.experience_level,
      experience_years: parseInt(form.experience_years),
      city: form.city,
      monthly_salary: parseInt(form.monthly_salary),
      includes_bonus: form.includes_bonus,
      bonus_amount: form.includes_bonus && form.bonus_amount ? parseInt(form.bonus_amount) : null,
      company_size: form.company_size || null,
      company_type: form.company_type || null,
      remote_policy: form.remote_policy || null,
      education: form.education || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Kunde inte spara", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <section id="submit-salary">
        <div className="bg-card border border-primary/30 rounded-xl p-8 md:p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">Tack för ditt bidrag! 🙏</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Dina data är helt anonyma och hjälper tusentals AI-utvecklare att förhandla bättre löner.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Vill du se hur din lön står sig? Scrolla upp till lönejämföraren.
          </p>
        </div>
      </section>
    );
  }

  const Field = ({ label, children, name, required }: { label: string; children: React.ReactNode; name: string; required?: boolean }) => (
    <div>
      <Label>{label}{required && " *"}</Label>
      {children}
      {errors[name] && <p className="text-xs text-destructive mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <section id="submit-salary" className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-xl" />
      <div className="relative bg-card border border-border rounded-xl p-6 md:p-8">
        <h2 className="text-2xl font-bold text-foreground mb-1">Bidra till lönestatistiken</h2>
        <p className="text-muted-foreground text-sm mb-6">Hjälp andra AI-utvecklare genom att dela din lönedata anonymt. Alla bidrag är helt anonyma.</p>

        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
          <Field label="Roll" name="role" required>
            <Select value={form.role} onValueChange={(v) => set("role", v)}>
              <SelectTrigger className="mt-1.5 bg-background border-border"><SelectValue placeholder="Välj roll" /></SelectTrigger>
              <SelectContent>
                {[...ROLES, "Annat"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Erfarenhetsnivå" name="experience_level" required>
            <Select value={form.experience_level} onValueChange={(v) => set("experience_level", v)}>
              <SelectTrigger className="mt-1.5 bg-background border-border"><SelectValue placeholder="Välj nivå" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="junior">Junior (0–2 år)</SelectItem>
                <SelectItem value="mid">Mid (3–5 år)</SelectItem>
                <SelectItem value="senior">Senior (6–9 år)</SelectItem>
                <SelectItem value="lead">Lead (10+ år)</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="År av erfarenhet" name="experience_years" required>
            <Input type="number" value={form.experience_years} onChange={(e) => set("experience_years", e.target.value)} className="mt-1.5 bg-background border-border" placeholder="5" min={0} max={40} />
          </Field>

          <Field label="Stad" name="city" required>
            <Select value={form.city} onValueChange={(v) => set("city", v)}>
              <SelectTrigger className="mt-1.5 bg-background border-border"><SelectValue placeholder="Välj stad" /></SelectTrigger>
              <SelectContent>
                {[...CITIES, "Annan"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Månadslön före skatt (SEK)" name="monthly_salary" required>
            <Input type="number" value={form.monthly_salary} onChange={(e) => set("monthly_salary", e.target.value)} className="mt-1.5 bg-background border-border" placeholder="55 000" min={20000} max={200000} />
          </Field>

          <div className="flex items-center gap-3 self-end pb-1">
            <Switch checked={form.includes_bonus} onCheckedChange={(v) => set("includes_bonus", v)} />
            <Label>Inkluderar bonus?</Label>
          </div>

          {form.includes_bonus && (
            <Field label="Årlig bonus (SEK)" name="bonus_amount">
              <Input type="number" value={form.bonus_amount} onChange={(e) => set("bonus_amount", e.target.value)} className="mt-1.5 bg-background border-border" placeholder="50 000" />
            </Field>
          )}

          <Field label="Företagsstorlek" name="company_size">
            <Select value={form.company_size} onValueChange={(v) => set("company_size", v)}>
              <SelectTrigger className="mt-1.5 bg-background border-border"><SelectValue placeholder="Valfritt" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="startup">Startup (&lt;20)</SelectItem>
                <SelectItem value="small">Litet (20–100)</SelectItem>
                <SelectItem value="medium">Medelstort (100–500)</SelectItem>
                <SelectItem value="large">Stort (500–5000)</SelectItem>
                <SelectItem value="enterprise">Enterprise (5000+)</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Företagstyp" name="company_type">
            <Select value={form.company_type} onValueChange={(v) => set("company_type", v)}>
              <SelectTrigger className="mt-1.5 bg-background border-border"><SelectValue placeholder="Valfritt" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="startup">Startup</SelectItem>
                <SelectItem value="scaleup">Scaleup</SelectItem>
                <SelectItem value="enterprise">Storföretag</SelectItem>
                <SelectItem value="consulting">Konsultbolag</SelectItem>
                <SelectItem value="agency">Byrå</SelectItem>
                <SelectItem value="bank_finance">Bank/Finans</SelectItem>
                <SelectItem value="public_sector">Offentlig sektor</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Remote-policy" name="remote_policy">
            <Select value={form.remote_policy} onValueChange={(v) => set("remote_policy", v)}>
              <SelectTrigger className="mt-1.5 bg-background border-border"><SelectValue placeholder="Valfritt" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="office">Kontor</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="remote">Helt remote</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Utbildning" name="education">
            <Select value={form.education} onValueChange={(v) => set("education", v)}>
              <SelectTrigger className="mt-1.5 bg-background border-border"><SelectValue placeholder="Valfritt" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="self_taught">Självlärd</SelectItem>
                <SelectItem value="bachelor">Kandidat</SelectItem>
                <SelectItem value="master">Master</SelectItem>
                <SelectItem value="phd">Doktorsexamen</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <div className="sm:col-span-2">
            <Button type="submit" size="lg" className="w-full gradient-bg text-primary-foreground hover:opacity-90" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Skicka anonymt</>}
            </Button>
          </div>
        </form>

        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <Lock className="w-3.5 h-3.5" />
          Alla bidrag är helt anonyma. Vi sparar ingen personlig information som kan kopplas till dig. Data används enbart i aggregerad form.
        </div>
      </div>
    </section>
  );
};

export default SalarySubmissionForm;
