'use client';

import Navbar from "@/components/Navbar";
import { useTools } from "@/hooks/useTools";

export default function VerktygPage() {
  const { tools, loading } = useTools();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Dark hero with stronger light effect */}
        <section className="mb-10">
          <div className="relative overflow-hidden rounded-2xl bg-slate-950 text-white p-7 sm:p-12 shadow-2xl">
            <div className="absolute -inset-1 opacity-50 bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-400 blur-xl" />
            <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-indigo-600 via-purple-700 to-cyan-500" />
            <div className="relative max-w-2xl z-10">
              <h1 className="text-3xl sm:text-4xl font-bold">Verktyg för AI-utvecklare</h1>
              <p className="mt-4 text-slate-300 text-base">
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
              className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${c === "Alla verktyg" ? "bg-indigo-700 text-white border-indigo-700" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Tools grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-52 bg-white rounded-2xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {tools.slice(0, 12).map((tool) => (
              <div key={tool.id} className="bg-white rounded-2xl p-6 shadow-md border border-slate-200/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                <h2 className="font-semibold text-slate-900">{tool.name}</h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-3">{tool.tagline || tool.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {(tool.tags || []).slice(0, 3).map((t) => (
                    <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">{t}</span>
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
