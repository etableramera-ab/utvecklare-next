'use client'
import { useState, useEffect, useRef } from "react";
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

const navLinks = [
  { label: "Nyheter", href: "/nyheter" },
  { label: "Jobb", href: "/jobb" },
  { label: "Verktyg", href: "/verktyg" },
  { label: "Guider", href: "/guider" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ articles: any[]; jobs: any[]; tools: any[] }>({ articles: [], jobs: [], tools: [] });
  const [searching, setSearching] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = (href: string) => pathname.startsWith(href);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim() || query.trim().length < 2) {
      setSuggestions({ articles: [], jobs: [], tools: [] });
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const term = `%${query.trim()}%`;

      const [articlesRes, jobsRes, toolsRes] = await Promise.all([
        supabase.from("articles").select("id, title, slug").eq("is_published", true).ilike("title", term).limit(3),
        supabase.from("jobs").select("id, title, slug").eq("is_active", true).ilike("title", term).limit(3),
        supabase.from("tools").select("id, name, slug").eq("is_published", true).ilike("name", term).limit(3),
      ]);

      setSuggestions({
        articles: articlesRes.data || [],
        jobs: jobsRes.data || [],
        tools: toolsRes.data || [],
      });
      setSearching(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/sok?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
      setMobileOpen(false);
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
    setSuggestions({ articles: [], jobs: [], tools: [] });
  };

  const hasSuggestions = suggestions.articles.length + suggestions.jobs.length + suggestions.tools.length > 0;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-700 flex items-center justify-center text-white font-bold text-lg">
            U
          </div>
          <span className="text-xl font-semibold text-slate-900">
            utvecklare<span className="text-cyan-500">.ai</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 text-sm rounded-md transition-colors",
                isActive(link.href)
                  ? "text-indigo-700 bg-indigo-50 font-medium"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
            aria-label="Sök"
          >
            <Search className="w-5 h-5" />
          </button>
          <Button className="bg-indigo-700 hover:bg-indigo-800 text-white">
            Prenumerera
          </Button>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-1 md:hidden">
          <button onClick={() => setSearchOpen(true)} className="p-2 text-slate-700">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-700" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-base",
                  isActive(link.href)
                    ? "text-indigo-700 bg-indigo-50 font-medium"
                    : "text-slate-600 hover:bg-slate-100"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3">
              <Button className="w-full bg-indigo-700 hover:bg-indigo-800 text-white">
                Prenumerera
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search modal with live suggestions */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-20" onClick={closeSearch}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="p-4 border-b">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Sök nyheter, jobb, verktyg..."
                  className="flex-1 text-lg outline-none"
                />
                <button type="button" onClick={closeSearch} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </form>

            {(searching || hasSuggestions || query.length >= 2) && (
              <div className="max-h-80 overflow-y-auto p-2">
                {searching && <div className="px-3 py-2 text-sm text-slate-500">Söker...</div>}

                {!searching && !hasSuggestions && query.length >= 2 && (
                  <div className="px-3 py-2 text-sm text-slate-500">Inga snabbförslag. Tryck Enter för full sökning.</div>
                )}

                {suggestions.articles.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-1 text-xs font-medium text-slate-400 uppercase">Nyheter</div>
                    {suggestions.articles.map((a) => (
                      <Link
                        key={a.id}
                        href={`/nyheter/${a.slug}`}
                        onClick={closeSearch}
                        className="block px-3 py-2 text-sm hover:bg-slate-50 rounded"
                      >
                        {a.title}
                      </Link>
                    ))}
                  </div>
                )}

                {suggestions.jobs.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-1 text-xs font-medium text-slate-400 uppercase">Jobb</div>
                    {suggestions.jobs.map((j) => (
                      <Link
                        key={j.id}
                        href={`/jobb/${j.slug}`}
                        onClick={closeSearch}
                        className="block px-3 py-2 text-sm hover:bg-slate-50 rounded"
                      >
                        {j.title}
                      </Link>
                    ))}
                  </div>
                )}

                {suggestions.tools.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs font-medium text-slate-400 uppercase">Verktyg</div>
                    {suggestions.tools.map((t) => (
                      <div key={t.id} className="px-3 py-2 text-sm text-slate-700">
                        {t.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
