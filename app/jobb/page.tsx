'use client';

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  slug: string;
  company_name: string;
  location: string;
  work_model: string;
  tech_tags: string[];
}

export default function JobbPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("jobs")
      .select("id, title, slug, location, work_model, tech_tags, companies(name)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data }) => {
        const mapped = (data || []).map((j: any) => ({
          id: j.id,
          title: j.title,
          slug: j.slug,
          company_name: j.companies?.name || "Företag",
          location: j.location || "",
          work_model: j.work_model || "",
          tech_tags: j.tech_tags || [],
        }));
        setJobs(mapped);
        setLoading(false);
      });
  }, []);

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
              <h1 className="text-3xl sm:text-4xl font-bold">AI-jobb för utvecklare.</h1>
              <p className="mt-4 text-slate-300 text-base">
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
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
          <button className="px-6 py-3 bg-indigo-700 text-white rounded-xl text-sm font-medium hover:bg-indigo-800 shadow-md">Sök</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {["Alla roller", "Stockholm", "Remote", "Python", "ML"].map((f) => (
            <span key={f} className="px-3.5 py-1.5 text-sm bg-white border border-slate-200 rounded-full text-slate-600 shadow-sm">
              {f}
            </span>
          ))}
        </div>

        {/* Jobs grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-2xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <Link key={job.id} href={`/jobb/${job.slug}`} className="block bg-white rounded-2xl p-6 shadow-md border border-slate-200/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                <h2 className="font-medium text-slate-900">{job.title}</h2>
                <div className="text-sm text-slate-500 mt-1">{job.company_name}</div>
                <div className="text-sm text-slate-500">{job.location} • {job.work_model}</div>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {job.tech_tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full font-medium">{t}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
