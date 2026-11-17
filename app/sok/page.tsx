'use client';

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState<{ articles: any[]; jobs: any[]; tools: any[] }>({ articles: [], jobs: [], tools: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q.trim()) {
      setLoading(false);
      return;
    }

    const search = async () => {
      setLoading(true);
      const term = `%${q.trim()}%`;

      const [articlesRes, jobsRes, toolsRes] = await Promise.all([
        supabase
          .from("articles")
          .select("id, title, slug, excerpt, published_at, tags")
          .eq("is_published", true)
          .or(`title.ilike.${term},excerpt.ilike.${term},tags.cs.{${q.trim()}}`)
          .limit(12),

        supabase
          .from("jobs")
          .select("id, title, slug, location, tech_tags, companies(name)")
          .eq("is_active", true)
          .or(`title.ilike.${term},location.ilike.${term}`)
          .limit(12),

        supabase
          .from("tools")
          .select("id, name, slug, tagline, description, tags")
          .eq("is_published", true)
          .or(`name.ilike.${term},tagline.ilike.${term},description.ilike.${term}`)
          .limit(12),
      ]);

      setResults({
        articles: articlesRes.data || [],
        jobs: (jobsRes.data || []).map((j: any) => ({ ...j, company_name: j.companies?.name })),
        tools: toolsRes.data || [],
      });
      setLoading(false);
    };

    search();
  }, [q]);

  const total = results.articles.length + results.jobs.length + results.tools.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Sökresultat</h1>
        <p className="text-slate-600 mb-8">
          {loading ? "Söker..." : `${total} resultat för “${q}”`}
        </p>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-lg animate-pulse border" />
            ))}
          </div>
        ) : total === 0 ? (
          <p className="text-slate-500">Inga resultat hittades. Prova ett annat sökord.</p>
        ) : (
          <div className="space-y-10">
            {/* Articles */}
            {results.articles.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Nyheter ({results.articles.length})</h2>
                <div className="space-y-3">
                  {results.articles.map((a) => (
                    <Link key={a.id} href={`/nyheter/${a.slug}`} className="block bg-white p-4 rounded-lg border hover:shadow-sm">
                      <div className="font-medium">{a.title}</div>
                      <div className="text-sm text-slate-500 mt-1 line-clamp-2">{a.excerpt}</div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Jobs */}
            {results.jobs.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Jobb ({results.jobs.length})</h2>
                <div className="space-y-3">
                  {results.jobs.map((j) => (
                    <Link key={j.id} href={`/jobb/${j.slug}`} className="block bg-white p-4 rounded-lg border hover:shadow-sm">
                      <div className="font-medium">{j.title}</div>
                      <div className="text-sm text-slate-500">{j.company_name} • {j.location}</div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Tools */}
            {results.tools.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">Verktyg ({results.tools.length})</h2>
                <div className="space-y-3">
                  {results.tools.map((t) => (
                    <div key={t.id} className="bg-white p-4 rounded-lg border">
                      <div className="font-medium">{t.name}</div>
                      <div className="text-sm text-slate-500 mt-1">{t.tagline || t.description}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SokPage() {
  return (
    <Suspense fallback={<div>Laddar...</div>}>
      <SearchResults />
    </Suspense>
  );
}
