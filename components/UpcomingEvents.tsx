'use client'
import Link from 'next/link'
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEvents, EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from "@/hooks/useEvents";

const UpcomingEvents = () => {
  const { events, loading } = useEvents();
  const now = new Date();
  const upcoming = events
    .filter(e => new Date(e.start_date) >= now)
    .slice(0, 4);

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 bg-card border border-border rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (upcoming.length === 0) return null;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Kommande events</h2>
            <p className="text-muted-foreground mt-1">Meetups, konferenser och workshops för AI-utvecklare</p>
          </div>
          <Button variant="outline" className="border-border hidden sm:flex" asChild>
            <Link href="/events">Alla events <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcoming.map(ev => {
            const date = new Date(ev.start_date);
            return (
              <Link key={ev.id} href={`/events/${ev.slug}`} className="group">
                <div className="rounded-xl bg-card border border-border overflow-hidden card-hover h-full flex flex-col">
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={ev.image_url || ev.hero_image_url || "/placeholder.svg"}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      {ev.event_type && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${EVENT_TYPE_COLORS[ev.event_type] || ""}`}>
                          {EVENT_TYPE_LABELS[ev.event_type] || ev.event_type}
                        </span>
                      )}
                    </div>
                    {ev.is_featured && (
                      <Badge className="absolute top-2 right-2 gradient-bg text-primary-foreground text-[10px]">Featured</Badge>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <CalendarDays className="w-3 h-3" />
                      {date.toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}
                    </div>
                    <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-2 mb-auto">
                      {ev.title}
                    </h3>
                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {ev.location_city || (ev.format === "online" ? "Online" : "—")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {ev.current_attendees}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-6 sm:hidden">
          <Button variant="outline" className="border-border" asChild>
            <Link href="/events">Alla events <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
