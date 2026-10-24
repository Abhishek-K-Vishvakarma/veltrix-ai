"use client";

import { useEffect, useState } from "react";

/** Example prompts rotate hote hain; user type kare to pause (active=false). */
export function useCyclingPlaceholder(items: string[], active = true, ms = 3200): string {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active || items.length < 2) return;
    const t = setInterval(() => setIndex((n) => (n + 1) % items.length), ms);
    return () => clearInterval(t);
  }, [active, items.length, ms]);
  return items[index] ?? "";
}