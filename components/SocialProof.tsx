import { Briefcase, Wrench, RefreshCw } from "lucide-react";

const items = [
  { icon: Briefcase, label: "Lediga IT-jobb via JobTech" },
  { icon: Wrench, label: "24+ AI-verktyg granskade" },
  { icon: RefreshCw, label: "Dagligen uppdaterat" },
];

const SocialProof = () => (
  <section className="border-b border-border bg-card/50">
    <div className="container mx-auto px-4 py-4">
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
            <item.icon className="w-4 h-4 text-primary" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default SocialProof;
