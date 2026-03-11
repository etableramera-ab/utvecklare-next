'use client'
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import { SalaryRow, ROLE_COLORS } from "@/hooks/useSalary";

const TREND_ROLES = ["ML Engineer", "Data Scientist", "AI Researcher", "MLOps Engineer", "NLP/LLM-utvecklare"];

interface Props {
  data: SalaryRow[];
}

const SalaryTrendChart = ({ data }: Props) => {
  const [visibleRoles, setVisibleRoles] = useState<Set<string>>(new Set(TREND_ROLES));

  const chartData = useMemo(() => {
    const filtered = data.filter(
      (r) => r.experience_level === "senior" && r.city === "Stockholm" && TREND_ROLES.includes(r.role)
    );
    const years = [2022, 2023, 2024, 2025, 2026];
    return years.map((year) => {
      const entry: any = { year };
      TREND_ROLES.forEach((role) => {
        const match = filtered.find((r) => r.role === role && r.year === year);
        if (match) entry[role] = match.salary_median;
      });
      return entry;
    });
  }, [data]);

  const toggleRole = (role: string) => {
    setVisibleRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  };

  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground mb-1">Löneutveckling 2022–2026</h2>
      <p className="text-muted-foreground text-sm mb-6">Så har AI-lönerna förändrats de senaste 5 åren (Senior, Stockholm)</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {TREND_ROLES.map((role) => (
          <button
            key={role}
            onClick={() => toggleRole(role)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              visibleRoles.has(role)
                ? "border-primary/50 text-foreground"
                : "border-border text-muted-foreground opacity-50"
            }`}
            style={{
              backgroundColor: visibleRoles.has(role) ? ROLE_COLORS[role] + "20" : undefined,
            }}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: ROLE_COLORS[role] }} />
            {role}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
            <XAxis dataKey="year" stroke="hsl(215, 16%, 57%)" fontSize={12} />
            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} stroke="hsl(215, 16%, 57%)" fontSize={12} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
                    <p className="font-medium text-foreground mb-1">{label}</p>
                    {payload.map((p: any) => (
                      <p key={p.dataKey} style={{ color: p.color }}>
                        {p.dataKey}: {p.value?.toLocaleString("sv-SE")} SEK
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            {TREND_ROLES.filter((r) => visibleRoles.has(r)).map((role) => (
              <Line
                key={role}
                type="monotone"
                dataKey={role}
                stroke={ROLE_COLORS[role]}
                strokeWidth={2}
                dot={{ r: 4, fill: ROLE_COLORS[role] }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 mt-6 flex gap-3">
        <TrendingUp className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">AI-löner har ökat med 35–50% sedan 2022.</span> Störst ökning ser vi för NLP/LLM-roller (+52%) drivet av den explosiva efterfrågan på LLM-kompetens.
        </p>
      </div>
    </section>
  );
};

export default SalaryTrendChart;
