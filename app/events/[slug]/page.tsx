'use client';
import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Calendar, MapPin, Globe, Users, ExternalLink, Copy, Check, Github, Linkedin, Clock, Tag, Mic, Coffee, Wrench, Handshake, MessageSquare } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventRegistrationModal from "@/components/events/EventRegistrationModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useEventDetail, EVENT_TYPE_LABELS, EVENT_TYPE_COLORS, FORMAT_LABELS } from "@/hooks/useEvents";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

const AGENDA_ICONS: Record<string, any> = {
  keynote: Mic,
  talk: MessageSquare,
  workshop: Wrench,
  break: Coffee,
  networking: Handshake,
  panel: Users,
  other: Tag,
};

function formatDateSv(date: string) {
  return new Date(date).toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
}

const EventDetailPage = () => {
  const params = useParams<{ slug: string }>();
  const { slug } = params;
  const router = useRouter();
  const { event, speakers, sponsors, agenda, registration, setRegistration, loading } = useEventDetail(slug);
  const [regOpen, setRegOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canceling, setCanceling] = useState(false);

  // Redirect if event not found after loading
  useEffect(() => {
    if (!loading && !event) {
      router.replace("/events");
    }
  }, [event, loading]);

  const heroImg = event?.hero_image_url || event?.image_url || null;
  const isFull = event?.max_attendees ? event.current_attendees >= event.max_attendees : false;

  const eventJsonLd = useMemo(() => {
    if (!event) return null;
    const location = event.format === "online"
      ? { "@type": "VirtualLocation", url: event.online_url || "" }
      : event.format === "hybrid"
      ? [
          { "@type": "Place", name: event.location_name, address: { "@type": "PostalAddress", addressLocality: event.location_city, addressCountry: "SE" } },
          { "@type": "VirtualLocation", url: event.online_url || "" },
        ]
      : { "@type": "Place", name: event.location_name, address: { "@type": "PostalAddress", streetAddress: event.location_address, addressLocality: event.location_city, addressCountry: "SE" } };

    return {
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.title,
      description: event.description,
      ...(heroImg ? { image: heroImg } : {}),
      startDate: event.start_date,
      ...(event.end_date ? { endDate: event.end_date } : {}),
      eventStatus: event.is_canceled ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
      eventAttendanceMode: event.format === "online"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : event.format === "hybrid"
        ? "https://schema.org/MixedEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
      location,
      ...(event.organizer_name ? { organizer: { "@type": "Organization", name: event.organizer_name, ...(event.organizer_url ? { url: event.organizer_url } : {}) } } : {}),
      offers: {
        "@type": "Offer",
        price: event.is_free ? "0" : String(event.ticket_price || 0),
        priceCurrency: "SEK",
        availability: isFull ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
        url: `https://utvecklare.ai/events/${event.slug}`,
      },
    };
  }, [event, heroImg, isFull]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 container mx-auto px-4 py-16 space-y-6">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!event) return null;

  const now = new Date();
  const start = new Date(event.start_date);
  const end = event.end_date ? new Date(event.end_date) : null;
  const isPast = end ? end < now : start < now;
  const fillPercent = event.max_attendees ? (event.current_attendees / event.max_attendees) * 100 : 0;
  const isRegistered = registration && registration.status !== "canceled";
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = () => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const shareLinkedIn = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank");
  const shareTwitter = () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Jag ska på ${event.title} via @utvecklare_ai`)}`, "_blank");

  const handleCancelReg = async () => {
    if (!registration) return;
    setCanceling(true);
    await supabase.from("event_registrations").update({ status: "canceled" }).eq("id", registration.id);
    await supabase.from("events").update({ current_attendees: Math.max(0, event.current_attendees - 1) }).eq("id", event.id);
    setRegistration({ ...registration, status: "canceled" });
    toast({ title: "Anmälan avbokad" });
    setCanceling(false);
  };

  const tierOrder = ["title", "gold", "silver", "standard"];
  const groupedSponsors = tierOrder.map((t) => ({ tier: t, items: sponsors.filter((s) => s.tier === t) })).filter((g) => g.items.length > 0);

  const googleMapsUrl = event.location_lat && event.location_lng
    ? `https://www.google.com/maps?q=${event.location_lat},${event.location_lng}`
    : event.location_address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location_address)}`
    : null;

  const ctaButton = () => {
    if (event.is_canceled) return <Badge variant="destructive" className="text-sm px-4 py-2">⚠️ Inställt</Badge>;
    if (isPast) return <p className="text-sm text-muted-foreground">Eventet har redan ägt rum</p>;
    if (isRegistered) return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-medium">
          <Check className="w-5 h-5" /> Du är anmäld!
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="text-xs text-muted-foreground hover:text-destructive transition-colors">Avboka anmälan</button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Avboka anmälan?</AlertDialogTitle>
              <AlertDialogDescription>Vill du avboka din anmälan till {event.title}?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border">Avbryt</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelReg} disabled={canceling} className="bg-destructive text-destructive-foreground">Avboka</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
    if (event.ticket_url) return (
      <Button className="w-full gradient-bg text-primary-foreground hover:opacity-90" size="lg" asChild>
        <a href={event.ticket_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4 mr-2" /> Köp biljett — {event.is_free ? "Gratis" : `${event.ticket_price} SEK`}</a>
      </Button>
    );
    return (
      <Button className="w-full gradient-bg text-primary-foreground hover:opacity-90" size="lg" onClick={() => setRegOpen(true)}>
        {isFull ? "Ställ dig på väntelistan" : `Anmäl dig — ${event.is_free ? "Gratis" : `${event.ticket_price} SEK`}`}
      </Button>
    );
  };

  const eventDateFormatted = new Date(event.start_date).toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${event.title} — ${eventDateFormatted}`}
        description={`${event.event_type ? EVENT_TYPE_LABELS[event.event_type] + " " : ""}i ${event.location_city || "Sverige"} den ${eventDateFormatted}. ${(event.description || "").slice(0, 100)}. Anmäl dig!`}
        canonical={`/events/${event.slug}`}
        ogType="event"
        ogImage={heroImg || undefined}
        jsonLd={eventJsonLd || undefined}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16">
        <div className="absolute inset-0 z-0">
          {heroImg ? (
            <img src={heroImg} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
          )}
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
            <Link href="/" className="hover:text-foreground transition-colors">Hem</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/events" className="hover:text-foreground transition-colors">Events</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground line-clamp-1">{event.title}</span>
          </nav>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {event.event_type && (
              <Badge variant="outline" className={EVENT_TYPE_COLORS[event.event_type]}>{EVENT_TYPE_LABELS[event.event_type]}</Badge>
            )}
            <Badge variant="outline" className="border-border text-muted-foreground">{FORMAT_LABELS[event.format]}</Badge>
            <Badge variant="outline" className="border-border text-muted-foreground">{event.is_free ? "Gratis" : `${event.ticket_price} SEK`}</Badge>
            {event.is_canceled && <Badge variant="destructive">⚠️ Inställt</Badge>}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">{event.title}</h1>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDateSv(event.start_date)}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{formatTime(event.start_date)}{event.end_date ? `–${formatTime(event.end_date)}` : ""}</span>
            {event.format !== "online" && event.location_name && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {googleMapsUrl ? <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">{event.location_name}, {event.location_city}</a> : `${event.location_name}, ${event.location_city}`}
              </span>
            )}
            {event.format !== "physical" && <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> Online</span>}
            {event.organizer_name && <span>Arrangör: <strong className="text-foreground">{event.organizer_name}</strong></span>}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[1fr_360px] gap-10">
          <div className="space-y-10">
            {/* Description */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Om eventet</h2>
              <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {event.long_description || event.description}
              </div>
            </div>

            {/* Agenda */}
            {agenda.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-6">Program</h2>
                <div className="relative pl-8 space-y-0">
                  <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
                  {agenda.map((item) => {
                    const Icon = AGENDA_ICONS[item.type] || Tag;
                    return (
                      <div key={item.id} className="relative pb-6 last:pb-0">
                        <div className="absolute -left-5 top-1 w-4 h-4 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-sm font-bold text-primary whitespace-nowrap">{item.time_start}{item.time_end ? `–${item.time_end}` : ""}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                            </div>
                            {item.event_speakers && (
                              <p className="text-xs text-muted-foreground mt-0.5">{item.event_speakers.name}{item.event_speakers.company ? `, ${item.event_speakers.company}` : ""}</p>
                            )}
                            {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Speakers */}
            {speakers.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-6">Talare</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {speakers.map((s) => (
                    <div key={s.id} className="p-5 rounded-xl bg-card border border-border">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-14 h-14">
                          {s.avatar_url ? <img src={s.avatar_url} alt={s.name} className="w-full h-full object-cover" /> : (
                            <AvatarFallback className="bg-accent text-sm">{s.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground">{s.name}</h4>
                          <p className="text-xs text-muted-foreground">{s.title}{s.company ? `, ${s.company}` : ""}</p>
                          {s.talk_title && <p className="text-xs text-primary italic mt-1">{s.talk_title}</p>}
                          {s.linkedin_url && (
                            <a href={s.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-1">
                              <Linkedin className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                            </a>
                          )}
                        </div>
                      </div>
                      {s.bio && <p className="text-xs text-muted-foreground mt-3 line-clamp-3">{s.bio}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sponsors */}
            {groupedSponsors.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-6">Sponsorer</h2>
                {groupedSponsors.map((g) => (
                  <div key={g.tier} className="mb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {g.tier === "title" ? "Titelsponsor" : g.tier === "gold" ? "Guld" : g.tier === "silver" ? "Silver" : "Standard"}
                    </p>
                    <div className="flex flex-wrap gap-4 items-center">
                      {g.items.map((s) => (
                        <a key={s.id} href={s.website_url || "#"} target="_blank" rel="noopener noreferrer"
                          className="bg-white rounded-lg p-3 flex items-center justify-center hover:shadow-md transition-shadow"
                          style={{ width: g.tier === "title" ? 200 : g.tier === "gold" ? 120 : g.tier === "silver" ? 80 : 60, height: g.tier === "title" ? 80 : g.tier === "gold" ? 48 : 36 }}>
                          <img src={s.logo_url} alt={s.name} className="max-w-full max-h-full object-contain" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Map */}
            {event.format !== "online" && event.location_address && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Hitta hit</h2>
                <p className="text-sm text-foreground font-medium">{event.location_name}</p>
                <p className="text-sm text-muted-foreground mb-3">{event.location_address}{event.location_city ? `, ${event.location_city}` : ""}</p>
                {googleMapsUrl && (
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    Öppna i Google Maps →
                  </a>
                )}
              </div>
            )}

            {/* Share */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Dela eventet</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-border" onClick={shareLinkedIn}>LinkedIn</Button>
                <Button variant="outline" size="sm" className="border-border" onClick={shareTwitter}>X / Twitter</Button>
                <Button variant="outline" size="sm" className="border-border" onClick={handleCopy}>
                  {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copied ? "Kopierad!" : "Kopiera länk"}
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl bg-card border border-border p-6 sticky top-24">
              <div className="text-center mb-4">{ctaButton()}</div>

              {event.max_attendees && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>👥 {event.current_attendees} anmälda</span>
                    <span>{Math.max(0, event.max_attendees - event.current_attendees)} kvar</span>
                  </div>
                  <Progress value={fillPercent} className="h-2" />
                </div>
              )}

              <div className="space-y-3 text-sm pt-2 border-t border-border">
                <div className="flex justify-between"><span className="text-muted-foreground">📅 Datum</span><span className="text-foreground font-medium">{new Date(event.start_date).toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">⏰ Tid</span><span className="text-foreground font-medium">{formatTime(event.start_date)}{event.end_date ? `–${formatTime(event.end_date)}` : ""}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">📍 Plats</span><span className="text-foreground font-medium text-right max-w-[160px]">{event.format === "online" ? "Online" : event.location_name || "-"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">💰 Pris</span><span className="text-foreground font-medium">{event.is_free ? "Gratis" : `${event.ticket_price} SEK`}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">🏷️ Typ</span><span className="text-foreground font-medium">{EVENT_TYPE_LABELS[event.event_type || ""] || "-"}</span></div>
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-4">
                  {event.tags.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                </div>
              )}
            </div>

            <Link href="/foretag" className="block relative rounded-lg overflow-hidden border border-border group" style={{ minHeight: "200px" }}>\n

              <img src="https://images.unsplash.com/photo-1531746790095-e5906b947fb1?w=400&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />\n

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />\n

              <div className="absolute inset-0 flex flex-col items-center justify-end p-5 text-center">\n

                <p className="text-sm font-bold text-white drop-shadow">Annonsera här</p>\n

                <p className="text-xs text-white/80 mt-1">Nå Sveriges AI-utvecklare →</p>\n

              </div>\n

            </Link>
          </div>
        </div>
      </section>

      <EventRegistrationModal event={event} open={regOpen} onOpenChange={setRegOpen} onRegistered={(r) => setRegistration(r)} />
      <Footer />
    </div>
  );
};

export default EventDetailPage;
