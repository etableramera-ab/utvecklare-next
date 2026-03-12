'use client'
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronRight, Target, Zap, Award, Building2, Send, ArrowRight,
  Check, UserPlus, FileText, Inbox, Quote, ChevronDown,
} from "lucide-react";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/hooks/useAuth";
import companyHeroBgImg from "@/assets/company-hero-bg.jpg";

const companyHeroBg = companyHeroBgImg.src;

/* ─── Animated counter hook ─── */
function useCounter(target: number, suffix = "", duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { ref, display: `${count.toLocaleString("sv-SE")}${suffix}` };
}

/* ─── Data ─── */
const benefits = [
  { icon: Target, title: "Nå rätt målgrupp", desc: "Alla våra användare är AI-utvecklare, data scientists och ML engineers — inga irrelevanta ansökningar." },
  { icon: Zap, title: "Snabbare rekrytering", desc: "Genomsnittlig tid till första kvalificerade ansökan: 72 timmar. Jämfört med 2+ veckor på traditionella plattformar." },
  { icon: Award, title: "Employer branding", desc: "Visa upp ert företag med detaljerade profiler, teknikstack och företagskultur direkt till er målgrupp." },
];

const steps = [
  { icon: UserPlus, title: "Skapa företagsprofil", desc: "Berätta om ert företag, teknikstack och kultur." },
  { icon: FileText, title: "Publicera jobb", desc: "Skapa en detaljerad jobbannons med AI-specifika krav." },
  { icon: Inbox, title: "Ta emot ansökningar", desc: "Granska och kontakta kandidater direkt i plattformen." },
];

const pricing = [
  {
    name: "Starter",
    price: "Gratis",
    desc: "Perfekt för att komma igång",
    features: ["1 aktiv jobbannons", "Grundläggande företagsprofil", "E-postnotifikationer", "30 dagars publicering"],
    cta: "Kom igång gratis",
    planId: "starter",
    featured: false,
  },
  {
    name: "Professional",
    price: "2 995 kr",
    period: "/månad",
    desc: "För företag som rekryterar aktivt",
    features: ["5 aktiva jobbannonser", "Featured-placering i listan", "Employer branding-sida", "Kandidatfiltrering", "Prioriterad support", "Analytics & statistik"],
    cta: "Välj Professional",
    planId: "professional",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Kontakta oss",
    desc: "Skräddarsydda lösningar",
    features: ["Obegränsade jobbannonser", "Dedikerad account manager", "API-integration med ert ATS", "Custom employer branding", "Event-sponsring", "Kandidatsökning i databas"],
    cta: "Boka demo",
    planId: null,
    featured: false,
  },
];

const testimonials = [
  { quote: "Vi hittade en senior ML Engineer inom 5 dagar. Kvaliteten på kandidaterna var exceptionell jämfört med andra plattformar.", name: "Lisa Andersson", title: "VP of Engineering", company: "TechCorp AB" },
  { quote: "utvecklare.ai har blivit vår primära kanal för AI-rekrytering. Employer branding-funktionen har stärkt vårt varumärke avsevärt.", name: "Johan Berg", title: "Head of Talent", company: "DataFlow Nordic" },
  { quote: "Enkel process, kvalificerade sökande, och fantastisk support. Vi har rekryterat 8 AI-utvecklare via plattformen.", name: "Maria Larsson", title: "CTO", company: "AI Innovations" },
];

const faqs = [
  { q: "Hur lång tid tar det att publicera ett jobb?", a: "Du kan publicera ett jobb på under 5 minuter. Skapa ett konto, fyll i jobbdetaljer och klicka publicera. Annonsen granskas och publiceras inom 1 timme." },
  { q: "Kan vi integrera med vårt befintliga ATS?", a: "Ja, med vårt Enterprise-paket erbjuder vi API-integration med populära ATS-system som Teamtailor, Lever och Greenhouse." },
  { q: "Erbjuder ni employer branding-tjänster?", a: "Ja! Från Professional-paketet och uppåt kan ni skapa en komplett employer branding-sida med er teknikstack, kultur, förmåner och teammedlemmar." },
  { q: "Hur säkerställer ni kvaliteten på kandidaterna?", a: "Vår plattform riktar sig exklusivt till AI- och ML-utvecklare. 85% av våra användare har 3+ års erfarenhet inom AI/ML." },
  { q: "Kan vi testa plattformen innan vi betalar?", a: "Absolut! Vår Starter-plan är helt gratis och inkluderar 1 aktiv jobbannons. Ingen kreditkortsinformation krävs." },
  { q: "Vad händer när en jobbannons löper ut?", a: "Efter 30 dagar (Starter) eller den avtalade perioden kan du enkelt förnya annonsen. Du behåller alltid tillgång till inkomna ansökningar." },
];

