'use client';

import { type AffiliatePartner, affiliatePartners } from '@/lib/affiliate-links';

interface AffiliateCardProps {
  partner: AffiliatePartner;
  variant?: 'sidebar' | 'compact' | 'horizontal';
}

export function AffiliateCard({ partner, variant = 'sidebar' }: AffiliateCardProps) {
  const info = affiliatePartners[partner];
  if (!info) return null;

  if (variant === 'compact') {
    return (
      <a
        href={info.url}
        target="_blank"
        rel="noopener sponsored"
        className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-all group"
      >
        <span className="text-lg">{info.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{info.name}</p>
          <p className="text-[11px] text-muted-foreground line-clamp-1">{info.description}</p>
        </div>
        <span className="text-[10px] text-muted-foreground/60 shrink-0">Annons</span>
      </a>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-2xl">{info.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{info.name}</span> — {info.description}
            </p>
          </div>
          <a
            href={info.url}
            target="_blank"
            rel="noopener sponsored"
            className="px-4 py-2 text-sm font-medium rounded-lg gradient-bg text-primary-foreground hover:opacity-90 transition-opacity shrink-0"
          >
            {info.ctaText} →
          </a>
          <span className="text-[10px] text-muted-foreground/60">Sponsrad länk</span>
        </div>
      </div>
    );
  }

  // sidebar (default)
  return (
    <div className="rounded-lg border border-border overflow-hidden bg-gradient-to-b from-indigo-500/5 to-transparent">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{info.icon}</span>
          <h4 className="text-sm font-semibold text-foreground">{info.name}</h4>
        </div>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{info.description}</p>
        <a
          href={info.url}
          target="_blank"
          rel="noopener sponsored"
          className="inline-block px-4 py-2 text-xs font-medium rounded-lg gradient-bg text-primary-foreground hover:opacity-90 transition-opacity"
        >
          {info.ctaText} →
        </a>
        <p className="text-[10px] text-muted-foreground/60 mt-2">Affiliate-länk</p>
      </div>
    </div>
  );
}

/** Grid of multiple affiliate cards for sections like verktyg */
export function AffiliateGrid({ partners }: { partners: AffiliatePartner[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Rekommenderade tjänster</h3>
        <span className="text-[10px] text-muted-foreground/60">Sponsrade</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {partners.map((p) => (
          <AffiliateCard key={p} partner={p} variant="sidebar" />
        ))}
      </div>
    </div>
  );
}
