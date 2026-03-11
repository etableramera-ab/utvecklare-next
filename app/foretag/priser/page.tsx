'use client'
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Check, X, Shield, Clock, FileCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ─── Data ─── */
const plans = [
  {
    name: "Starter",
    monthly: 2990,
    yearlyMonthly: 2390,
    yearly: 28680,
    features: [
      "3 jobbannonser per månad",
      "Grundläggande företagsprofil",
      "Begränsad CV-sökning (10 profiler/mån)",
      "E-postsupport",
      "14 dagars gratis provperiod",
    ],
    cta: "Välj Starter →",
    planId: "starter",
    featured: false,
  },
  {
    name: "Professional",
    monthly: 6990,
    yearlyMonthly: 5590,
    yearly: 67080,
    features: [
      "10 jobbannonser per månad",
      "Utökad företagsprofil med hero-bild",
      "Featured-placering i jobbflödet",
      "Fullständig CV-sökning (obegränsad)",
      "Rekryterings-dashboard med analytics",
      "Sponsrad plats i nyhetsbrev (1/mån)",
      "Prioriterad support",
      "14 dagars gratis provperiod",
    ],
    cta: "Välj Professional →",
    planId: "professional",
    featured: true,
  },
  {
    name: "Enterprise",
    monthly: 14990,
    yearlyMonthly: 11990,
    yearly: 143880,
    features: [
      "Obegränsade jobbannonser",
      "Premium employer branding-sida",
      "Sponsrat innehåll i nyhetsbrev (veckovis)",
      "Dedikerad kontaktperson",
      "Event-partnerskap och co-branding",
      "API-access till kandidatdata",
      "Anpassade rapporter",
      "14 dagars gratis provperiod",
    ],
    cta: "Kontakta oss →",
    planId: "enterprise",
    featured: false,
  },
];

const allFeatures = [
  { label: "Jobbannonser/mån", values: ["3", "10", "Obegränsat"] },
  { label: "Företagsprofil", values: ["Grundläggande", "Utökad", "Premium"] },
  { label: "Featured-placering", values: [false, true, true] },
  { label: "CV-sökning", values: ["10/mån", "Obegränsad", "Obegränsad"] },
  { label: "Analytics-dashboard", values: [false, true, true] },
  { label: "Nyhetsbrevs-sponsring", values: [false, "1/mån", "Veckovis"] },
  { label: "Dedikerad kontaktperson", values: [false, false, true] },
  { label: "Event-partnerskap", values: [false, false, true] },
  { label: "API-access", values: [false, false, true] },
  { label: "Anpassade rapporter", values: [false, false, true] },
  { label: "E-postsupport", values: [true, true, true] },
  { label: "Prioriterad support", values: [false, true, true] },
];

const faqs = [
  { q: "Hur fungerar provperioden?", a: "Alla planer inkluderar 14 dagars gratis provperiod. Du får full tillgång till alla funktioner i din valda plan. Ingen betalning krävs förrän provperioden är slut, och du kan avbryta när som helst utan kostnad." },
  { q: "Kan jag byta plan?", a: "Ja, du kan uppgradera eller nedgradera din plan när som helst. Vid uppgradering aktiveras det nya paketet direkt och mellanskillnaden faktureras proportionellt. Vid nedgradering gäller det nya paketet vid nästa faktureringsperiod." },
  { q: "Hur betalar jag?", a: "Vi accepterar alla vanliga betalkort samt faktura för årsbetalning. Alla priser är exklusive moms. Med årsbetalning sparar du 20%." },
  { q: "Vad händer om jag avslutar?", a: "Du behåller tillgång till alla funktioner till slutet av din betalda period. Dina jobbannonser förblir aktiva under resterande tid. Du kan återaktivera din prenumeration när som helst." },
  { q: "Finns det någon bindningstid?", a: "Nej, inga bindningstider. Du kan avsluta ditt abonnemang när som helst. Med årsbetalning sparar du 20%, men även den kan avslutas med proportionell återbetalning." },
  { q: "Ingår GDPR-stöd?", a: "Ja, alla paket är GDPR-kompatibla. Vi erbjuder databehandlingsavtal (DPA), dataexport och full transparens kring hur kandidatdata hanteras." },
];

