"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "./CartContext";
import { dict, type Lang } from "@/lib/i18n";

export function AddToCart({ product, lang, defaultQty = 1, compact = false }: { product: Product; lang: Lang; defaultQty?: number; compact?: boolean }) {
  const cart = useCart();
  const [qty, setQty] = useState<number>(defaultQty);
  const [added, setAdded] = useState<boolean>(false);
  const labels = lang === "uk"
    ? { add: "В кошик", added: "Додано", qty: "Кількість" }
    : { add: "В корзину", added: "Добавлено", qty: "Количество" };

  function add() {
    cart.add({
      slug: product.slug,
      name: lang === "uk" ? product.name : product.nameRu,
      manufacturer: product.manufacturer,
      packaging: product.packaging,
      unit: product.unit,
      qty,
      priceVat: product.priceVat,
      priceCash: product.priceCash,
      currency: product.currency
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className={compact ? "flex items-center gap-2" : "flex flex-col gap-2"}>
      <div className="flex items-stretch border border-border rounded-lg overflow-hidden">
        <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-2.5 hover:bg-bg" aria-label="-">
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={e => setQty(Math.max(1, parseInt(e.target.value || "1", 10)))}
          className="w-16 text-center font-semibold border-0 focus:outline-none"
        />
        <button onClick={() => setQty(qty + 1)} className="px-2.5 hover:bg-bg" aria-label="+">
          <Plus className="w-4 h-4" />
        </button>
        <span className="px-2 text-sm text-muted self-center">{product.unit}</span>
      </div>
      <button onClick={add} className={`btn-primary ${compact ? "!py-2 !px-3 text-sm" : ""} ${added ? "!bg-brand" : ""}`}>
        {added ? <><Check className="w-4 h-4" />{labels.added}</> : <><ShoppingCart className="w-4 h-4" />{labels.add}</>}
      </button>
    </div>
  );
}
