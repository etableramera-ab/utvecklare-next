'use client';

import { affiliateLinks } from '@/lib/affiliate-links';

const partners = [
  { name: 'Hostinger', tagline: 'Hosting', icon: '🌐', url: affiliateLinks.hostinger },
  { name: 'NordPass', tagline: 'Säkerhet', icon: '🔐', url: affiliateLinks.nordpass },
  { name: 'Confex', tagline: 'Utbildning', icon: '📚', url: affiliateLinks.confex },
  { name: 'Partna', tagline: 'IT-offerter', icon: '🔍', url: affiliateLinks.partna },
];

const HomePartners = () => (
  <section className="py-10 border-t border-border">
    <div className="container mx-auto px-4">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
        <span className="text-xs text-muted-foreground/60 uppercase tracking-wider">Rekommenderade verktyg</span>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {partners.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener sponsored"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <span>{p.icon}</span>
              <span className="font-medium">{p.name}</span>
              <span className="text-xs text-muted-foreground/60 hidden sm:inline">— {p.tagline}</span>
            </a>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground/40">Sponsrade</span>
      </div>
    </div>
  </section>
);

export default HomePartners;
