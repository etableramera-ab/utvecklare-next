'use client'
import { useEffect, useRef, useState } from "react";

interface AdUnitProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

/**
 * AdSense ad unit — renders nothing if ad fails to load or times out (2s).
 * Requires the AdSense script to be loaded in the page head.
 */
const AdUnit = ({ slot, format = "auto", className = "" }: AdUnitProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!visible) setVisible(false); // timeout: stay hidden
    }, 2000);

    try {
      if (typeof window !== "undefined" && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        setVisible(true);
      }
    } catch {
      // ad blocked or script missing — render nothing
    }

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div ref={containerRef} className={`ad-unit overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdUnit;
