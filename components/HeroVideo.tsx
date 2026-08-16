"use client";

import { useEffect, useState } from "react";

export default function HeroVideo({ src, className }: { src: string; className?: string }) {
  // Starts false to match SSR output (no `window` on the server), then syncs to the
  // real value on mount — avoids a hydration mismatch on the autoPlay attribute.
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <video
      key={src}
      src={src}
      autoPlay={!reducedMotion}
      loop
      muted
      playsInline
      preload="metadata"
      className={`bg-ink ${className ?? ""}`}
    />
  );
}
