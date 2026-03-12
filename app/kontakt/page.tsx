'use client';
import { Suspense } from 'react';

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Send, Loader2, Mail, MapPin, Globe, Linkedin, Github, Twitter, Clock, BookOpen } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const subjects = [
  "Allmän fråga",
  "Annonsering & sponsring",
  "Företagskonto & prenumeration",
  "Jobbpublicering",
  "Teknisk support",
  "Feedback & förslag",
  "Pressförfrågan",
  "Annat",
];

const contactSchema = z.object({
  name: z.string().trim().min(1, "Namn krävs").max(100),
  email: z.string().trim().email("Ogiltig e-post").max(255),
  subject: z.string().min(1, "Välj ett ämne"),
  message: z.string().trim().min(20, "Minst 20 tecken").max(2000),
});

type ContactForm = z.infer<typeof contactSchema>;

const socials = [
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
  { icon: Twitter, label: "X / Twitter", href: "#" },
];

const ContactPage = () => {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const preSubject = searchParams.get("amne") || "";

  const [form, setForm] = useState<ContactForm>({
    name: "", email: "",
    subject: subjects.find(s => s.toLowerCase().includes(preSubject)) || "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key: keyof ContactForm, value: string) => {
    setForm({ ...form, [key]: value });
    if (errors[key]) setErrors({ ...errors, [key]: undefined });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const errs: typeof errors = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as keyof ContactForm] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name, email: form.email, subject: form.subject, message: form.message,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Kunde inte skicka", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Kontakta oss"
        description="Kontakta utvecklare.ai för frågor om jobb, annonsering, prenumerationer eller samarbete. Vi svarar inom 1-2 arbetsdagar."
        canonical="/kontakt"
      />
      <Navbar />

      <section className="pt-16">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Kontakta oss</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Har du frågor, feedback eller vill samarbeta? Vi hör gärna från dig!
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Hem</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">Kontakt</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-5 gap-10 max-w-5xl mx-auto">
          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <Card className="bg-card border-border">
                <CardContent className="p-10 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-2xl">✅</div>
                  <h2 className="text-xl font-bold text-foreground">Tack för ditt meddelande!</h2>
                  <p className="text-muted-foreground">Vi svarar normalt inom 1-2 arbetsdagar.</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="c-name">Namn *</Label>
                        <Input id="c-name" value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1.5 bg-background border-border" maxLength={100} />
                        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <Label htmlFor="c-email">E-post *</Label>
                        <Input id="c-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="mt-1.5 bg-background border-border" maxLength={255} />
                        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                      </div>
                    </div>
                    <div>
                      <Label>Ämne *</Label>
                      <Select value={form.subject} onValueChange={(v) => set("subject", v)}>
                        <SelectTrigger className="mt-1.5 bg-background border-border"><SelectValue placeholder="Välj ämne" /></SelectTrigger>
                        <SelectContent>
                          {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
                    </div>
                    <div>
                      <Label htmlFor="c-message">Meddelande *</Label>
                      <Textarea id="c-message" value={form.message} onChange={(e) => set("message", e.target.value)} className="mt-1.5 bg-background border-border" rows={6} maxLength={2000} placeholder="Beskriv ditt ärende..." />
                      {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
                    </div>
                    <Button type="submit" className="w-full gradient-bg text-primary-foreground hover:opacity-90" size="lg" disabled={submitting}>
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-1" /> Skicka meddelande</>}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass border-border">
              <CardContent className="p-6 space-y-5">
                <h3 className="font-semibold text-foreground">Kontaktuppgifter</h3>
                {[
                  { icon: Mail, label: "Generell", value: "hej@utvecklare.ai" },
                  { icon: Mail, label: "Annonsering", value: "annons@utvecklare.ai" },
                  { icon: Mail, label: "Integritet", value: "integritet@utvecklare.ai" },
                  { icon: MapPin, label: "Adress", value: "Etablera Mera AB, Stockholm" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <item.icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Vi svarar normalt inom 1-2 arbetsdagar.</span>
                </div>
                <Link href="/kunskapshubb" className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <BookOpen className="w-4 h-4" />
                  Vanliga frågor? Kolla vår kunskapshubb →
                </Link>
              </CardContent>
            </Card>

            <div>
              <p className="text-sm font-medium text-foreground mb-3">Följ oss</p>
              <div className="flex gap-3">
                {socials.map((s) => (
                  <a key={s.label} href={s.href} aria-label={s.label} className="p-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all">
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground text-sm mb-1">Etablera Mera AB</p>
              <p>Organisationsnummer: XXX-XXXX</p>
              <p>Stockholm, Sverige</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const ContactPageWithSuspense = () => (
  <Suspense>
    <ContactPage />
  </Suspense>
);

export default ContactPageWithSuspense;
