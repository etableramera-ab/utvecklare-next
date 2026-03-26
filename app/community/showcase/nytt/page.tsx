'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Upload, X, Loader2 } from "lucide-react";
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
import { generateSlug } from "@/hooks/useCommunity";
import SEOHead from "@/components/SEOHead";

const CATEGORIES = ["Webbapp", "CLI-verktyg", "Modell/Forskning", "Dataset", "Bibliotek/Paket", "Annat"];
const TECH_SUGGESTIONS = ["Python", "PyTorch", "TensorFlow", "React", "Next.js", "TypeScript", "LangChain", "Hugging Face", "FastAPI", "Docker", "Kubernetes", "AWS", "OpenCV", "Stable Diffusion", "YOLO"];

const ADMIN_USER_ID = "8e06c38b-e406-48cb-9714-963904091465";

const CreateShowcasePage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [category, setCategory] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);

  if (!user) {
    router.push("/logga-in");
    return null;
  }

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !techStack.includes(t) && techStack.length < 8) {
      setTechStack([...techStack, t]);
    }
    setNewTag("");
  };

  const handleThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Max 5 MB", variant: "destructive" });
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleScreenshots = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (screenshotFiles.length + files.length > 5) {
      toast({ title: "Max 5 screenshots", variant: "destructive" });
      return;
    }
    setScreenshotFiles(prev => [...prev, ...files.slice(0, 5 - prev.length)]);
  };

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    const { error } = await supabase.storage.from("showcase-images").upload(path, file, { upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from("showcase-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast({ title: "Titel och beskrivning krävs", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const slug = generateSlug(title);

    let thumbnailUrl: string | null = null;
    if (thumbnailFile) {
      const ext = thumbnailFile.name.split(".").pop();
      thumbnailUrl = await uploadFile(thumbnailFile, `${user.id}/${slug}/thumbnail.${ext}`);
    }

    const screenshotUrls: string[] = [];
    for (let i = 0; i < screenshotFiles.length; i++) {
      const ext = screenshotFiles[i].name.split(".").pop();
      const url = await uploadFile(screenshotFiles[i], `${user.id}/${slug}/screenshot-${i}.${ext}`);
      if (url) screenshotUrls.push(url);
    }

    const isAdmin = user.id === ADMIN_USER_ID;
    const { error } = await supabase.from("showcase_projects").insert({
      user_id: user.id,
      title: title.trim(),
      slug,
      description: description.trim(),
      long_description: longDescription.trim() || null,
      thumbnail_url: thumbnailUrl,
      screenshot_urls: screenshotUrls,
      demo_url: demoUrl.trim() || null,
      github_url: githubUrl.trim() || null,
      tech_stack: techStack,
      category: category || null,
      moderation_status: isAdmin ? "approved" : "pending",
    });

    if (error) {
      toast({ title: "Kunde inte publicera", description: error.message, variant: "destructive" });
    } else {
      await supabase.rpc("upsert_reputation", { p_user_id: user.id });
      if (isAdmin) {
        toast({ title: "Projekt publicerat!" });
        router.push(`/community/showcase/${slug}`);
      } else {
        toast({ title: "Projekt skickat för granskning", description: "Det publiceras när en admin har godkänt det." });
        router.push("/community?tab=showcase");
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Dela ditt projekt"
        description="Dela ditt AI-projekt i utvecklare.ai showcase."
        canonical="/community/showcase/nytt"
        noindex
      />
      <Navbar />
      <section className="pt-16">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/community" className="hover:text-foreground transition-colors">Community</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/community?tab=showcase" className="hover:text-foreground transition-colors">Showcase</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Nytt projekt</span>
          </nav>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Dela ditt projekt</h1>

          <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
            {/* Title */}
            <div>
              <Label>Titel *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Mitt AI-projekt" className="mt-1.5 bg-background border-border" maxLength={100} />
            </div>

            {/* Short description */}
            <div>
              <Label>Kort beskrivning * <span className="text-muted-foreground text-xs">({description.length}/280)</span></Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Beskriv ditt projekt kort..." className="mt-1.5 bg-background border-border" maxLength={280} rows={2} />
            </div>

            {/* Long description */}
            <div>
              <Label>Detaljerad beskrivning <span className="text-muted-foreground text-xs">(markdown)</span></Label>
              <Textarea value={longDescription} onChange={e => setLongDescription(e.target.value)} placeholder="Beskriv arkitektur, features, utmaningar..." className="mt-1.5 bg-background border-border" rows={8} />
            </div>

            {/* Category */}
            <div>
              <Label>Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1.5 bg-background border-border"><SelectValue placeholder="Välj kategori" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Thumbnail */}
            <div>
              <Label>Thumbnail (16:9 rekommenderas)</Label>
              {thumbnailPreview ? (
                <div className="mt-2 relative aspect-video rounded-lg overflow-hidden border border-border">
                  <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                  <button onClick={() => { setThumbnailFile(null); setThumbnailPreview(""); }} className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="mt-2 flex flex-col items-center gap-2 p-8 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Klicka för att ladda upp</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnail} />
                </label>
              )}
            </div>

            {/* Screenshots */}
            <div>
              <Label>Extra screenshots (max 5)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {screenshotFiles.map((f, i) => (
                  <div key={i} className="relative w-24 h-16 rounded border border-border overflow-hidden">
                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setScreenshotFiles(prev => prev.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-background/80">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {screenshotFiles.length < 5 && (
                  <label className="w-24 h-16 rounded border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleScreenshots} />
                  </label>
                )}
              </div>
            </div>

            {/* URLs */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Live demo URL</Label>
                <Input value={demoUrl} onChange={e => setDemoUrl(e.target.value)} placeholder="https://..." className="mt-1.5 bg-background border-border" />
              </div>
              <div>
                <Label>GitHub URL</Label>
                <Input value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/..." className="mt-1.5 bg-background border-border" />
              </div>
            </div>

            {/* Tech stack */}
            <div>
              <Label>Tech stack</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {techStack.map(t => (
                  <Badge key={t} variant="secondary" className="cursor-pointer hover:bg-destructive/20" onClick={() => setTechStack(techStack.filter(x => x !== t))}>
                    {t} ×
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(newTag); } }} placeholder="Lägg till teknologi..." className="bg-background border-border flex-1" />
                <Button variant="outline" size="sm" onClick={() => addTag(newTag)} className="border-border">Lägg till</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {TECH_SUGGESTIONS.filter(t => !techStack.includes(t)).slice(0, 8).map(t => (
                  <button key={t} onClick={() => addTag(t)} className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
                    + {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSubmit} disabled={submitting || !title.trim() || !description.trim()} className="gradient-bg text-primary-foreground hover:opacity-90 flex-1">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Publicera
              </Button>
              <Button variant="outline" className="border-border" onClick={() => router.push("/community?tab=showcase")}>Avbryt</Button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CreateShowcasePage;
