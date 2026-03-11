'use client'
import { X } from "lucide-react";
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button";
import type { ToolRow } from "@/hooks/useTools";

interface CompareBarProps {
  selectedTools: ToolRow[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

const CompareBar = ({ selectedTools, onRemove, onClear }: CompareBarProps) => {
  const router = useRouter();

  if (selectedTools.length === 0) return null;

  const slugs = selectedTools.map(t => t.slug).join("-vs-");

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border px-4 py-3 shadow-lg">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">
            {selectedTools.length} verktyg valda
          </span>
          <div className="flex -space-x-2">
            {selectedTools.map(t => (
              <div key={t.id} className="relative group">
                {t.logo_url ? (
                  <img src={t.logo_url} alt={t.name} className="w-8 h-8 rounded-lg border-2 border-card bg-white p-0.5 object-contain" />
                ) : (
                  <div className="w-8 h-8 rounded-lg border-2 border-card bg-accent flex items-center justify-center text-[10px] font-bold text-foreground">
                    {t.name.substring(0, 2)}
                  </div>
                )}
                <button
                  onClick={() => onRemove(t.id)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onClear} className="text-xs text-muted-foreground hover:text-foreground">
            Rensa
          </button>
          <Button
            disabled={selectedTools.length < 2}
            onClick={() => router.push(`/verktyg/jamfor/${slugs}`)}
            className="gradient-bg text-primary-foreground hover:opacity-90 transition-opacity text-sm"
          >
            Jämför nu →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;
