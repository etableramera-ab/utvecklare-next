'use client';
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Search, CheckCircle2, XCircle, DollarSign, Users, TrendingUp } from "lucide-react";

const AdminSalary = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: submissions, refetch } = useQuery({
    queryKey: ["admin-salary-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_submissions")
        .select("*")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: salaryData } = useQuery({
    queryKey: ["admin-salary-data"],
    queryFn: async () => {
      const { data, error } = await supabase.from("salary_data").select("*").eq("year", 2026);
      if (error) throw error;
      return data;
    },
  });

  const toggleApproved = async (id: string, current: boolean) => {
    await supabase.from("salary_submissions").update({ is_approved: !current }).eq("id", id);
    refetch();
  };

  const filtered = (submissions || []).filter((s) => {
    if (filter === "approved" && !s.is_approved) return false;
    if (filter === "pending" && s.is_approved) return false;
    if (search && !s.role.toLowerCase().includes(search.toLowerCase()) && !s.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const avgSalary = submissions?.length
    ? Math.round(submissions.reduce((a, b) => a + b.monthly_salary, 0) / submissions.length)
    : 0;

  const roleStats = (salaryData || []).reduce<Record<string, number[]>>((acc, r) => {
    if (!acc[r.role]) acc[r.role] = [];
    acc[r.role].push(r.salary_median);
    return acc;
  }, {});

  const chartData = Object.entries(roleStats)
    .map(([role, medians]) => ({
      role: role.length > 16 ? role.slice(0, 14) + "…" : role,
      median: Math.round(medians.reduce((a, b) => a + b, 0) / medians.length),
    }))
    .sort((a, b) => b.median - a.median);

  const companySizeLabels: Record<string, string> = {
    startup: "Startup", small: "Litet", medium: "Medel", large: "Stort", enterprise: "Enterprise",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lönestatistik</h1>
          <p className="text-muted-foreground text-sm">Hantera lönebidrag och referensdata</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-5 flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{submissions?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Totala bidrag</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-5 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold">{avgSalary.toLocaleString("sv-SE")} SEK</p>
                <p className="text-xs text-muted-foreground">Genomsnittlig rapporterad lön</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-5 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{salaryData?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Referensdatapunkter</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Genomsnittlig lön per roll (referensdata)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} stroke="hsl(215, 16%, 57%)" fontSize={12} />
                <YAxis type="category" dataKey="role" width={130} stroke="hsl(215, 16%, 57%)" fontSize={12} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
                        <p className="text-foreground font-medium">{payload[0].payload.role}</p>
                        <p className="text-primary">{payload[0].value?.toLocaleString("sv-SE")} SEK/mån</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="median" fill="hsl(239, 84%, 67%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <CardTitle className="text-lg">Lönebidrag</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-background border-border w-48"
                    placeholder="Sök roll/stad..."
                  />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-36 bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alla</SelectItem>
                    <SelectItem value="approved">Godkända</SelectItem>
                    <SelectItem value="pending">Ej godkända</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll</TableHead>
                    <TableHead>Nivå</TableHead>
                    <TableHead>Stad</TableHead>
                    <TableHead className="text-right">Lön</TableHead>
                    <TableHead>Företagstyp</TableHead>
                    <TableHead>Storlek</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.role}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{s.experience_level}</Badge></TableCell>
                      <TableCell>{s.city}</TableCell>
                      <TableCell className="text-right tabular-nums">{s.monthly_salary.toLocaleString("sv-SE")}</TableCell>
                      <TableCell className="text-muted-foreground">{s.company_type || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{s.company_size ? companySizeLabels[s.company_size] || s.company_size : "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString("sv-SE") : "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleApproved(s.id, s.is_approved ?? false)}
                          className={s.is_approved ? "text-emerald-400" : "text-destructive"}
                        >
                          {s.is_approved ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filtered.length && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        Inga bidrag hittades
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSalary;
