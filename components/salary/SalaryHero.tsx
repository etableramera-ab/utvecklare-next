'use client'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import salaryHeroBg from "@/assets/salary-hero-bg.jpg";

interface SalaryHeroProps {
  totalReports: number;
}

const SalaryHero = ({ totalReports }: SalaryHeroProps) => (
  <section className="relative pt-16">
    <div className="absolute inset-0">
      <img src={salaryHeroBg.src} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />
    </div>
    <div className="relative container mx-auto px-4 py-20 md:py-28 text-center">
      <Badge className="gradient-bg text-primary-foreground mb-4">Lönestatistik 2026</Badge>
      <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 max-w-3xl mx-auto">
        AI-utvecklarlöner i Sverige 2026
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
        Komplett lönestatistik för ML Engineers, Data Scientists och andra AI-roller — baserat på marknadsdata och community-bidrag
      </p>
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
        <span>8 AI-roller</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
        <span>6 städer</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
        <span>{totalReports} lönerapporter</span>
      </div>
      <Button
        size="lg"
        className="gradient-bg text-primary-foreground hover:opacity-90"
        onClick={() => document.getElementById("submit-salary")?.scrollIntoView({ behavior: "smooth" })}
      >
        Bidra anonymt med din lön <ArrowDown className="w-4 h-4 ml-2" />
      </Button>
    </div>
  </section>
);

export default SalaryHero;
