'use client';

import { affiliateLinks } from '@/lib/affiliate-links';
import { Globe, Lock, GraduationCap, Search } from 'lucide-react';

const partners = [
  { name: 'Hostinger', tagline: 'Hosting', icon: Globe, url: affiliateLinks.hostinger },
  { name: 'NordPass', tagline: 'Säkerhet', icon: Lock, url: affiliateLinks.nordpass },
  { name: 'Confex', tagline: 'Utbildning', icon: GraduationCap, url: affiliateLinks.confex },
  { name: 'Partna', tagline: 'IT-offerter', icon: Search, url: affiliateLinks.partna },
];

const HomePartners = () => (
  <section className="py-10 border-t border-border">
    <div className="container mx-auto px-4">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
        <span className="text-xs text-muted-foreground/60 uppercase tracking-wider">Utvalda partner</span>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {partners.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener sponsored"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <p.icon className="w-4 h-4 text-primary" />
              <span className="font-medium">{p.name}</span>
              <span className="text-xs text-muted-foreground/60 hidden sm:inline">— {p.tagline}</span>
            </a>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground/40">Affiliatepartner</span>
      </div>
    </div>
  </section>
);

export default HomePartners;
