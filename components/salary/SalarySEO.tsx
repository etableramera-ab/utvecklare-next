'use client'
import SEOHead from "@/components/SEOHead";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Vad tjänar en ML Engineer i Sverige 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "En ML Engineer i Sverige tjänar mellan 34 000 och 125 000 SEK/mån beroende på erfarenhet och stad. Medianlönen i Stockholm är 58 000 (mid) till 82 000 (senior) SEK/mån.",
      },
    },
    {
      "@type": "Question",
      name: "Vilken AI-roll har högst lön?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AI Researcher har generellt den högsta medianlönen bland AI-roller i Sverige, med upp till 108 000 SEK/mån för lead-nivå i Stockholm.",
      },
    },
    {
      "@type": "Question",
      name: "Hur mycket mer tjänar AI-utvecklare i Stockholm?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AI-utvecklare i Stockholm tjänar i genomsnitt 10-18% mer än i Göteborg och Malmö. Remote-roller matchar ofta Stockholmslöner.",
      },
    },
    {
      "@type": "Question",
      name: "Hur mycket har AI-lönerna ökat?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AI-löner i Sverige har ökat med 35-50% sedan 2022. Störst ökning har NLP/LLM-roller sett, med över 50% ökning på fyra år.",
      },
    },
  ],
};

const SalarySEO = () => (
  <SEOHead
    title="AI-utvecklarlöner i Sverige 2026 — Lönestatistik per roll & stad"
    description="Vad tjänar en ML Engineer, Data Scientist eller AI Researcher i Sverige? Se löner per roll, stad och erfarenhet med interaktiva grafer."
    canonical="/lonestatistik"
    jsonLd={faqJsonLd}
  />
);

export default SalarySEO;
