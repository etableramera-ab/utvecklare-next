'use client'
import { useState, useEffect } from "react";
import Link from 'next/link'
import { MessageSquare, Code2, Award, Zap, ArrowBigUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/client";

interface ForumPost {
  id: string;
  title: string;
  slug: string | null;
  comment_count: number;
  upvotes: number;
}

interface ShowcaseProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  upvotes: number | null;
  tech_stack: string[] | null;
}

const features = [
  { icon: MessageSquare, text: "Diskutera med andra AI-utvecklare" },
  { icon: Code2, text: "Visa upp dina projekt" },
  { icon: Award, text: "Få feedback från experter" },
  { icon: Zap, text: "Delta i hackathons" },
];

const CommunitySection = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [showcase, setShowcase] = useState<ShowcaseProject | null>(null);

  useEffect(() => {
    supabase
      .from("forum_posts")
      .select("id, title, slug, comment_count, upvotes")
      .eq("is_published", true)
      .order("last_activity_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setPosts((data ?? []) as ForumPost[]));

    supabase
      .from("showcase_projects")
      .select("id, title, slug, description, upvotes, tech_stack")
      .eq("is_published", true)
      .order("upvotes", { ascending: false })
      .limit(1)
      .then(({ data }) => setShowcase(data?.[0] as ShowcaseProject | null));
  }, []);

  return (
    <section className="section-spacing bg-card/50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-10">Gå med i Sveriges AI-community</h2>

        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Anslut dig till tusentals svenska AI-utvecklare. Dela kunskap, hitta samarbetspartners och håll dig uppdaterad med det senaste inom AI.
            </p>
            <ul className="space-y-4 mb-8">
              {features.map((f) => (
                <li key={f.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md gradient-bg flex items-center justify-center shrink-0">
                    <f.icon className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-foreground">{f.text}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="gradient-bg text-primary-foreground hover:opacity-90">
              <Link href="/community">Gå med i communityn</Link>
            </Button>
          </div>

          <div className="space-y-3">
            {posts.length > 0 ? posts.map((p) => (
              <Link key={p.id} href={`/community/${p.slug}`} className="block">
                <div className="p-4 rounded-lg bg-card border border-border card-hover">
                  <h4 className="font-medium text-foreground mb-2 line-clamp-1">{p.title}</h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{p.comment_count} svar</span>
                    <span className="flex items-center gap-1"><ArrowBigUp className="w-3.5 h-3.5" />{p.upvotes}</span>
                  </div>
                </div>
              </Link>
            )) : (
              <>
                {[
                  { title: "Hur optimerar ni inference-kostnader för LLM:er i produktion?", replies: 24 },
                  { title: "Bästa approach för RAG med svenska dokument?", replies: 18 },
                  { title: "Visar: Open-source svensk NER-modell 🇸🇪", replies: 42 },
                ].map(p => (
                  <div key={p.title} className="p-4 rounded-lg bg-card border border-border card-hover">
                    <h4 className="font-medium text-foreground mb-2">{p.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{p.replies} svar</span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {showcase && (
              <Link href={`/community/showcase/${showcase.slug}`} className="block mt-3">
                <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 card-hover">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="gradient-bg text-primary-foreground text-[10px]">Showcase</Badge>
                  </div>
                  <h4 className="font-medium text-foreground mb-1">{showcase.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-1">{showcase.description}</p>
                  <div className="flex gap-1.5 mt-2">
                    {showcase.tech_stack?.slice(0, 3).map(t => (
                      <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0">{t}</Badge>
                    ))}
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
