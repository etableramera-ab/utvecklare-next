'use client';
import Link from "next/link";
import { ChevronRight, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SalaryHero from "@/components/salary/SalaryHero";
import SalaryHighlights from "@/components/salary/SalaryHighlights";
import SalaryByRoleChart from "@/components/salary/SalaryByRoleChart";
import SalaryByCityChart from "@/components/salary/SalaryByCityChart";
import SalaryTrendChart from "@/components/salary/SalaryTrendChart";
import SalaryFactors from "@/components/salary/SalaryFactors";
import SalaryComparator from "@/components/salary/SalaryComparator";
import SalarySubmissionForm from "@/components/salary/SalarySubmissionForm";
import SalaryTips from "@/components/salary/SalaryTips";
import SalarySEO from "@/components/salary/SalarySEO";
import { useAllSalaryData } from "@/hooks/useSalary";
import { AnswerBlock } from "@/components/AnswerBlock";

const SalaryPage = () => {
  const { data, isLoading } = useAllSalaryData();
  const currentYear = data?.filter((d) => d.year === 2026) || [];
  const totalReports = currentYear.reduce((a, b) => a + (b.sample_size || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <SalarySEO />
      <Navbar />
      <SalaryHero totalReports={totalReports} />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Hem</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">Lönestatistik</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 pb-20">
        <AnswerBlock text="En AI-utvecklare i Sverige tjänar i genomsnitt mellan 36 000 och 115 000 SEK/månad beroende på roll, erfarenhetsnivå och stad. ML Engineers har en medianlön på 58 000 SEK i Stockholm (mid-level). AI Researchers har den högsta lönen med upp till 108 000 SEK för lead-nivå." />
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-16">
            <SalaryHighlights />
            <SalaryByRoleChart data={currentYear} />
            <SalaryByCityChart data={currentYear} />
            <div className="py-4">
              <Link href="/foretag" className="block p-5 rounded-lg border border-dashed border-border hover:border-primary/50 transition-colors text-center group">
                <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Annonsera på utvecklare.ai</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">Nå Sveriges AI-utvecklare →</p>
              </Link>
            </div>
            <SalaryTrendChart data={data || []} />
            <SalaryFactors />
            <SalaryComparator data={currentYear} />
            <SalarySubmissionForm />
            <SalaryTips />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SalaryPage;
