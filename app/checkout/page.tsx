'use client';
import { Suspense } from 'react';

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, Shield, Clock, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";

const PLAN_INFO: Record<string, { name: string; monthly: number; yearly: number; features: string[] }> = {
  starter: {
    name: "Starter",
    monthly: 2990,
    yearly: 28680,
    features: ["3 jobbannonser/mån", "Grundläggande företagsprofil", "Begränsad CV-sökning (10/mån)", "E-postsupport"],
  },
  professional: {
    name: "Professional",
    monthly: 6990,
    yearly: 67080,
    features: ["10 jobbannonser/mån", "Utökad företagsprofil", "Featured-placering", "Fullständig CV-sökning", "Rekryterings-dashboard", "Prioriterad support"],
  },
  enterprise: {
    name: "Enterprise",
    monthly: 14990,
    yearly: 143880,
    features: ["Obegränsade jobbannonser", "Premium employer branding", "Sponsrat nyhetsbrev", "Dedikerad kontaktperson", "Event-partnerskap", "API-access"],
  },
};

const CheckoutPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const planId = searchParams.get("plan") || "starter";
  const billing = searchParams.get("billing") || "monthly";
  const plan = PLAN_INFO[planId] || PLAN_INFO.starter;
  const isYearly = billing === "yearly";
  const monthlyPrice = isYearly ? Math.round(plan.yearly / 12) : plan.monthly;

  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/logga-in?return_url=${encodeURIComponent(`/checkout?plan=${planId}&billing=${billing}`)}`);
      return;
    }
    supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          router.push("/foretag/registrera");
          return;
        }
        setCompany(data);
        setLoading(false);
      });
  }, [user, authLoading]);

  const handleStartTrial = async () => {
    if (!company || !user) return;
    setSubmitting(true);

    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);

    const { error: subError } = await supabase.from("subscriptions").insert({
      company_id: company.id,
      plan: planId,
      status: "trialing",
      monthly_price: monthlyPrice,
      trial_end: trialEnd.toISOString(),
      current_period_start: new Date().toISOString(),
      current_period_end: trialEnd.toISOString(),
    });

    if (subError) {
      toast({ title: "Något gick fel", description: subError.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    await supabase.from("companies").update({ plan: planId, plan_started_at: new Date().toISOString() }).eq("id", company.id);

    await supabase.from("revenue_log").insert({
      source: "subscription",
      amount: 0,
      description: `Trial started: ${plan.name} (${isYearly ? "yearly" : "monthly"})`,
      reference_type: "subscription",
    });

    toast({ title: "Välkommen!", description: "Din 14-dagars provperiod har börjat." });
    router.push("/dashboard");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Checkout"
        description="Bekräfta din plan och starta din provperiod på utvecklare.ai."
        canonical="/checkout"
        noindex
      />
      <Navbar />
      <section className="pt-16">
        <div className="container mx-auto px-4 py-12 max-w-lg">
          <Button variant="ghost" className="mb-6 text-muted-foreground" onClick={() => router.push("/foretag/priser")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Tillbaka till priser
          </Button>

          <div className="bg-card border border-border rounded-xl p-6 md:p-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">Bekräfta din plan</h1>
            <p className="text-muted-foreground text-sm mb-6">Starta gratis — ingen betalning krävs nu.</p>

            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Företag</span>
                <span className="text-foreground font-medium">{company?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Plan</span>
                <span className="text-foreground font-medium">{plan.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Pris efter provperiod</span>
                <span className="text-foreground font-medium">
                  {monthlyPrice.toLocaleString("sv-SE")} SEK/mån
                  {isYearly && <span className="text-muted-foreground font-normal"> (faktureras årligen)</span>}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Provperiod</span>
                <span className="text-emerald-400 font-medium">14 dagar gratis</span>
              </div>
            </div>

            <div className="bg-accent/50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-foreground mb-2">Ingår i {plan.name}:</p>
              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-6">
              <Shield className="w-4 h-4 text-primary shrink-0" />
              <span>Ingen bindningstid. Avsluta när du vill. GDPR-kompatibelt.</span>
            </div>

            <Button
              className="w-full gradient-bg text-primary-foreground hover:opacity-90"
              size="lg"
              onClick={handleStartTrial}
              disabled={submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Börja provperiod →
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              Genom att starta godkänner du våra{" "}
              <Link href="/villkor" className="text-primary hover:underline">villkor</Link>.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

const CheckoutPageWithSuspense = () => (
  <Suspense>
    <CheckoutPage />
  </Suspense>
);

export default CheckoutPageWithSuspense;
