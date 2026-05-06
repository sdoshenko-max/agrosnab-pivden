"use client";
import { useEffect, useState } from "react";

// Повертає напрямок прокрутки + чи знаходимось вище порогу.
// Використовується для auto-hide хедера на мобільному.
export function useScrollDirection(threshold = 80): { dir: "up" | "down"; atTop: boolean } {
  const [dir, setDir] = useState<"up" | "down">("up");
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    let lastY = typeof window !== "undefined" ? window.scrollY : 0;
    let ticking = false;

    function update() {
      const y = window.scrollY;
      const diff = y - lastY;
      // ігноруємо мікрорухи (вібрації iOS bounce)
      if (Math.abs(diff) > 5) {
        setDir(diff > 0 ? "down" : "up");
        lastY = y;
      }
      setAtTop(y < threshold);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return { dir, atTop };
}
