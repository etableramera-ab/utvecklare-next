'use client'
import { useState, useEffect } from "react";
import Link from 'next/link'
import { Bookmark, Clock, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { getCategorySlug, type ArticleRow } from "@/hooks/useArticles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface BookmarkItem {
  id: string;
  article_id: string;
  created_at: string;
  articles: ArticleRow;
}

const BookmarkedArticles = ({ userId }: { userId: string }) => {
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = () => {
    supabase
      .from("bookmarks")
      .select("id, article_id, created_at, articles(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setItems((data as unknown as BookmarkItem[]) || []);
        setLoading(false);
      });
  };

  useEffect(() => { fetchBookmarks(); }, [userId]);

  const removeBookmark = async (bookmarkId: string) => {
    await supabase.from("bookmarks").delete().eq("id", bookmarkId);
    setItems(prev => prev.filter(i => i.id !== bookmarkId));
    toast({ title: "Bokmärke borttaget" });
  };

  if (loading) return null;

  if (items.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="text-center py-10 text-muted-foreground">
          <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Du har inga bokmärkta artiklar ännu.</p>
          <Button variant="outline" className="border-border mt-4" asChild>
            <Link href="/kunskapshubb">Utforska artiklar</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-primary" />
          Min läslista
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => {
          const a = item.articles;
          if (!a) return null;
          const catSlug = getCategorySlug(a.category);
          return (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
              <Link href={`/kunskapshubb/${catSlug}/${a.slug}`} className="flex items-start gap-3 flex-1 min-w-0">
                {a.hero_image_url && (
                  <img src={a.hero_image_url} alt={a.title} className="w-14 h-10 rounded object-cover shrink-0" loading="lazy" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                    <span>{a.category}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {a.reading_time_minutes || 5} min</span>
                  </p>
                </div>
              </Link>
              <button onClick={() => removeBookmark(item.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default BookmarkedArticles;
