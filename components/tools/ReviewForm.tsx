'use client'
import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import Link from 'next/link'
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

interface ReviewFormProps {
  toolId: string;
  toolName: string;
  user: User | null;
  existingReview?: any;
  onSuccess: () => void;
}

const StarInput = ({ rating, onRate }: { rating: number; onRate: (r: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(i => (
      <button key={i} type="button" onClick={() => onRate(i)} className="cursor-pointer hover:scale-110 transition-transform">
        <Star className={`w-6 h-6 ${i <= rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
      </button>
    ))}
  </div>
);

const ReviewForm = ({ toolId, toolName, user, existingReview, onSuccess }: ReviewFormProps) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [content, setContent] = useState(existingReview?.content || "");
  const [pros, setPros] = useState(existingReview?.pros || "");
  const [cons, setCons] = useState(existingReview?.cons || "");
  const [useCase, setUseCase] = useState(existingReview?.use_case || "");
  const [expLevel, setExpLevel] = useState(existingReview?.experience_level || "");
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!existingReview;

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/logga-in" className="text-primary hover:underline">Logga in</Link> för att skriva en recension.
      </p>
    );
  }

  if (existingReview && !isEdit) {
    return <p className="text-sm text-muted-foreground">Du har redan recenserat detta verktyg.</p>;
  }

  const handleSubmit = async () => {
    if (!rating || content.trim().length < 50) {
      toast({ title: "Fel", description: "Betyg krävs och recensionen måste vara minst 50 tecken.", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    const payload = {
      tool_id: toolId,
      user_id: user.id,
      rating,
      title: title || null,
      content,
      pros: pros || null,
      cons: cons || null,
      use_case: useCase || null,
      experience_level: expLevel || null,
    };

    let error;
    if (isEdit) {
      ({ error } = await supabase.from("tool_reviews").update(payload).eq("id", existingReview.id));
    } else {
      ({ error } = await supabase.from("tool_reviews").insert(payload));
    }

    if (error) {
      toast({ title: "Fel", description: error.code === "23505" ? "Du har redan recenserat detta verktyg." : "Kunde inte skicka recension.", variant: "destructive" });
    } else {
      toast({ title: "Tack!", description: isEdit ? "Din recension har uppdaterats." : "Din recension har publicerats." });
      // Update tool avg_rating via a simple re-fetch in parent
      onSuccess();
    }
    setSubmitting(false);
  };

  const inputCls = "w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors";

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-muted-foreground mb-1.5 block">Ditt betyg *</label>
        <StarInput rating={rating} onRate={setRating} />
      </div>

      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Rubrik (valfritt)" className={inputCls} />

      <div>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Berätta om din upplevelse… (minst 50 tecken)"
          className={`${inputCls} resize-none min-h-[120px]`}
        />
        <p className="text-xs text-muted-foreground mt-1">{content.length}/50 tecken minimum</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input value={pros} onChange={e => setPros(e.target.value)} placeholder="Fördelar (valfritt)" className={inputCls} />
        <input value={cons} onChange={e => setCons(e.target.value)} placeholder="Nackdelar (valfritt)" className={inputCls} />
      </div>

      <input value={useCase} onChange={e => setUseCase(e.target.value)} placeholder="Vad använder du verktyget till? (valfritt)" className={inputCls} />

      <Select value={expLevel} onValueChange={setExpLevel}>
        <SelectTrigger className="w-full sm:w-[200px] bg-background border-border">
          <SelectValue placeholder="Din erfarenhetsnivå" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="beginner">Nybörjare</SelectItem>
          <SelectItem value="intermediate">Mellannivå</SelectItem>
          <SelectItem value="advanced">Avancerad</SelectItem>
        </SelectContent>
      </Select>

      <Button
        disabled={!rating || content.trim().length < 50 || submitting}
        onClick={handleSubmit}
        className="gradient-bg text-primary-foreground hover:opacity-90 transition-opacity"
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        {isEdit ? "Uppdatera recension" : "Publicera recension"}
      </Button>
    </div>
  );
};

export default ReviewForm;
