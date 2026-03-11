'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, Check } from "lucide-react";
import { subscribeNewsletter } from "@/hooks/useArticles";

const NewsletterCTA = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "already" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    const result = await subscribeNewsletter(email, "homepage");
    if (result === "already_subscribed") setStatus("already");
    else if (result === "success") setStatus("success");
    else setStatus("error");
  };

  return (
    <section className="section-spacing">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl gradient-bg p-10 lg:p-16 text-center">
          <Mail className="w-10 h-10 text-primary-foreground mx-auto mb-4" />
          <h2 className="text-2xl lg:text-3xl font-bold text-primary-foreground mb-3">
            Missa inte nästa AI-genombrott
          </h2>
          <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8">
            Få de viktigaste AI-nyheterna, nya jobb och exklusiva guider direkt i din inbox varje vecka.
          </p>

          {status === "success" ? (
            <div className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5 text-primary-foreground" />
              <p className="text-primary-foreground font-medium">Välkommen! 🎉 Kolla din inbox.</p>
            </div>
          ) : status === "already" ? (
            <p className="text-primary-foreground font-medium">Du prenumererar redan — tack! 🎉</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="din@email.se"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 rounded-lg bg-background/20 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 outline-none focus:border-primary-foreground/50"
              />
              <Button
                type="submit"
                disabled={status === "loading"}
                className="bg-background text-foreground hover:bg-background/90 px-6"
              >
                {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Prenumerera gratis"}
              </Button>
            </form>
          )}
          {status === "error" && (
            <p className="text-primary-foreground/70 text-sm mt-3">Något gick fel, försök igen.</p>
          )}
          <p className="text-xs text-primary-foreground/50 mt-4">Ingen spam. Avsluta när du vill.</p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterCTA;
