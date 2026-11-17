'use client';

import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function NyheterPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Dark hero */}
        <section className="mb-10">
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 sm:p-10 shadow-xl">
            <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500" />
            <div className="relative max-w-2xl">
              <span className="inline-block px-2.5 py-1 text-xs font-medium bg-indigo-600/80 rounded-full mb-3">HUVUDNYHET</span>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                OpenAI lanserar GPT-4o update: bäddade funktioner och lägre latens
              </h1>
              <p className="mt-3 text-slate-300">
                Ny version med snabbare svar, multimodal effektivitet och starkare kod- och verktygsstöd.
              </p>
              <div className="mt-4 text-sm text-slate-400">Idag • OpenAI</div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["Alla nyheter", "OpenAI", "Anthropic", "Google DeepMind", "xAI", "Hugging Face"].map((f) => (
            <button
              key={f}
              className={`px-3 py-1.5 text-sm rounded-full border ${f === "Alla nyheter" ? "bg-indigo-700 text-white border-indigo-700" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* News grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { source: "OpenAI", title: "OpenAI introducerar ny Assistants API med filhantering och kodtolkning", date: "23 maj 2024" },
            { source: "Anthropic", title: "Anthropic lanserar Claude 3.5 Sonnet: starkare resonemang, lägre kostnad", date: "22 maj 2024" },
            { source: "Google DeepMind", title: "Google DeepMind presenterar Genie 2: generativ simulering i stor skala", date: "21 maj 2024" },
            { source: "xAI", title: "xAI öppnar Grok-1.5 för utvecklare", date: "20 maj 2024" },
            { source: "Hugging Face", title: "Hugging Face lanserar Text Embeddings 2", date: "19 maj 2024" },
            { source: "Mistral", title: "Ny DeepMind-studie om skalning av agenter", date: "18 maj 2024" },
          ].map((item) => (
            <Link href="#" key={item.title} className="block bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="text-xs font-medium text-slate-500 mb-2">{item.source}</div>
              <h2 className="font-medium text-slate-900 leading-snug mb-3">{item.title}</h2>
              <div className="text-xs text-slate-400">{item.date}</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
