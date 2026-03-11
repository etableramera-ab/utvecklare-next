'use client'
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type EventRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  event_type: string | null;
  format: string;
  hero_image_url: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string | null;
  date_start: string;
  timezone: string | null;
  location_name: string | null;
  location_address: string | null;
  location_city: string | null;
  location_lat: number | null;
  location_lng: number | null;
  online_url: string | null;
  organizer_name: string | null;
  organizer_logo_url: string | null;
  organizer_url: string | null;
  organizer_user_id: string | null;
  tags: string[] | null;
  max_attendees: number | null;
  current_attendees: number;
  ticket_price: number;
  ticket_currency: string | null;
  ticket_url: string | null;
  is_free: boolean;
  is_featured: boolean;
  is_published: boolean;
  is_canceled: boolean;
  views_count: number;
  created_at: string;
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  meetup: "Meetup",
  konferens: "Konferens",
  workshop: "Workshop",
  webinar: "Webinar",
  hackathon: "Hackathon",
  networking: "Networking",
};

export const EVENT_TYPE_COLORS: Record<string, string> = {
  meetup: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  konferens: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  workshop: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  webinar: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  hackathon: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  networking: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

export const FORMAT_LABELS: Record<string, string> = {
  physical: "På plats",
  online: "Online",
  hybrid: "Hybrid",
};

export function useEvents() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .order("start_date", { ascending: true });
      setEvents((data as any[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  return { events, loading };
}

export function useEventDetail(slug: string | undefined) {
  const [event, setEvent] = useState<EventRow | null>(null);
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [agenda, setAgenda] = useState<any[]>([]);
  const [registration, setRegistration] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      const { data: ev } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (!ev) { setLoading(false); return; }
      setEvent(ev as any);

      // increment views
      supabase.rpc("increment_event_views", { p_event_id: ev.id });

      const [spk, spn, ag] = await Promise.all([
        supabase.from("event_speakers").select("*").eq("event_id", ev.id).order("sort_order"),
        supabase.from("event_sponsors").select("*").eq("event_id", ev.id).order("sort_order"),
        supabase.from("event_agenda").select("*, event_speakers(name, title, company)").eq("event_id", ev.id).order("sort_order"),
      ]);
      setSpeakers(spk.data ?? []);
      setSponsors(spn.data ?? []);
      setAgenda(ag.data ?? []);

      if (user) {
        const { data: reg } = await supabase
          .from("event_registrations")
          .select("*")
          .eq("event_id", ev.id)
          .eq("user_id", user.id)
          .maybeSingle();
        setRegistration(reg);
      }

      setLoading(false);
    };
    load();
  }, [slug, user]);

  return { event, speakers, sponsors, agenda, registration, setRegistration, loading };
}

export function useMyEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const load = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("organizer_user_id", user.id)
        .order("start_date", { ascending: false });
      setEvents(data ?? []);
      setLoading(false);
    };
    load();
  }, [user]);

  return { events, loading };
}

export function generateEventSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 60);
}
