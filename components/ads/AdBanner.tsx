'use client'
import { useAdBanner } from "@/hooks/useAdBanner";

interface Props {
  placement: "leaderboard" | "sidebar" | "in-feed" | "between-sections" | "sticky-sidebar" | "article-bottom";
  category?: string;
  page?: string;
  className?: string;
}

const AdBanner = ({ placement, category, page, className = "" }: Props) => {
  const { ad, adRef, handleClick } = useAdBanner({ placement, category, page });

  if (!ad) return null;

  const badge = (
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Annons</span>
  );

  // ─── In-feed (sponsored card) ───
  if (placement === "in-feed") {
    return (
      <div ref={adRef} className={className}>
        <button
          onClick={handleClick}
          className="w-full text-left p-5 rounded-lg bg-card/80 border border-border hover:border-primary/30 transition-all relative"
        >
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary">
            Sponsrad
          </span>
          {ad.image_url && (
            <img src={ad.image_url} alt={ad.title} className="w-full h-32 object-cover rounded mt-1" loading="lazy" />
          )}
          <p className="text-sm font-medium text-foreground mt-2">{ad.title}</p>
          {ad.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ad.description}</p>
          )}
        </button>
      </div>
    );
  }

  // ─── Leaderboard (728×90) ───
  if (placement === "leaderboard") {
    return (
      <div ref={adRef} className={`max-w-[728px] mx-auto ${className}`}>
        <button
          onClick={handleClick}
          className="w-full text-left rounded-lg overflow-hidden border border-border bg-card hover:border-primary/30 transition-all relative"
        >
          <span className="absolute top-2 right-3 z-10">{badge}</span>
          {ad.image_url ? (
            <img src={ad.image_url} alt={ad.title} className="w-full h-[90px] object-cover" loading="lazy" />
          ) : (
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <p className="text-sm font-medium text-foreground">{ad.title}</p>
                {ad.description && <p className="text-xs text-muted-foreground mt-1">{ad.description}</p>}
              </div>
              <span className="text-xs text-primary shrink-0 ml-4">{ad.advertiser_name} →</span>
            </div>
          )}
        </button>
      </div>
    );
  }

  // ─── Between-sections (horizontal banner) ───
  if (placement === "between-sections") {
    return (
      <div ref={adRef} className={`w-full ${className}`}>
        <button
          onClick={handleClick}
          className="w-full text-left rounded-lg overflow-hidden border border-border bg-gradient-to-r from-card to-accent/30 hover:border-primary/30 transition-all"
        >
          <div className="flex items-center gap-6 p-6">
            {ad.image_url && (
              <img src={ad.image_url} alt={ad.title} className="w-24 h-24 rounded-lg object-cover shrink-0" loading="lazy" />
            )}
            <div className="flex-1 min-w-0">
              {badge}
              <p className="text-base font-semibold text-foreground mt-1">{ad.title}</p>
              {ad.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ad.description}</p>}
            </div>
            <span className="px-4 py-2 rounded-md gradient-bg text-primary-foreground text-sm font-medium shrink-0 hidden sm:block">
              Läs mer
            </span>
          </div>
        </button>
      </div>
    );
  }

  // ─── Article-bottom ───
  if (placement === "article-bottom") {
    return (
      <div ref={adRef} className={`w-full ${className}`}>
        <button
          onClick={handleClick}
          className="w-full text-left rounded-lg overflow-hidden border border-border bg-card hover:border-primary/30 transition-all"
        >
          <div className="p-6">
            <p className="text-xs text-muted-foreground mb-3">Rekommenderat från våra partners</p>
            <div className="flex items-start gap-5">
              {ad.image_url && (
                <img src={ad.image_url} alt={ad.title} className="w-32 h-20 rounded-lg object-cover shrink-0" loading="lazy" />
              )}
              <div>
                <p className="text-base font-semibold text-foreground">{ad.title}</p>
                {ad.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ad.description}</p>}
                <span className="text-xs text-primary mt-2 inline-block">{ad.advertiser_name} →</span>
              </div>
            </div>
          </div>
        </button>
      </div>
    );
  }

  // ─── Sidebar / Sticky-sidebar (300×250) ───
  return (
    <div ref={adRef} className={placement === "sticky-sidebar" ? `sticky top-[100px] ${className}` : className}>
      <button
        onClick={handleClick}
        className="block w-full text-left rounded-lg overflow-hidden border border-border bg-card hover:border-primary/30 transition-all"
      >
        <div className="px-3 pt-2">{badge}</div>
        {ad.image_url && (
          <img src={ad.image_url} alt={ad.title} className="w-full aspect-[6/5] object-cover px-3 pt-2 rounded-xl" loading="lazy" />
        )}
        <div className="p-3">
          <p className="text-sm font-medium text-foreground">{ad.title}</p>
          {ad.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ad.description}</p>}
        </div>
      </button>
    </div>
  );
};

export default AdBanner;
