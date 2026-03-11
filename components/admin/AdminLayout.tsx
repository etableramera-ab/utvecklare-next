'use client'
import { ReactNode, useEffect } from "react";
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart3, Megaphone, CreditCard, Link2, Mail, ArrowLeft, Shield, Wrench, MessageSquare, Users, CalendarDays, DollarSign, Inbox, Search } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/annonser", label: "Annonser", icon: Megaphone },
  { href: "/admin/prenumerationer", label: "Prenumerationer", icon: CreditCard },
  { href: "/admin/affiliates", label: "Affiliates", icon: Link2 },
  { href: "/admin/nyhetsbrev", label: "Nyhetsbrev", icon: Mail },
  { href: "/admin/verktyg", label: "Verktyg", icon: Wrench },
  { href: "/admin/recensioner", label: "Recensioner", icon: MessageSquare },
  { href: "/admin/community", label: "Community", icon: Users },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/lonestatistik", label: "Lönestatistik", icon: DollarSign },
  { href: "/admin/meddelanden", label: "Meddelanden", icon: Inbox },
  { href: "/admin/seo", label: "SEO", icon: Search },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { isAdmin, loading } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace('/');
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Laddar...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border bg-card hidden lg:flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Tillbaka till sajten
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto">
          <Link href="/" className="text-muted-foreground hover:text-foreground shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Shield className="w-4 h-4 text-primary shrink-0" />
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all ${
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 lg:p-8 p-4 pt-16 lg:pt-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
