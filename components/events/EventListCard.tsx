'use client'
import Link from 'next/link'
import { MapPin, Globe, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import EventDateBlock from "./EventDateBlock";
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS, FORMAT_LABELS, type EventRow } from "@/hooks/useEvents";

interface Props {
  event: EventRow;
}

function formatDateSv(date: string) {
  return new Date(date).toLocaleDateString("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
}

const EventListCard = ({ event }: Props) => {
  const now = new Date();
  const start = new Date(event.start_date);
  const end = event.end_date ? new Date(event.end_date) : null;
  const isPast = end ? end < now : start < now;
  const isOngoing = start <= now && end ? end >= now : false;
  const isFull = event.max_attendees ? event.current_attendees >= event.max_attendees : false;
  const fillPercent = event.max_attendees ? (event.current_attendees / event.max_attendees) * 100 : 0;
  const almostFull = fillPercent >= 80 && !isFull;

  return (
    <Link href={`/events/${event.slug}`}>
      <div
        className={`flex gap-4 p-5 rounded-xl border transition-all ${
          event.is_canceled
            ? "bg-card border-border opacity-60"
            : event.is_featured
            ? "bg-card border-primary/40 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.15)]"
            : "bg-card border-border hover:border-primary/30"
        }`}
      >
        <EventDateBlock date={event.start_date} isOngoing={isOngoing} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {event.event_type && (
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${EVENT_TYPE_COLORS[event.event_type] || ""}`}>
                {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border text-muted-foreground">
              {event.is_free ? "Gratis" : `${event.ticket_price} SEK`}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border text-muted-foreground">
              {FORMAT_LABELS[event.format] || event.format}
            </Badge>
            {event.is_featured && (
              <Badge className="gradient-bg text-primary-foreground text-[10px] px-1.5 py-0">Featured</Badge>
            )}
            {event.is_canceled && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Inställt</Badge>
            )}
            {isOngoing && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 py-0">Pågår nu</Badge>
            )}
          </div>

          <h3 className={`font-semibold text-foreground mb-1 line-clamp-1 ${event.is_canceled ? "line-through" : ""}`}>
            {event.title}
          </h3>

          <p className="text-xs text-muted-foreground mb-1.5 capitalize">
            {formatDateSv(event.start_date)} · {formatTime(event.start_date)}
            {event.end_date ? `–${formatTime(event.end_date)}` : ""}
          </p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            {event.format !== "online" && event.location_name && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {event.location_name}{event.location_city ? `, ${event.location_city}` : ""}
              </span>
            )}
            {event.format !== "physical" && (
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" /> Online
              </span>
            )}
            {event.max_attendees && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span className={almostFull ? "text-amber-400" : isFull ? "text-destructive" : ""}>
                  {event.current_attendees}/{event.max_attendees}
                  {isFull ? " — Fullbokat" : almostFull ? " — Nästan fullt!" : " platser"}
                </span>
              </span>
            )}
          </div>

          {event.max_attendees && (
            <Progress value={fillPercent} className="h-1 mt-2 max-w-[200px]" />
          )}

          <p className="text-xs text-muted-foreground mt-1.5">
            Organisatör: {event.organizer_name}
          </p>
        </div>

        <div className="hidden sm:flex items-center">
          {!isPast && !event.is_canceled ? (
            <Button size="sm" className="gradient-bg text-primary-foreground hover:opacity-90 whitespace-nowrap">
              {isFull ? "Väntelista" : "Anmäl dig →"}
            </Button>
          ) : isPast ? (
            <span className="text-xs text-muted-foreground">Avslutat</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
};

export default EventListCard;
