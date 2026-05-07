// Стабільне псевдо-випадкове число «в наявності» на основі slug-у.
// Один SKU → завжди одне і те саме число (до перебудови сайту).
// Розкид залежить від tier: дженерики більше, оригінали менше.
//
// Якщо у Product є поле stockOverride — використовуємо його напряму.

import type { Product } from "./types";

const RANGES: Record<string, [number, number]> = {
  econom: [25, 80],
  premium: [10, 40],
  original: [5, 25],
};

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getStock(product: Pick<Product, "slug" | "tier" | "stockOverride">): number {
  if (typeof product.stockOverride === "number") return product.stockOverride;
  const [min, max] = RANGES[product.tier] ?? [15, 50];
  const range = max - min + 1;
  return min + (hashSlug(product.slug) % range);
}
