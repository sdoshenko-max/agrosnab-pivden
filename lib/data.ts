export * from "./types";
export { cultures } from "./cultures";
export { products } from "./products";
export { tankMixes } from "./tankMixes";

import { cultures } from "./cultures";
import { products } from "./products";
import { tankMixes } from "./tankMixes";
import type { Product, Culture, TankMix } from "./types";

// Магниты-товары: топ-8 эконом/премиум препаратов с указанным аналогом, отсортированных по цене
export const highlightedProducts = products
  .filter(p => p.tier !== "original" && p.analog && p.activeIngredient)
  .sort((a, b) => a.priceCash - b.priceCash)
  .slice(0, 8);

export function getCultureBySlug(slug: string): Culture | undefined {
  return cultures.find(c => c.slug === slug);
}

export function getProductsByCulture(cultureSlug: string): Product[] {
  return products.filter(p => p.cultures.includes(cultureSlug));
}

export function getProductsByCultureStage(cultureSlug: string, stageSlug: string, technologySlug?: string): Product[] {
  return products.filter(p => {
    if (!p.cultures.includes(cultureSlug)) return false;
    if (!p.stage.includes(stageSlug)) return false;
    if (technologySlug && p.technology && p.technology.length > 0) {
      return p.technology.includes(technologySlug);
    }
    return true;
  });
}

export function getTankMixesByCulture(cultureSlug: string): TankMix[] {
  return tankMixes.filter(m => m.cultureSlug === cultureSlug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}
