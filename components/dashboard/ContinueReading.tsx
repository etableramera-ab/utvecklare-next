'use client'
import { useState, useEffect } from "react";
import Link from 'next/link'
import { Clock, BookOpen, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { getCategorySlug, type ArticleRow } from "@/hooks/useArticles";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReadingItem {
  article_id: string;
  scroll_percentage: number;
  read_at: string;
  articles: ArticleRow;
}

const ContinueReading = ({ userId }: { userId: string }) => {
  const [items, setItems] = useState<ReadingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("reading_history")
      .select("article_id, scroll_percentage, read_at, articles(*)")
      .eq("user_id", userId)
      .lt("scroll_percentage", 90)
      .order("read_at", { ascending: false })
      .limit(4)
      .then(({ data }) => {
        setItems((data as unknown as ReadingItem[]) || []);
        setLoading(false);
      });
  }, [userId]);

  if (loading || items.length === 0) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Fortsätt läsa
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/kunskapshubb">Alla artiklar <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => {
          const a = item.articles;
          if (!a) return null;
          const catSlug = getCategorySlug(a.category);
          return (
            <Link
              key={item.article_id}
              href={`/kunskapshubb/${catSlug}/${a.slug}`}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              {a.hero_image_url && (
                <img
                  src={a.hero_image_url}
                  alt={a.title}
                  className="w-16 h-12 rounded object-cover shrink-0"
                  loading="lazy"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {a.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {a.reading_time_minutes || 5} min
                  </span>
                  <span className="text-xs text-muted-foreground">{item.scroll_percentage}% läst</span>
                </div>
                <Progress value={item.scroll_percentage} className="h-1 mt-1.5" />
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ContinueReading;
