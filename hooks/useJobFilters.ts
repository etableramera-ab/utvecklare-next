'use client'
import { useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { JobFilters } from "@/types/jobs";

const DEFAULT_FILTERS: JobFilters = {
  search: "",
  categories: [],
  techTags: [],
  experienceLevels: [],
  workModels: [],
  cities: [],
  salaryMin: 25000,
  salaryMax: 130000,
  showNoSalary: true,
  sort: "Nyast först",
};

export function useJobFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: JobFilters = useMemo(() => ({
    search: searchParams?.get("q") || "",
    categories: searchParams?.getAll("cat") ?? [],
    techTags: searchParams?.getAll("tech") ?? [],
    experienceLevels: searchParams?.getAll("exp") ?? [],
    workModels: searchParams?.getAll("work") ?? [],
    cities: searchParams?.getAll("city") ?? [],
    salaryMin: Number(searchParams?.get("smin")) || 25000,
    salaryMax: Number(searchParams?.get("smax")) || 130000,
    showNoSalary: searchParams?.get("nosalary") !== "0",
    sort: searchParams?.get("sort") || "Nyast först",
  }), [searchParams]);

  const setFilters = (updates: Partial<JobFilters>) => {
    const next = { ...filters, ...updates };
    const params = new URLSearchParams();
    if (next.search) params.set("q", next.search);
    next.categories.forEach(v => params.append("cat", v));
    next.techTags.forEach(v => params.append("tech", v));
    next.experienceLevels.forEach(v => params.append("exp", v));
    next.workModels.forEach(v => params.append("work", v));
    next.cities.forEach(v => params.append("city", v));
    if (next.salaryMin !== 25000) params.set("smin", String(next.salaryMin));
    if (next.salaryMax !== 130000) params.set("smax", String(next.salaryMax));
    if (!next.showNoSalary) params.set("nosalary", "0");
    if (next.sort !== "Nyast först") params.set("sort", next.sort);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => router.replace(pathname);

  const hasActiveFilters = filters.categories.length > 0 || filters.techTags.length > 0 ||
    filters.experienceLevels.length > 0 || filters.workModels.length > 0 ||
    filters.cities.length > 0 || filters.salaryMin !== 25000 || filters.salaryMax !== 130000 ||
    !filters.showNoSalary || filters.search !== "";

  return { filters, setFilters, clearFilters, hasActiveFilters };
}
