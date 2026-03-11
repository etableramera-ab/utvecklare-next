'use client'
import { TrendingUp, Award, Briefcase, ArrowUpRight } from "lucide-react";

const highlights = [
  {
    icon: TrendingUp,
    label: "Genomsnittlig AI-lön",
    value: "62 000",
    unit: "SEK/mån",
    sub: "Snitt alla AI-roller, alla nivåer",
    trend: "↑ 8% jmf 2025",
    trendColor: "text-emerald-400",
  },
  {
    icon: Award,
    label: "Högst betald roll",
    value: "108 000",
    unit: "SEK/mån",
    sub: "AI Researcher · Lead · Stockholm",
    trend: null,
    trendColor: "",
  },
  {
    icon: Briefcase,
    label: "Mest efterfrågad",
    value: "ML Engineer",
    unit: "",
    sub: "68% av alla AI-jobbannonser",
    trend: null,
    trendColor: "",
  },
  {
    icon: ArrowUpRight,
    label: "Löneökning YoY",
    value: "8–12%",
    unit: "",
    sub: "Genomsnittlig ökning 2025→2026",
    trend: null,
    trendColor: "",
  },
];

const SalaryHighlights = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {highlights.map((h) => (
      <div key={h.label} className="bg-card border border-border rounded-xl p-5 md:p-6">
        <h.icon className="w-5 h-5 text-primary mb-3" />
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{h.label}</p>
        <p className="text-2xl md:text-3xl font-bold text-foreground">
          {h.value} <span className="text-sm font-normal text-muted-foreground">{h.unit}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">{h.sub}</p>
        {h.trend && <p className={`text-xs font-medium mt-2 ${h.trendColor}`}>{h.trend}</p>}
      </div>
    ))}
  </div>
);

export default SalaryHighlights;
