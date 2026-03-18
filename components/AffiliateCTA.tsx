'use client';

import { IconFromName } from "@/lib/icon-map";

interface AffiliateCTAProps {
  partner: string;
  description: string;
  ctaText: string;
  url: string;
  icon?: string;
}

export function AffiliateCTA({ partner, description, ctaText, url, icon = 'lightbulb' }: AffiliateCTAProps) {
  return (
    <div className="my-6 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20">
      <div className="flex items-start gap-3">
        <span className="w-6 h-6 text-primary shrink-0">
          <IconFromName name={icon} className="w-5 h-5" />
        </span>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{partner}</span> — {description}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <a
              href={url}
              target="_blank"
              rel="noopener sponsored"
              className="text-sm font-medium text-primary hover:text-secondary transition-colors"
            >
              {ctaText} →
            </a>
            <span className="text-[10px] text-muted-foreground/60">Affiliate-länk</span>
          </div>
        </div>
      </div>
    </div>
  );
}
