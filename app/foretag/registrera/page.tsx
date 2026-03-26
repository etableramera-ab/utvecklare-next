'use client';
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Check, Upload, Building2, CreditCard, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import SEOHead from "@/components/SEOHead";

/* ─── Schemas ─── */
const step1Schema = z.object({
  email: z.string().trim().email("Ogiltig e-postadress").max(255),
  password: z.string().min(8, "Minst 8 tecken").max(72),
  companyName: z.string().trim().min(1, "Företagsnamn krävs").max(100),
});

const step2Schema = z.object({
  description: z.string().trim().max(1000).optional(),
  website: z.string().trim().url("Ogiltig URL").max(255).or(z.literal("")).optional(),
  industry: z.string().min(1, "Välj bransch"),
  size: z.string().min(1, "Välj storlek"),
  location: z.string().trim().min(1, "Ort krävs").max(100),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;

const PLANS = [
  { id: "starter", name: "Starter", price: "2 990", features: ["3 jobbannonser/mån", "Grundläggande profil", "E-postsupport"] },
  { id: "professional", name: "Professional", price: "6 990", features: ["10 jobbannonser/mån", "Featured-placering", "Analytics"], featured: true },
  { id: "enterprise", name: "Enterprise", price: "14 990", features: ["Obegränsade annonser", "Premium branding", "API-access"] },
];

const INDUSTRIES = ["AI/ML", "Fintech", "Healthtech", "E-handel", "SaaS", "Konsult", "Telekom", "Fordon", "Energi", "Övrigt"];
const SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

const STEPS = ["Konto", "Företagsprofil", "Välj paket", "Bekräftelse"];

const CompanyRegisterPage = () => {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user: loggedInUser } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [s1, setS1] = useState<Step1>({ email: "", password: "", companyName: "" });
  const [s1Errors, setS1Errors] = useState<Partial<Record<keyof Step1, string>>>({});

  // Step 2
  const [s2, setS2] = useState<Step2>({ description: "", website: "", industry: "", size: "", location: "" });
  const [s2Errors, setS2Errors] = useState<Partial<Record<keyof Step2, string>>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Step 3
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get("plan") || "starter");

  const progress = ((step + 1) / STEPS.length) * 100;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Filen är för stor", description: "Max 2 MB.", variant: "destructive" });
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const nextStep1 = () => {
    const result = step1Schema.safeParse(s1);
    if (!result.success) {
      const errs: typeof s1Errors = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as keyof Step1] = i.message; });
      setS1Errors(errs);
      return;
    }
    setS1Errors({});
    setStep(1);
  };

  const nextStep2 = () => {
    const result = step2Schema.safeParse(s2);
    if (!result.success) {
      const errs: typeof s2Errors = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as keyof Step2] = i.message; });
      setS2Errors(errs);
      return;
    }
    setS2Errors({});
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Get or create user
      let userId: string;
      if (loggedInUser) {
        // Already logged in — reuse existing account
        userId = loggedInUser.id;
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: s1.email,
          password: s1.password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (authError) throw authError;
        if (!authData.user) throw new Error("Registrering misslyckades");
        userId = authData.user.id;
      }

      // 2. Upload logo if provided
      let logoUrl: string | null = null;
      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        const path = `${userId}/logo.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("company-logos")
          .upload(path, logoFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("company-logos").getPublicUrl(path);
        logoUrl = urlData.publicUrl;
      }

      // 3. Create company record
      const { error: companyError } = await supabase.from("companies").insert({
        user_id: userId,
        name: s1.companyName,
        logo_url: logoUrl,
        description: s2.description || null,
        website: s2.website || null,
        industry: s2.industry,
        size: s2.size,
        location: s2.location,
        plan: selectedPlan,
      });
      if (companyError) throw companyError;

      setStep(3);
      toast({ title: "Registrering klar!", description: "Välkommen till utvecklare.ai" });
    } catch (err: any) {
      toast({ title: "Något gick fel", description: err.message || "Försök igen.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const planInfo = PLANS.find((p) => p.id === selectedPlan) || PLANS[0];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Registrera företag"
        description="Skapa ett företagskonto på utvecklare.ai och börja rekrytera AI-utvecklare."
        canonical="/foretag/registrera"
        noindex
      />
      <Navbar />

      <section className="pt-16">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">Hem</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/foretag" className="hover:text-foreground transition-colors">Företag</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Registrera</span>
          </nav>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Skapa företagskonto</h1>
          <p className="text-muted-foreground mb-8">Steg {step + 1} av {STEPS.length}: {STEPS[step]}</p>

          {/* Progress */}
          <Progress value={progress} className="h-2 mb-8" />

          {/* Step indicators */}
          <div className="flex justify-between mb-10">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < step ? "gradient-bg text-primary-foreground" :
                  i === step ? "border-2 border-primary text-primary" :
                  "border border-border text-muted-foreground"
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-[10px] text-muted-foreground hidden sm:block">{s}</span>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-6 md:p-8">
            {/* Step 1: Account */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="email">E-post *</Label>
                  <Input id="email" type="email" value={s1.email} onChange={(e) => { setS1({ ...s1, email: e.target.value }); setS1Errors({ ...s1Errors, email: undefined }); }} className="mt-1.5 bg-background border-border" maxLength={255} />
                  {s1Errors.email && <p className="text-xs text-destructive mt-1">{s1Errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="password">Lösenord *</Label>
                  <Input id="password" type="password" value={s1.password} onChange={(e) => { setS1({ ...s1, password: e.target.value }); setS1Errors({ ...s1Errors, password: undefined }); }} className="mt-1.5 bg-background border-border" maxLength={72} />
                  {s1Errors.password && <p className="text-xs text-destructive mt-1">{s1Errors.password}</p>}
                </div>
                <div>
                  <Label htmlFor="companyName">Företagsnamn *</Label>
                  <Input id="companyName" value={s1.companyName} onChange={(e) => { setS1({ ...s1, companyName: e.target.value }); setS1Errors({ ...s1Errors, companyName: undefined }); }} className="mt-1.5 bg-background border-border" maxLength={100} />
                  {s1Errors.companyName && <p className="text-xs text-destructive mt-1">{s1Errors.companyName}</p>}
                </div>
                <Button onClick={nextStep1} className="w-full gradient-bg text-primary-foreground hover:opacity-90" size="lg">
                  Fortsätt →
                </Button>
              </div>
            )}

            {/* Step 2: Company Profile */}
            {step === 1 && (
              <div className="space-y-5">
                {/* Logo upload */}
                <div>
                  <Label>Logotyp</Label>
                  <div className="mt-1.5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <label className="cursor-pointer text-sm text-primary hover:underline">
                        Välj bild
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                      </label>
                      <p className="text-xs text-muted-foreground mt-0.5">Max 2 MB. PNG, JPG.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="desc">Beskrivning</Label>
                  <Textarea id="desc" value={s2.description} onChange={(e) => setS2({ ...s2, description: e.target.value })} className="mt-1.5 bg-background border-border" rows={3} maxLength={1000} />
                </div>

                <div>
                  <Label htmlFor="website">Webbplats</Label>
                  <Input id="website" type="url" placeholder="https://" value={s2.website} onChange={(e) => { setS2({ ...s2, website: e.target.value }); setS2Errors({ ...s2Errors, website: undefined }); }} className="mt-1.5 bg-background border-border" maxLength={255} />
                  {s2Errors.website && <p className="text-xs text-destructive mt-1">{s2Errors.website}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Bransch *</Label>
                    <Select value={s2.industry} onValueChange={(v) => { setS2({ ...s2, industry: v }); setS2Errors({ ...s2Errors, industry: undefined }); }}>
                      <SelectTrigger className="mt-1.5 bg-background border-border"><SelectValue placeholder="Välj bransch" /></SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {s2Errors.industry && <p className="text-xs text-destructive mt-1">{s2Errors.industry}</p>}
                  </div>
                  <div>
                    <Label>Storlek *</Label>
                    <Select value={s2.size} onValueChange={(v) => { setS2({ ...s2, size: v }); setS2Errors({ ...s2Errors, size: undefined }); }}>
                      <SelectTrigger className="mt-1.5 bg-background border-border"><SelectValue placeholder="Antal anställda" /></SelectTrigger>
                      <SelectContent>
                        {SIZES.map((s) => <SelectItem key={s} value={s}>{s} anställda</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {s2Errors.size && <p className="text-xs text-destructive mt-1">{s2Errors.size}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Ort *</Label>
                  <Input id="location" value={s2.location} onChange={(e) => { setS2({ ...s2, location: e.target.value }); setS2Errors({ ...s2Errors, location: undefined }); }} className="mt-1.5 bg-background border-border" maxLength={100} />
                  {s2Errors.location && <p className="text-xs text-destructive mt-1">{s2Errors.location}</p>}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)} className="border-border">Tillbaka</Button>
                  <Button onClick={nextStep2} className="flex-1 gradient-bg text-primary-foreground hover:opacity-90" size="lg">Fortsätt →</Button>
                </div>
              </div>
            )}

            {/* Step 3: Plan selection */}
            {step === 2 && (
              <div className="space-y-6">
                <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="space-y-3">
                  {PLANS.map((p) => (
                    <label
                      key={p.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedPlan === p.id
                          ? "border-primary/50 bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <RadioGroupItem value={p.id} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{p.name}</span>
                          {p.featured && (
                            <span className="gradient-bg text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">POPULÄRAST</span>
                          )}
                        </div>
                        <p className="text-lg font-bold text-foreground mt-0.5">{p.price} <span className="text-sm font-normal text-muted-foreground">SEK/mån</span></p>
                        <ul className="mt-2 space-y-1">
                          {p.features.map((f) => (
                            <li key={f} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Check className="w-3.5 h-3.5 text-emerald-400" />{f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </label>
                  ))}
                </RadioGroup>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="border-border">Tillbaka</Button>
                  <Button onClick={() => setStep(3)} className="flex-1 gradient-bg text-primary-foreground hover:opacity-90" size="lg">Fortsätt →</Button>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 3 && !loading && (
              <div className="space-y-6">
                <h3 className="font-semibold text-foreground text-lg">Sammanfattning</h3>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">E-post</span>
                    <span className="text-foreground font-medium">{loggedInUser?.email ?? s1.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Företag</span>
                    <span className="text-foreground font-medium">{s1.companyName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Bransch</span>
                    <span className="text-foreground font-medium">{s2.industry}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Ort</span>
                    <span className="text-foreground font-medium">{s2.location}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Paket</span>
                    <span className="text-foreground font-medium">{planInfo.name} — {planInfo.price} SEK/mån</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Genom att registrera dig godkänner du våra villkor. Du startar med 14 dagars gratis provperiod.
                </p>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="border-border">Tillbaka</Button>
                  <Button onClick={handleSubmit} disabled={loading} className="flex-1 gradient-bg text-primary-foreground hover:opacity-90" size="lg">
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Starta gratis provperiod →
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const CompanyRegisterPageWithSuspense = () => (
  <Suspense>
    <CompanyRegisterPage />
  </Suspense>
);

export default CompanyRegisterPageWithSuspense;
