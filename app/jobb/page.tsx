'use client';

import Navbar from "@/components/Navbar";

export default function JobbPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Dark hero */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 sm:p-10 shadow-xl">
            <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500" />
            <div className="relative max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-bold">AI-jobb för utvecklare.</h1>
              <p className="mt-3 text-slate-300">
                Hitta roller som matchar dina kunskaper. Bygg framtidens AI-produkter hos banbrytande team.
              </p>
            </div>
          </div>
        </section>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Sök roller, teknologier eller företag..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button className="px-5 py-2.5 bg-indigo-700 text-white rounded-lg text-sm font-medium">Sök</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {["Alla roller", "Stockholm", "Remote", "Python", "ML"].map((f) => (
            <span key={f} className="px-3 py-1 text-sm bg-white border border-slate-200 rounded-full text-slate-600">
              {f}
            </span>
          ))}
        </div>

        {/* Jobs grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Senior AI/ML Engineer", company: "Algoryx AI", loc: "Stockholm • Hybrid", tags: ["Python", "PyTorch", "AWS"] },
            { title: "Backendutvecklare – AI-plattform", company: "Mindshift Technologies", loc: "Göteborg • Hybrid", tags: ["TypeScript", "Node.js"] },
            { title: "Fullstackutvecklare", company: "Evolutio", loc: "Malmö • Hybrid", tags: ["React", "Next.js"] },
            { title: "MLOps Engineer", company: "Gradient Labs", loc: "Stockholm • Remote", tags: ["Docker", "Terraform"] },
            { title: "AI Software Developer", company: "Northvolt AI", loc: "Linköping • Hybrid", tags: ["Python", "FastAPI"] },
            { title: "Frontendutvecklare – AI Dashboard", company: "InsightFlow", loc: "Stockholm • Hybrid", tags: ["React", "Tailwind"] },
          ].map((job) => (
            <div key={job.title} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <h2 className="font-medium text-slate-900">{job.title}</h2>
              <div className="text-sm text-slate-500 mt-1">{job.company}</div>
              <div className="text-sm text-slate-500">{job.loc}</div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {job.tags.map((t) => (
                  <span key={t} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
