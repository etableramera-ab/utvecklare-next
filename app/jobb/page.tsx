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
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 bg-white rounded-xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <Link key={job.id} href={`/jobb/${job.slug}`} className="block bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <h2 className="font-medium text-slate-900">{job.title}</h2>
                <div className="text-sm text-slate-500 mt-1">{job.company_name}</div>
                <div className="text-sm text-slate-500">{job.location} • {job.work_model}</div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {job.tech_tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{t}</span>
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
