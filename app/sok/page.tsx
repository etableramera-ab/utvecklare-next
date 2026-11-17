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
    if (!q) {
      setLoading(false);
      return;
    }

    const search = async () => {
      setLoading(true);
      const [articlesRes, jobsRes, toolsRes] = await Promise.all([
        supabase.from("articles").select("id, title, slug, excerpt, published_at").eq("is_published", true).ilike("title", `%${q}%`).limit(10),
        supabase.from("jobs").select("id, title, slug, location, companies(name)").eq("is_active", true).ilike("title", `%${q}%`).limit(10),
        supabase.from("tools").select("id, name, slug, tagline").eq("is_published", true).ilike("name", `%${q}%`).limit(10),
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Sökresultat</h1>
        <p className="text-slate-600 mb-8">Resultat för “{q}”</p>

        {loading ? (
          <div>Söker...</div>
        ) : (
          <div className="space-y-10">
            {/* Articles */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Nyheter</h2>
              {results.articles.length === 0 ? (
                <p className="text-slate-500 text-sm">Inga nyheter hittades.</p>
              ) : (
                <div className="space-y-3">
                  {results.articles.map((a) => (
                    <Link key={a.id} href={`/nyheter/${a.slug}`} className="block bg-white p-4 rounded-lg border hover:shadow-sm">
                      <div className="font-medium">{a.title}</div>
                      <div className="text-sm text-slate-500 mt-1 line-clamp-2">{a.excerpt}</div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Jobs */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Jobb</h2>
              {results.jobs.length === 0 ? (
                <p className="text-slate-500 text-sm">Inga jobb hittades.</p>
              ) : (
                <div className="space-y-3">
                  {results.jobs.map((j) => (
                    <Link key={j.id} href={`/jobb/${j.slug}`} className="block bg-white p-4 rounded-lg border hover:shadow-sm">
                      <div className="font-medium">{j.title}</div>
                      <div className="text-sm text-slate-500">{j.company_name} • {j.location}</div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Tools */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Verktyg</h2>
              {results.tools.length === 0 ? (
                <p className="text-slate-500 text-sm">Inga verktyg hittades.</p>
              ) : (
                <div className="space-y-3">
                  {results.tools.map((t) => (
                    <div key={t.id} className="bg-white p-4 rounded-lg border">
                      <div className="font-medium">{t.name}</div>
                      <div className="text-sm text-slate-500 mt-1">{t.tagline}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
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
