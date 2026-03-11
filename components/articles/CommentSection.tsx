'use client'
import { useState } from "react";
import Link from 'next/link'
import { MessageSquare, Reply, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComments } from "@/hooks/useArticles";

interface Props {
  articleId: string;
}

function CommentItem({ comment, user, onReply, onEdit, onDelete, depth = 0, allComments }: any) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editText, setEditText] = useState(comment.content);

  const profile = comment.profiles;
  const name = profile?.full_name || "Anonym";
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase();
  const isOwner = user?.id === comment.user_id;
  const children = allComments.filter((c: any) => c.parent_comment_id === comment.id);

  const handleReply = () => {
    if (!replyText.trim()) return;
    onReply(replyText, comment.id);
    setReplyText("");
    setReplying(false);
  };

  const handleEdit = () => {
    if (!editText.trim()) return;
    onEdit(comment.id, editText);
    setEditing(false);
  };

  return (
    <div className={`${depth > 0 ? "ml-6 pl-4 border-l-2 border-border" : ""}`}>
      <div className="p-4 rounded-lg bg-card border border-border mb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-foreground">{initials}</div>
          <span className="text-sm font-medium text-foreground">{name}</span>
          {comment.is_edited && <span className="text-xs text-tertiary">(redigerad)</span>}
          <span className="text-xs text-tertiary ml-auto">
            {new Date(comment.created_at).toLocaleDateString("sv-SE")}
          </span>
        </div>

        {editing ? (
          <div className="space-y-2">
            <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-md bg-accent border border-border text-sm text-foreground outline-none resize-none" />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEdit} className="gradient-bg text-primary-foreground text-xs">Spara</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="text-xs">Avbryt</Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{comment.content}</p>
        )}

        <div className="flex items-center gap-2 mt-2">
          {depth < 2 && user && (
            <button onClick={() => setReplying(!replying)} className="flex items-center gap-1 text-xs text-tertiary hover:text-foreground transition-colors">
              <Reply className="w-3 h-3" /> Svara
            </button>
          )}
          {isOwner && !editing && (
            <>
              <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-tertiary hover:text-foreground transition-colors">
                <Edit3 className="w-3 h-3" /> Redigera
              </button>
              <button onClick={() => { if (confirm("Är du säker på att du vill ta bort kommentaren?")) onDelete(comment.id); }}
                className="flex items-center gap-1 text-xs text-tertiary hover:text-destructive transition-colors">
                <Trash2 className="w-3 h-3" /> Ta bort
              </button>
            </>
          )}
        </div>

        {replying && (
          <div className="mt-3 space-y-2">
            <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Skriv ett svar…" rows={2}
              className="w-full px-3 py-2 rounded-md bg-accent border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none" />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleReply} className="gradient-bg text-primary-foreground text-xs">Svara</Button>
              <Button size="sm" variant="ghost" onClick={() => setReplying(false)} className="text-xs">Avbryt</Button>
            </div>
          </div>
        )}
      </div>

      {children.map((child: any) => (
        <CommentItem key={child.id} comment={child} user={user} onReply={onReply} onEdit={onEdit} onDelete={onDelete} depth={depth + 1} allComments={allComments} />
      ))}
    </div>
  );
}

const CommentSection = ({ articleId }: Props) => {
  const { comments, loading, addComment, editComment, deleteComment, user } = useComments(articleId);
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addComment(text);
    setText("");
  };

  const topLevel = comments.filter(c => !c.parent_comment_id);

  return (
    <div className="mb-10">
      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" /> Kommentarer ({comments.length})
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={text} onChange={e => setText(e.target.value)}
            placeholder="Dela dina tankar…" rows={3}
            className="w-full px-4 py-3 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors resize-none"
          />
          <Button type="submit" size="sm" className="mt-2 gradient-bg text-primary-foreground hover:opacity-90">Kommentera</Button>
        </form>
      ) : (
        <div className="mb-6 p-4 rounded-lg bg-card border border-border text-center">
          <p className="text-sm text-muted-foreground">
            <Link href="/logga-in" className="text-primary hover:underline">Logga in</Link> för att kommentera
          </p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-1">
          {topLevel.map(c => (
            <CommentItem key={c.id} comment={c} user={user} onReply={addComment} onEdit={editComment} onDelete={deleteComment} depth={0} allComments={comments} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
