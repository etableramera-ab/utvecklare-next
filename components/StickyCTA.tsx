'use client'
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Briefcase, X } from "lucide-react";

const DISMISSED_KEY = "stickyCTADismissed";

const StickyCTA = () => {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISSED_KEY) === "1");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname === "/jobb" || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  };

  return (
    <>
      {/* Mobile: fixed bottom bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 md:hidden">
        <Link
          href="/jobb"
          className="flex items-center justify-center gap-2 h-14 w-full gradient-bg text-primary-foreground font-semibold text-sm shadow-lg"
        >
          <Briefcase className="w-4 h-4" />
          Se AI-jobb i Sverige
        </Link>
        <button
          onClick={(e) => { e.preventDefault(); dismiss(); }}
          className="absolute top-1/2 right-3 -translate-y-1/2 p-1 rounded-full text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          aria-label="Stäng"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Desktop: sticky sidebar button */}
      {scrolled && (
        <div className="hidden md:block fixed right-0 top-1/2 -translate-y-1/2 z-50">
          <Link
            href="/jobb"
            className="flex items-center gap-1.5 gradient-bg text-primary-foreground text-xs font-semibold px-3 py-2.5 rounded-l-lg shadow-lg hover:opacity-90 transition-opacity writing-mode-vertical"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            <Briefcase className="w-3.5 h-3.5 rotate-90" />
            AI-jobb
          </Link>
        </div>
      )}
    </>
  );
};

export default StickyCTA;
