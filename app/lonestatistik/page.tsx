'use client';
import Link from "next/link";
import { ChevronRight, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdBanner from "@/components/ads/AdBanner";
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
              <AdBanner placement="between-sections" page="salary" />
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
