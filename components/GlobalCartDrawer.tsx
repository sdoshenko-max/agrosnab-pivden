"use client";

import { usePathname } from "next/navigation";
import { CartDrawer } from "./CartDrawer";
import { useCart } from "./CartContext";

export function GlobalCartDrawer() {
  const cart = useCart();
  const pathname = usePathname();
  const lang = pathname?.startsWith("/ru") ? "ru" : "uk";
  return <CartDrawer open={cart.isOpen} onClose={() => cart.setOpen(false)} lang={lang} />;
}
