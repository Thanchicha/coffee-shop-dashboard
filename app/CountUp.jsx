"use client";
import { useEffect, useState } from "react";

// Counts up once on load; respects reduced-motion.
// Uses a timer (not requestAnimationFrame) so the final number always lands,
// even in a background tab or embedded preview where rAF is paused.
export default function CountUp({ value, prefix = "", ms = 1400 }) {
  const target = Math.round(Number(value));
  const [n, setN] = useState(target);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t0 = performance.now();
    setN(0);
    const id = setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / ms);
      setN(Math.round(target * (1 - Math.pow(1 - p, 4))));
      if (p >= 1) clearInterval(id);
    }, 16);
    return () => { clearInterval(id); setN(target); };
  }, [target, ms]);
  return <>{prefix}{n.toLocaleString("th-TH")}</>;
}
