'use client'
import { Trophy, MessageCircle, Plus, ChevronDown, Flame, Brain, Languages, Eye, Settings2, Briefcase, HelpCircle, TrendingUp } from "lucide-react";
import Link from 'next/link'
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLeaderboard, FORUM_CATEGORIES, type ForumCategory } from "@/hooks/useCommunity";
import type { LucideIcon } from "lucide-react";

interface Props {
  activeCategory: ForumCategory;
  onCategoryChange: (cat: ForumCategory) => void;
  showNewPost?: boolean;
}

const CATEGORY_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  alla:            { icon: Flame,          label: "Alla" },
  allmant:         { icon: MessageCircle,  label: "Allmänt" },
  maskininlarning: { icon: Brain,          label: "Maskininlärning" },
  "llm-nlp":       { icon: Languages,      label: "NLP & LLM" },
  datorseende:     { icon: Eye,            label: "Datorseende" },
  mlops:           { icon: Settings2,      label: "MLOps & Infrastruktur" },
  "karriar-jobb":  { icon: Briefcase,      label: "Karriär & Jobb" },
  "fragor-svar":   { icon: HelpCircle,     label: "Frågor & Svar" },
  "nyheter-trender": { icon: TrendingUp,   label: "Nyheter & Trender" },
};

const CommunitySidebar = ({ activeCategory, onCategoryChange, showNewPost = true }: Props) => {
  const { leaders } = useLeaderboard();

  return (
    <aside className="space-y-6">
      {/* Category nav */}
      <div className="rounded-lg bg-card border border-border p-4">
        <h3 className="font-semibold text-foreground text-sm mb-3">Kategorier</h3>
        <nav className="space-y-0.5">
          {FORUM_CATEGORIES.map(c => {
            const meta = CATEGORY_ICONS[c.slug];
            const Icon = meta?.icon;
            const label = meta?.label ?? c.label;
            return (
              <button
                key={c.slug}
                onClick={() => onCategoryChange(c.slug as ForumCategory)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2.5 ${
                  activeCategory === c.slug
                    ? "gradient-bg text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* New post CTA */}
      {showNewPost && (
        <Button className="w-full gradient-bg text-primary-foreground hover:opacity-90" asChild>
          <Link href="/community/nytt">
            <Plus className="w-4 h-4 mr-1" /> Ny diskussion
          </Link>
        </Button>
      )}

      {/* Community rules */}
      <Collapsible>
        <div className="rounded-lg bg-card border border-border p-4">
          <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-semibold text-foreground">
            Community-regler
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-2 text-xs text-muted-foreground">
            <p>• Var respektfull mot andra medlemmar</p>
            <p>• Håll dig on-topic i rätt kategori</p>
            <p>• Ingen spam eller självpromotion</p>
            <p>• Sök innan du frågar</p>
            <p>• Dela kod med kodblock för läsbarhet</p>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Top contributors */}
      {leaders.length > 0 && (
        <div className="rounded-lg bg-card border border-border p-5">
          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4 text-sm">
            <Trophy className="w-4 h-4 text-warning" />
            Topbidragare
          </h3>
          <ul className="space-y-3">
            {leaders.slice(0, 5).map((l: any, i: number) => {
              const name = l.profiles?.full_name || "Anonym";
              return (
                <li key={l.user_id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="text-[10px] bg-accent">
                      {name.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">{name}</span>
                    <div className="flex gap-3 text-[11px] text-muted-foreground">
                      <span>{l.total_points} poäng</span>
                      <span className="text-primary/80">{l.rank}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Discord */}
      <div className="rounded-lg bg-card border border-border p-5">
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2 text-sm">
          <MessageCircle className="w-4 h-4 text-secondary" />
          Discord
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Chatta i realtid med andra svenska AI-utvecklare.
        </p>
        <Button variant="outline" className="w-full border-border" asChild>
          <a href="https://discord.gg" target="_blank" rel="noopener noreferrer">
            Gå med i vår Discord →
          </a>
        </Button>
      </div>

      {/* Ad placeholder */}
      <Link href="/foretag" className="block relative rounded-lg overflow-hidden border border-border group" style={{ minHeight: "200px" }}>\n
        <img src="https://images.unsplash.com/photo-1531746790095-e5906b947fb1?w=400&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />\n
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />\n
        <div className="absolute inset-0 flex flex-col items-center justify-end p-5 text-center">\n
          <p className="text-sm font-bold text-white drop-shadow">Annonsera här</p>\n
          <p className="text-xs text-white/80 mt-1">Nå Sveriges AI-utvecklare →</p>\n
        </div>\n
      </Link>
    </aside>
  );
};

export default CommunitySidebar;