const PricingPage = () => {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-16">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center">
          <nav className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">Hem</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/foretag" className="hover:text-foreground transition-colors">Företag</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Priser</span>
          </nav>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Välj rätt paket för ert team
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Alla paket inkluderar 14 dagars gratis provperiod. Ingen bindningstid.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <Label htmlFor="billing" className={`text-sm ${!yearly ? "text-foreground" : "text-muted-foreground"}`}>
              Månad
            </Label>
            <Switch id="billing" checked={yearly} onCheckedChange={setYearly} />
            <Label htmlFor="billing" className={`text-sm ${yearly ? "text-foreground" : "text-muted-foreground"}`}>
              År
            </Label>
            {yearly && (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Spara 20%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="container mx-auto px-4 -mt-8 pb-16">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((p) => {
            const price = yearly ? p.yearlyMonthly : p.monthly;
            const billingParam = yearly ? "yearly" : "monthly";
            const href = p.planId === "enterprise"
              ? "/foretag#kontakt"
              : `/checkout?plan=${p.planId}&billing=${billingParam}`;
            return (
              <div
                key={p.name}
                className={`rounded-xl p-6 md:p-8 border relative ${
                  p.featured
                    ? "border-primary/50 bg-card shadow-[var(--glow-primary)] md:scale-105 z-10"
                    : "border-border bg-card"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 gradient-bg text-primary-foreground text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    POPULÄRAST
                  </span>
                )}
                <h3 className="text-xl font-bold text-foreground mb-1">{p.name}</h3>
                <div className="mb-6 mt-4">
                  <span className="text-4xl font-bold text-foreground">
                    {price.toLocaleString("sv-SE")}
                  </span>
                  <span className="text-sm text-muted-foreground"> SEK/mån</span>
                  {yearly && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {p.yearly.toLocaleString("sv-SE")} SEK/år
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${p.featured ? "gradient-bg text-primary-foreground hover:opacity-90" : ""}`}
                  variant={p.featured ? "default" : "outline"}
                  size="lg"
                  asChild
                >
                  <Link href={href}>{p.cta}</Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Included in all */}
        <p className="text-center text-sm text-muted-foreground mt-12 max-w-2xl mx-auto">
          Alla planer inkluderar: 14 dagars gratis provperiod · Ingen bindningstid · Avsluta när du vill · GDPR-kompatibelt
        </p>
        <div className="flex flex-wrap justify-center gap-6 mt-4 text-sm text-muted-foreground">
          {[
            { icon: Clock, text: "14 dagars gratis provperiod" },
            { icon: FileCheck, text: "Ingen bindningstid" },
            { icon: Shield, text: "GDPR-kompatibelt" },
          ].map((item) => (
            <span key={item.text} className="flex items-center gap-1.5">
              <item.icon className="w-4 h-4 text-primary" />
              {item.text}
            </span>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="bg-card/50 py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Jämför alla funktioner</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Funktion</th>
                  {plans.map((p) => (
                    <th key={p.name} className={`text-center py-3 px-4 font-semibold ${p.featured ? "text-primary" : "text-foreground"}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allFeatures.map((f) => (
                  <tr key={f.label} className="border-b border-border/50">
                    <td className="py-3 px-4 text-muted-foreground">{f.label}</td>
                    {f.values.map((v, i) => (
                      <td key={i} className="text-center py-3 px-4">
                        {typeof v === "boolean" ? (
                          v ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                        ) : (
                          <span className="text-foreground font-medium">{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-border">
                  <td className="py-4 px-4 font-semibold text-foreground">Pris/mån</td>
                  {plans.map((p) => {
                    const price = yearly ? p.yearlyMonthly : p.monthly;
                    return (
                      <td key={p.name} className={`text-center py-4 px-4 font-bold ${p.featured ? "text-primary" : "text-foreground"}`}>
                        {price.toLocaleString("sv-SE")} SEK
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <h2 className="text-2xl font-bold text-foreground text-center mb-10">Vanliga frågor om priser</h2>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Bottom CTA */}
      <section className="bg-card/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Redo att börja rekrytera?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Starta din gratis provperiod idag och nå tusentals kvalificerade AI-utvecklare.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="gradient-bg text-primary-foreground hover:opacity-90" asChild>
              <Link href="/checkout?plan=professional">Starta gratis provperiod →</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-border" asChild>
              <Link href="/foretag#kontakt">Kontakta oss</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;
