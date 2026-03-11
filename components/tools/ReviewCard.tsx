'use client'
import { useState } from "react";
import { Star, ThumbsUp, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface ReviewCardProps {
  review: any;
  userId?: string;
}

const ReviewCard = ({ review, userId }: ReviewCardProps) => {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0);
  const [voted, setVoted] = useState(false);

  const handleHelpful = async () => {
    if (!userId || voted) return;
    setVoted(true);
    setHelpfulCount((c: number) => c + 1);
    await supabase.from("review_helpful").insert({ review_id: review.id, user_id: userId });
  };

  return (
    <div className="border-b border-border pb-5 last:border-0 last:pb-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent border border-border flex items-center justify-center text-xs font-bold text-foreground">
            {(review.profiles?.full_name || "A").split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
          </div>
          <span className="text-sm font-medium text-foreground">{review.profiles?.full_name || "Anonym"}</span>
          {review.experience_level && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-border capitalize">
              {review.experience_level === "beginner" ? "Nybörjare" : review.experience_level === "intermediate" ? "Mellannivå" : "Avancerad"}
            </span>
          )}
          {review.is_verified && (
            <span className="flex items-center gap-0.5 text-[10px] text-success">
              <CheckCircle className="w-3 h-3" /> Verifierad
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(review.created_at).toLocaleDateString("sv-SE")}
        </span>
      </div>

      {review.title && <h4 className="font-semibold text-foreground text-sm mb-1">{review.title}</h4>}

      <div className="flex gap-0.5 mb-2">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} className={`w-4 h-4 ${i <= review.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
        ))}
      </div>

      <p className="text-sm text-muted-foreground mb-2">{review.content}</p>

      {(review.pros || review.cons) && (
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-2">
          {review.pros && <span>👍 {review.pros}</span>}
          {review.cons && <span>👎 {review.cons}</span>}
        </div>
      )}

      {review.use_case && (
        <p className="text-xs text-muted-foreground italic mb-2">Använder det för: {review.use_case}</p>
      )}

      <button
        onClick={handleHelpful}
        disabled={!userId || voted}
        className={`flex items-center gap-1.5 text-xs mt-1 transition-colors ${
          voted ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <ThumbsUp className="w-3.5 h-3.5" />
        Hjälpsam {helpfulCount > 0 && `(${helpfulCount})`}
      </button>
    </div>
  );
};

export default ReviewCard;
