'use client';
import Link from "next/link";
import { useState, useEffect } from "react";
import { CalendarDays, Eye, Users, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from "@/hooks/useEvents";

const AdminEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("start_date", { ascending: false });
    setEvents(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const togglePublished = async (id: string, current: boolean) => {
    await supabase.from("events").update({ is_published: !current }).eq("id", id);
    setEvents(prev => prev.map(e => e.id === id ? { ...e, is_published: !current } : e));
    toast.success(!current ? "Event publicerat" : "Event avpublicerat");
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from("events").update({ is_featured: !current }).eq("id", id);
    setEvents(prev => prev.map(e => e.id === id ? { ...e, is_featured: !current } : e));
    toast.success(!current ? "Markerat som featured" : "Avmarkerat som featured");
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Radera detta event permanent?")) return;
    await supabase.from("events").delete().eq("id", id);
    setEvents(prev => prev.filter(e => e.id !== id));
    toast.success("Event raderat");
  };

  const filtered = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.organizer_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.start_date) >= now).length;
  const totalAttendees = events.reduce((s, e) => s + (e.current_attendees || 0), 0);
  const totalViews = events.reduce((s, e) => s + (e.views_count || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Events</h1>
            <p className="text-sm text-muted-foreground mt-1">Hantera alla events på plattformen</p>
          </div>
          <Button className="gradient-bg text-primary-foreground" asChild>
            <Link href="/events/skapa"><Plus className="w-4 h-4 mr-1" /> Skapa event</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Totalt events", value: events.length, icon: CalendarDays },
            { label: "Kommande", value: upcoming, icon: CalendarDays },
            { label: "Deltagare", value: totalAttendees, icon: Users },
            { label: "Visningar", value: totalViews, icon: Eye },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-card border border-border p-5">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        <Input
          placeholder="Sök events..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm bg-card border-border"
        />

        <div className="rounded-xl bg-card border border-border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Laddar...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Stad</TableHead>
                  <TableHead className="text-center">Deltagare</TableHead>
                  <TableHead className="text-center">Visningar</TableHead>
                  <TableHead className="text-center">Publicerat</TableHead>
                  <TableHead className="text-center">Featured</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(ev => {
                  const isPast = new Date(ev.start_date) < now;
                  return (
                    <TableRow key={ev.id} className={isPast ? "opacity-60" : ""}>
                      <TableCell>
                        <div className="max-w-[250px]">
                          <p className="font-medium text-foreground truncate">{ev.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{ev.organizer_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {ev.event_type && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${EVENT_TYPE_COLORS[ev.event_type] || "bg-muted text-muted-foreground"}`}>
                            {EVENT_TYPE_LABELS[ev.event_type] || ev.event_type}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(ev.start_date).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ev.location_city || (ev.format === "online" ? "Online" : "—")}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {ev.current_attendees}{ev.max_attendees ? `/${ev.max_attendees}` : ""}
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {ev.views_count || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch checked={ev.is_published} onCheckedChange={() => togglePublished(ev.id, ev.is_published)} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch checked={ev.is_featured} onCheckedChange={() => toggleFeatured(ev.id, ev.is_featured)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/events/${ev.slug}`}><ExternalLink className="w-3.5 h-3.5" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteEvent(ev.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEvents;
