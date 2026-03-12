import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const toc = [
  "Inledning", "Personuppgiftsansvarig", "Vilka uppgifter samlar vi in?",
  "Varför behandlar vi dina uppgifter?", "Hur länge sparar vi dina uppgifter?",
  "Vem delar vi data med?", "Dina rättigheter", "Säkerhet", "Ändringar i policyn", "Kontakt",
];

const sections = [
  {
    title: "1. Inledning",
    content: `utvecklare.ai ("vi", "oss", "vår") drivs av Etablera Mera AB. Vi värnar om din integritet och behandlar dina personuppgifter i enlighet med EU:s dataskyddsförordning (GDPR) och svensk lag.\n\nDenna policy beskriver vilka personuppgifter vi samlar in, varför vi gör det, hur vi behandlar dem och vilka rättigheter du har.`,
  },
  {
    title: "2. Personuppgiftsansvarig",
    content: `Etablera Mera AB\nE-post: info@utvecklare.ai\nWebbplats: utvecklare.ai`,
  },
  {
    title: "3. Vilka uppgifter samlar vi in?",
    content: `Vi samlar in följande kategorier av personuppgifter:\n\n**Kontouppgifter** (vid registrering):\n• Namn\n• E-postadress\n• Lösenord (krypterat, aldrig i klartext)\n• Profilbild (valfritt)\n• Yrkestitel och kompetenser (valfritt)\n\n**Företagsuppgifter** (vid företagsregistrering):\n• Företagsnamn, organisationsnummer\n• Kontaktuppgifter\n• Logotyp\n\n**Användaraktivitet:**\n• Jobbansökningar och sparade jobb\n• Foruminlägg och kommentarer\n• Eventregistreringar\n• Verktygsrecensioner\n• Lönedata (anonymiserad vid insamling)\n\n**Teknisk data:**\n• IP-adress (anonymiserad)\n• Webbläsartyp och enhet\n• Sidvisningar och klickdata (via cookies)`,
  },
  {
    title: "4. Varför behandlar vi dina uppgifter?",
    table: [
      ["Tillhandahålla och förbättra tjänsten", "Fullgörande av avtal"],
      ["Skicka nyhetsbrev och uppdateringar", "Samtycke"],
      ["Visa relevanta jobb och annonser", "Berättigat intresse"],
      ["Föra aggregerad statistik (löner, trafik)", "Berättigat intresse"],
      ["Uppfylla lagkrav (bokföring etc.)", "Rättslig förpliktelse"],
      ["Skicka transaktionella e-postmeddelanden", "Fullgörande av avtal"],
    ],
  },
  {
    title: "5. Hur länge sparar vi dina uppgifter?",
    content: `• **Kontouppgifter:** Så länge du har ett aktivt konto. Vid radering raderas dina uppgifter inom 30 dagar.\n• **Lönedata:** Lagras permanent i anonymiserad form.\n• **Foruminlägg:** Så länge kontot är aktivt. Vid radering anonymiseras inlägg.\n• **Teknisk data:** Max 26 månader.\n• **Nyhetsbrevsprenumeration:** Tills du avregistrerar dig.`,
  },
  {
    title: "6. Vem delar vi data med?",
    content: `• Supabase (databas och autentisering) — EU-baserad datalagring\n• Resend (e-postutskick) — för transaktionella meddelanden och nyhetsbrev\n• Google Analytics (webbanalys) — anonymiserad\n• Google AdSense (annonser) — via cookies\n\n**Vi säljer aldrig dina personuppgifter till tredje part.**`,
  },
  {
    title: "7. Dina rättigheter",
    content: `Enligt GDPR har du rätt att:\n\n• Få tillgång till dina personuppgifter\n• Rätta felaktiga uppgifter\n• Radera dina uppgifter ("rätten att bli glömd")\n• Begränsa behandlingen\n• Invända mot behandling baserad på berättigat intresse\n• Dataportabilitet — få dina uppgifter i maskinläsbart format\n• Återkalla samtycke — t.ex. avregistrera dig från nyhetsbrev\n\nKontakta oss på info@utvecklare.ai för att utöva dina rättigheter. Vi svarar inom 30 dagar.`,
  },
  {
    title: "8. Säkerhet",
    content: `Vi vidtar tekniska och organisatoriska åtgärder för att skydda dina uppgifter:\n\n• All data överförs via HTTPS/TLS\n• Lösenord lagras med bcrypt-hashing\n• Databas med Row Level Security (RLS)\n• Regelbundna säkerhetsgenomgångar`,
  },
  {
    title: "9. Ändringar i policyn",
    content: `Vi kan uppdatera denna policy. Väsentliga ändringar meddelas via e-post eller notis på sajten. Datum för senaste uppdatering visas alltid överst.`,
  },
  {
    title: "10. Kontakt",
    content: `Frågor om integritet? Kontakta oss:\n\nE-post: info@utvecklare.ai`,
  },
];

const renderContent = (text: string) =>
  text.split("**").map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="text-foreground font-medium">{part}</strong> : <span key={i}>{part}</span>
  );

const PrivacyPage = () => (
  <div className="min-h-screen bg-background">
    <SEOHead
      title="Integritetspolicy"
      description="Läs om hur utvecklare.ai behandlar dina personuppgifter i enlighet med GDPR."
      canonical="/integritetspolicy"
    />
    <Navbar />
    <section className="pt-16">
      <div className="container mx-auto px-4 py-12 max-w-[800px]">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Hem</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">Integritetspolicy</span>
        </nav>

        <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">Integritetspolicy</h1>
        <p className="text-muted-foreground mb-8">Senast uppdaterad: 7 februari 2026</p>

        <div className="bg-card border border-border rounded-xl p-5 mb-10">
          <p className="text-sm font-semibold text-foreground mb-3">Innehållsförteckning</p>
          <ol className="space-y-1.5">
            {toc.map((item, i) => (
              <li key={i}>
                <a href={`#privacy-${i + 1}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {i + 1}. {item}
                </a>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-10">
          {sections.map((section, idx) => (
            <div key={section.title} id={`privacy-${idx + 1}`}>
              <h2 className="text-lg font-bold text-foreground mb-3 border-l-2 border-primary pl-3">{section.title}</h2>
              {section.content && (
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {renderContent(section.content)}
                </div>
              )}
              {section.table && (
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                    <thead><tr className="bg-muted"><th className="text-left p-3 text-foreground font-medium">Syfte</th><th className="text-left p-3 text-foreground font-medium">Rättslig grund</th></tr></thead>
                    <tbody>
                      {section.table.map(([purpose, basis], i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                          <td className="p-3 text-muted-foreground">{purpose}</td>
                          <td className="p-3 text-muted-foreground">{basis}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default PrivacyPage;
