'use client'
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { SalaryRow, ROLES, LEVELS, LEVEL_LABELS, CITIES } from "@/hooks/useSalary";

interface Props {
  data: SalaryRow[];
}

const SalaryComparator = ({ data }: Props) => {
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [city, setCity] = useState("");
  const [salary, setSalary] = useState("");
  const [error, setError] = useState("");
  const [fallbackNote, setFallbackNote] = useState("");
  const [result, setResult] = useState<null | {
    median: number;
    p25: number;
    p75: number;
    diff: number;
    diffPct: number;
    percentile: number;
    message: string;
  }>(null);

  const compare = () => {
    setError("");
    setFallbackNote("");
    const s = parseInt(salary);
    if (!role || !level || !city || !s) {
      setError("Fyll i alla fält för att jämföra");
      return;
    }
    if (s < 10000 || s > 300000) {
      setError("Ange en rimlig månadslön (10 000 – 300 000 SEK)");
      return;
    }
    const match = data.find(
      (r) => r.role === role && r.experience_level === level && r.city === city && r.year === 2026
    );
    if (!match) {
      // Fallback: use same role+level across all cities
      const fallback = data.filter((r) => r.role === role && r.experience_level === level && r.year === 2026);
      if (!fallback.length) {
        // Second fallback: just role across all levels/cities
        const roleFallback = data.filter((r) => r.role === role && r.year === 2026);
        if (!roleFallback.length) {
          setError("Tyvärr saknas lönedata för denna kombination. Prova en annan roll.");
          return;
        }
        const avg = Math.round(roleFallback.reduce((a, b) => a + b.salary_median, 0) / roleFallback.length);
        const p25 = Math.round(roleFallback.reduce((a, b) => a + (b.salary_p25 || b.salary_min), 0) / roleFallback.length);
        const p75 = Math.round(roleFallback.reduce((a, b) => a + (b.salary_p75 || b.salary_max), 0) / roleFallback.length);
        setFallbackNote(`Visar rikssnitt för ${role} (alla nivåer) — exakt match saknas`);
        computeResult(s, avg, p25, p75);
        return;
      }
      const avg = Math.round(fallback.reduce((a, b) => a + b.salary_median, 0) / fallback.length);
      const p25 = Math.round(fallback.reduce((a, b) => a + (b.salary_p25 || b.salary_min), 0) / fallback.length);
      const p75 = Math.round(fallback.reduce((a, b) => a + (b.salary_p75 || b.salary_max), 0) / fallback.length);
      setFallbackNote(`Visar rikssnitt för ${role} (${LEVEL_LABELS[level]}) — data saknas för ${city}`);
      computeResult(s, avg, p25, p75);
      return;
    }
    computeResult(s, match.salary_median, match.salary_p25 || match.salary_min, match.salary_p75 || match.salary_max);
  };

  const computeResult = (s: number, median: number, p25: number, p75: number) => {
    const diff = s - median;
    const diffPct = Math.round((diff / median) * 100);
    // Approximate percentile
    let percentile: number;
    if (s <= p25) percentile = Math.max(10, Math.round((s / p25) * 25));
    else if (s <= median) percentile = 25 + Math.round(((s - p25) / (median - p25)) * 25);
    else if (s <= p75) percentile = 50 + Math.round(((s - median) / (p75 - median)) * 25);
    else percentile = Math.min(95, 75 + Math.round(((s - p75) / (p75 * 0.3)) * 20));

    let message: string;
    if (diffPct < -10) message = "Din lön ligger under medianen. Kolla marknaden och överväg att förhandla!";
    else if (diffPct <= 10) message = "Din lön ligger i linje med marknaden — bra!";
    else message = "Din lön ligger över medianen — bra förhandlat!";

    setResult({ median, p25, p75, diff, diffPct, percentile, message });
  };

  const gaugePosition = result ? Math.min(95, Math.max(5, result.percentile)) : 50;

  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground mb-1">Jämför din lön</h2>
      <p className="text-muted-foreground text-sm mb-6">Se hur din lön står sig jämfört med marknaden</p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div>
            <Label>Din roll</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="mt-1.5 bg-background border-border"><SelectValue placeholder="Välj roll" /></SelectTrigger>
              <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Erfarenhetsnivå</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="mt-1.5 bg-background border-border"><SelectValue placeholder="Välj nivå" /></SelectTrigger>
              <SelectContent>{LEVELS.map((l) => <SelectItem key={l} value={l}>{LEVEL_LABELS[l]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Stad</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="mt-1.5 bg-background border-border"><SelectValue placeholder="Välj stad" /></SelectTrigger>
              <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Din månadslön (SEK)</Label>
            <Input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="mt-1.5 bg-background border-border"
              placeholder="55 000"
              min={20000}
              max={200000}
            />
          </div>
          <Button onClick={compare} className="w-full gradient-bg text-primary-foreground hover:opacity-90">
            Jämför
          </Button>
        </div>

        {/* Result */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-center">
          {error ? (
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">⚠️</p>
              <p>{error}</p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {fallbackNote && (
                <p className="text-xs text-muted-foreground text-center bg-muted/50 rounded-lg px-3 py-2">{fallbackNote}</p>
              )}
              {/* Gauge bar */}
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>P10</span>
                  <span>Median</span>
                  <span>P90</span>
                </div>
                <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${gaugePosition}%`,
                      background: result.diffPct >= 0
                        ? "linear-gradient(90deg, hsl(160, 84%, 39%), hsl(239, 84%, 67%))"
                        : "linear-gradient(90deg, hsl(0, 84%, 60%), hsl(38, 92%, 50%))",
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-foreground rounded-full border-2 border-background shadow-lg"
                    style={{ left: `calc(${gaugePosition}% - 8px)` }}
                  />
                </div>
              </div>

              <p className={`text-lg font-semibold ${result.diffPct >= 0 ? "text-emerald-400" : "text-warning"}`}>
                {result.message}
              </p>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Median</p>
                  <p className="text-lg font-bold tabular-nums">{result.median.toLocaleString("sv-SE")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Din lön</p>
                  <p className="text-lg font-bold tabular-nums">{parseInt(salary).toLocaleString("sv-SE")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Differens</p>
                  <p className={`text-lg font-bold tabular-nums ${result.diff >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                    {result.diff >= 0 ? "+" : ""}{result.diff.toLocaleString("sv-SE")} ({result.diffPct >= 0 ? "+" : ""}{result.diffPct}%)
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Du ligger på den <span className="font-medium text-foreground">{result.percentile}:e</span> percentilen — {100 - result.percentile}% tjänar mer
              </p>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">📊</p>
              <p>Fyll i dina uppgifter och klicka "Jämför" för att se hur din lön står sig</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SalaryComparator;
