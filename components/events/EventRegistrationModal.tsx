'use client'
import { useState } from "react";
import { Loader2, Check, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import type { EventRow } from "@/hooks/useEvents";

interface Props {
  event: EventRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegistered: (reg: any) => void;
}

const EventRegistrationModal = ({ event, open, onOpenChange, onRegistered }: Props) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isWaitlist, setIsWaitlist] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: user?.email || "",
    company: "",
    role: "",
    dietary_requirements: "",
  });

  const isFull = event.max_attendees ? event.current_attendees >= event.max_attendees : false;

  const handleSubmit = async () => {
    if (!form.full_name.trim() || !form.email.trim()) {
      toast({ title: "Namn och e-post krävs", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    const status = isFull ? "waitlist" : "registered";

    const { data, error } = await supabase.from("event_registrations").insert({
      event_id: event.id,
      user_id: user?.id ?? "",
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      company: form.company.trim() || null,
      role: form.role.trim() || null,
      dietary_requirements: form.dietary_requirements.trim() || null,
      status,
    }).select().single();

    if (error) {
      if (error.message.includes("unique_event_email")) {
        toast({ title: "Du är redan anmäld till detta event", variant: "destructive" });
      } else {
        toast({ title: "Kunde inte registrera", description: error.message, variant: "destructive" });
      }
    } else {
      if (!isFull) {
        await supabase.from("events").update({ current_attendees: event.current_attendees + 1 }).eq("id", event.id);
      }
      setIsWaitlist(isFull);
      setSuccess(true);
      onRegistered(data);
    }
    setSubmitting(false);
  };

  const googleCalUrl = () => {
    const start = new Date(event.start_date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const end = event.end_date
      ? new Date(event.end_date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
      : start;
    const loc = event.location_name ? `${event.location_name}, ${event.location_address || ""}` : "Online";
    return `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(loc)}`;
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-border">
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {isWaitlist ? "Du är på väntelistan!" : "Du är anmäld!"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isWaitlist
                ? `Du är placerad på väntelistan för ${event.title}. Vi meddelar dig om en plats blir ledig.`
                : `Du är anmäld till ${event.title}!`}
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="flex items-center gap-1"><CalendarIcon className="w-3 h-3 text-primary" /> {new Date(event.start_date).toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" })}</p>
              <p className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" /> {event.location_name || "Online"}</p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <Button size="sm" variant="outline" className="border-border" asChild>
                <a href={googleCalUrl()} target="_blank" rel="noopener noreferrer">
                  <CalendarIcon className="w-3.5 h-3.5 mr-1" /> Lägg till i kalender
                </a>
              </Button>
              <Button size="sm" variant="outline" className="border-border" onClick={() => onOpenChange(false)}>
                Stäng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isFull ? "Ställ dig på väntelistan" : "Anmäl dig"} — {event.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label>Namn *</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Ditt namn" className="mt-1 bg-background border-border" />
          </div>
          <div>
            <Label>E-post *</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="din@email.se" className="mt-1 bg-background border-border" type="email" />
          </div>
          <div>
            <Label>Företag</Label>
            <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Valfritt" className="mt-1 bg-background border-border" />
          </div>
          <div>
            <Label>Roll/Titel</Label>
            <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Valfritt" className="mt-1 bg-background border-border" />
          </div>
          <div>
            <Label>Kostpreferenser</Label>
            <Textarea value={form.dietary_requirements} onChange={(e) => setForm({ ...form, dietary_requirements: e.target.value })} placeholder="Allergier eller specialkost?" className="mt-1 bg-background border-border" rows={2} />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !form.full_name.trim() || !form.email.trim()}
            className="w-full gradient-bg text-primary-foreground hover:opacity-90"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
            {isFull ? "Ställ dig på väntelistan" : "Bekräfta anmälan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationModal;
