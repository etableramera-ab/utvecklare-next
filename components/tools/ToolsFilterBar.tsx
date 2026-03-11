'use client'
import { Star, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortOption, PricingFilter } from "@/hooks/useTools";

interface ToolsFilterBarProps {
  pricingFilters: PricingFilter[];
  onTogglePricing: (f: PricingFilter) => void;
  minRating: number;
  onSetMinRating: (r: number) => void;
  sortBy: SortOption;
  onSetSortBy: (s: SortOption) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

const pricingOptions: { value: PricingFilter; label: string }[] = [
  { value: "free", label: "Gratis" },
  { value: "freemium", label: "Freemium" },
  { value: "open-source", label: "Open Source" },
  { value: "paid", label: "Betald" },
  { value: "enterprise", label: "Enterprise" },
];

const ToolsFilterBar = ({
  pricingFilters, onTogglePricing,
  minRating, onSetMinRating,
  sortBy, onSetSortBy,
  onClearAll, hasActiveFilters,
}: ToolsFilterBarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Pricing chips */}
      <div className="flex flex-wrap gap-1.5">
        {pricingOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => onTogglePricing(opt.value)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
              pricingFilters.includes(opt.value)
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-card text-muted-foreground border-border hover:border-primary/30"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Rating filter */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onSetMinRating(minRating === 4 ? 0 : 4)}
          className={`px-3 py-1.5 text-xs rounded-full border flex items-center gap-1 transition-all ${
            minRating >= 4 ? "bg-warning/10 text-warning border-warning/30" : "bg-card text-muted-foreground border-border hover:border-warning/30"
          }`}
        >
          <Star className="w-3 h-3 fill-current" /> 4+
        </button>
        <button
          onClick={() => onSetMinRating(minRating === 3 ? 0 : 3)}
          className={`px-3 py-1.5 text-xs rounded-full border flex items-center gap-1 transition-all ${
            minRating === 3 ? "bg-warning/10 text-warning border-warning/30" : "bg-card text-muted-foreground border-border hover:border-warning/30"
          }`}
        >
          <Star className="w-3 h-3 fill-current" /> 3+
        </button>
      </div>

      {/* Sort */}
      <Select value={sortBy} onValueChange={(v) => onSetSortBy(v as SortOption)}>
        <SelectTrigger className="w-[160px] h-8 text-xs bg-card border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="popular">Populärast</SelectItem>
          <SelectItem value="rating">Högst betyg</SelectItem>
          <SelectItem value="newest">Nyast</SelectItem>
          <SelectItem value="alpha">A–Ö</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <X className="w-3 h-3" /> Rensa filter
        </button>
      )}
    </div>
  );
};

export default ToolsFilterBar;
