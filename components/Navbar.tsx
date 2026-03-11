'use client'
import { useState } from "react";
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Jobb", href: "/jobb" },
  { label: "Kunskapshubb", href: "/kunskapshubb" },
  { label: "Verktyg", href: "/verktyg" },
  { label: "Lönestatistik", href: "/lonestatistik" },
  { label: "Community", href: "/community" },
  { label: "Events", href: "/events" },
  { label: "Företag", href: "/foretag" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useAuth();
  const { isAdmin } = useAdmin();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-0.5 text-xl font-bold tracking-tight">
          <span className="text-foreground">utvecklare</span>
          <span className="gradient-text">.ai</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 text-sm transition-colors rounded-md",
                isActive(link.href)
                  ? "text-foreground bg-accent font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-3">
          {isAdmin && (
            <Link href="/admin" className="p-2 text-muted-foreground hover:text-primary transition-colors" title="Admin">
              <Shield className="w-5 h-5" />
            </Link>
          )}
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Sök">
            <Search className="w-5 h-5" />
          </button>
          {!loading && (
            user ? (
              <Link href="/dashboard">
                <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <>
                <Link href="/logga-in">
                  <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-accent">
                    Logga in
                  </Button>
                </Link>
                <Link href="/registrera">
                  <Button size="sm" className="gradient-bg text-primary-foreground hover:opacity-90 transition-opacity">
                    Kom igång gratis
                  </Button>
                </Link>
              </>
            )
          )}
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden glass border-t border-border">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 transition-colors rounded-md",
                  isActive(link.href)
                    ? "text-foreground bg-accent font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin"
                className="px-3 py-2 text-primary hover:text-foreground transition-colors rounded-md hover:bg-accent flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full border-border text-foreground">Dashboard</Button>
                  </Link>
                  <Link href="/profil" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full gradient-bg text-primary-foreground">Min profil</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/logga-in" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full border-border text-foreground">Logga in</Button>
                  </Link>
                  <Link href="/registrera" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full gradient-bg text-primary-foreground">Kom igång gratis</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
