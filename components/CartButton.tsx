"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext";
import type { Lang } from "@/lib/i18n";

export function CartButton({ lang }: { lang: Lang }) {
  const cart = useCart();
  return (
    <button onClick={() => cart.setOpen(true)} className="relative p-2 hover:bg-bg rounded-lg" aria-label="cart">
      <ShoppingCart className="w-5 h-5" />
      {cart.items.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {cart.items.length}
        </span>
      )}
    </button>
  );
}
