'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ArticleRenderer from "@/components/articles/ArticleRenderer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { FORUM_CATEGORIES, generateSlug } from "@/hooks/useCommunity";

const CreatePostPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState<"write" | "preview">("write");

  if (!authLoading && !user) {
    router.push("/logga-in?redirect=/community/nytt");
    return null;
  }

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && tags.length < 5 && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !category || !content.trim() || content.length < 20) {
      toast({ title: "Fyll i alla obligatoriska fält", description: "Titel, kategori och innehåll (min 20 tecken) krävs.", variant: "destructive" });
      return;
    }
    if (!user) return;

    setSubmitting(true);
    const slug = generateSlug(title);

    const { error } = await supabase.from("forum_posts").insert({
      title: title.trim(),
      slug,
      content: content.trim(),
      category,
      tags,
      user_id: user.id,
    });

    if (error) {
      console.error(error);
      toast({ title: "Kunde inte publicera", variant: "destructive" });
    } else {
      // Update reputation
      await supabase.rpc("upsert_reputation", { p_user_id: user.id });
      toast({ title: "Ditt inlägg har publicerats! 🎉" });
      router.push(`/community/${slug}`);
    }
    setSubmitting(false);
  };

  const categoriesWithoutAll = FORUM_CATEGORIES.filter(c => c.slug !== "alla");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Hem</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/community" className="hover:text-foreground transition-colors">Community</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">Nytt inlägg</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Skapa nytt inlägg</h1>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Titel *</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Vad vill du diskutera?"
              maxLength={200}
              className="bg-card border-border"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">{title.length}/200</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Kategori *</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="Välj kategori" />
              </SelectTrigger>
              <SelectContent>
                {categoriesWithoutAll.map(c => (
                  <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Innehåll * (Markdown stöds)</label>
            <Tabs value={previewMode} onValueChange={v => setPreviewMode(v as "write" | "preview")}>
              <TabsList className="bg-muted/50 mb-2">
                <TabsTrigger value="write">Skriv</TabsTrigger>
                <TabsTrigger value="preview"><Eye className="w-3 h-3 mr-1" /> Förhandsgranska</TabsTrigger>
              </TabsList>
              <TabsContent value="write">
                <Textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Beskriv din fråga eller diskussionsämne. Använd markdown för formatering. Kodblock skapas med ```"
                  className="bg-card border-border min-h-[250px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">{content.length} tecken (min 20)</p>
              </TabsContent>
              <TabsContent value="preview">
                <div className="rounded-lg bg-card border border-border p-6 min-h-[250px] prose prose-invert prose-sm max-w-none">
                  {content ? <ArticleRenderer content={content} /> : <p className="text-muted-foreground">Inget att förhandsgranska...</p>}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tags (valfritt, max 5)</label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Skriv en tag och tryck Enter"
                className="bg-card border-border"
                disabled={tags.length >= 5}
              />
              <Button type="button" variant="outline" onClick={addTag} disabled={tags.length >= 5}>Lägg till</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs cursor-pointer" onClick={() => setTags(tags.filter(t => t !== tag))}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button className="gradient-bg text-primary-foreground hover:opacity-90" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Publicerar..." : "Publicera"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/community")}>Avbryt</Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreatePostPage;
