'use client'
import { Star } from "lucide-react";

interface RatingBreakdownProps {
  reviews: any[];
  avgRating: number;
  totalCount: number;
}

const RatingBreakdown = ({ reviews, avgRating, totalCount }: RatingBreakdownProps) => {
  const counts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter((r: any) => r.rating === star).length,
  }));
  const maxCount = Math.max(...counts.map(c => c.count), 1);

  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
      {/* Left: big rating */}
      <div className="text-center shrink-0">
        <p className="text-5xl font-extrabold text-foreground">{Number(avgRating).toFixed(1)}</p>
        <div className="flex gap-0.5 justify-center my-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} className={`w-5 h-5 ${i <= Math.round(avgRating) ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{totalCount} recensioner</p>
      </div>

      {/* Right: bars */}
      <div className="flex-1 w-full space-y-1.5">
        {counts.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-2 text-sm">
            <span className="w-6 text-right text-muted-foreground">{star}★</span>
            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-warning rounded-full transition-all duration-500"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-8 text-left text-muted-foreground text-xs">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingBreakdown;
