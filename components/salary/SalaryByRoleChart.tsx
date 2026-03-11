'use client'
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { SalaryRow, ROLES, LEVELS, LEVEL_LABELS, CITIES } from "@/hooks/useSalary";

interface Props {
  data: SalaryRow[];
}

const SalaryTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value?.toLocaleString("sv-SE")} SEK
        </p>
      ))}
    </div>
  );
};

const SalaryByRoleChart = ({ data }: Props) => {
  const [level, setLevel] = useState("all");
  const [city, setCity] = useState("all");
  const [showTable, setShowTable] = useState(false);

  const filtered = useMemo(() => {
    let d = data.filter((r) => r.year === 2026);
    if (level !== "all") d = d.filter((r) => r.experience_level === level);
    if (city !== "all") d = d.filter((r) => r.city === city);
    return d;
  }, [data, level, city]);

  const chartData = useMemo(() => {
    const map: Record<string, { p25: number[]; median: number[]; p75: number[]; samples: number }> = {};
    filtered.forEach((r) => {
      if (!map[r.role]) map[r.role] = { p25: [], median: [], p75: [], samples: 0 };
      map[r.role].p25.push(r.salary_p25 || r.salary_min);
      map[r.role].median.push(r.salary_median);
      map[r.role].p75.push(r.salary_p75 || r.salary_max);
      map[r.role].samples += r.sample_size || 0;
    });
    return ROLES.filter((r) => map[r])
      .map((role) => ({
        role: role.length > 18 ? role.slice(0, 16) + "…" : role,
        fullRole: role,
        P25: Math.round(map[role].p25.reduce((a, b) => a + b, 0) / map[role].p25.length),
        Median: Math.round(map[role].median.reduce((a, b) => a + b, 0) / map[role].median.length),
        P75: Math.round(map[role].p75.reduce((a, b) => a + b, 0) / map[role].p75.length),
        samples: map[role].samples,
      }))
      .sort((a, b) => b.Median - a.Median);
  }, [filtered]);

  const tableData = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    const d = data.filter((r) => r.year === 2026 && (city === "all" || r.city === city));
    d.forEach((r) => {
      if (!result[r.role]) result[r.role] = {};
      result[r.role][r.experience_level] = r.salary_median;
    });
    return ROLES.filter((r) => result[r]).map((role) => ({ role, ...result[role] }));
  }, [data, city]);

  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground mb-1">Månadslön per AI-roll</h2>
      <p className="text-muted-foreground text-sm mb-6">Median, 25:e och 75:e percentilen (SEK/månad, 2026)</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Tabs value={level} onValueChange={setLevel}>
          <TabsList className="bg-muted">
            <TabsTrigger value="all">Alla</TabsTrigger>
            {LEVELS.map((l) => (
              <TabsTrigger key={l} value={l}>{LEVEL_LABELS[l]}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="w-44 bg-card border-border">
            <SelectValue placeholder="Alla städer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla städer</SelectItem>
            {CITIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} stroke="hsl(215, 16%, 57%)" fontSize={12} />
            <YAxis type="category" dataKey="role" width={140} stroke="hsl(215, 16%, 57%)" fontSize={12} />
            <Tooltip content={<SalaryTooltip />} />
            <Legend />
            <Bar dataKey="P25" fill="hsl(239, 84%, 67%, 0.3)" name="25:e percentil" radius={[0, 2, 2, 0]} />
            <Bar dataKey="Median" fill="hsl(239, 84%, 67%)" name="Median" radius={[0, 2, 2, 0]} />
            <Bar dataKey="P75" fill="hsl(239, 84%, 50%)" name="75:e percentil" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => setShowTable(!showTable)} className="text-muted-foreground">
          {showTable ? "Dölj tabell" : "Visa som tabell"}
        </Button>
      </div>

      {showTable && (
        <div className="overflow-x-auto mt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll</TableHead>
                {LEVELS.map((l) => (
                  <TableHead key={l} className="text-right">{LEVEL_LABELS[l]}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row: any) => (
                <TableRow key={row.role}>
                  <TableCell className="font-medium">{row.role}</TableCell>
                  {LEVELS.map((l) => (
                    <TableCell key={l} className="text-right tabular-nums">
                      {row[l] ? `${(row[l] / 1000).toFixed(0)} 000` : "—"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
};

export default SalaryByRoleChart;
