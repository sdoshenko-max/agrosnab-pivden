"use client";

import { useState, useEffect } from "react";
import { CartDrawer } from "./CartDrawer";
import { useCart } from "./CartContext";
import type { Lang } from "@/lib/i18n";

export function GlobalCartDrawer() {
  const cart = useCart();
  const [lang, setLang] = useState<Lang>("uk");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLang(window.location.pathname.startsWith("/ru") ? "ru" : "uk");
    }
  }, []);

  return <CartDrawer open={cart.isOpen} onClose={() => cart.setOpen(false)} lang={lang} />;
}
