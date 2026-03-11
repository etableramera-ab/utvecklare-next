'use client'
import { useState, useEffect } from "react";
import { CheckCircle, Reply, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import VoteButtons from "./VoteButtons";
import { useForumVote, type ForumCommentRow } from "@/hooks/useCommunity";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import ArticleRenderer from "@/components/articles/ArticleRenderer";

function timeAgo(dateStr: string) {
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

interface Props {
  comment: ForumCommentRow;
  replies: ForumCommentRow[];
  allComments: ForumCommentRow[];
  postUserId: string;
  postId: string;
  isLocked: boolean;
  onRefetch: () => void;
  depth?: number;
}

const ForumCommentItem = ({ comment, replies, allComments, postUserId, postId, isLocked, onRefetch, depth = 0 }: Props) => {
  const { user } = useAuth();
  const { userVote, score, setScore, vote } = useForumVote("comment", comment.id);
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setScore((comment.upvotes ?? 0) - (comment.downvotes ?? 0));
  }, [comment.upvotes, comment.downvotes, setScore]);

  const profile = comment.profiles;
  const displayName = profile?.full_name || "Anonym";
  const initials = displayName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  const isOwner = user?.id === comment.user_id;
  const isOP = user?.id === postUserId;

  const handleReply = async () => {
    if (!replyContent.trim() || !user) return;
    setSubmitting(true);
    // Max nesting depth 2 — reply at parent level if already nested
    const parentId = depth >= 1 ? comment.parent_comment_id || comment.id : comment.id;
    const { error } = await supabase.from("forum_comments").insert({
      post_id: postId,
      user_id: user.id,
      parent_comment_id: parentId,
      content: (depth >= 1 ? `@${displayName} ` : "") + replyContent,
    });
    if (error) {
      toast({ title: "Kunde inte svara", variant: "destructive" });
    } else {
      await supabase.from("forum_posts").update({
        comment_count: (await supabase.from("forum_comments").select("id", { count: "exact", head: true }).eq("post_id", postId)).count ?? 0,
        last_activity_at: new Date().toISOString(),
      }).eq("id", postId);
      toast({ title: "Svar publicerat!" });
      setReplyContent("");
      setShowReply(false);
      onRefetch();
    }
    setSubmitting(false);
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setSubmitting(true);
    await supabase.from("forum_comments").update({
      content: editContent,
      is_edited: true,
      updated_at: new Date().toISOString(),
    }).eq("id", comment.id);
    setEditing(false);
    setSubmitting(false);
    onRefetch();
  };

  const handleDelete = async () => {
    if (!confirm("Vill du verkligen ta bort denna kommentar?")) return;
    await supabase.from("forum_comments").delete().eq("id", comment.id);
    await supabase.from("forum_posts").update({
      comment_count: Math.max(0, ((await supabase.from("forum_comments").select("id", { count: "exact", head: true }).eq("post_id", postId)).count ?? 0)),
    }).eq("id", postId);
    toast({ title: "Kommentar borttagen" });
    onRefetch();
  };

  const handleAcceptAnswer = async () => {
    await supabase.from("forum_comments").update({ is_accepted_answer: true }).eq("id", comment.id);
    await supabase.from("forum_posts").update({
      is_solved: true,
      solved_comment_id: comment.id,
    }).eq("id", postId);
    // Update reputation for the answerer
    await supabase.rpc("upsert_reputation", { p_user_id: comment.user_id });
    toast({ title: "Svar markerat som accepterat! ✅" });
    onRefetch();
  };

  return (
    <div className={depth > 0 ? "ml-8 sm:ml-12 pl-4 border-l-2 border-border" : ""}>
      <div className={`flex gap-3 p-4 rounded-lg ${comment.is_accepted_answer ? "border-l-4 border-l-green-500 bg-green-500/5" : ""}`}>
        {/* Vote */}
        <div className="hidden sm:flex">
          <VoteButtons score={score} userVote={userVote} onVote={vote} size="sm" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Author */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Avatar className="w-7 h-7">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
              <AvatarFallback className="text-[10px] bg-accent">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">{displayName}</span>
            <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at)}</span>
            {comment.is_edited && <span className="text-xs text-muted-foreground">(redigerad)</span>}
            {comment.is_accepted_answer && (
              <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-[10px] px-1.5 py-0">
                <CheckCircle className="w-3 h-3 mr-0.5" /> Accepterat svar
              </Badge>
            )}
          </div>

          {/* Content */}
          {editing ? (
            <div className="space-y-2">
              <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="bg-muted border-border min-h-[80px]" />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEdit} disabled={submitting}>Spara</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Avbryt</Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-foreground/90 prose prose-invert prose-sm max-w-none mb-2">
              <ArticleRenderer content={comment.content} />
            </div>
          )}

          {/* Actions */}
          {!editing && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              <div className="sm:hidden">
                <VoteButtons score={score} userVote={userVote} onVote={vote} vertical={false} size="sm" />
              </div>
              {!isLocked && user && (
                <button onClick={() => setShowReply(!showReply)} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <Reply className="w-3 h-3" /> Svara
                </button>
              )}
              {isOP && !comment.is_accepted_answer && (
                <button onClick={handleAcceptAnswer} className="flex items-center gap-1 hover:text-green-400 transition-colors">
                  <CheckCircle className="w-3 h-3" /> Markera som svar
                </button>
              )}
              {isOwner && (
                <>
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <Pencil className="w-3 h-3" /> Redigera
                  </button>
                  <button onClick={handleDelete} className="flex items-center gap-1 hover:text-destructive transition-colors">
                    <Trash2 className="w-3 h-3" /> Ta bort
                  </button>
                </>
              )}
            </div>
          )}

          {/* Inline reply */}
          {showReply && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder={`Svara @${displayName}...`}
                className="bg-muted border-border min-h-[60px] text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleReply} disabled={submitting || !replyContent.trim()}>Skicka</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowReply(false)}>Avbryt</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {depth < 2 && replies.map(reply => (
        <ForumCommentItem
          key={reply.id}
          comment={reply}
          replies={allComments.filter(c => c.parent_comment_id === reply.id)}
          allComments={allComments}
          postUserId={postUserId}
          postId={postId}
          isLocked={isLocked}
          onRefetch={onRefetch}
          depth={depth + 1}
        />
      ))}
    </div>
  );
};

export default ForumCommentItem;
