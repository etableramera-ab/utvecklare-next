'use client'
import Link from 'next/link'
import { Clock } from "lucide-react";
import { Article } from "@/types/articles";

interface Props {
  article: Article;
  featured?: boolean;
}

const ArticleCard = ({ article, featured }: Props) => {
  if (featured) {
    return (
      <Link href={`/kunskapshubb/${article.category_slug}/${article.slug}`} className="group block">
        <article className="rounded-lg bg-card border border-border card-hover overflow-hidden grid md:grid-cols-2 gap-0">
          <div className="aspect-video md:aspect-auto md:h-full overflow-hidden">
            <img src={article.hero_image_url ?? undefined} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          </div>
          <div className="p-6 lg:p-8 flex flex-col justify-center">
            <span className="self-start px-2.5 py-1 text-xs font-medium rounded-full gradient-bg text-primary-foreground mb-3">
              {article.category}
            </span>
            <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
              {article.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">{article.excerpt}</p>
            <div className="flex items-center justify-between text-sm text-tertiary">
              <span>{article.author_name} · {article.published_at ? new Date(article.published_at).toLocaleDateString("sv-SE") : "—"}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{article.reading_time_minutes} min</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/kunskapshubb/${article.category_slug}/${article.slug}`} className="group block">
      <article className="rounded-lg bg-card border border-border card-hover overflow-hidden flex flex-col h-full">
        <div className="relative aspect-video overflow-hidden">
          <img src={article.hero_image_url ?? undefined} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium rounded-full gradient-bg text-primary-foreground">
            {article.category}
          </span>
        </div>
        <div className="flex flex-col flex-1 p-5">
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{article.excerpt}</p>
          <div className="mt-auto flex items-center justify-between text-xs text-tertiary">
            <span>{article.author_name} · {article.published_at ? new Date(article.published_at).toLocaleDateString("sv-SE") : "—"}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{article.reading_time_minutes} min</span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ArticleCard;
