import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const toc = [
  "Allmänt", "Tjänsten", "Registrering och konto", "Användarinnehåll",
  "Företagstjänster och prenumerationer", "Jobbportal", "Lönestatistik",
  "Affiliate-länkar och annonser", "Ansvarsbegränsning", "Immateriella rättigheter",
  "Uppsägning", "Tillämplig lag och tvister", "Ändringar", "Kontakt",
];

const sections = [
  { title: "1. Allmänt", content: `Dessa villkor gäller för din användning av utvecklare.ai ("Tjänsten"), som drivs av Etablera Mera AB ("vi", "oss"). Genom att registrera dig eller använda Tjänsten accepterar du dessa villkor.` },
  { title: "2. Tjänsten", content: `utvecklare.ai är en plattform för AI-utvecklare som erbjuder:\n\n• Jobbportal med AI-fokuserade tjänster\n• Kunskapshubb med artiklar och guider\n• Verktyg och resursrecensioner\n• Community med forum och projekt-showcase\n• Eventkalender med registrering\n• Lönestatistik och karriärverktyg` },
  { title: "3. Registrering och konto", content: `• Du måste vara minst 16 år för att skapa ett konto\n• Du ansvarar för att informationen du anger är korrekt\n• Du ansvarar för att hålla dina inloggningsuppgifter säkra\n• Ett konto per person — multipla konton kan stängas` },
  { title: "4. Användarinnehåll", content: `Du behåller äganderätten till innehåll du skapar (foruminlägg, recensioner, projekt). Genom att publicera innehåll på plattformen ger du oss en icke-exklusiv, royaltyfri licens att visa, distribuera och marknadsföra ditt innehåll inom Tjänsten.\n\nDu ansvarar för att ditt innehåll:\n• Inte bryter mot upphovsrätt eller andra immateriella rättigheter\n• Inte innehåller olagligt, hotfullt eller kränkande material\n• Inte är spam eller vilseledande marknadsföring\n• Inte innehåller skadlig kod\n\nVi förbehåller oss rätten att ta bort innehåll som bryter mot dessa villkor.` },
  { title: "5. Företagstjänster och prenumerationer", content: `• Företag kan registrera sig och publicera jobb enligt vald prenumerationsplan\n• Priserna anges exklusive moms (25%) om ej annat anges\n• Prenumerationer förnyas automatiskt om de inte avbryts före periodens slut\n• Återbetalning: Vid avbokning inom 14 dagar efter start (ångerrätt)\n• Vi förbehåller oss rätten att ändra priser med 30 dagars varsel` },
  { title: "6. Jobbportal", content: `• Arbetsgivare ansvarar för att jobbannonser är korrekta och lagenliga\n• Vi garanterar inte anställning genom plattformen\n• Kandidater ansvarar för riktigheten i sina profiler och ansökningar\n• Diskriminerande jobbannonser accepteras inte` },
  { title: "7. Lönestatistik", content: `• Lönedata som publiceras är baserad på tillgängliga datakällor och användarbidrag\n• Vi garanterar inte att lönedata är exakt eller fullständig\n• Lönedata ska ses som vägledning, inte som juridisk eller ekonomisk rådgivning\n• Anonymt inskickad lönedata kan inte kopplas till enskilda användare` },
  { title: "8. Affiliate-länkar och annonser", content: `• Vissa länkar på plattformen är affiliate-länkar, vilket innebär att vi kan få provision vid köp\n• Affiliate-länkar märks med "Affiliate-länk" eller "Sponsrad"\n• Annonser märks tydligt med "Annons"\n• Vi ansvarar inte för tredjepartsprodukter som marknadsförs` },
  { title: "9. Ansvarsbegränsning", content: `• Tjänsten tillhandahålls "som den är" utan garantier\n• Vi ansvarar inte för förluster eller skador som uppstår genom användning av Tjänsten\n• Vi garanterar inte att Tjänsten alltid är tillgänglig utan avbrott\n• Vårt totala ansvar är begränsat till det belopp du betalat oss de senaste 12 månaderna` },
  { title: "10. Immateriella rättigheter", content: `• utvecklare.ai:s varumärke, design och kod ägs av Etablera Mera AB\n• Du får inte kopiera, distribuera eller skapa derivat av Tjänsten utan skriftligt tillstånd` },
  { title: "11. Uppsägning", content: `• Du kan när som helst radera ditt konto via inställningarna\n• Vi kan stänga konton som bryter mot villkoren efter varning\n• Vid uppsägning raderas dina personuppgifter enligt vår integritetspolicy` },
  { title: "12. Tillämplig lag och tvister", content: `• Svensk lag tillämpas\n• Tvister avgörs i svensk domstol\n• Konsumenter kan även vända sig till Allmänna Reklamationsnämnden (ARN)` },
  { title: "13. Ändringar", content: `Vi kan uppdatera dessa villkor. Väsentliga ändringar meddelas via e-post minst 30 dagar i förväg. Fortsatt användning efter ändring innebär accept av nya villkor.` },
  { title: "14. Kontakt", content: `Frågor om villkoren?\n\nE-post: info@utvecklare.ai` },
];

const renderContent = (text: string) =>
  text.split("**").map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="text-foreground font-medium">{part}</strong> : <span key={i}>{part}</span>
  );

const TermsPage = () => (
  <div className="min-h-screen bg-background">
    <SEOHead
      title="Användarvillkor"
      description="Läs användarvillkoren för utvecklare.ai — villkor för jobbportal, community, prenumerationer och lönestatistik."
      canonical="/villkor"
    />
    <Navbar />
    <section className="pt-16">
      <div className="container mx-auto px-4 py-12 max-w-[800px]">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Hem</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">Villkor</span>
        </nav>

        <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">Användarvillkor</h1>
        <p className="text-muted-foreground mb-8">Senast uppdaterad: 7 februari 2026</p>

        <div className="bg-card border border-border rounded-xl p-5 mb-10">
          <p className="text-sm font-semibold text-foreground mb-3">Innehållsförteckning</p>
          <ol className="space-y-1.5">
            {toc.map((item, i) => (
              <li key={i}>
                <a href={`#terms-${i + 1}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {i + 1}. {item}
                </a>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-10">
          {sections.map((section, idx) => (
            <div key={section.title} id={`terms-${idx + 1}`}>
              <h2 className="text-lg font-bold text-foreground mb-3 border-l-2 border-primary pl-3">{section.title}</h2>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {renderContent(section.content)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default TermsPage;
