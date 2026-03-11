'use client'
import { Target, Monitor, Building2, MapPin, GraduationCap, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const factors = [
  { icon: Target, title: "Erfarenhet", desc: "Enskilt viktigaste faktorn. Senior tjänar 80–110% mer än junior.", effect: "+80–110%" },
  { icon: Monitor, title: "Tech stack", desc: "PyTorch och LLM-erfarenhet ger löne-premium.", effect: "+10–20%" },
  { icon: Building2, title: "Bransch", desc: "Fintech och adtech betalar högst. Public sector lägst.", effect: "±15–25%" },
  { icon: MapPin, title: "Stad", desc: "Stockholm ligger 10–18% över övriga städer.", effect: "+10–18%" },
  { icon: GraduationCap, title: "Utbildning", desc: "PhD ger premium i forskningsroller.", effect: "+10–15%" },
  { icon: Home, title: "Remote", desc: "Full remote betalar ofta stockholmslöner.", effect: "+5–12%" },
];

const SalaryFactors = () => (
  <section>
    <h2 className="text-2xl font-bold text-foreground mb-1">Vad påverkar din AI-lön?</h2>
    <p className="text-muted-foreground text-sm mb-6">De viktigaste faktorerna som styr din lön</p>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {factors.map((f) => (
        <div
          key={f.title}
          className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <f.icon className="w-5 h-5 text-primary" />
            <Badge variant="secondary" className="text-xs">{f.effect}</Badge>
          </div>
          <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
          <p className="text-sm text-muted-foreground">{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default SalaryFactors;
