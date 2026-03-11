'use client'
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from 'next/link'
import { EVENT_TYPE_COLORS } from "@/hooks/useEvents";
import type { EventRow } from "@/hooks/useEvents";

const WEEKDAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

function getDaysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function getFirstDay(y: number, m: number) {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

const EventCalendarView = ({ events }: { events: EventRow[] }) => {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const label = new Date(year, month).toLocaleDateString("sv-SE", { month: "long", year: "numeric" });
  const days = getDaysInMonth(year, month);
  const first = getFirstDay(year, month);

  const dayMap = useMemo(() => {
    const m = new Map<number, EventRow[]>();
    events.forEach((e) => {
      const d = new Date(e.start_date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        if (!m.has(day)) m.set(day, []);
        m.get(day)!.push(e);
      }
    });
    return m;
  }, [events, month, year]);

  const prev = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); setSelectedDay(null); };
  const next = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); setSelectedDay(null); };

  const todayDay = new Date().getDate();
  const isCurrentMonth = month === new Date().getMonth() && year === new Date().getFullYear();
  const selectedEvents = selectedDay ? dayMap.get(selectedDay) || [] : [];

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prev} className="p-2 hover:bg-accent rounded-md transition-colors">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <h3 className="text-lg font-semibold text-foreground capitalize">{label}</h3>
          <button onClick={next} className="p-2 hover:bg-accent rounded-md transition-colors">
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {WEEKDAYS.map((d) => (
            <div key={d} className="bg-muted px-2 py-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>
          ))}
          {Array.from({ length: first }).map((_, i) => (
            <div key={`e-${i}`} className="bg-card min-h-[72px]" />
          ))}
          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const de = dayMap.get(day) || [];
            const isToday = isCurrentMonth && day === todayDay;
            const isSelected = day === selectedDay;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                className={`bg-card min-h-[72px] p-1.5 text-left transition-colors hover:bg-accent/50 ${isToday ? "ring-1 ring-primary" : ""} ${isSelected ? "bg-primary/10" : ""}`}
              >
                <span className={`text-xs font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>{day}</span>
                <div className="mt-1 space-y-0.5">
                  {de.slice(0, 2).map((e) => (
                    <div key={e.id} className={`text-[9px] font-medium px-1 py-0.5 rounded truncate ${EVENT_TYPE_COLORS[e.event_type || ""] || "bg-primary/20 text-primary"}`}>
                      {e.title}
                    </div>
                  ))}
                  {de.length > 2 && <span className="text-[9px] text-muted-foreground">+{de.length - 2}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && selectedEvents.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Events den {selectedDay} {label}</h4>
          {selectedEvents.map((e) => (
            <Link key={e.id} href={`/events/${e.slug}`} className="block p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors">
              <p className="font-medium text-foreground text-sm">{e.title}</p>
              <p className="text-xs text-muted-foreground">{new Date(e.start_date).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })} · {e.organizer_name}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventCalendarView;
