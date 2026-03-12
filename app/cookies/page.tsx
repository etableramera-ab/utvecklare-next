import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const cookies = [
  ["Autentisering (Supabase)", "Nödvändig", "Håller dig inloggad", "Session"],
  ["Tema-preferens", "Nödvändig", "Sparar dina inställningar", "1 år"],
  ["Google Analytics (_ga)", "Statistik", "Anonymiserad besöksanalys", "26 månader"],
  ["Google AdSense", "Marknadsföring", "Visa relevanta annonser", "13 månader"],
  ["Session-ID", "Nödvändig", "Spåra annonsvisningar (ej personlig)", "Session"],
];

const sections = [
  { title: "1. Vad är cookies?", content: "Cookies är små textfiler som lagras i din webbläsare när du besöker en webbplats. De hjälper oss att ge dig en bättre upplevelse." },
  { title: "2. Vilka cookies använder vi?", isTable: true },
  { title: "3. Kategorier", content: "**Nödvändiga cookies:** Krävs för att sajten ska fungera. Kan inte stängas av.\n\n**Statistik-cookies:** Hjälper oss förstå hur sajten används. Anonymiserade.\n\n**Marknadsföring-cookies:** Används för att visa relevanta annonser via Google AdSense." },
  { title: "4. Hantera cookies", content: "Du kan hantera cookies via din webbläsares inställningar:\n\n• **Chrome:** Inställningar → Sekretess och säkerhet → Cookies\n• **Firefox:** Inställningar → Integritet & säkerhet → Cookies\n• **Safari:** Inställningar → Sekretess → Cookies\n\nObservera att blockering av nödvändiga cookies kan påverka sajtens funktionalitet." },
  { title: "5. Tredjepartscookies", content: "Vi använder tjänster från Google (Analytics och AdSense) som kan sätta egna cookies. Läs Googles integritetspolicy för mer information." },
  { title: "6. Ändringar", content: "Vi kan uppdatera denna policy. Datum för senaste uppdatering visas alltid överst." },
];

const renderContent = (text: string) =>
  text.split("**").map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="text-foreground font-medium">{part}</strong> : <span key={i}>{part}</span>
  );

const CookiePolicyPage = () => (
  <div className="min-h-screen bg-background">
    <SEOHead
      title="Cookiepolicy"
      description="Information om hur utvecklare.ai använder cookies."
      canonical="/cookies"
    />
    <Navbar />
    <section className="pt-16">
      <div className="container mx-auto px-4 py-12 max-w-[800px]">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Hem</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">Cookiepolicy</span>
        </nav>

        <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">Cookiepolicy</h1>
        <p className="text-muted-foreground mb-10">Senast uppdaterad: 7 februari 2026</p>

        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-bold text-foreground mb-3 border-l-2 border-primary pl-3">{section.title}</h2>
              {section.isTable ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-muted">
                        {["Cookie", "Typ", "Syfte", "Lagringstid"].map((h) => (
                          <th key={h} className="text-left p-3 text-foreground font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cookies.map(([name, type, purpose, duration], i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                          <td className="p-3 text-muted-foreground">{name}</td>
                          <td className="p-3 text-muted-foreground">{type}</td>
                          <td className="p-3 text-muted-foreground">{purpose}</td>
                          <td className="p-3 text-muted-foreground">{duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : section.content ? (
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {renderContent(section.content)}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default CookiePolicyPage;
