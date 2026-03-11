'use client'
import { useState } from "react";
import Link from 'next/link'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CreditCard, ArrowUpRight, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  company: any;
  subscription: any;
  isTrialing: boolean;
  trialEnd: Date | null;
}

const planBadge: Record<string, string> = {
  starter: "bg-muted text-muted-foreground",
  professional: "bg-primary/10 text-primary",
  enterprise: "bg-amber-500/10 text-amber-400",
};

const SubscriptionManager = ({ company, subscription, isTrialing, trialEnd }: Props) => {
  const { toast } = useToast();
  const [cancelling, setCancelling] = useState(false);
  const plan = subscription?.plan || company?.plan || "none";

  const handleCancel = async () => {
    if (!subscription) return;
    setCancelling(true);
    await supabase
      .from("subscriptions")
      .update({ cancel_at_period_end: true })
      .eq("id", subscription.id);
    toast({ title: "Prenumeration avslutad", description: "Du behåller tillgång till slutet av perioden." });
    setCancelling(false);
  };

  if (!subscription && plan === "none") {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium mb-1">Ingen aktiv plan</p>
          <p className="text-sm text-muted-foreground mb-4">Välj en plan för att publicera jobb.</p>
          <Button className="gradient-bg text-primary-foreground" asChild>
            <Link href="/foretag/priser">Se priser →</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-primary" />
          Prenumeration
          <Badge className={planBadge[plan] || ""}>{plan.charAt(0).toUpperCase() + plan.slice(1)}</Badge>
          {isTrialing && <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">Provperiod</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTrialing && trialEnd && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-400">
              Din provperiod slutar {trialEnd.toLocaleDateString("sv-SE")}. Uppgradera för att behålla åtkomst.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Pris</p>
            <p className="text-foreground font-medium">{subscription?.monthly_price?.toLocaleString("sv-SE") || "—"} SEK/mån</p>
          </div>
          <div>
            <p className="text-muted-foreground">Nästa faktura</p>
            <p className="text-foreground font-medium">
              {subscription?.current_period_end
                ? new Date(subscription.current_period_end).toLocaleDateString("sv-SE")
                : "—"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="border-border" size="sm" asChild>
            <Link href="/foretag/priser">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> Byt plan
            </Link>
          </Button>
          {!subscription?.cancel_at_period_end && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                  Avsluta prenumeration
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Avsluta prenumeration?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Du behåller tillgång till alla funktioner till slutet av din betalda period. Dina jobbannonser förblir aktiva under resterande tid.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Avbryt</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel} disabled={cancelling} className="bg-destructive text-destructive-foreground">
                    Ja, avsluta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionManager;
