'use client'
import Link from 'next/link'
import { Pin, MessageSquare, Eye, Clock, CheckCircle, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VoteButtons from "./VoteButtons";
import { useForumVote, FORUM_CATEGORIES, type ForumPostRow } from "@/hooks/useCommunity";
import { useEffect } from "react";

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just nu";
  if (mins < 60) return `${mins}m sedan`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h sedan`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d sedan`;
  return `${Math.floor(days / 7)}v sedan`;
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
}

const ForumPostCard = ({ post }: { post: ForumPostRow }) => {
  const catLabel = FORUM_CATEGORIES.find(c => c.slug === post.category)?.label ?? post.category;
  const { userVote, score, setScore, vote } = useForumVote("post", post.id);

  useEffect(() => {
    setScore((post.upvotes ?? 0) - (post.downvotes ?? 0));
  }, [post.upvotes, post.downvotes, setScore]);

  const profile = post.profiles;
  const displayName = profile?.full_name || "Anonym";

  return (
    <div className={`p-4 rounded-lg bg-card border transition-all hover:border-primary/30 ${post.is_pinned ? "border-l-2 border-l-primary bg-primary/5 border-primary/40" : "border-border"}`}>
      <div className="flex gap-3">
        {/* Vote column */}
        <div className="hidden sm:flex">
          <VoteButtons score={score} userVote={userVote} onVote={vote} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Badges row */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {post.is_pinned && <Pin className="w-3.5 h-3.5 text-warning shrink-0" />}
            {post.is_solved && (
              <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-[10px] px-1.5 py-0">
                <CheckCircle className="w-3 h-3 mr-0.5" /> Löst
              </Badge>
            )}
            {post.is_locked && <Lock className="w-3 h-3 text-muted-foreground" />}
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{catLabel}</Badge>
          </div>

          {/* Title */}
          <Link href={`/community/${post.slug || post.id}`}>
            <h3 className="font-semibold text-foreground mb-1.5 line-clamp-2 hover:text-primary transition-colors cursor-pointer text-base">
              {post.title}
            </h3>
          </Link>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{post.content?.substring(0, 150)}</p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {post.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{tag}</span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <Avatar className="w-5 h-5">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
                <AvatarFallback className="text-[9px] bg-accent">{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <span>{displayName}</span>
            </div>
            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post.comment_count}</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views}</span>
            <span className="flex items-center gap-1 sm:hidden">
              <VoteButtons score={score} userVote={userVote} onVote={vote} vertical={false} size="sm" />
            </span>
            <span className="flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" />{timeAgo(post.last_activity_at || post.updated_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPostCard;
