'use client'
import { useState, useEffect, useCallback } from "react";

interface Props {
  contentRef: React.RefObject<HTMLDivElement>;
  onProgressChange?: (pct: number) => void;
}

const ReadingProgress = ({ contentRef, onProgressChange }: Props) => {
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const totalHeight = el.offsetHeight;
    const scrolledPast = Math.max(0, -rect.top + windowHeight * 0.2);
    const pct = Math.min(100, Math.max(0, (scrolledPast / totalHeight) * 100));
    setProgress(Math.round(pct));
    onProgressChange?.(Math.round(pct));
  }, [contentRef, onProgressChange]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="fixed top-16 left-0 right-0 z-40 h-[3px] bg-transparent">
      <div className="h-full gradient-bg transition-all duration-150" style={{ width: `${progress}%` }} />
    </div>
  );
};

export default ReadingProgress;
