'use client'
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { JobFilters } from "@/types/jobs";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: JobFilters;
}

const JobAlertModal = ({ open, onOpenChange, filters }: Props) => {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("weekly");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Du behöver logga in för att skapa en jobbbevakning.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("job_alerts").insert({
      user_id: user.id,
      email,
      filters: { ...filters, frequency } as any,
      is_active: true,
    });
    setLoading(false);
    if (error) {
      toast.error("Kunde inte skapa bevakingen. Försök igen.");
    } else {
      toast.success("Jobbbevakning skapad! Du får notiser via e-post.");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Bell className="w-5 h-5 text-primary" /> Skapa jobbbevakning
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Få notiser när nya jobb matchar dina filter.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-foreground mb-1 block">E-post</label>
            <Input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="din@email.se"
              className="bg-background border-border"
            />
          </div>
          <div>
            <label className="text-sm text-foreground mb-2 block">Frekvens</label>
            <div className="flex gap-2">
              {(["daily", "weekly"] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                    frequency === f
                      ? "gradient-bg text-primary-foreground border-transparent"
                      : "bg-accent text-accent-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {f === "daily" ? "Dagligen" : "Veckovis"}
                </button>
              ))}
            </div>
          </div>
          {!user && (
            <p className="text-xs text-warning">Du behöver vara inloggad för att skapa en bevakning.</p>
          )}
          <Button type="submit" disabled={loading || !user} className="w-full gradient-bg text-primary-foreground hover:opacity-90">
            {loading ? "Skapar…" : "Skapa bevakning"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobAlertModal;
