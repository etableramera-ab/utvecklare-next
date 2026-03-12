'use client';

import Link from "next/link";
import { ChevronRight, Briefcase, BookOpen, Wrench, MessageSquare, CalendarDays, TrendingUp, Linkedin, Github, ArrowRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import aboutHeroBg from "@/assets/hero-bg.jpg";

const features = [
  { icon: Briefcase, title: "Jobbportal", desc: "Hundratals AI-jobb från ledande svenska företag. Filtrera på roll, stad och teknik." },
  { icon: BookOpen, title: "Kunskapshubb", desc: "Artiklar, guider och tutorials skrivna för svenska AI-utvecklare." },
  { icon: Wrench, title: "Verktyg & Resurser", desc: "Kuraterade AI-verktyg med svenska recensioner och jämförelser." },
  { icon: MessageSquare, title: "Community", desc: "Forum, projekt-showcase och leaderboard för Sveriges AI-community." },
  { icon: CalendarDays, title: "Events", desc: "Meetups, konferenser och workshops i hela Sverige." },
  { icon: TrendingUp, title: "Lönestatistik", desc: "Transparenta lönedata för alla AI-roller, städer och erfarenhetsnivåer." },
];

const stats = [
  { value: "2 500+", label: "Medlemmar" },
  { value: "350+", label: "AI-jobb" },
  { value: "25+", label: "Verktygsrecensioner" },
  { value: "50+", label: "Events per år" },
];

const AboutPage = () => (
  <div className="min-h-screen bg-background">
    <SEOHead
      title="Om utvecklare.ai — Sveriges plattform för AI-utvecklare"
      description="utvecklare.ai samlar Sveriges AI-community med jobb, artiklar, verktyg, forum och events. Läs om vår mission."
      canonical="/om-oss"
    />
    <Navbar />

    {/* Hero */}
    <section className="relative pt-16 overflow-hidden">
      <div className="absolute inset-0">
        <img src={aboutHeroBg.src} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />
      </div>
      <div className="relative container mx-auto px-4 py-20 md:py-28 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
          Om <span className="gradient-text">utvecklare.ai</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Sveriges plattform för AI-utvecklare — byggd av utvecklare, för utvecklare
        </p>
      </div>
    </section>

    {/* Breadcrumb */}
    <div className="container mx-auto px-4 pb-4">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">Hem</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">Om oss</span>
      </nav>
    </div>

    <div className="container mx-auto px-4 pb-20 space-y-20">
      {/* Mission */}
      <section className="max-w-[720px] mx-auto space-y-5">
        <h2 className="text-2xl font-bold text-foreground">Vår mission</h2>
        <p className="text-muted-foreground leading-relaxed">
          utvecklare.ai startades 2026 med en enkel idé: att samla Sveriges AI-community på en plats. Vi byggde plattformen vi själva saknade — ett nav där AI-utvecklare kan hitta jobb, lära sig nya tekniker, dela projekt och nätverka med likasinnade.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Vi tror på att AI-kompetens är nyckeln till Sveriges konkurrenskraft. Genom att göra kunskap tillgänglig, koppla ihop talanger med arbetsgivare och bygga community hjälper vi hela det svenska AI-ekosystemet att växa.
        </p>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-2xl font-bold text-foreground text-center mb-10">Vad vi erbjuder</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f) => (
            <Card key={f.title} className="bg-card border-border card-hover">
              <CardContent className="p-6">
                <f.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-4xl font-bold text-primary">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Founder */}
      <section className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">Bakom plattformen</h2>
        <Card className="glass border-border">
          <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary shrink-0">
              KS
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold text-foreground">Kim Stockblom</h3>
              <p className="text-sm text-primary mb-2">Grundare & Utvecklare</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fullstack-utvecklare och entreprenör med passion för AI och den svenska tech-scenen. Bygger utvecklare.ai för att stärka Sveriges AI-community.
              </p>
              <div className="flex gap-3 mt-3 justify-center sm:justify-start">
                <a href="https://www.linkedin.com/in/kimstockblom" target="_blank" rel="noopener noreferrer" className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="https://github.com/kimstockblom" target="_blank" rel="noopener noreferrer" className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all">
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Contact CTA */}
      <section className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Har du frågor eller vill samarbeta?</h2>
        <Link href="/kontakt">
          <Button size="lg" className="gradient-bg text-primary-foreground hover:opacity-90 mt-2">
            Kontakta oss <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
        <p className="text-sm text-muted-foreground">Eller mejla oss direkt: <a href="mailto:hej@utvecklare.ai" className="text-primary hover:underline">hej@utvecklare.ai</a></p>
      </section>
    </div>

    <Footer />
  </div>
);

export default AboutPage;
