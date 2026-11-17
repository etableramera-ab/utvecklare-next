'use client';

import Navbar from "@/components/Navbar";

export default function VerktygPage() {
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[
            { name: "LangChain", desc: "Bygg kontextika LLM-applikationer med kedjor, agenter och minne.", tags: ["LLM", "Ramverk"] },
            { name: "Cursor", desc: "AI-driven kodredigerare byggd för snabb utveckling och reflektion.", tags: ["Kod", "AI Editor"] },
            { name: "GitHub Copilot", desc: "Din AI-parprogrammerare direkt i VS Code och din favorit-editor.", tags: ["Kod", "Assistant"] },
            { name: "Ollama", desc: "Kör stora modeller lokalt på din maskin. Enkelt och effektivt.", tags: ["Lokalt", "LLM"] },
            { name: "Pinecone", desc: "Serverless vector database för att lagra, söka och rekommendera.", tags: ["Vector DB"] },
            { name: "Weaviate", desc: "Öppen vector-sökmotor för att builda skalbara AI-applikationer.", tags: ["Vector DB"] },
            { name: "Chroma", desc: "AI-native embeddings databas för att builda intelligenta appar.", tags: ["Embeddings"] },
            { name: "Replit", desc: "Bygg, dela och deploya AI-applikationer direkt från molnet.", tags: ["Deployment"] },
          ].map((tool) => (
            <div key={tool.name} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <h2 className="font-semibold text-slate-900">{tool.name}</h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{tool.desc}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {tool.tags.map((t) => (
                  <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
