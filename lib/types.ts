export type Tier = "econom" | "premium" | "original";

export type Product = {
  slug: string;
  name: string;
  nameRu: string;
  manufacturer: string;
  tier: Tier;
  group: string;
  groupSlug: string;
  activeIngredient: string;
  activeIngredientRu: string;
  concentration: string;
  packaging: string;
  rate: string;
  priceVat: number;
  priceCash: number;
  unit: "л" | "кг";
  currency: "USD" | "EUR";
  analog?: string;
  saveFromOriginal?: number;
  cultures: string[];
  stage: string[];
  technology?: string[];
  highlight?: boolean;
  description?: string;
  descriptionRu?: string;
  image?: string;
};

export type Culture = {
  slug: string;
  nameUk: string;
  nameRu: string;
  emoji: string;
  shortUk: string;
  shortRu: string;
  longUk?: string;
  longRu?: string;
  technologies?: { slug: string; nameUk: string; nameRu: string; descUk: string; descRu: string }[];
  stages: { slug: string; nameUk: string; nameRu: string; icon: string }[];
  image?: string;
};

export type TankMix = {
  slug: string;
  cultureSlug: string;
  titleUk: string;
  titleRu: string;
  descUk: string;
  descRu: string;
  components: { name: string; manufacturer: string; role: string; priceVat: number; priceCash: number }[];
};

export function calcCash(priceVat: number): number {
  return Math.round((priceVat / 1.2) * 1.1 * 100) / 100;
}
