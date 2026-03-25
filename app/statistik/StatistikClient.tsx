'use client'
import Link from "next/link";
import { ChevronRight, TrendingUp, Building2, MapPin, BarChart3, Users, Monitor } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { YEARLY_IT, SIZE_DISTRIBUTION, LAN_LIST, KEY_STATS, NATIONAL_TOTAL_2025 } from "@/lib/statistik-data";

const fmt = (n: number) => n.toLocaleString("sv-SE");
const fmtK = (n: number) => `${(n / 1000).toFixed(1)}k`;

const StatistikClient = () => (
  <div className="container mx-auto px-4 pb-20">
    {/* Breadcrumb */}
    <nav className="flex items-center gap-2 text-sm text-muted-foreground py-4">
      <Link href="/" className="hover:text-foreground transition-colors">Hem</Link>
      <ChevronRight className="w-3 h-3" />
      <span className="text-foreground">Statistik</span>
    </nav>

    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
      IT-branschen i Sverige {KEY_STATS.latestYear}
    </h1>
    <p className="text-muted-foreground text-lg mb-10 max-w-2xl">
      Företag, löner och lediga jobb inom IT &amp; tech. Baserat på offentlig data från SCB och JobTech API.
    </p>

    {/* Key stats grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
      {[
        { icon: Building2, value: fmt(KEY_STATS.totalIT), label: "IT-företag i Sverige", sub: `+${KEY_STATS.yoyPct}% senaste året` },
        { icon: Monitor, value: fmt(KEY_STATS.totalSoftware), label: "Programvarubolag (SNI 62)", sub: `${KEY_STATS.softwareShare}% av IT-sektorn` },
        { icon: TrendingUp, value: `+${fmt(KEY_STATS.yoyGrowth)}`, label: "Nya IT-företag senaste året", sub: `Jämfört med ${KEY_STATS.latestYear - 1}` },
        { icon: MapPin, value: fmt(KEY_STATS.topLanCount), label: KEY_STATS.topLan, sub: "Flest IT-företag" },
      ].map((s) => (
        <div key={s.label} className="p-4 rounded-lg bg-card border border-border">
          <s.icon className="w-5 h-5 text-primary mb-2" />
          <div className="text-2xl font-bold text-foreground">{s.value}</div>
          <div className="text-sm text-muted-foreground">{s.label}</div>
          <div className="text-xs text-muted-foreground/70 mt-1">{s.sub}</div>
        </div>
      ))}
    </div>

    {/* Chart 1: IT companies over time */}
    <section className="mb-14">
      <h2 className="text-xl font-bold text-foreground mb-1">Antal IT-företag per år</h2>
      <p className="text-sm text-muted-foreground mb-4">SNI J — Informations- och kommunikationsföretag. Källa: SCB Företagsdatabasen.</p>
      <div className="rounded-lg bg-card border border-border p-4">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={YEARLY_IT}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
            <XAxis dataKey="year" tick={{ fill: "hsl(215 16% 57%)", fontSize: 12 }} />
            <YAxis tickFormatter={(v) => fmtK(v)} tick={{ fill: "hsl(215 16% 57%)", fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: "hsl(240 18% 8%)", border: "1px solid hsl(217 33% 17%)", borderRadius: 8 }}
              labelStyle={{ color: "hsl(210 40% 98%)", fontWeight: 600 }}
              formatter={(value, name) => [fmt(value as number), name === "total" ? "IT-företag totalt" : "Programvarubolag"]}
            />
            <Line type="monotone" dataKey="total" stroke="hsl(239 84% 67%)" strokeWidth={2.5} dot={{ r: 3 }} name="total" />
            <Line type="monotone" dataKey="software" stroke="hsl(187 92% 42%)" strokeWidth={2} dot={{ r: 3 }} name="software" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>

    {/* Chart 2: Size distribution */}
    <section className="mb-14">
      <h2 className="text-xl font-bold text-foreground mb-1">IT-företag per storleksklass ({KEY_STATS.latestYear})</h2>
      <p className="text-sm text-muted-foreground mb-4">Antal anställda. De flesta IT-företag är soloföretag (0 anställda).</p>
      <div className="rounded-lg bg-card border border-border p-4">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={SIZE_DISTRIBUTION} layout="vertical" margin={{ left: 80, right: 20, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
            <XAxis type="number" tickFormatter={(v) => fmtK(v)} tick={{ fill: "hsl(215 16% 57%)", fontSize: 12 }} />
            <YAxis dataKey="label" type="category" width={75} tick={{ fill: "hsl(215 16% 57%)", fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: "hsl(240 18% 8%)", border: "1px solid hsl(217 33% 17%)", borderRadius: 8 }}
              labelStyle={{ color: "hsl(210 40% 98%)", fontWeight: 600 }}
              formatter={(value) => [fmt(value as number), "Företag"]}
            />
            <Bar dataKey="count" fill="hsl(239 84% 67%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>

    {/* Regional table */}
    <section className="mb-14">
      <h2 className="text-xl font-bold text-foreground mb-1">IT-företag per län</h2>
      <p className="text-sm text-muted-foreground mb-4">Uppskattning baserad på SCB:s nationella data och regionala fördelning.</p>
      <div className="rounded-lg bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="px-4 py-2.5 text-left font-semibold text-foreground">Län</th>
              <th className="px-4 py-2.5 text-right font-semibold text-foreground">IT-företag</th>
              <th className="px-4 py-2.5 text-right font-semibold text-foreground">Förändring</th>
              <th className="px-4 py-2.5 text-right font-semibold text-foreground">Andel</th>
            </tr>
          </thead>
          <tbody>
            {LAN_LIST.sort((a, b) => b.latest - a.latest).map((l) => (
              <tr key={l.slug} className="border-t border-border hover:bg-muted/50 transition-colors">
                <td className="px-4 py-2">
                  <Link href={`/statistik/${l.slug}`} className="text-primary hover:underline font-medium">{l.name}</Link>
                </td>
                <td className="px-4 py-2 text-right text-muted-foreground">{fmt(l.latest)}</td>
                <td className="px-4 py-2 text-right">
                  <span className={l.growth >= 0 ? "text-emerald-400" : "text-destructive"}>
                    {l.growth >= 0 ? "+" : ""}{l.growthPct}%
                  </span>
                </td>
                <td className="px-4 py-2 text-right text-muted-foreground">{l.shareOfSweden}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    {/* Län links grid */}
    <section className="mb-14">
      <h2 className="text-xl font-bold text-foreground mb-4">Utforska IT-branschen per län</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {LAN_LIST.sort((a, b) => a.name.localeCompare(b.name, "sv")).map((l) => (
          <Link
            key={l.slug}
            href={`/statistik/${l.slug}`}
            className="p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-all group"
          >
            <p className="font-medium text-foreground group-hover:text-primary transition-colors text-sm">{l.name}</p>
            <p className="text-xs text-muted-foreground">{fmt(l.latest)} IT-företag</p>
          </Link>
        ))}
      </div>
    </section>

    {/* Source */}
    <div className="text-xs text-muted-foreground/60 border-t border-border pt-6">
      <p>Källa: SCB (Statistiska centralbyrån) — Företagsdatabasen (FDBR07N), SNI 2007. Senast uppdaterat december 2025.</p>
      <p className="mt-1">Regionala uppskattningar baserade på SCB:s publicerade statistik om IT-branschens geografiska fördelning.</p>
    </div>
  </div>
);

export default StatistikClient;
