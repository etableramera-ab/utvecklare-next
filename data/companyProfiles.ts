export interface CompanyProfile {
  slug: string;
  name: string;
  logoUrl: string | null;
  coverImageUrl: string;
  industry: string;
  size: string;
  location: string;
  website: string;
  description: string;
  techStack: string[];
  founded?: string;
}

export const MOCK_COMPANY_PROFILES: CompanyProfile[] = [
  {
    slug: "spotify",
    name: "Spotify",
    logoUrl: null,
    coverImageUrl: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=1200&q=80",
    industry: "Musik & Streaming",
    size: "5 000+",
    location: "Stockholm",
    website: "https://spotify.com",
    description: "Spotify är världens största musikstreamingtjänst med 600+ miljoner användare. Vi använder AI och maskininlärning i kärnan av vår produkt för att leverera personaliserade upplevelser. Vårt ML-team arbetar med allt från rekommendationssystem och sökalgoritmer till content moderation och annonsoptimering.\n\nVi tror på en kultur av innovation, autonomi och samarbete. Våra team har friheten att experimentera och iterera snabbt, med stöd av en världsledande ML-infrastruktur.",
    techStack: ["Python", "PyTorch", "TensorFlow", "Kubernetes", "GCP", "Java", "Scala"],
    founded: "2006",
  },
  {
    slug: "klarna",
    name: "Klarna",
    logoUrl: null,
    coverImageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&q=80",
    industry: "Fintech",
    size: "3 000+",
    location: "Stockholm",
    website: "https://klarna.com",
    description: "Klarna är ett av Europas mest värdefulla fintech-bolag. Vi använder AI för att revolutionera betalningar och shopping för 150 miljoner konsumenter. Vårt AI-team bygger allt från kreditriskmodeller och fraud detection till konversations-AI och personaliserade shoppingupplevelser.",
    techStack: ["Python", "LLM", "AWS", "Kubernetes", "React", "Node.js"],
    founded: "2005",
  },
  {
    slug: "volvo",
    name: "Volvo",
    logoUrl: null,
    coverImageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=1200&q=80",
    industry: "Fordon & Autonomi",
    size: "10 000+",
    location: "Göteborg",
    website: "https://volvocars.com",
    description: "Volvo Cars är ledande inom säkerhet och autonom körning. Vårt AI-team arbetar med banbrytande teknik för framtidens mobilitet, inklusive perceptionssystem, planning och prediktionsmodeller för självkörande fordon.",
    techStack: ["Python", "C++", "TensorFlow", "Computer Vision", "ROS", "CUDA"],
    founded: "1927",
  },
  {
    slug: "hm-group",
    name: "H&M Group",
    logoUrl: null,
    coverImageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
    industry: "Mode & Retail",
    size: "10 000+",
    location: "Stockholm",
    website: "https://hmgroup.com",
    description: "H&M Group är en av världens största modekoncerner. Vi satsar stort på AI och data för att skapa en mer hållbar och personaliserad modeupplevelse, från supply chain-optimering till kundupplevelser.",
    techStack: ["Python", "NLP", "Hugging Face", "LangChain", "Azure", "Spark"],
    founded: "1947",
  },
  {
    slug: "ericsson",
    name: "Ericsson",
    logoUrl: null,
    coverImageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
    industry: "Telekommunikation",
    size: "10 000+",
    location: "Stockholm",
    website: "https://ericsson.com",
    description: "Ericsson är en global ledare inom telekommunikation. Vi använder AI för att optimera nätverk, förutse fel och skapa framtidens uppkopplade samhälle. Med över 100 000 anställda globalt erbjuder vi unika möjligheter att arbeta med AI i stor skala.",
    techStack: ["Python", "LLM", "RAG", "AWS", "Kubernetes", "5G"],
    founded: "1876",
  },
];
