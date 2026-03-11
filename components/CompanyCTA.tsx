'use client'
import Link from 'next/link'
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CompanyCTA = () => (
  <section className="section-spacing">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">Rekryterar ni AI-kompetens?</h2>
      <p className="text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
        Nå Sveriges mest kvalificerade AI-utvecklare. Publicera jobb, bygg ert employer brand och hitta rätt kandidat.
      </p>
      <Button asChild size="lg" className="gradient-bg text-primary-foreground hover:opacity-90">
        <Link href="/foretag/priser">Se priser och paket <ArrowRight className="w-4 h-4 ml-2" /></Link>
      </Button>
    </div>
  </section>
);

export default CompanyCTA;
