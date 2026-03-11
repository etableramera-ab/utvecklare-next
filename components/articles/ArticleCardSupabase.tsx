'use client'
import Link from 'next/link'
import { Clock } from "lucide-react";
import type { ArticleRow } from "@/hooks/useArticles";
import { getCategorySlug } from "@/hooks/useArticles";

interface Props {
  article: ArticleRow;
  featured?: boolean;
}

function formatRelativeDate(dateStr: string | null) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Idag";
  if (days === 1) return "Igår";
  if (days < 7) return `${days} dagar sedan`;
  if (days < 30) return `${Math.floor(days / 7)} veckor sedan`;
  return new Date(dateStr).toLocaleDateString("sv-SE");
}

const ArticleCardSupabase = ({ article, featured }: Props) => {
  const catSlug = getCategorySlug(article.category);
  const link = `/kunskapshubb/${catSlug}/${article.slug}`;

  if (featured) {
    return (
      <Link href={link} className="group block">
        <article className="rounded-lg bg-card border border-border card-hover overflow-hidden grid md:grid-cols-5 gap-0">
          <div className="md:col-span-3 aspect-video md:aspect-auto md:min-h-[300px] overflow-hidden">
            <img src={article.hero_image_url || ""} alt={article.hero_image_alt || article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          </div>
          <div className="md:col-span-2 p-6 lg:p-8 flex flex-col justify-center">
            <span className="self-start px-2.5 py-1 text-xs font-medium rounded-full gradient-bg text-primary-foreground mb-3">
              {article.category}
            </span>
            <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-3">
              {article.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">{article.excerpt}</p>
            <div className="flex items-center gap-3 text-sm text-tertiary">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                  {(article.author_name || "?").split(" ").map(n => n[0]).join("")}
                </div>
                <span className="text-foreground font-medium text-sm">{article.author_name}</span>
              </div>
              <span>{formatRelativeDate(article.published_at)}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{article.reading_time_minutes || 5} min</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={link} className="group block">
      <article className="rounded-lg bg-card border border-border card-hover overflow-hidden flex flex-col h-full">
        <div className="relative aspect-video overflow-hidden">
          <img src={article.hero_image_url || ""} alt={article.hero_image_alt || article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium rounded-full bg-background/70 backdrop-blur-sm text-foreground">
            {article.category}
          </span>
        </div>
        <div className="flex flex-col flex-1 p-5">
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
          {(article.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {(article.tags || []).slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-muted text-secondary">{tag}</span>
              ))}
            </div>
          )}
          <div className="mt-auto flex items-center justify-between text-xs text-tertiary">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-primary-foreground text-[10px] font-bold shrink-0">
                {(article.author_name || "?").split(" ").map(n => n[0]).join("")}
              </div>
              <span>{article.author_name} · {formatRelativeDate(article.published_at)}</span>
            </div>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{article.reading_time_minutes || 5} min</span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ArticleCardSupabase;
