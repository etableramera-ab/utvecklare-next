'use client';

import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useArticleDetail, usePopularArticles } from "@/hooks/useArticles";

export default function NyhetArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { article, loading } = useArticleDetail(slug);
  const related = usePopularArticles();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-12">Laddar...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-12">Artikel hittades inte.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Dark hero */}
        <section className="mb-10">
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 sm:p-10 shadow-xl">
            <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium">{article.category || article.author_name}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{article.title}</h1>
              <p className="mt-4 text-slate-300 max-w-2xl">{article.excerpt}</p>
              <div className="mt-4 text-sm text-slate-400">
                {article.published_at ? new Date(article.published_at).toLocaleDateString("sv-SE") : ""}
                {article.reading_time_minutes ? ` • ${article.reading_time_minutes} min läsning` : ""}
              </div>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Article body */}
          <article className="lg:col-span-2 prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: article.content || "" }} />

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-4">Relaterade nyheter</h3>
              <div className="space-y-4">
                {related.slice(0, 3).map((item) => (
                  <Link key={item.id} href={`/nyheter/${item.slug}`} className="block group">
                    <div className="text-sm font-medium text-slate-900 group-hover:text-indigo-700 leading-snug">{item.title}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {item.published_at ? new Date(item.published_at).toLocaleDateString("sv-SE") : ""}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
              <h3 className="font-semibold text-slate-900 mb-2">Få nyheter direkt</h3>
              <p className="text-sm text-slate-600 mb-3">Prenumerera på vårt nyhetsbrev.</p>
              <input type="email" placeholder="din.epost@exempel.se" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 mb-2" />
              <button className="w-full py-2 bg-indigo-700 text-white text-sm rounded-lg font-medium">Prenumerera</button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
