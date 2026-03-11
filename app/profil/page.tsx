'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, Save, Loader2, ExternalLink } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const LEVELS = ["Junior", "Mid-level", "Senior", "Lead/Principal"];
const TECH_OPTIONS = ["Python", "PyTorch", "TensorFlow", "LangChain", "Hugging Face", "Kubernetes", "AWS", "Azure", "GCP", "Docker", "MLflow", "React", "TypeScript"];

const ProfilePage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    avatar_url: "",
    title: "",
    bio: "",
    location: "",
    experience_level: "",
    tech_stack: [] as string[],
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    is_public: false,
  });
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/logga-in");
      return;
    }
    if (user) fetchProfile();
  }, [user, authLoading]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single();
    if (data) {
      setProfile({
        full_name: data.full_name || "",
        avatar_url: data.avatar_url || "",
        title: data.title || "",
        bio: data.bio || "",
        location: data.location || "",
        experience_level: data.experience_level || "",
        tech_stack: data.tech_stack || [],
        linkedin_url: data.linkedin_url || "",
        github_url: data.github_url || "",
        portfolio_url: data.portfolio_url || "",
        is_public: data.is_public || false,
      });
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Max 2 MB", variant: "destructive" });
      return;
    }
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload misslyckades", variant: "destructive" });
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setProfile({ ...profile, avatar_url: data.publicUrl });
    toast({ title: "Profilbild uppdaterad" });
  };

  const addTag = (tag: string) => {
    if (tag && !profile.tech_stack.includes(tag)) {
      setProfile({ ...profile, tech_stack: [...profile.tech_stack, tag] });
    }
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    setProfile({ ...profile, tech_stack: profile.tech_stack.filter((t) => t !== tag) });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name || null,
      avatar_url: profile.avatar_url || null,
      title: profile.title || null,
      bio: profile.bio || null,
      location: profile.location || null,
      experience_level: profile.experience_level || null,
      tech_stack: profile.tech_stack,
      linkedin_url: profile.linkedin_url || null,
      github_url: profile.github_url || null,
      portfolio_url: profile.portfolio_url || null,
      is_public: profile.is_public,
    }).eq("id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Kunde inte spara", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profil sparad!" });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-16">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Min profil</h1>

          <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-lg bg-muted">{profile.full_name?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:opacity-90">
                  <Camera className="w-3.5 h-3.5 text-primary-foreground" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
              <div>
                <p className="font-semibold text-foreground">{profile.full_name || "Namnlös"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            {/* Public toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
              <div>
                <p className="text-sm font-medium text-foreground">Min profil är publik</p>
                <p className="text-xs text-muted-foreground">Synlig i företags CV-sökning</p>
              </div>
              <Switch checked={profile.is_public} onCheckedChange={(v) => setProfile({ ...profile, is_public: v })} />
            </div>

            {/* Fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Namn</Label>
                <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="mt-1.5 bg-background border-border" />
              </div>
              <div>
                <Label>Titel</Label>
                <Input value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} className="mt-1.5 bg-background border-border" placeholder="t.ex. Senior ML Engineer" />
              </div>
            </div>

            <div>
              <Label>Bio</Label>
              <Textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="mt-1.5 bg-background border-border" rows={3} maxLength={500} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Ort</Label>
                <Input value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} className="mt-1.5 bg-background border-border" />
              </div>
              <div>
                <Label>Erfarenhetsnivå</Label>
                <Select value={profile.experience_level} onValueChange={(v) => setProfile({ ...profile, experience_level: v })}>
                  <SelectTrigger className="mt-1.5 bg-background border-border"><SelectValue placeholder="Välj nivå" /></SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tech stack */}
            <div>
              <Label>Tech stack</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {profile.tech_stack.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-destructive/20" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
              <Select value={newTag} onValueChange={(v) => addTag(v)}>
                <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Lägg till teknologi..." /></SelectTrigger>
                <SelectContent>
                  {TECH_OPTIONS.filter((t) => !profile.tech_stack.includes(t)).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Länkar</h3>
              <div>
                <Label>LinkedIn</Label>
                <Input value={profile.linkedin_url} onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })} className="mt-1.5 bg-background border-border" placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <Label>GitHub</Label>
                <Input value={profile.github_url} onChange={(e) => setProfile({ ...profile, github_url: e.target.value })} className="mt-1.5 bg-background border-border" placeholder="https://github.com/..." />
              </div>
              <div>
                <Label>Portfolio</Label>
                <Input value={profile.portfolio_url} onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })} className="mt-1.5 bg-background border-border" placeholder="https://..." />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full gradient-bg text-primary-foreground hover:opacity-90" size="lg" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Spara profil</>}
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ProfilePage;
