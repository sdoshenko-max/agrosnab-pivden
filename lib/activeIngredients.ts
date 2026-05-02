import { products } from "./products";

// Витягнемо унікальні діючі речовини як slug
function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/[іїє]/g, m => ({ "і": "i", "ї": "i", "є": "e" }[m] || m))
    .replace(/[Ѐ-ӿ]/g, m => {
      const map: Record<string, string> = { а:"a",б:"b",в:"v",г:"g",ґ:"g",д:"d",е:"e",ж:"zh",з:"z",и:"y",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"c",ч:"ch",ш:"sh",щ:"sch",ь:"",ю:"yu",я:"ya",ы:"y",э:"e",ё:"e" };
      return map[m] || "";
    })
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type AIEntry = {
  slug: string;
  nameUk: string;
  nameRu: string;
  productSlugs: string[];
};

const map = new Map<string, AIEntry>();
for (const p of products) {
  // Розбиваємо на компоненти, якщо складний
  const parts = p.activeIngredient.split(/\s*\+\s*/);
  const partsRu = p.activeIngredientRu.split(/\s*\+\s*/);
  parts.forEach((part, i) => {
    const main = part.replace(/\s*\([^)]+\)\s*/g, "").replace(/\s*[,;]?\s*\d+([.,]\d+)?\s*(г|мг|кг)\/[лкт][гр]?\s*$/, "").replace(/[,;]\s*$/, "").trim();
    const mainRu = (partsRu[i] || part).replace(/\s*\([^)]+\)\s*/g, "").replace(/\s*[,;]?\s*\d+([.,]\d+)?\s*(г|мг|кг)\/[лкт][гр]?\s*$/, "").replace(/[,;]\s*$/, "").trim();
    if (!main) return;
    const slug = slugify(main);
    if (!slug) return;
    if (!map.has(slug)) {
      map.set(slug, { slug, nameUk: main, nameRu: mainRu, productSlugs: [] });
    }
    const e = map.get(slug)!;
    if (!e.productSlugs.includes(p.slug)) e.productSlugs.push(p.slug);
  });
}

export const activeIngredients: AIEntry[] = Array.from(map.values()).filter(a => a.productSlugs.length >= 2).sort((a, b) => b.productSlugs.length - a.productSlugs.length);

export function getAIBySlug(slug: string): AIEntry | undefined {
  return activeIngredients.find(a => a.slug === slug);
}
