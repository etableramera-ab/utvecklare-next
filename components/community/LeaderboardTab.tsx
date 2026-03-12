'use client'
import { useState } from "react";
import { Trophy, MessageSquare, CheckCircle, ArrowBigUp, Code2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLeaderboard } from "@/hooks/useCommunity";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

const rankColors: Record<string, string> = {
  "AI-legend": "bg-gradient-to-r from-primary to-secondary text-primary-foreground",
  "Senior Expert": "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  Legend: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  Expert: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  Bidragare: "bg-green-500/10 text-green-400 border-green-500/30",
  Senior: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  Aktiv: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  Nybörjare: "bg-muted text-muted-foreground border-border",
};

const rankThresholds = [
  { min: 0, rank: "Nybörjare", next: 50 },
  { min: 50, rank: "Aktiv", next: 200 },
  { min: 200, rank: "Bidragare", next: 500 },
  { min: 500, rank: "Expert", next: 1000 },
  { min: 1000, rank: "Senior Expert", next: 2500 },
  { min: 2500, rank: "AI-legend", next: null },
];

const podiumColors = ["border-yellow-500/50 bg-yellow-500/5", "border-gray-400/50 bg-gray-400/5", "border-amber-700/50 bg-amber-700/5"];
const podiumLabels = ["🥇", "🥈", "🥉"];

const LeaderboardTab = () => {
  const { leaders, loading } = useLeaderboard();
  const { user } = useAuth();
  const [period] = useState("all");

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (leaders.length === 0) {
    return (
      <div className="text-center py-16">
        <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Leaderboard är tomt. Bidra till communityn för att synas här!</p>
      </div>
    );
  }

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);
  const userEntry = user ? leaders.find((l: any) => l.user_id === user.id) : null;
  const userRank = userEntry ? leaders.indexOf(userEntry) + 1 : null;
  const currentThreshold = userEntry ? rankThresholds.find(t => (userEntry.total_points ?? 0) >= t.min && (t.next === null || (userEntry.total_points ?? 0) < t.next)) : null;

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-8">
      <div className="space-y-8">
        {/* Time filter */}
        <Tabs value={period} className="w-fit">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="week" disabled>Denna vecka</TabsTrigger>
            <TabsTrigger value="month" disabled>Denna månad</TabsTrigger>
            <TabsTrigger value="all">All tid</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Top 3 Podium */}
        {top3.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 items-end">
            {[1, 0, 2].map(idx => {
              const l = top3[idx];
              if (!l) return null;
              const name = l.profiles?.full_name || "Anonym";
              const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2);
              const isFirst = idx === 0;
              return (
                <div key={l.user_id} className={`text-center p-4 sm:p-6 rounded-xl border ${podiumColors[idx]} ${isFirst ? "lg:-mt-4" : ""}`}>
                  <div className="text-2xl mb-2">{podiumLabels[idx]}</div>
                  <Avatar className={`mx-auto mb-2 ${isFirst ? "w-16 h-16" : "w-12 h-12"}`}>
                    <AvatarFallback className={`bg-accent ${isFirst ? "text-lg" : "text-sm"}`}>{initials}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-foreground text-sm truncate">{name}</p>
                  <Badge className={`text-[10px] px-1.5 py-0 mt-1 ${rankColors[l.rank] || rankColors.Nybörjare}`}>
                    {l.rank}
                  </Badge>
                  <p className="text-lg font-bold gradient-text mt-2">{l.total_points}</p>
                  <p className="text-[10px] text-muted-foreground">poäng</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Rest of leaderboard */}
        <div className="space-y-2">
          {rest.map((l: any, i: number) => {
            const name = l.profiles?.full_name || "Anonym";
            const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2);
            const isUser = user && l.user_id === user.id;

            return (
              <div
                key={l.user_id}
                className={`flex items-center gap-4 p-4 rounded-lg bg-card border border-border ${isUser ? "ring-1 ring-primary/50 bg-primary/5" : ""}`}
              >
                <span className="text-sm font-bold w-8 text-center text-muted-foreground">
                  {i + 4}
                </span>
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-accent text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">{name}</span>
                    <Badge className={`text-[10px] px-1.5 py-0 ${rankColors[l.rank] || rankColors.Nybörjare}`}>
                      {l.rank}
                    </Badge>
                    {isUser && <span className="text-[10px] text-primary">(Du)</span>}
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>{l.posts_count} inlägg</span>
                    <span>{l.comments_count} svar</span>
                    <span>{l.accepted_answers} accepterade</span>
                    <span className="hidden sm:inline">{l.showcase_projects} projekt</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold gradient-text">{l.total_points}</span>
                  <p className="text-[10px] text-muted-foreground">poäng</p>
                </div>
              </div>
            );
          })}
        </div>

        {userRank && userRank > 3 && (
          <p className="text-sm text-muted-foreground text-center">Din position: <strong className="text-foreground">#{userRank}</strong> av {leaders.length}</p>
        )}
      </div>

      {/* Sidebar */}
      <aside className="space-y-6">
        {/* User stats */}
        {userEntry && (
          <div className="rounded-lg bg-card border border-border p-5">
            <h3 className="font-semibold text-foreground text-sm mb-3">Dina stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Poäng</span>
                <span className="font-bold gradient-text">{userEntry.total_points}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rank</span>
                <Badge className={`text-[10px] ${rankColors[userEntry.rank] || rankColors.Nybörjare}`}>{userEntry.rank}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Inlägg</span>
                <span className="text-foreground">{userEntry.posts_count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Svar</span>
                <span className="text-foreground">{userEntry.comments_count}</span>
              </div>
              {currentThreshold?.next && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-1">
                    Nästa rank: {rankThresholds[rankThresholds.indexOf(currentThreshold) + 1]?.rank}
                  </p>
                  <Progress value={((userEntry.total_points - currentThreshold.min) / (currentThreshold.next - currentThreshold.min)) * 100} className="h-2" />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {userEntry.total_points}/{currentThreshold.next} poäng
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* How to earn points */}
        <div className="rounded-lg bg-card border border-border p-5">
          <h3 className="font-semibold text-foreground text-sm mb-3">Så tjänar du poäng</h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>Nytt foruminlägg</span><span className="text-foreground font-medium">+5</span></div>
            <div className="flex justify-between"><span>Svar/kommentar</span><span className="text-foreground font-medium">+2</span></div>
            <div className="flex justify-between"><span>Accepterat svar</span><span className="text-foreground font-medium">+15</span></div>
            <div className="flex justify-between"><span>Upvote mottagen</span><span className="text-foreground font-medium">+1</span></div>
            <div className="flex justify-between"><span>Showcase-projekt</span><span className="text-foreground font-medium">+10</span></div>
          </div>
        </div>

        <Link href="/foretag" className="block p-4 rounded-lg border border-dashed border-border hover:border-primary/50 transition-colors text-center group">
          <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">Din annons här</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">Annonsera på utvecklare.ai →</p>
        </Link>
      </aside>
    </div>
  );
};

export default LeaderboardTab;
