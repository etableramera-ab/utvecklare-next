'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Loader2, Upload, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { generateEventSlug, EVENT_TYPE_LABELS } from "@/hooks/useEvents";

const CITIES = ["Stockholm", "Göteborg", "Malmö", "Uppsala", "Linköping", "Annan"];
const TAG_SUGGESTIONS = ["AI", "ML", "NLP", "LLM", "RAG", "MLOps", "Datorseende", "Python", "PyTorch", "Nybörjare"];

const ADMIN_USER_ID = "8e06c38b-e406-48cb-9714-963904091465";

const CreateEventPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("");
  const [format, setFormat] = useState("physical");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // Step 2
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("18:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("20:00");
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [onlineUrl, setOnlineUrl] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [ticketPrice, setTicketPrice] = useState("0");
  const [ticketUrl, setTicketUrl] = useState("");

  // Step 3
  const [organizerName, setOrganizerName] = useState("");
  const [organizerUrl, setOrganizerUrl] = useState("");

  if (!user || user.id !== ADMIN_USER_ID) { router.push("/events"); return null; }

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !tags.includes(t) && tags.length < 5) setTags([...tags, t]);
    setNewTag("");
  };

  const handleHero = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast({ title: "Max 5 MB", variant: "destructive" }); return; }
    setHeroFile(file);
    setHeroPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !eventType || !startDate || !organizerName.trim()) {
      toast({ title: "Fyll i alla obligatoriska fält", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const slug = generateEventSlug(title);

    let heroUrl: string | null = null;
    if (heroFile) {
      const ext = heroFile.name.split(".").pop();
      const path = `${user.id}/${slug}/hero.${ext}`;
      const { error } = await supabase.storage.from("event-images").upload(path, heroFile, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from("event-images").getPublicUrl(path);
        heroUrl = data.publicUrl;
      }
    }

    const startDateTime = new Date(`${startDate}T${startTime}`).toISOString();
    const endDateTime = endDate ? new Date(`${endDate}T${endTime}`).toISOString() : null;

    const { error } = await supabase.from("events").insert({
      title: title.trim(),
      slug,
      description: description.trim(),
      long_description: longDescription.trim() || null,
      event_type: eventType,
      format,
      hero_image_url: heroUrl,
      start_date: startDateTime,
      end_date: endDateTime,
      location_name: format !== "online" ? locationName.trim() || null : null,
      location_address: format !== "online" ? locationAddress.trim() || null : null,
      location_city: format !== "online" ? locationCity || null : null,
      online_url: format !== "physical" ? onlineUrl.trim() || null : null,
      organizer_name: organizerName.trim(),
      organizer_url: organizerUrl.trim() || null,
      organizer_user_id: user.id,
      tags,
      max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
      ticket_price: parseInt(ticketPrice) || 0,
      is_free: parseInt(ticketPrice) === 0,
      ticket_url: ticketUrl.trim() || null,
    } as any);

    if (error) {
      toast({ title: "Kunde inte skapa event", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event skapat! 🎉" });
      router.push(`/events/${slug}`);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-16">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/events" className="hover:text-foreground transition-colors">Events</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Skapa event</span>
          </nav>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Skapa nytt event</h1>

          {/* Steps indicator */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex-1 h-1 rounded-full ${step >= s ? "gradient-bg" : "bg-muted"}`} />
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
            {step === 1 && (
              <>
                <h2 className="font-semibold text-foreground">Steg 1: Grundinformation</h2>
                <div>
                  <Label>Titel *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="AI Meetup Stockholm" className="mt-1 bg-background border-border" maxLength={100} />
                </div>
                <div>
                  <Label>Event-typ *</Label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger className="mt-1 bg-background border-border"><SelectValue placeholder="Välj typ" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Format *</Label>
                  <div className="flex gap-2 mt-1">
                    {["physical", "online", "hybrid"].map((f) => (
                      <Button key={f} variant={format === f ? "default" : "outline"} size="sm" className="border-border" onClick={() => setFormat(f)}>
                        {f === "physical" ? "På plats" : f === "online" ? "Online" : "Hybrid"}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Kort beskrivning * <span className="text-muted-foreground text-xs">({description.length}/300)</span></Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 bg-background border-border" maxLength={300} rows={2} />
                </div>
                <div>
                  <Label>Detaljerad beskrivning</Label>
                  <Textarea value={longDescription} onChange={(e) => setLongDescription(e.target.value)} className="mt-1 bg-background border-border" rows={6} placeholder="Markdown stöds..." />
                </div>
                <div>
                  <Label>Hero-bild</Label>
                  {heroPreview ? (
                    <div className="mt-2 relative aspect-video rounded-lg overflow-hidden border border-border">
                      <img src={heroPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button onClick={() => { setHeroFile(null); setHeroPreview(""); }} className="absolute top-2 right-2 p-1 rounded-full bg-background/80"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <label className="mt-2 flex flex-col items-center gap-2 p-8 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Klicka för att ladda upp</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleHero} />
                    </label>
                  )}
                </div>
                <div>
                  <Label>Tags (max 5)</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {tags.map((t) => (
                      <Badge key={t} variant="secondary" className="cursor-pointer hover:bg-destructive/20" onClick={() => setTags(tags.filter((x) => x !== t))}>{t} ×</Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(newTag); } }} placeholder="Lägg till tag..." className="bg-background border-border flex-1" />
                    <Button variant="outline" size="sm" className="border-border" onClick={() => addTag(newTag)}>Lägg till</Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {TAG_SUGGESTIONS.filter((t) => !tags.includes(t)).slice(0, 6).map((t) => (
                      <button key={t} onClick={() => addTag(t)} className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">+ {t}</button>
                    ))}
                  </div>
                </div>
                <Button onClick={() => setStep(2)} disabled={!title.trim() || !description.trim() || !eventType} className="w-full gradient-bg text-primary-foreground">Nästa: Tid och plats →</Button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="font-semibold text-foreground">Steg 2: Tid och plats</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label>Startdatum *</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 bg-background border-border" /></div>
                  <div><Label>Starttid *</Label><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1 bg-background border-border" /></div>
                  <div><Label>Slutdatum</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 bg-background border-border" /></div>
                  <div><Label>Sluttid</Label><Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-1 bg-background border-border" /></div>
                </div>
                {format !== "online" && (
                  <>
                    <div><Label>Platsnamn</Label><Input value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="Epicenter Stockholm" className="mt-1 bg-background border-border" /></div>
                    <div><Label>Adress</Label><Input value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} placeholder="Mäster Samuelsgatan 36" className="mt-1 bg-background border-border" /></div>
                    <div>
                      <Label>Stad</Label>
                      <Select value={locationCity} onValueChange={setLocationCity}>
                        <SelectTrigger className="mt-1 bg-background border-border"><SelectValue placeholder="Välj stad" /></SelectTrigger>
                        <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                {format !== "physical" && (
                  <div><Label>Länk till stream/möte</Label><Input value={onlineUrl} onChange={(e) => setOnlineUrl(e.target.value)} placeholder="https://zoom.us/..." className="mt-1 bg-background border-border" /></div>
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label>Max deltagare</Label><Input type="number" value={maxAttendees} onChange={(e) => setMaxAttendees(e.target.value)} placeholder="Obegränsat" className="mt-1 bg-background border-border" /></div>
                  <div><Label>Pris (SEK, 0 = gratis)</Label><Input type="number" value={ticketPrice} onChange={(e) => setTicketPrice(e.target.value)} className="mt-1 bg-background border-border" /></div>
                </div>
                <div><Label>Extern biljettlänk</Label><Input value={ticketUrl} onChange={(e) => setTicketUrl(e.target.value)} placeholder="https://..." className="mt-1 bg-background border-border" /></div>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-border" onClick={() => setStep(1)}>← Tillbaka</Button>
                  <Button onClick={() => setStep(3)} disabled={!startDate} className="flex-1 gradient-bg text-primary-foreground">Nästa: Organisatör →</Button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="font-semibold text-foreground">Steg 3: Organisatör</h2>
                <div><Label>Organisatörsnamn *</Label><Input value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} placeholder="utvecklare.ai" className="mt-1 bg-background border-border" /></div>
                <div><Label>Organisatörs webbplats</Label><Input value={organizerUrl} onChange={(e) => setOrganizerUrl(e.target.value)} placeholder="https://..." className="mt-1 bg-background border-border" /></div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="border-border" onClick={() => setStep(2)}>← Tillbaka</Button>
                  <Button onClick={handleSubmit} disabled={submitting || !organizerName.trim()} className="flex-1 gradient-bg text-primary-foreground hover:opacity-90">
                    {submitting && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                    Publicera event
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CreateEventPage;
