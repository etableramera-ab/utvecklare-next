'use client';

interface AffiliateCTAProps {
  partner: string;
  description: string;
  ctaText: string;
  url: string;
  icon?: string;
}

export function AffiliateCTA({ partner, description, ctaText, url, icon = '💡' }: AffiliateCTAProps) {
  return (
    <div className="my-6 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20">
      <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>
        <div className="flex-1">
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-white">{partner}</span> — {description}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <a
              href={url}
              target="_blank"
              rel="noopener sponsored"
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {ctaText} →
            </a>
            <span className="text-[10px] text-slate-500">Affiliate-länk</span>
          </div>
        </div>
      </div>
    </div>
  );
}
