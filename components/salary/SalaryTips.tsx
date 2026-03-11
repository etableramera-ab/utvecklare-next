'use client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const tips = [
  {
    title: "Gör din research",
    content: "Använd lönestatistiken ovan som grund. Vet vad marknaden betalar för din roll, nivå och stad. Ju mer data du har, desto starkare står du i förhandlingen.",
  },
  {
    title: "Kvantifiera ditt värde",
    content: "Konkreta exempel på hur du bidragit: 'Jag optimerade modellen så inference-kostnaden minskade med 40%' eller 'Jag ledde migrationen till en ny ML-pipeline som sparade 200 ingenjörstimmar per kvartal'.",
  },
  {
    title: "Förhandla mer än grundlön",
    content: "Remote-möjlighet, kompetensutvecklingsbudget, konferensbesök och equity kan vara minst lika värdefullt. Tänk på helheten — inte bara månadslönen.",
  },
  {
    title: "Timing är allt",
    content: "Förhandla i samband med prestation: efter ett lyckat projekt, vid årlig lönerevision, eller när du fått ett konkurrerande erbjudande.",
  },
  {
    title: "Var beredd att gå vidare",
    content: "Den största löneökningen kommer ofta vid byte av arbetsgivare. Lojalitet belönas sällan lönemässigt — i genomsnitt 15–25% löneökning vid byte jämfört med 3–5% vid intern revision.",
  },
];

const SalaryTips = () => (
  <section>
    <h2 className="text-2xl font-bold text-foreground mb-1">Tips för din löneförhandling</h2>
    <p className="text-muted-foreground text-sm mb-6">Så maximerar du din lön som AI-utvecklare</p>

    <Accordion type="single" collapsible className="space-y-2">
      {tips.map((tip, i) => (
        <AccordionItem
          key={i}
          value={`tip-${i}`}
          className="bg-card border border-border rounded-xl px-5 data-[state=open]:border-primary/30"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <span className="flex items-center gap-3 text-left">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                {i + 1}
              </span>
              <span className="font-semibold text-foreground">{tip.title}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pl-10 pb-4">
            {tip.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </section>
);

export default SalaryTips;
