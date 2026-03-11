'use client';
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MailOpen, Trash2, Inbox, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const AdminMessages = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleRead = useMutation({
    mutationFn: async ({ id, is_read }: { id: string; is_read: boolean }) => {
      const { error } = await supabase.from("contact_messages").update({ is_read } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-messages"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-messages"] });
      toast({ title: "Meddelande raderat" });
      setSelected(null);
    },
  });

  const unreadCount = messages.filter((m: any) => !m.is_read).length;

  const openMessage = (msg: any) => {
    setSelected(msg);
    if (!msg.is_read) {
      toggleRead.mutate({ id: msg.id, is_read: true });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kontaktmeddelanden</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} olästa meddelanden` : "Alla meddelanden lästa"}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <Inbox className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{messages.length}</p>
                <p className="text-xs text-muted-foreground">Totalt</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <Mail className="w-5 h-5 text-warning" />
              <div>
                <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
                <p className="text-xs text-muted-foreground">Olästa</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <MailOpen className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold text-foreground">{messages.length - unreadCount}</p>
                <p className="text-xs text-muted-foreground">Lästa</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-lg">Alla meddelanden</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-sm animate-pulse">Laddar...</p>
            ) : messages.length === 0 ? (
              <p className="text-muted-foreground text-sm">Inga meddelanden ännu.</p>
            ) : (
              <div className="divide-y divide-border">
                {messages.map((msg: any) => (
                  <button
                    key={msg.id}
                    onClick={() => openMessage(msg)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-accent/50 transition-colors ${!msg.is_read ? "bg-primary/5" : ""}`}
                  >
                    {!msg.is_read ? (
                      <Mail className="w-4 h-4 text-primary mt-1 shrink-0" />
                    ) : (
                      <MailOpen className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm ${!msg.is_read ? "font-semibold text-foreground" : "text-foreground"}`}>{msg.name}</span>
                        <Badge variant="outline" className="text-xs">{msg.subject}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.email}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(msg.created_at).toLocaleDateString("sv-SE")}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Från:</span> <span className="text-foreground">{selected.name}</span></div>
                <div><span className="text-muted-foreground">E-post:</span> <a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a></div>
                <div><span className="text-muted-foreground">Datum:</span> <span className="text-foreground">{new Date(selected.created_at).toLocaleString("sv-SE")}</span></div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap">
                {selected.message}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toggleRead.mutate({ id: selected.id, is_read: !selected.is_read });
                    setSelected({ ...selected, is_read: !selected.is_read });
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {selected.is_read ? "Markera oläst" : "Markera läst"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(selected.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Radera
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMessages;
