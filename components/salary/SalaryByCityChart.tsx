'use client'
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Lightbulb } from "lucide-react";
import { SalaryRow, ROLES } from "@/hooks/useSalary";

interface Props {
  data: SalaryRow[];
}

const SalaryByCityChart = ({ data }: Props) => {
  const [role, setRole] = useState("all");

  const chartData = useMemo(() => {
    let d = data.filter((r) => r.year === 2026);
    if (role !== "all") d = d.filter((r) => r.role === role);
    const map: Record<string, number[]> = {};
    d.forEach((r) => {
      if (!map[r.city]) map[r.city] = [];
      map[r.city].push(r.salary_median);
    });
    const result = Object.entries(map)
      .map(([city, medians]) => ({
        city,
        median: Math.round(medians.reduce((a, b) => a + b, 0) / medians.length),
      }))
      .sort((a, b) => b.median - a.median);
    const sthlm = result.find((r) => r.city === "Stockholm")?.median || 1;
    return result.map((r) => ({
      ...r,
      diff: r.city === "Stockholm" ? 0 : Math.round(((r.median - sthlm) / sthlm) * 100),
    }));
  }, [data, role]);

  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground mb-1">AI-löner per stad</h2>
      <p className="text-muted-foreground text-sm mb-6">Medianlön för alla AI-roller per stad</p>

      <div className="mb-6">
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-56 bg-card border-border">
            <SelectValue placeholder="Alla roller" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla roller</SelectItem>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} stroke="hsl(215, 16%, 57%)" fontSize={12} />
            <YAxis type="category" dataKey="city" width={90} stroke="hsl(215, 16%, 57%)" fontSize={12} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
                    <p className="font-medium text-foreground">{d.city}</p>
                    <p className="text-primary">{d.median.toLocaleString("sv-SE")} SEK/mån</p>
                    {d.diff !== 0 && (
                      <p className="text-muted-foreground">{d.diff}% vs Stockholm</p>
                    )}
                  </div>
                );
              }}
            />
            <Bar dataKey="median" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.city === "Stockholm" ? "hsl(239, 84%, 67%)" : "hsl(187, 92%, 42%)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 mt-6 flex gap-3">
        <Lightbulb className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Stockholm-premium:</span> AI-utvecklare i Stockholm tjänar i genomsnitt 12% mer än i Göteborg och 18% mer än i Malmö. Remote-roller betalar ofta stockholmslöner oavsett var du bor.
        </p>
      </div>
    </section>
  );
};

export default SalaryByCityChart;
