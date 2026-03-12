'use client';
import { useState, useEffect } from "react";
import { RefreshCw, CheckCircle, XCircle, Database, ExternalLink } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SyncResult {
  success: boolean;
  inserted?: number;
  updated?: number;
  deactivated?: number;
  totalActive?: number;
  errors?: string[];
  error?: string;
}

const AdminJobSyncPage = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);
  const [stats, setStats] = useState({ total: 0, external: 0, manual: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [{ count: total }, { count: external }, { count: manual }] = await Promise.all([
      supabase.from("jobs").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("jobs").select("id", { count: "exact", head: true }).eq("is_active", true).eq("source", "jobtech"),
      supabase.from("jobs").select("id", { count: "exact", head: true }).eq("is_active", true).eq("source", "manual"),
    ]);
    setStats({ total: total || 0, external: external || 0, manual: manual || 0 });
  };

  const runSync = async () => {
    setSyncing(true);
    setLastResult(null);
    try {
      const res = await fetch("/api/jobs/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || "UtvecklareAiCron2026"}` },
      });
      const data: SyncResult = await res.json();
      setLastResult(data);
      if (data.success) loadStats();
    } catch (err: any) {
      setLastResult({ success: false, error: err.message });
    }
    setSyncing(false);
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground mb-2">JobTech API — Jobb-synk</h1>
        <p className="text-muted-foreground mb-8">
          Synkroniserar AI/ML-jobb från Arbetsförmedlingens öppna API. Kör automatiskt varje dag kl 08:00 via Vercel Cron.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-lg bg-card border border-border text-center">
            <p className="text-3xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground mt-1">Totalt aktiva jobb</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border text-center">
            <p className="text-3xl font-bold text-primary">{stats.external}</p>
            <p className="text-xs text-muted-foreground mt-1">Från JobTech API</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border text-center">
            <p className="text-3xl font-bold text-foreground">{stats.manual}</p>
            <p className="text-xs text-muted-foreground mt-1">Manuellt publicerade</p>
          </div>
        </div>

        {/* Sync button */}
        <div className="p-6 rounded-lg bg-card border border-border mb-6">
          <h2 className="text-base font-semibold text-foreground mb-3">Manuell synkronisering</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hämtar jobb med 14 söktermer (machine learning, data scientist, NLP, MLOps m.fl.) och upsertar i Supabase.
            Tar 30–120 sekunder beroende på antal träffar.
          </p>
          <Button
            onClick={runSync}
            disabled={syncing}
            className="gradient-bg text-primary-foreground hover:opacity-90"
          >
            {syncing ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Synkar...</>
            ) : (
              <><RefreshCw className="w-4 h-4 mr-2" /> Synka nu</>
            )}
          </Button>
        </div>

        {/* Last result */}
        {lastResult && (
          <div className={`p-5 rounded-lg border ${lastResult.success ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"}`}>
            <div className="flex items-center gap-2 mb-3">
              {lastResult.success ? (
                <CheckCircle className="w-5 h-5 text-success" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive" />
              )}
              <h3 className="font-semibold text-foreground">
                {lastResult.success ? "Synk genomförd!" : "Synk misslyckades"}
              </h3>
            </div>
            {lastResult.success && (
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-muted-foreground">Nya jobb</dt><dd className="font-medium text-success">+{lastResult.inserted}</dd></div>
                <div><dt className="text-muted-foreground">Uppdaterade</dt><dd className="font-medium">{lastResult.updated}</dd></div>
                <div><dt className="text-muted-foreground">Avaktiverade</dt><dd className="font-medium text-warning">{lastResult.deactivated}</dd></div>
                <div><dt className="text-muted-foreground">Totalt aktiva</dt><dd className="font-medium">{lastResult.totalActive}</dd></div>
              </dl>
            )}
            {lastResult.error && <p className="text-sm text-destructive">{lastResult.error}</p>}
            {lastResult.errors && lastResult.errors.length > 0 && (
              <details className="mt-3">
                <summary className="text-xs text-muted-foreground cursor-pointer">{lastResult.errors.length} fel</summary>
                <ul className="mt-2 space-y-1">
                  {lastResult.errors.map((e, i) => <li key={i} className="text-xs text-destructive">{e}</li>)}
                </ul>
              </details>
            )}
          </div>
        )}

        {/* Setup info */}
        <div className="mt-8 p-5 rounded-lg bg-card border border-border">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Database className="w-4 h-4" /> Setup-krav
          </h3>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Kör SQL-migrationen i Supabase: <code className="bg-accent px-1 rounded text-xs">supabase/migrations/001_jobtech_columns.sql</code></li>
            <li>Registrera API-nyckel på <a href="https://apirequest.jobtechdev.se" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">apirequest.jobtechdev.se <ExternalLink className="w-3 h-3" /></a></li>
            <li>Lägg till <code className="bg-accent px-1 rounded text-xs">JOBTECH_API_KEY</code> i Vercel Environment Variables</li>
            <li>Lägg till <code className="bg-accent px-1 rounded text-xs">CRON_SECRET=UtvecklareAiCron2026</code> i Vercel Environment Variables</li>
            <li>Lägg till <code className="bg-accent px-1 rounded text-xs">SUPABASE_SERVICE_ROLE_KEY</code> i Vercel (för server-side skrivning)</li>
          </ol>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminJobSyncPage;
