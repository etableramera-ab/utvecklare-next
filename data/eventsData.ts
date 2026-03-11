export type EventType = "meetup" | "hackathon" | "conference" | "webinar";

export interface EventSpeaker {
  name: string;
  role: string;
  company: string;
}

export interface AIEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  eventType: EventType;
  dateStart: string;
  dateEnd?: string;
  timeStart: string;
  timeEnd: string;
  locationName: string;
  locationAddress?: string;
  isOnline: boolean;
  registrationUrl: string;
  price: number;
  maxAttendees?: number;
  currentAttendees: number;
  organizerName: string;
  isFeatured: boolean;
  videoUrl?: string;
  speakers?: EventSpeaker[];
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  meetup: "Meetup",
  hackathon: "Hackathon",
  conference: "Konferens",
  webinar: "Webbinarium",
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  meetup: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  hackathon: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  conference: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  webinar: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export const MOCK_EVENTS: AIEvent[] = [
  {
    id: "1",
    title: "Stockholm AI Summit 2026",
    slug: "stockholm-ai-summit-2026",
    description: "Sveriges största AI-konferens med internationella talare, workshops och networking. Fokus på enterprise AI och ansvarsfull AI.",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    eventType: "conference",
    dateStart: "2026-03-15",
    dateEnd: "2026-03-16",
    timeStart: "09:00",
    timeEnd: "18:00",
    locationName: "Stockholmsmässan",
    locationAddress: "Mässvägen 1, Älvsjö",
    isOnline: false,
    registrationUrl: "#",
    price: 4995,
    maxAttendees: 2000,
    currentAttendees: 1456,
    organizerName: "AI Sweden",
    isFeatured: true,
    longDescription: "Stockholm AI Summit är Sveriges största årliga AI-konferens som samlar över 2000 deltagare från hela Norden. Under två intensiva dagar får du ta del av keynotes från internationella AI-ledare, delta i praktiska workshops, och nätverka med branschens främsta experter. Årets fokusområden inkluderar enterprise AI-implementation, ansvarsfull AI, och de senaste genombrotten inom generativ AI.",
    speakers: [
      { name: "Dr. Anna Lindberg", role: "Head of AI Research", company: "Ericsson" },
      { name: "Marcus Wallenberg", role: "CTO", company: "Klarna" },
      { name: "Dr. Yann Chen", role: "Principal Scientist", company: "DeepMind" },
      { name: "Sara Eriksson", role: "Director of ML", company: "Spotify" },
    ],
  },
  {
    id: "2",
    title: "LLM Hackathon Göteborg",
    slug: "llm-hackathon-goteborg",
    description: "48-timmars hackathon fokuserat på att bygga innovativa applikationer med stora språkmodeller. Priser totalt värda 100 000 kr.",
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
    eventType: "hackathon",
    dateStart: "2026-04-05",
    dateEnd: "2026-04-07",
    timeStart: "10:00",
    timeEnd: "16:00",
    locationName: "Lindholmen Science Park",
    locationAddress: "Lindholmspiren 5, Göteborg",
    isOnline: false,
    registrationUrl: "#",
    price: 0,
    maxAttendees: 150,
    currentAttendees: 98,
    organizerName: "GöteborgTech",
    isFeatured: true,
  },
  {
    id: "3",
    title: "MLOps Meetup Stockholm #12",
    slug: "mlops-meetup-stockholm-12",
    description: "Månatlig meetup om MLOps. Denna gång: Model monitoring i produktion och CI/CD för ML-pipelines.",
    imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
    eventType: "meetup",
    dateStart: "2026-02-20",
    timeStart: "18:00",
    timeEnd: "21:00",
    locationName: "Spotify HQ",
    locationAddress: "Regeringsgatan 19, Stockholm",
    isOnline: false,
    registrationUrl: "#",
    price: 0,
    currentAttendees: 67,
    organizerName: "MLOps Sweden",
    isFeatured: false,
  },
  {
    id: "4",
    title: "Generativ AI för företag — webbinarium",
    slug: "generativ-ai-foretag-webinar",
    description: "Lär dig implementera generativ AI i din organisation. Praktiska exempel från svenska företag som redan gör det.",
    imageUrl: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80",
    eventType: "webinar",
    dateStart: "2026-02-25",
    timeStart: "12:00",
    timeEnd: "13:00",
    locationName: "Online (Zoom)",
    isOnline: true,
    registrationUrl: "#",
    price: 0,
    currentAttendees: 234,
    organizerName: "utvecklare.ai",
    isFeatured: false,
  },
  {
    id: "5",
    title: "Computer Vision Workshop Malmö",
    slug: "computer-vision-workshop-malmo",
    description: "Hands-on workshop i datorseende med PyTorch och YOLO. Bygg din egen objektdetekterings-pipeline.",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
    eventType: "meetup",
    dateStart: "2026-03-08",
    timeStart: "10:00",
    timeEnd: "16:00",
    locationName: "MINC Malmö",
    locationAddress: "Anckargripsgatan 3, Malmö",
    isOnline: false,
    registrationUrl: "#",
    price: 500,
    maxAttendees: 30,
    currentAttendees: 22,
    organizerName: "Skåne AI",
    isFeatured: false,
  },
  {
    id: "6",
    title: "AI Ethics Roundtable",
    slug: "ai-ethics-roundtable",
    description: "Paneldiskussion om etik och ansvar i AI-utveckling med representanter från akademi, industri och myndigheter.",
    imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
    eventType: "conference",
    dateStart: "2026-03-22",
    timeStart: "14:00",
    timeEnd: "17:00",
    locationName: "KTH Royal Institute",
    locationAddress: "Brinellvägen 8, Stockholm",
    isOnline: false,
    registrationUrl: "#",
    price: 0,
    currentAttendees: 89,
    organizerName: "KTH AI Society",
    isFeatured: false,
  },
  // Past events
  {
    id: "7",
    title: "NLP i praktiken — workshop",
    slug: "nlp-i-praktiken",
    description: "Workshop om naturlig språkbehandling för svenska texter. Tokenisering, sentimentanalys och textklassificering.",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    eventType: "meetup",
    dateStart: "2025-12-10",
    timeStart: "17:00",
    timeEnd: "20:00",
    locationName: "SUP46 Stockholm",
    isOnline: false,
    registrationUrl: "#",
    price: 0,
    currentAttendees: 45,
    organizerName: "NLP Sweden",
    isFeatured: false,
    videoUrl: "https://youtube.com",
  },
  {
    id: "8",
    title: "AI Year in Review 2025 — webbinarium",
    slug: "ai-year-in-review-2025",
    description: "Sammanfattning av årets viktigaste AI-genombrott och trender. Vad kan vi förvänta oss 2026?",
    imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
    eventType: "webinar",
    dateStart: "2025-12-28",
    timeStart: "13:00",
    timeEnd: "14:30",
    locationName: "Online (YouTube Live)",
    isOnline: true,
    registrationUrl: "#",
    price: 0,
    currentAttendees: 567,
    organizerName: "utvecklare.ai",
    isFeatured: false,
    videoUrl: "https://youtube.com",
  },
];
