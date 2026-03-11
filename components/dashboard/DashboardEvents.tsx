'use client'
import Link from 'next/link'
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEvents, EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from "@/hooks/useEvents";

const DashboardEvents = () => {
  const { events, loading } = useEvents();
  const now = new Date();
  const upcoming = events.filter(e => new Date(e.start_date) >= now).slice(0, 4);

  if (loading) {
    return <div className="animate-pulse h-32 bg-card border border-border rounded-xl" />;
  }

  if (upcoming.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="text-center py-12 text-muted-foreground">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Inga kommande events just nu.</p>
          <Button variant="outline" className="border-border mt-4" asChild>
            <Link href="/events">Utforska events</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {upcoming.map(ev => {
          const date = new Date(ev.start_date);
          return (
            <Link key={ev.id} href={`/events/${ev.slug}`}>
              <Card className="bg-card border-border card-hover h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="text-center shrink-0 bg-primary/10 rounded-lg p-2 min-w-[48px]">
                      <p className="text-xs font-medium text-primary uppercase">
                        {date.toLocaleDateString("sv-SE", { month: "short" })}
                      </p>
                      <p className="text-lg font-bold text-foreground">{date.getDate()}</p>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-sm truncate">{ev.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {ev.location_city || (ev.format === "online" ? "Online" : "—")}
                      </div>
                      {ev.event_type && (
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium border ${EVENT_TYPE_COLORS[ev.event_type] || ""}`}>
                          {EVENT_TYPE_LABELS[ev.event_type] || ev.event_type}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      <div className="text-center">
        <Button variant="outline" className="border-border" asChild>
          <Link href="/events">Alla events <ArrowRight className="w-4 h-4 ml-1" /></Link>
        </Button>
      </div>
    </div>
  );
};

export default DashboardEvents;
