'use client';

import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Hero */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.05] tracking-tight">
                Bygg framtidens<br />applikationer.<br />
                <span className="text-cyan-600">Snabbare. Smartare.<br />Tillsammans.</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 max-w-md leading-relaxed">
                Nyheter, verktyg och jobb för dig som bygger morgondagens teknik med AI.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/nyheter" className="inline-flex items-center justify-center px-7 py-3.5 bg-indigo-700 text-white rounded-xl font-medium hover:bg-indigo-800 shadow-lg shadow-indigo-200">
                  Läs de senaste nyheterna →
                </Link>
                <Link href="/verktyg" className="inline-flex items-center justify-center px-7 py-3.5 text-indigo-700 font-medium hover:underline">
                  Bläddra bland verktyg →
                </Link>
              </div>
            </div>

            {/* Dark featured card – closer to approved style */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-400 rounded-3xl blur-2xl opacity-40" />
              <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-8 sm:p-10 text-white shadow-2xl border border-white/10">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500 via-transparent to-transparent" />
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-400 via-transparent to-transparent" />
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-indigo-500/80 backdrop-blur rounded-full mb-5">FEATURED</span>
                  <h2 className="text-xl sm:text-2xl font-semibold leading-snug">
                    Anthropic lanserar Claude 3.5 Sonnet – starkare resonemang och lägre kostnad
                  </h2>
                  <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
                    Ny modell med topprestanda på kod, matematik och verktygsanvändning.
                  </p>
                  <div className="mt-6 text-sm text-slate-400">18 JUN 2024 • ANTHROPIC</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest news */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">Senaste nyheterna</h2>
            <Link href="/nyheter" className="text-sm text-indigo-700 hover:underline">Visa alla →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { logo: "OpenAI", title: "OpenAI lanserar GPT-4o mini", date: "17 JUN" },
              { logo: "Google", title: "Google I/O 2024: AI everywhere", date: "16 JUN" },
              { logo: "Meta", title: "Meta presenterar Llama 3.1", date: "15 JUN" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 shadow-md border border-slate-200/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                <div className="text-xs font-semibold text-indigo-600 mb-3 uppercase tracking-wider">{item.logo}</div>
                <h3 className="font-medium text-slate-900 leading-snug">{item.title}</h3>
                <div className="mt-4 text-xs text-slate-400">{item.date}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Tools + Jobs */}
        <section className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Verktyg som boostar din utveckling</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {["LangChain", "Cursor", "GitHub Copilot", "Ollama", "Pinecone", "Modal"].map((tool) => (
                <div key={tool} className="bg-white rounded-xl p-5 text-center shadow-md border border-slate-200/80 text-sm font-medium text-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  {tool}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Spana in lediga roller</h2>
            <div className="space-y-4">
              {[
                { title: "AI Engineer", company: "Klarna", loc: "Stockholm / Remote" },
                { title: "Backend Engineer (Go)", company: "Peltar", loc: "Göteborg / Remote" },
                { title: "ML Engineer", company: "Northvolt", loc: "Stockholm" },
              ].map((job) => (
                <div key={job.title} className="bg-white rounded-2xl p-5 shadow-md border border-slate-200/80 flex justify-between items-center hover:shadow-xl transition-shadow">
                  <div>
                    <div className="font-medium text-slate-900">{job.title}</div>
                    <div className="text-sm text-slate-500 mt-0.5">{job.company} • {job.loc}</div>
                  </div>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">Heltid</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
