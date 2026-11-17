'use client';

import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero */}
        <section className="mb-10 sm:mb-14">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
                Bygg framtidens applikationer.<br />
                <span className="text-cyan-600">Snabbare. Smartare. Tillsammans.</span>
              </h1>
              <p className="mt-4 text-lg text-slate-600 max-w-lg">
                Nyheter, verktyg och jobb för dig som bygger morgondagens teknik med AI.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link href="/nyheter" className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-700 text-white rounded-lg font-medium hover:bg-indigo-800 shadow-md">
                  Läs de senaste nyheterna →
                </Link>
                <Link href="/verktyg" className="inline-flex items-center justify-center px-5 py-2.5 text-indigo-700 font-medium hover:underline">
                  Bläddra bland verktyg →
                </Link>
              </div>
            </div>

            {/* Dark featured card */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 sm:p-8 text-white shadow-2xl">
              <div className="absolute inset-0 opacity-50 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500" />
              <div className="relative">
                <span className="inline-block px-2.5 py-1 text-xs font-medium bg-indigo-600/80 rounded-full mb-3">FEATURED</span>
                <h2 className="text-xl sm:text-2xl font-semibold leading-snug">
                  Anthropic lanserar Claude 3.5 Sonnet – starkare resonemang och lägre kostnad
                </h2>
                <p className="mt-2 text-slate-300 text-sm sm:text-base">
                  Ny modell med topprestanda på kod, matematik och verktygsanvändning.
                </p>
                <div className="mt-4 text-sm text-slate-400">18 JUN 2024 • ANTHROPIC</div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest news */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">Senaste nyheterna</h2>
            <Link href="/nyheter" className="text-sm text-indigo-700 hover:underline">Visa alla →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { logo: "OpenAI", title: "OpenAI lanserar GPT-4o mini", date: "17 JUN" },
              { logo: "Google", title: "Google I/O 2024: AI everywhere", date: "16 JUN" },
              { logo: "Meta", title: "Meta presenterar Llama 3.1", date: "15 JUN" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-5 shadow-md border border-slate-200/60 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="text-xs font-medium text-slate-500 mb-2">{item.logo}</div>
                <h3 className="font-medium text-slate-900 leading-snug">{item.title}</h3>
                <div className="mt-3 text-xs text-slate-400">{item.date}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Tools + Jobs */}
        <section className="grid lg:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-5">Verktyg som boostar din utveckling</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {["LangChain", "Cursor", "GitHub Copilot", "Ollama", "Pinecone", "Modal"].map((tool) => (
                <div key={tool} className="bg-white rounded-lg p-4 text-center shadow-md border border-slate-200/60 text-sm font-medium text-slate-700 hover:shadow-lg transition-shadow">
                  {tool}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-5">Spana in lediga roller</h2>
            <div className="space-y-3">
              {[
                { title: "AI Engineer", company: "Klarna", loc: "Stockholm / Remote" },
                { title: "Backend Engineer (Go)", company: "Peltar", loc: "Göteborg / Remote" },
                { title: "ML Engineer", company: "Northvolt", loc: "Stockholm" },
              ].map((job) => (
                <div key={job.title} className="bg-white rounded-xl p-4 shadow-md border border-slate-200/60 flex justify-between items-center hover:shadow-lg transition-shadow">
                  <div>
                    <div className="font-medium text-slate-900">{job.title}</div>
                    <div className="text-sm text-slate-500">{job.company} • {job.loc}</div>
                  </div>
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">Heltid</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
