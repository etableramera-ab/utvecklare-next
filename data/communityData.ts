export const COMMUNITY_CATEGORIES = [
  { label: "Alla", slug: "alla" },
  { label: "Allmänt", slug: "allmant" },
  { label: "Maskininlärning", slug: "maskininlarning" },
  { label: "LLM & NLP", slug: "llm-nlp" },
  { label: "Datorseende", slug: "datorseende" },
  { label: "MLOps", slug: "mlops" },
  { label: "Karriärfrågor", slug: "karriarfragor" },
  { label: "Visa projekt", slug: "visa-projekt" },
  { label: "Jobbdiskussioner", slug: "jobbdiskussioner" },
] as const;

export type ForumCategory = typeof COMMUNITY_CATEGORIES[number]["slug"];

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: ForumCategory;
  authorName: string;
  authorAvatar: string;
  isPinned: boolean;
  upvotes: number;
  commentCount: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShowcaseProject {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  authorName: string;
  authorAvatar: string;
  githubUrl: string;
  demoUrl?: string;
  upvotes: number;
  tags: string[];
}

export const MOCK_FORUM_POSTS: ForumPost[] = [
  {
    id: "1",
    title: "Hur optimerar ni inference-kostnader för LLM:er i produktion?",
    content: "Vi kör GPT-4 i produktion och kostnaderna skenar. Någon som har bra strategier för att minska kostnader utan att tappa kvalitet?",
    category: "allmant",
    authorName: "DevMaria",
    authorAvatar: "DM",
    isPinned: true,
    upvotes: 47,
    commentCount: 24,
    views: 892,
    createdAt: "2025-02-05T10:30:00Z",
    updatedAt: "2025-02-06T14:20:00Z",
  },
  {
    id: "2",
    title: "Bästa approach för RAG med svenska dokument?",
    content: "Jag bygger en RAG-pipeline för ett svenskt försäkringsbolag. Vilka embedding-modeller funkar bäst för svenska?",
    category: "llm-nlp",
    authorName: "AIErik",
    authorAvatar: "AE",
    isPinned: true,
    upvotes: 35,
    commentCount: 18,
    views: 654,
    createdAt: "2025-02-04T08:15:00Z",
    updatedAt: "2025-02-06T09:45:00Z",
  },
  {
    id: "3",
    title: "Visar: Open-source svensk NER-modell",
    content: "Jag har tränat en NER-modell specifikt för svenska texter. Den klarar personnummer, organisationsnummer och svenska adresser. Släpper den som open source!",
    category: "visa-projekt",
    authorName: "NLPAnna",
    authorAvatar: "NA",
    isPinned: false,
    upvotes: 89,
    commentCount: 42,
    views: 2341,
    createdAt: "2025-02-03T16:00:00Z",
    updatedAt: "2025-02-06T11:30:00Z",
  },
  {
    id: "4",
    title: "MLOps-pipeline med Kubernetes — tips och fallgropar",
    content: "Delar med mig av våra erfarenheter efter 6 månader med ML-modeller på K8s. Spoiler: det är inte så lätt som det låter.",
    category: "mlops",
    authorName: "OpsOlof",
    authorAvatar: "OO",
    isPinned: false,
    upvotes: 28,
    commentCount: 15,
    views: 445,
    createdAt: "2025-02-02T12:00:00Z",
    updatedAt: "2025-02-05T16:00:00Z",
  },
  {
    id: "5",
    title: "Löneförhandling som ML Engineer — vad är rimligt 2025?",
    content: "Har fått ett erbjudande på 62k/mån som ML Engineer med 3 års erfarenhet i Stockholm. Är det rimligt?",
    category: "karriarfragor",
    authorName: "KarrärKarin",
    authorAvatar: "KK",
    isPinned: false,
    upvotes: 56,
    commentCount: 31,
    views: 1876,
    createdAt: "2025-02-01T09:00:00Z",
    updatedAt: "2025-02-06T08:00:00Z",
  },
  {
    id: "6",
    title: "YOLOv9 vs DETR — vilken modell för realtids-detektion?",
    content: "Vi behöver realtids object detection för en fabriksrobot. YOLOv9 verkar snabbare men DETR ger bättre resultat i våra tester.",
    category: "datorseende",
    authorName: "VisionViktor",
    authorAvatar: "VV",
    isPinned: false,
    upvotes: 19,
    commentCount: 11,
    views: 312,
    createdAt: "2025-01-30T14:30:00Z",
    updatedAt: "2025-02-04T10:00:00Z",
  },
  {
    id: "7",
    title: "Fine-tuning av Llama 3 med svenska data — guide",
    content: "Steg-för-steg-guide för att fine-tuna Llama 3 på svenska corpus. Inkluderar dataset-prep, LoRA-konfiguration och evaluation.",
    category: "maskininlarning",
    authorName: "LLMLars",
    authorAvatar: "LL",
    isPinned: false,
    upvotes: 72,
    commentCount: 28,
    views: 1543,
    createdAt: "2025-01-28T11:00:00Z",
    updatedAt: "2025-02-03T15:00:00Z",
  },
  {
    id: "8",
    title: "Söker medgrundare till AI-startup inom healthtech",
    content: "Har en prototyp för AI-driven diagnostik och söker en teknisk medgrundare med erfarenhet av ML i produktion.",
    category: "jobbdiskussioner",
    authorName: "StartupSara",
    authorAvatar: "SS",
    isPinned: false,
    upvotes: 33,
    commentCount: 14,
    views: 789,
    createdAt: "2025-01-27T08:00:00Z",
    updatedAt: "2025-02-02T12:00:00Z",
  },
];

export const MOCK_SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: "s1",
    title: "SvenskGPT Chat",
    description: "En chattbot fine-tunad på svenska Wikipedia och nyhetsartiklar. Körs helt lokalt.",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
    authorName: "NLPAnna",
    authorAvatar: "NA",
    githubUrl: "https://github.com",
    demoUrl: "https://demo.example.com",
    upvotes: 156,
    tags: ["LLM", "Svenska", "Open Source"],
  },
  {
    id: "s2",
    title: "AI Bildanalys för Fastigheter",
    description: "Computer vision-verktyg som automatiskt analyserar fastighetsbilder och genererar beskrivningar.",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80",
    authorName: "VisionViktor",
    authorAvatar: "VV",
    githubUrl: "https://github.com",
    upvotes: 89,
    tags: ["Computer Vision", "Fastigheter", "Python"],
  },
  {
    id: "s3",
    title: "MLOps Dashboard",
    description: "Open source dashboard för att övervaka ML-modeller i produktion med automatiska alerts.",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
    authorName: "OpsOlof",
    authorAvatar: "OO",
    githubUrl: "https://github.com",
    demoUrl: "https://demo.example.com",
    upvotes: 67,
    tags: ["MLOps", "Dashboard", "Monitoring"],
  },
];

export const TOP_CONTRIBUTORS = [
  { name: "NLPAnna", avatar: "NA", upvotes: 312, posts: 24 },
  { name: "LLMLars", avatar: "LL", upvotes: 245, posts: 18 },
  { name: "DevMaria", avatar: "DM", upvotes: 198, posts: 31 },
  { name: "VisionViktor", avatar: "VV", upvotes: 156, posts: 12 },
  { name: "AIErik", avatar: "AE", upvotes: 134, posts: 15 },
];
