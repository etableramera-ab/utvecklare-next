'use client';
import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, CalendarDays, List, Search, Plus } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventListCard from "@/components/events/EventListCard";
import EventCalendarView from "@/components/events/EventCalendarView";
import AdBanner from "@/components/ads/AdBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useEvents, EVENT_TYPE_LABELS } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import eventsHeroBg from "@/assets/events-hero-bg.jpg";
import { AnswerBlock } from "@/components/AnswerBlock";

type ViewMode = "list" | "calendar";

const CITIES = ["Stockholm", "Göteborg", "Malmö", "Uppsala", "Linköping"];

const EventsPage = () => {
  const { events, loading } = useEvents();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [search, setSearch] = useState(searchParams.get("sok") || "");
  const typeFilter = searchParams.get("typ") || "all";
  const formatFilter = searchParams.get("format") || "all";
  const cityFilter = searchParams.get("stad") || "all";
  const priceFilter = searchParams.get("pris") || "all";
  const timeFilter = searchParams.get("tid") || "kommande";

  const setFilter = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "kommande") p.delete(key);
    else p.set(key, value);
    router.replace(`/events?${p.toString()}`);
  };

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const start = new Date(e.start_date);
      if (timeFilter === "kommande" && start < now) return false;
      if (timeFilter === "vecka" && (start < now || start > weekFromNow)) return false;
      if (timeFilter === "manad" && (start < now || start > monthFromNow)) return false;
      if (typeFilter !== "all" && e.event_type !== typeFilter) return false;
      if (formatFilter !== "all" && e.format !== formatFilter) return false;
      if (cityFilter !== "all") {
        if (cityFilter === "online" && e.format !== "online") return false;
        if (cityFilter !== "online" && e.location_city?.toLowerCase() !== cityFilter.toLowerCase()) return false;
      }
      if (priceFilter === "free" && !e.is_free) return false;
      if (priceFilter === "paid" && e.is_free) return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [events, timeFilter, typeFilter, formatFilter, cityFilter, priceFilter, search, now]);

  const featured = filtered.filter((e) => e.is_featured && new Date(e.start_date) >= now).slice(0, 2);
  const rest = filtered.filter((e) => !featured.includes(e));

  const totalUpcoming = events.filter((e) => new Date(e.start_date) >= now).length;
  const uniqueCities = [...new Set(events.map((e) => e.location_city).filter(Boolean))].length;
  const totalAttendees = events.reduce((s, e) => s + e.current_attendees, 0);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="AI-events i Sverige 2026 — Meetups, Konferenser & Workshops"
        description="Hitta AI-events nära dig. Meetups, konferenser, workshops och hackathons för AI-utvecklare i hela Sverige."
        canonical="/events"
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16">
        <div className="absolute inset-0 z-0">
          <img src={eventsHeroBg.src} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Hem</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Events</span>
          </nav>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">AI-events i Sverige</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            Meetups, konferenser, workshops och hackathons för AI-utvecklare
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground mb-6">
            <span className="font-medium text-foreground">{totalUpcoming}</span> kommande events ·
            <span className="font-medium text-foreground">{uniqueCities}</span> städer ·
            <span className="font-medium text-foreground">{totalAttendees}</span> deltagare
          </div>
          {user && (
            <Button variant="outline" className="border-border" asChild>
              <Link href="/events/skapa"><Plus className="w-4 h-4 mr-1" /> Lägg till ditt event</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Answer block */}
      <div className="container mx-auto px-4 pt-6">
        <AnswerBlock text="Hitta AI-events i Sverige — meetups, konferenser, workshops och hackathons för AI-utvecklare i Stockholm, Göteborg, Malmö och online. Se kommande events och anmäl dig direkt." />
      </div>

      {/* Filters */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-4">
          {/* Time tabs */}
          <div className="flex gap-1 bg-muted rounded-lg p-0.5 w-fit">
            {[
              { key: "kommande", label: "Kommande" },
              { key: "vecka", label: "Denna vecka" },
              { key: "manad", label: "Denna månad" },
              { key: "alla", label: "Alla" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter("tid", t.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  timeFilter === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Type chips */}
            <div className="flex flex-wrap gap-1">
              <Badge
                variant={typeFilter === "all" ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setFilter("typ", "all")}
              >
                Alla typer
              </Badge>
              {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
                <Badge
                  key={k}
                  variant={typeFilter === k ? "default" : "outline"}
                  className="cursor-pointer text-xs border-border"
                  onClick={() => setFilter("typ", k)}
                >
                  {v}
                </Badge>
              ))}
            </div>

            {/* Format */}
            <Select value={formatFilter} onValueChange={(v) => setFilter("format", v)}>
              <SelectTrigger className="w-[130px] bg-card border-border h-8 text-xs">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla format</SelectItem>
                <SelectItem value="physical">På plats</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>

            {/* City */}
            <Select value={cityFilter} onValueChange={(v) => setFilter("stad", v)}>
              <SelectTrigger className="w-[140px] bg-card border-border h-8 text-xs">
                <SelectValue placeholder="Stad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla städer</SelectItem>
                {CITIES.map((c) => <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>)}
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>

            {/* Price */}
            <div className="flex gap-1">
              {["all", "free", "paid"].map((p) => (
                <Badge
                  key={p}
                  variant={priceFilter === p ? "default" : "outline"}
                  className="cursor-pointer text-xs border-border"
                  onClick={() => setFilter("pris", p)}
                >
                  {p === "all" ? "Alla" : p === "free" ? "Gratis" : "Betald"}
                </Badge>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Sök events..."
                className="pl-8 h-8 text-xs bg-card border-border"
              />
            </div>

            {/* View toggle */}
            <div className="flex gap-1 bg-muted rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                <List className="w-3.5 h-3.5" /> Lista
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === "calendar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                <CalendarDays className="w-3.5 h-3.5" /> Kalender
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-3">
                {filtered.length === 0 && (
                  <div className="text-center py-16">
                    <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Inga events matchar dina filter.</p>
                  </div>
                )}
                {filtered.map((e) => <EventListCard key={e.id} event={e} />)}
              </div>
            ) : (
              <EventCalendarView events={filtered} />
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 hidden lg:block">
            {user && (
              <Button className="w-full gradient-bg text-primary-foreground hover:opacity-90" asChild>
                <Link href="/events/skapa"><Plus className="w-4 h-4 mr-1" /> Lägg till ditt event</Link>
              </Button>
            )}

            {/* Upcoming highlights */}
            <div className="rounded-lg bg-card border border-border p-5">
              <h3 className="font-semibold text-foreground text-sm mb-3">Kommande highlights</h3>
              <div className="space-y-3">
                {events
                  .filter((e) => new Date(e.start_date) >= now)
                  .slice(0, 3)
                  .map((e) => (
                    <Link key={e.id} href={`/events/${e.slug}`} className="block group">
                      <p className="text-xs text-muted-foreground">
                        {new Date(e.start_date).toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}
                      </p>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {e.title}
                      </p>
                    </Link>
                  ))}
              </div>
            </div>

            <Link href="/foretag" className="block p-4 rounded-lg border border-dashed border-border hover:border-primary/50 transition-colors text-center group">
                  <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">Din annons här</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">Annonsera på utvecklare.ai →</p>
                </Link>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const EventsPageWithSuspense = () => (
  <Suspense>
    <EventsPage />
  </Suspense>
);

export default EventsPageWithSuspense;
