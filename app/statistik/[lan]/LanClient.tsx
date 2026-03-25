'use client'
import Link from "next/link";
import { ChevronRight, TrendingUp, Building2, Percent } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import type { LanInfo } from "@/lib/statistik-data";

const fmt = (n: number) => n.toLocaleString("sv-SE");

const LanClient = ({ lan }: { lan: LanInfo }) => (
  <div className="container mx-auto px-4 pb-20">
    {/* Breadcrumb */}
    <nav className="flex items-center gap-2 text-sm text-muted-foreground py-4 flex-wrap">
      <Link href="/" className="hover:text-foreground transition-colors">Hem</Link>
      <ChevronRight className="w-3 h-3" />
      <Link href="/statistik" className="hover:text-foreground transition-colors">Statistik</Link>
      <ChevronRight className="w-3 h-3" />
      <span className="text-foreground">{lan.name}</span>
    </nav>

    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
      IT-branschen i {lan.name}
    </h1>
    <p className="text-muted-foreground text-lg mb-10 max-w-2xl">
      Antal IT-företag, tillväxttakt och trender i {lan.name}. Baserat på SCB:s Företagsdatabas.
    </p>

    {/* Key stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
      {[
        { icon: Building2, value: fmt(lan.latest), label: "IT-företag", sub: `I ${lan.name} (${lan.yearly[lan.yearly.length - 1].year})` },
        { icon: TrendingUp, value: `${lan.growth >= 0 ? "+" : ""}${fmt(lan.growth)}`, label: "Förändring senaste året", sub: `${lan.growth >= 0 ? "+" : ""}${lan.growthPct}%` },
        { icon: Percent, value: `${lan.shareOfSweden}%`, label: "Andel av Sveriges IT-företag", sub: `Av totalt ${fmt(80083)}` },
        { icon: Building2, value: fmt(lan.yearly[0].count), label: `IT-företag ${lan.yearly[0].year}`, sub: `Tillväxt: +${fmt(lan.latest - lan.yearly[0].count)} sedan dess` },
      ].map((s) => (
        <div key={s.label} className="p-4 rounded-lg bg-card border border-border">
          <s.icon className="w-5 h-5 text-primary mb-2" />
          <div className="text-2xl font-bold text-foreground">{s.value}</div>
          <div className="text-sm text-muted-foreground">{s.label}</div>
          <div className="text-xs text-muted-foreground/70 mt-1">{s.sub}</div>
        </div>
      ))}
    </div>

    {/* Chart: IT companies over time */}
    <section className="mb-14">
      <h2 className="text-xl font-bold text-foreground mb-1">IT-företag i {lan.name} per år</h2>
      <p className="text-sm text-muted-foreground mb-4">Uppskattat antal baserat på SCB:s nationella data och regionala fördelning.</p>
      <div className="rounded-lg bg-card border border-border p-4">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={lan.yearly}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
            <XAxis dataKey="year" tick={{ fill: "hsl(215 16% 57%)", fontSize: 12 }} />
            <YAxis tickFormatter={(v) => fmt(v)} tick={{ fill: "hsl(215 16% 57%)", fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: "hsl(240 18% 8%)", border: "1px solid hsl(217 33% 17%)", borderRadius: 8 }}
              labelStyle={{ color: "hsl(210 40% 98%)", fontWeight: 600 }}
              formatter={(value) => [fmt(value as number), "IT-företag"]}
            />
            <Line type="monotone" dataKey="count" stroke="hsl(239 84% 67%)" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>

    {/* Context */}
    <section className="mb-14 rounded-lg bg-card border border-border p-6">
      <h2 className="text-lg font-bold text-foreground mb-3">Om IT-branschen i {lan.name}</h2>
      <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
        <p>
          {lan.name} har <strong className="text-foreground">{fmt(lan.latest)} IT-företag</strong> ({lan.yearly[lan.yearly.length - 1].year}),
          vilket motsvarar <strong className="text-foreground">{lan.shareOfSweden}%</strong> av alla IT-företag i Sverige.
        </p>
        <p>
          Sedan {lan.yearly[0].year} har antalet IT-företag i länet ökat
          med <strong className="text-foreground">{fmt(lan.latest - lan.yearly[0].count)}</strong> — en tillväxt
          på {(((lan.latest - lan.yearly[0].count) / lan.yearly[0].count) * 100).toFixed(0)}%.
        </p>
        <p>
          IT-branschen (SNI J — Informations- och kommunikationsföretag) omfattar programvaruutveckling,
          datakonsulter, telekommunikation, informationstjänster och digital media.
        </p>
      </div>
    </section>

    {/* Source */}
    <div className="text-xs text-muted-foreground/60 border-t border-border pt-6">
      <p>Källa: SCB (Statistiska centralbyrån) — Företagsdatabasen (FDBR07N), SNI 2007.</p>
      <p className="mt-1">Regionala uppskattningar baserade på nationella data och publicerad statistik om IT-branschens geografiska fördelning.</p>
    </div>
  </div>
);

export default LanClient;
