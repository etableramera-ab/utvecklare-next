'use client';

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useArticles } from "@/hooks/useArticles";

export default function NyheterPage() {
  const { articles, featured, loading } = useArticles("ai-nyheter", "", []);

  const displayArticles = articles.length > 0 ? articles : [];
  const hero = featured || displayArticles[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Dark hero with stronger light effect */}
        {hero && (
          <section className="mb-10">
            <div className="relative overflow-hidden rounded-2xl bg-slate-950 text-white p-7 sm:p-12 shadow-2xl">
              <div className="absolute -inset-1 opacity-50 bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-400 blur-xl" />
              <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-indigo-600 via-purple-700 to-cyan-500" />
              <div className="relative max-w-2xl z-10">
                <span className="inline-block px-3 py-1 text-xs font-medium bg-indigo-500/90 rounded-full mb-4">HUVUDNYHET</span>
                <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{hero.title}</h1>
                <p className="mt-4 text-slate-300 text-base">{hero.excerpt}</p>
                <div className="mt-5 text-sm text-slate-400">
                  {hero.published_at ? new Date(hero.published_at).toLocaleDateString("sv-SE") : ""} • {hero.author_name || "utvecklare.ai"}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["Alla nyheter", "OpenAI", "Anthropic", "Google", "xAI"].map((f) => (
            <button
              key={f}
              className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${f === "Alla nyheter" ? "bg-indigo-700 text-white border-indigo-700" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* News grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 bg-white rounded-2xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayArticles.slice(0, 9).map((item) => (
              <Link
                href={`/nyheter/${item.slug}`}
                key={item.id}
                className="block bg-white rounded-2xl p-6 shadow-md border border-slate-200/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
              >
                <div className="text-xs font-semibold text-indigo-600 mb-2 uppercase tracking-wide">{item.category || item.author_name}</div>
                <h2 className="font-medium text-slate-900 leading-snug mb-4">{item.title}</h2>
                <div className="text-xs text-slate-400">
                  {item.published_at ? new Date(item.published_at).toLocaleDateString("sv-SE") : ""}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
