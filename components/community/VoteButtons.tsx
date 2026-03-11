'use client'
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  score: number;
  userVote: "up" | "down" | null;
  onVote: (direction: "up" | "down") => void;
  vertical?: boolean;
  size?: "sm" | "md";
}

const VoteButtons = ({ score, userVote, onVote, vertical = true, size = "md" }: VoteButtonsProps) => {
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <div className={cn("flex items-center gap-1", vertical ? "flex-col" : "flex-row")}>
      <button
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); onVote("up"); }}
        className={cn(
          "p-1 rounded transition-colors",
          userVote === "up"
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
        )}
        aria-label="Upprösta"
      >
        <ArrowBigUp className={iconSize} />
      </button>
      <span className={cn(
        "text-sm font-bold tabular-nums",
        score > 0 && "text-green-400",
        score < 0 && "text-destructive",
        score === 0 && "text-muted-foreground"
      )}>
        {score}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); onVote("down"); }}
        className={cn(
          "p-1 rounded transition-colors",
          userVote === "down"
            ? "text-destructive bg-destructive/10"
            : "text-muted-foreground hover:text-destructive hover:bg-destructive/5"
        )}
        aria-label="Nedrösta"
      >
        <ArrowBigDown className={iconSize} />
      </button>
    </div>
  );
};

export default VoteButtons;
