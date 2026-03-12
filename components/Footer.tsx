'use client'
import { useState } from "react";
import Link from 'next/link'
import { Github, Linkedin, Twitter, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: email.trim(), source: "footer" });
    setLoading(false);
    if (error?.code === "23505") {
      toast({ title: "Redan prenumerant", description: "Du prenumererar redan på vårt nyhetsbrev." });
    } else if (error) {
      toast({ title: "Kunde inte registrera", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tack! 🎉", description: "Du är nu prenumerant på vårt nyhetsbrev." });
      setEmail("");
    }
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand */}
          <div>
            <Link href="/" className="text-xl font-bold tracking-tight">
              <span className="text-foreground">utvecklare</span>
              <span className="gradient-text">.ai</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Sveriges plattform för AI-utvecklare
            </p>
            <div className="flex gap-3 mt-4">
              {[
                { icon: Linkedin, href: "https://www.linkedin.com/company/utvecklare-ai", label: "LinkedIn" },
                { icon: Github, href: "https://github.com/utvecklare-ai", label: "GitHub" },
                { icon: Twitter, href: "https://x.com/utvecklareai", label: "X" },
              ].map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all">
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Platform */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Plattformen</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                { label: "Jobb", to: "/jobb" },
                { label: "Kunskapshubb", to: "/kunskapshubb" },
                { label: "Verktyg", to: "/verktyg" },
                { label: "Community", to: "/community" },
                { label: "Events", to: "/events" },
                { label: "Lönestatistik", to: "/lonestatistik" },
              ].map((l) => (
                <li key={l.to}><Link href={l.to} className="hover:text-foreground transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Företag</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/foretag/priser" className="hover:text-foreground transition-colors">Publicera jobb</Link></li>
              <li><Link href="/kontakt?amne=annonsering" className="hover:text-foreground transition-colors">Annonsera</Link></li>
              <li><Link href="/om-oss" className="hover:text-foreground transition-colors">Om oss</Link></li>
              <li><Link href="/kontakt" className="hover:text-foreground transition-colors">Kontakt</Link></li>
            </ul>

            <h4 className="font-semibold text-foreground mb-4 text-sm mt-8">Juridiskt</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/integritetspolicy" className="hover:text-foreground transition-colors">Integritetspolicy</Link></li>
              <li><Link href="/villkor" className="hover:text-foreground transition-colors">Användarvillkor</Link></li>
              <li><Link href="/cookies" className="hover:text-foreground transition-colors">Cookiepolicy</Link></li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Nyhetsbrev</h4>
            <p className="text-sm text-muted-foreground mb-3">Få de senaste AI-jobben och artiklarna direkt i din inkorg.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="din@email.se"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border text-sm h-9"
                maxLength={255}
              />
              <Button type="submit" size="sm" className="gradient-bg text-primary-foreground hover:opacity-90 shrink-0 h-9" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Prenumerera"}
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © 2026 Etablera Mera AB. Alla rättigheter förbehållna.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
