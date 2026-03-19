'use client'
import { useEffect, useState } from "react";
import { Search, Briefcase, Wrench, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { supabase } from "@/lib/supabase/client";
import heroBg from "@/assets/hero-bg.jpg";

const companies = ["Spotify", "Klarna", "Ericsson", "H&M Group", "Volvo", "IKEA", "King", "iZettle"];

const HeroSection = () => {
  const [jobCount, setJobCount] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .then(({ count }) => { if (count != null) setJobCount(count); });
  }, []);

  const stats = [
    {
      icon: Briefcase,
      value: jobCount != null ? `${jobCount.toLocaleString("sv-SE")}+` : "…",
      label: "Lediga IT-jobb",
    },
    { icon: Wrench, value: "24+", label: "AI-verktyg granskade" },
    { icon: Calendar, value: "Mars 2026", label: "Senast uppdaterat" },
  ];

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background */}
      <img src={heroBg.src} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />

      <div className="relative container mx-auto px-4 py-32 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight max-w-4xl mx-auto animate-fade-in-up">
          Framtiden byggs av AI-utvecklare.{" "}
          <span className="gradient-text">Är du en av dem?</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          Sveriges plattform för AI-jobb, kunskap och verktyg — kostnadsfritt.
        </p>

        {/* Search */}
        <div className="mt-8 max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center bg-card border border-border rounded-lg overflow-hidden focus-within:border-primary/50 transition-colors">
            <Search className="w-5 h-5 text-muted-foreground ml-4 shrink-0" />
            <input
              type="text"
              placeholder="Sök jobb, verktyg..."
              className="flex-1 min-w-0 bg-transparent px-3 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none truncate"
            />
            <Button className="gradient-bg text-primary-foreground rounded-none rounded-r-lg h-full px-6 shrink-0">Sök</Button>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <Button asChild size="lg" className="gradient-bg text-primary-foreground hover:opacity-90 transition-opacity px-8">
            <Link href="/jobb">Hitta AI-jobb</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-border text-foreground hover:bg-accent px-8">
            <Link href="/foretag">Jag rekryterar</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 border border-border">
              <s.icon className="w-4 h-4 text-secondary" />
              <span className="text-sm font-semibold text-foreground">{s.value}</span>
              <span className="text-sm text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Company ticker */}
        <div className="mt-16 overflow-hidden opacity-50">
          <div className="flex animate-ticker whitespace-nowrap">
            {[...companies, ...companies].map((c, i) => (
              <span key={i} className="mx-8 text-sm font-medium text-muted-foreground">{c}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
