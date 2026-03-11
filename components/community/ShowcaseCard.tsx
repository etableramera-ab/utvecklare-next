'use client'
import Link from 'next/link'
import { ArrowBigUp, Github, ExternalLink, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

export interface ShowcaseProjectRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  demo_url: string | null;
  github_url: string | null;
  tech_stack: string[] | null;
  upvotes: number;
  comment_count: number;
  views: number;
  is_featured: boolean;
  created_at: string;
  user_id: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
}

const ShowcaseCard = ({ project }: { project: ShowcaseProjectRow }) => {
  const { user } = useAuth();
  const authorName = project.profiles?.full_name || "Anonym";
  const initials = authorName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  const [votes, setVotes] = useState(project.upvotes ?? 0);
  const [voted, setVoted] = useState(false);

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({ title: "Logga in för att rösta", variant: "destructive" });
      return;
    }
    if (voted) {
      await supabase.from("showcase_votes").delete().eq("user_id", user.id).eq("project_id", project.id);
      setVoted(false);
      setVotes(v => v - 1);
    } else {
      await supabase.from("showcase_votes").insert({ user_id: user.id, project_id: project.id });
      setVoted(true);
      setVotes(v => v + 1);
    }
  };

  return (
    <Link href={`/community/showcase/${project.slug}`} className="block">
      <div className="rounded-lg bg-card border border-border card-hover overflow-hidden h-full flex flex-col">
        {/* Thumbnail — always same height */}
        <div className="aspect-video overflow-hidden bg-muted">
          {project.thumbnail_url ? (
            <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <span className="text-lg font-bold text-muted-foreground/50 px-4 text-center line-clamp-2">{project.title}</span>
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{project.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{project.description}</p>

          {project.tech_stack && project.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {project.tech_stack.slice(0, 4).map(t => (
                <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0">{t}</Badge>
              ))}
              {project.tech_stack.length > 4 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{project.tech_stack.length - 4}</Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1.5">
              <Avatar className="w-5 h-5">
                <AvatarFallback className="text-[9px] bg-accent">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{authorName}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleVote}
                className={`flex items-center gap-1 text-xs transition-colors ${voted ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <ArrowBigUp className="w-3.5 h-3.5" />{votes}
              </button>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="w-3 h-3" />{project.comment_count ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ShowcaseCard;