/* ─── Form schema ─── */
const contactSchema = z.object({
  name: z.string().trim().min(1, "Namn krävs").max(100),
  company: z.string().trim().min(1, "Företag krävs").max(100),
  email: z.string().trim().email("Ogiltig e-postadress").max(255),
  phone: z.string().trim().max(20).optional(),
  message: z.string().trim().min(1, "Meddelande krävs").max(2000),
});

type ContactForm = z.infer<typeof contactSchema>;

/* ─── Page ─── */
const CompanyPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState<ContactForm>({ name: "", company: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const heroCta = user ? "/dashboard/publicera-jobb" : "/foretag/registrera";

  const stat1 = useCounter(10000, "+");
  const stat2 = useCounter(85, "%");
  const stat3 = useCounter(72, "h");

  const handleChange = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.issues.forEach((i) => {
        const field = i.path[0] as keyof ContactForm;
        if (!fieldErrors[field]) fieldErrors[field] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16">
        <div className="absolute inset-0 z-0">
          <img src={companyHeroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Hitta Sveriges bästa AI-utvecklare
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Nå 10 000+ kvalificerade AI-utvecklare. Publicera jobb, bygg ert employer brand och rekrytera snabbare.
          </p>
          <Button size="lg" className="gradient-bg text-primary-foreground hover:opacity-90" asChild>
            <Link href={heroCta}>Kom igång — Publicera ert första jobb gratis →</Link>
          </Button>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((b) => (
            <div key={b.title} className="text-center p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-4">
                <b.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { ...stat1, label: "Utvecklare i nätverket" },
              { ...stat2, label: "Senior-nivå" },
              { ...stat3, label: "Genomsnittlig tid till första ansökan" },
            ].map((s) => (
              <div key={s.label} ref={s.ref}>
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">{s.display}</div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground text-center mb-12">Hur det fungerar</h2>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((s, i) => (
            <div key={s.title} className="text-center relative">
              <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-xl">
                {i + 1}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute top-7 -right-4 w-8 h-8 text-muted-foreground/30" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground text-center mb-12">Prispaket</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricing.map((p) => (
              <div
                key={p.name}
                className={`rounded-lg p-6 border ${
                  p.featured
                    ? "border-primary/50 bg-card shadow-[var(--glow-primary)] relative"
                    : "border-border bg-card"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-bg text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    POPULÄRAST
                  </span>
                )}
                <h3 className="text-lg font-bold text-foreground mb-1">{p.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{p.desc}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-foreground">{p.price}</span>
                  {p.period && <span className="text-sm text-muted-foreground">{p.period}</span>}
                </div>
                <ul className="space-y-2.5 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${p.featured ? "gradient-bg text-primary-foreground hover:opacity-90" : ""}`}
                  variant={p.featured ? "default" : "outline"}
                  asChild
                >
                  <Link href={
                    p.planId === null
                      ? "#kontakt"
                      : user
                        ? `/checkout?plan=${p.planId}`
                        : "/foretag/registrera"
                  }>{p.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground text-center mb-12">Vad företag säger</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="p-6 rounded-lg bg-card border border-border">
              <Quote className="w-8 h-8 text-primary/30 mb-3" />
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic">"{t.quote}"</p>
              <div>
                <p className="font-semibold text-foreground text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.title}, {t.company}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-card/50 py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground text-center mb-12">Vanliga frågor</h2>
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
        </div>
      </section>

      {/* Contact form */}
      <section className="container mx-auto px-4 py-16 max-w-2xl" id="kontakt">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground text-center mb-3">Vill ni veta mer?</h2>
        <p className="text-muted-foreground text-center mb-10">Boka ett samtal med oss eller skicka en förfrågan.</p>

        {submitted ? (
          <div className="text-center p-8 rounded-lg bg-card border border-border">
            <Check className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">Tack för din förfrågan!</h3>
            <p className="text-sm text-muted-foreground">Vi återkommer inom 24 timmar.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border rounded-lg p-6 md:p-8">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Namn *</Label>
                <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} className="mt-1.5 bg-background border-border" maxLength={100} />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="company">Företag *</Label>
                <Input id="company" value={form.company} onChange={(e) => handleChange("company", e.target.value)} className="mt-1.5 bg-background border-border" maxLength={100} />
                {errors.company && <p className="text-xs text-destructive mt-1">{errors.company}</p>}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">E-post *</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} className="mt-1.5 bg-background border-border" maxLength={255} />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} className="mt-1.5 bg-background border-border" maxLength={20} />
              </div>
            </div>
            <div>
              <Label htmlFor="message">Meddelande *</Label>
              <Textarea id="message" value={form.message} onChange={(e) => handleChange("message", e.target.value)} className="mt-1.5 bg-background border-border" rows={4} maxLength={2000} />
              {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
            </div>
            <Button type="submit" className="w-full gradient-bg text-primary-foreground hover:opacity-90" size="lg">
              <Send className="w-4 h-4 mr-2" />
              Skicka förfrågan
            </Button>
          </form>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default CompanyPage;
