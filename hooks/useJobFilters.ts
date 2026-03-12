'use client'
import { useState, useCallback } from "react";
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
  const [filters, setFiltersState] = useState<JobFilters>(DEFAULT_FILTERS);

  const setFilters = useCallback((updates: Partial<JobFilters>) => {
    setFiltersState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.techTags.length > 0 ||
    filters.experienceLevels.length > 0 ||
    filters.workModels.length > 0 ||
    filters.cities.length > 0 ||
    filters.salaryMin !== DEFAULT_FILTERS.salaryMin ||
    filters.salaryMax !== DEFAULT_FILTERS.salaryMax ||
    !filters.showNoSalary ||
    filters.search !== "";

  return { filters, setFilters, clearFilters, hasActiveFilters };
}
