'use client'
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { JobFilters } from "@/types/jobs";
import { CATEGORIES, TECH_TAGS, EXPERIENCE_LEVELS, WORK_MODELS, CITIES } from "@/data/jobsData";
import { useState } from "react";

interface Props {
  filters: JobFilters;
  setFilters: (u: Partial<JobFilters>) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const toggleInArray = (arr: string[], val: string) =>
  arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

const FilterGroup = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-border pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full text-sm font-semibold text-foreground mb-2">
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && children}
    </div>
  );
};

const ChipMultiSelect = ({ options, selected, onChange, max }: { options: string[]; selected: string[]; onChange: (v: string[]) => void; max?: number }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map(opt => (
      <button
        key={opt}
        onClick={() => {
          if (!selected.includes(opt) && max && selected.length >= max) return;
          onChange(toggleInArray(selected, opt));
        }}
        className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
          selected.includes(opt)
            ? "gradient-bg text-primary-foreground border-transparent"
            : "bg-accent text-accent-foreground border-border hover:border-primary/50"
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

const CheckboxGroup = ({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) => (
  <div className="space-y-1.5">
    {options.map(opt => (
      <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer group">
        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
          selected.includes(opt)
            ? "gradient-bg border-transparent"
            : "border-border group-hover:border-primary/50"
        }`}>
          {selected.includes(opt) && (
            <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className={selected.includes(opt) ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}>{opt}</span>
      </label>
    ))}
  </div>
);

const JobFilterPanel = ({ filters, setFilters, clearFilters, hasActiveFilters }: Props) => (
  <aside className="space-y-0">
    <div className="flex items-center justify-between mb-4">
      <h3 className="flex items-center gap-2 font-semibold text-foreground">
        <SlidersHorizontal className="w-4 h-4" /> Filter
      </h3>
      {hasActiveFilters && (
        <button onClick={clearFilters} className="text-xs text-primary hover:underline flex items-center gap-1">
          <X className="w-3 h-3" /> Rensa alla
        </button>
      )}
    </div>

    <FilterGroup title="Kategori">
      <ChipMultiSelect options={CATEGORIES} selected={filters.categories} onChange={v => setFilters({ categories: v })} />
    </FilterGroup>

    <FilterGroup title="Teknikstack">
      <ChipMultiSelect options={TECH_TAGS} selected={filters.techTags} onChange={v => setFilters({ techTags: v })} max={10} />
      {filters.techTags.length > 0 && (
        <p className="text-[10px] text-muted-foreground mt-1">{filters.techTags.length}/10 valda</p>
      )}
    </FilterGroup>

    <FilterGroup title="Erfarenhetsnivå">
      <CheckboxGroup options={EXPERIENCE_LEVELS} selected={filters.experienceLevels} onChange={v => setFilters({ experienceLevels: v })} />
    </FilterGroup>

    <FilterGroup title="Arbetsmodell">
      <CheckboxGroup options={WORK_MODELS} selected={filters.workModels} onChange={v => setFilters({ workModels: v })} />
    </FilterGroup>

    <FilterGroup title="Ort">
      <CheckboxGroup options={CITIES} selected={filters.cities} onChange={v => setFilters({ cities: v })} />
    </FilterGroup>

    <FilterGroup title="Löneintervall (SEK/mån)">
      <div className="px-1">
        <Slider
          min={25000}
          max={130000}
          step={5000}
          value={[filters.salaryMin, filters.salaryMax]}
          onValueChange={([min, max]) => setFilters({ salaryMin: min, salaryMax: max })}
          className="my-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{filters.salaryMin.toLocaleString("sv-SE")} kr</span>
          <span>{filters.salaryMax.toLocaleString("sv-SE")} kr</span>
        </div>
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <Switch
            checked={filters.showNoSalary}
            onCheckedChange={v => setFilters({ showNoSalary: v })}
            className="scale-75"
          />
          <span className="text-xs text-muted-foreground">Visa jobb utan lön</span>
        </label>
      </div>
    </FilterGroup>
  </aside>
);

export default JobFilterPanel;
