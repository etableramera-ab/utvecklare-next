import Link from "next/link";
import { Briefcase, Wrench, Users, TrendingUp, ArrowRight } from "lucide-react";

const variants = {
  jobb: {
    icon: Briefcase,
    heading: "Letar du efter AI-jobb?",
    text: "Se lediga tjänster",
    href: "/jobb",
    trust: "434+ AI-jobb \u00b7 Uppdaterat dagligen via JobTech API",
  },
  verktyg: {
    icon: Wrench,
    heading: "Hitta r\u00e4tt AI-verktyg",
    text: "Se v\u00e5ra rekommendationer",
    href: "/verktyg",
    trust: "24+ verktyg granskade och j\u00e4mf\u00f6rda",
  },
  community: {
    icon: Users,
    heading: "G\u00e5 med i Sveriges AI-community",
    text: "Bes\u00f6k forumet",
    href: "/community",
    trust: "Aktivt community f\u00f6r AI-utvecklare",
  },
  lon: {
    icon: TrendingUp,
    heading: "Vad tj\u00e4nar en AI-utvecklare?",
    text: "Se l\u00f6nestatistik",
    href: "/lonestatistik",
    trust: "L\u00f6nedata fr\u00e5n hundratals svenska AI-utvecklare",
  },
} as const;

type Variant = keyof typeof variants;

const InContentCTA = ({ variant }: { variant: Variant }) => {
  const v = variants[variant];
  const Icon = v.icon;

  return (
    <div className="my-8 rounded-lg border border-primary/20 bg-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg gradient-bg shrink-0">
        <Icon className="w-5 h-5 text-primary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm">{v.heading}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{v.trust}</p>
      </div>
      <Link
        href={v.href}
        className="inline-flex items-center gap-1.5 gradient-bg text-primary-foreground text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity shrink-0"
      >
        {v.text}
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};

export default InContentCTA;
