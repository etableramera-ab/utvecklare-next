'use client';

import Navbar from "@/components/Navbar";
import { useTools } from "@/hooks/useTools";

export default function VerktygPage() {
  const { tools, loading } = useTools();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Dark hero */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 sm:p-10 shadow-xl">
            <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500" />
            <div className="relative max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-bold">Verktyg för AI-utvecklare</h1>
              <p className="mt-3 text-slate-300">
                En samling av de bästa verktygen och ramverken för att builda, skala och leverera AI-produkter snabbare.
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["Alla verktyg", "LLM & Ramverk", "Kod & Produktivitet", "Lokala modeller", "Vector DB"].map((c) => (
            <button
              key={c}
              className={`px-3 py-1.5 text-sm rounded-full border ${c === "Alla verktyg" ? "bg-indigo-700 text-white border-indigo-700" : "bg-white text-slate-600 border-slate-200"}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Tools grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 bg-white rounded-xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tools.slice(0, 12).map((tool) => (
              <div key={tool.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <h2 className="font-semibold text-slate-900">{tool.name}</h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-3">{tool.tagline || tool.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(tool.tags || []).slice(0, 3).map((t) => (
                    <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
