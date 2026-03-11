'use client'
import { Calendar, MapPin, Users, ExternalLink, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type AIEvent, EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from "@/data/eventsData";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("sv-SE", { day: "numeric", month: "short" });
}

function formatDateFull(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

const EventCard = ({ event, isPast }: { event: AIEvent; isPast: boolean }) => {
  const day = new Date(event.dateStart).getDate();
  const month = new Date(event.dateStart).toLocaleDateString("sv-SE", { month: "short" }).toUpperCase();

  return (
    <div className={`rounded-lg bg-card border overflow-hidden card-hover ${event.isFeatured ? "border-primary/40 shadow-[var(--glow-primary)]" : "border-border"}`}>
      <div className="aspect-video relative overflow-hidden">
        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-center min-w-[52px]">
          <div className="text-xl font-bold text-foreground leading-none">{day}</div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase">{month}</div>
        </div>
        {event.isFeatured && (
          <div className="absolute top-3 right-3 gradient-bg text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
            UTVALDA
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${EVENT_TYPE_COLORS[event.eventType]}`}>
            {EVENT_TYPE_LABELS[event.eventType]}
          </span>
          {event.isOnline && (
            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Online</span>
          )}
        </div>

        <h3 className="font-semibold text-foreground mb-1.5 line-clamp-2">{event.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{event.description}</p>

        <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 shrink-0" />
            <span>{formatDateFull(event.dateStart)}{event.dateEnd ? ` – ${formatDate(event.dateEnd)}` : ""}, {event.timeStart}–{event.timeEnd}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{event.locationName}</span>
          </div>
          {event.maxAttendees && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3 h-3 shrink-0" />
              <span>{event.currentAttendees}/{event.maxAttendees} anmälda</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-sm font-semibold ${event.price === 0 ? "text-emerald-400" : "text-foreground"}`}>
            {event.price === 0 ? "Gratis" : `${event.price.toLocaleString("sv-SE")} kr`}
          </span>
          {isPast && event.videoUrl ? (
            <Button size="sm" variant="outline" className="border-border" asChild>
              <a href={event.videoUrl} target="_blank" rel="noopener noreferrer">
                <Video className="w-3.5 h-3.5 mr-1" />
                Se inspelning →
              </a>
            </Button>
          ) : !isPast ? (
            <Button size="sm" className="gradient-bg text-primary-foreground hover:opacity-90" asChild>
              <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                Anmäl dig →
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
