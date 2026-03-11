'use client'
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Upload } from "lucide-react";

interface Props {
  jobId: string;
  companyName: string;
}

const JobApplicationForm = ({ jobId, companyName }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: user?.email || "",
    linkedin_url: "",
    phone: "",
    message: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Du måste vara inloggad för att ansöka", variant: "destructive" });
      return;
    }
    if (!form.full_name.trim() || !form.email.trim()) {
      toast({ title: "Namn och e-post krävs", variant: "destructive" });
      return;
    }

    setLoading(true);
    let resume_url: string | null = null;

    if (resumeFile) {
      const path = `${user.id}/${Date.now()}_${resumeFile.name}`;
      const { error: uploadErr } = await supabase.storage
        .from("resumes")
        .upload(path, resumeFile);
      if (uploadErr) {
        toast({ title: "Kunde inte ladda upp CV", variant: "destructive" });
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(path);
      resume_url = urlData.publicUrl;
    }

    const { error } = await supabase.from("applications").insert({
      job_id: jobId,
      user_id: user.id,
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      linkedin_url: form.linkedin_url.trim() || null,
      phone: form.phone.trim() || null,
      message: form.message.trim() || null,
      resume_url,
    });

    setLoading(false);
    if (error) {
      toast({ title: "Kunde inte skicka ansökan", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Din ansökan har skickats!" });
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-6">
        <CheckCircle className="w-10 h-10 text-success mx-auto mb-3" />
        <p className="font-semibold text-foreground">Din ansökan har skickats!</p>
        <p className="text-sm text-muted-foreground mt-1">Vi meddelar dig om uppdateringar.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        placeholder="Fullständigt namn *"
        value={form.full_name}
        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        required
        maxLength={100}
      />
      <Input
        type="email"
        placeholder="E-post *"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
        maxLength={255}
      />
      <Input
        placeholder="LinkedIn-URL"
        value={form.linkedin_url}
        onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
        maxLength={255}
      />
      <Input
        placeholder="Telefon (valfritt)"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        maxLength={20}
      />
      <Textarea
        placeholder="Meddelande till företaget"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        maxLength={1000}
        rows={3}
      />
      <div>
        <label className="flex items-center gap-2 p-3 rounded-md border border-border bg-background cursor-pointer hover:border-primary/50 transition-colors">
          <Upload className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {resumeFile ? resumeFile.name : "Ladda upp CV (PDF)"}
          </span>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>
      <Button type="submit" className="w-full gradient-bg text-primary-foreground hover:opacity-90" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Skicka ansökan
      </Button>
    </form>
  );
};

export default JobApplicationForm;
