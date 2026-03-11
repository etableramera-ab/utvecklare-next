'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { subscribeNewsletter } from "@/hooks/useArticles";

interface Props {
  source?: string;
  variant?: "inline" | "compact" | "article-bottom";
}

const NewsletterInlineCTA = ({ source = "kunskapshubb-inline", variant = "inline" }: Props) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "already" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    const result = await subscribeNewsletter(email, source);
    if (result === "already_subscribed") setStatus("already");
    else if (result === "success") setStatus("success");
    else setStatus("error");
  };

  if (status === "success") {
    return (
      <div className={`rounded-lg gradient-bg p-6 lg:p-8 text-center ${variant === "compact" ? "" : "col-span-full"}`}>
        <Check className="w-8 h-8 text-primary-foreground mx-auto mb-2" />
        <p className="text-primary-foreground font-medium">Välkommen! Kolla din inbox.</p>
      </div>
    );
  }

  if (status === "already") {
    return (
      <div className={`rounded-lg gradient-bg p-6 lg:p-8 text-center ${variant === "compact" ? "" : "col-span-full"}`}>
        <p className="text-primary-foreground font-medium">Du prenumererar redan! 🎉</p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="din@email.se" value={email} onChange={e => setEmail(e.target.value)} required
          className="w-full px-3 py-2 rounded-md bg-accent border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none mb-2" />
        <Button type="submit" size="sm" disabled={status === "loading"} className="w-full gradient-bg text-primary-foreground text-xs">
          {status === "loading" ? "…" : "Prenumerera"}
        </Button>
      </form>
    );
  }

  if (variant === "article-bottom") {
    return (
      <div className="rounded-lg gradient-bg p-8 text-center">
        <h3 className="text-lg font-bold text-primary-foreground mb-2">Gillade du den här artikeln?</h3>
        <p className="text-primary-foreground/70 text-sm mb-4">Prenumerera på vårt nyhetsbrev för fler guider och AI-nyheter.</p>
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
          <input type="email" placeholder="din@email.se" value={email} onChange={e => setEmail(e.target.value)} required
            className="flex-1 px-3 py-2 rounded-md bg-background/20 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 outline-none text-sm" />
          <Button type="submit" disabled={status === "loading"} className="bg-background text-foreground hover:bg-background/90 text-sm">
            {status === "loading" ? "…" : "Prenumerera"}
          </Button>
        </form>
        {status === "error" && <p className="text-destructive text-xs mt-2">Något gick fel, försök igen.</p>}
      </div>
    );
  }

  // inline (full-width in grid)
  return (
    <div className="col-span-full rounded-lg gradient-bg p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-4">
      <div className="flex-1 text-center sm:text-left">
        <h3 className="font-bold text-primary-foreground text-lg">Få nya AI-artiklar direkt i inboxen</h3>
        <p className="text-primary-foreground/70 text-sm mt-1">Varje vecka sammanfattar vi det viktigaste inom AI-utveckling i Sverige.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto">
        <input type="email" placeholder="din@email.se" value={email} onChange={e => setEmail(e.target.value)} required
          className="px-3 py-2 rounded-md bg-background/20 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 outline-none text-sm flex-1 sm:w-56" />
        <Button type="submit" disabled={status === "loading"} className="bg-background text-foreground hover:bg-background/90 text-sm px-4">
          {status === "loading" ? "…" : "Prenumerera"}
        </Button>
      </form>
    </div>
  );
};

export default NewsletterInlineCTA;
