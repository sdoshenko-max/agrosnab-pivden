export type Tier = "econom" | "premium" | "original";

export type Product = {
  slug: string;
  code: string;
  name: string;
  nameRu: string;
  manufacturer: string;
  tier: string; // string вместо union, чтобы TypeScript не падал на 1400+ SKU.
  group: string;
  groupSlug: string;
  activeIngredient: string;
  activeIngredientRu: string;
  concentration: string;
  packaging: string;
  rate: string;
  priceVat: number;
  priceCash: number;
  priceOnRequest?: boolean;
  unit: string;
  currency: string; // "USD" | "EUR"
  analog?: string;
  saveFromOriginal?: number;
  cultures: string[];
  stage: string[];
  technology?: string[];
  highlight?: boolean;
  description?: string;
  descriptionRu?: string;
  image?: string;
  stockOverride?: number;
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

export type City = {
  slug: string;
  nameUk: string;
  inCity: string;
  nameGen: string;
  district: string;
  region: string;
  distanceKm: number;
  coordinates: { lat: number; lng: number };
  population?: number;
  intro: string;
  mainCultureSlugs: string[];
  climateZone: string;
  localChallenges: { title: string; desc: string }[];
  seasonalCalendar: { month: string; tasks: string }[];
  faq: { q: string; a: string }[];
  metaTitle: string;
  metaDescription: string;
};

export type SavePair = {
  ai: string;
  groupName: string;
  packaging: string;
  unit: "л" | "кг";
  currency: "USD" | "EUR";
  orig: { brand: string; name: string; priceCash: number; url: string };
  our:  { brand: string; name: string; priceCash: number; url: string };
};

export type TankMix = {
  slug: string;
  cultureSlug: string;
  titleUk: string;
  titleRu: string;
  descUk: string;
  descRu: string;
  components: {
    slug?: string;
    name: string;
    manufacturer: string;
    role: string;
    ratePerHa: number;
    packSize: number;
    unit: "л" | "кг";
    priceVat: number;
    priceCash: number;
  }[];
};

export function calcCash(priceVat: number): number {
  return Math.round((priceVat / 1.2) * 1.1 * 100) / 100;
}

export type PackagingHints = {
  name?: string;
  activeIngredient?: string;
  rate?: string;
};

export type PackUnit = "л" | "кг" | "комплект";

function normalizeHintText(hints?: PackagingHints): string {
  if (!hints) return "";
  return [hints.name || "", hints.activeIngredient || "", hints.rate || ""].join(" ").toLowerCase();
}

export function isDryProductLike(hints?: PackagingHints): boolean {
  const text = normalizeHintText(hints);
  if (!text) return false;

  const sep = "[^a-zа-яёіїєґ0-9]";
  const hasDryForm = new RegExp("(^|" + sep + ")(вг|в\\.г|вдг|в\\.д\\.г|зп|з\\.п|вп|в\\.п|сг|с\\.г|тб)(?=$|" + sep + ")", "i").test(text);
  const hasDryActive = /г\s*\/\s*кг/i.test(text);
  const hasDryRate = /(^|[^а-яёіїєґ])(кг|г|гр)\s*\/\s*(га|т|100)/i.test(text);
  const hasLiquidActive = /г\s*\/\s*л/i.test(text);
  const hasLiquidRate = /(л|мл)\s*\/\s*(га|т|100)/i.test(text);
  const explicitlyLiquid = new RegExp("(^|" + sep + ")(ліквід|liquid|рк|р\\.к|кс|к\\.с|ке|к\\.е|мк|м\\.к|се|с\\.е|ме|м\\.е|вс|в\\.с|концентрат\\s+суспензії|эмульсии)(?=$|" + sep + ")", "i").test(text);

  if (explicitlyLiquid) return false;
  if (hasLiquidActive && !hasDryActive && !hasDryRate) return false;
  if (hasLiquidActive && hasLiquidRate && !hasDryActive && !hasDryRate) return false;
  if (hasDryActive && !hasLiquidActive) return true;
  if ((hasDryForm || hasDryActive) && hasDryRate) return true;
  if (hasDryForm && !explicitlyLiquid) return true;
  return false;
}

function removePackageWords(value: string): string {
  return value
    .replace(/(^|[\s,;()])(?:пляш(?:к[аи])?|флакон|ящик|ящ|пак(?:ет)?|банк[аи]?|туба|каніст(?:р[аи])?)(?=$|[\s,;()])/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatPkgNumber(num: number): string {
  return String(num).replace(/^0\.0+$/, "0");
}

function liquidEquivalentToDry(num: number, unit: "л" | "мл"): string {
  const kg = unit === "мл" ? num / 1000 : num;
  if (kg >= 1) return formatPkgNumber(kg) + " кг";
  const grams = Math.round(kg * 1000 * 1000) / 1000;
  return formatPkgNumber(grams) + " г";
}

export function getPackSize(packaging: string): number {
  const s = String(packaging || "").toLowerCase();
  if (/(комплект|комбі-пак|комби-пак|набір|набор)/i.test(s)) {
    const n = s.match(/[\d.,]+/);
    return n ? (parseFloat(n[0].replace(",", ".")) || 1) : 1;
  }

  const m = s.match(/(\d+(?:[.,]\d+)?)\s*(кг|мл|гр|г|л|т)/i);
  if (!m) {
    const n = s.match(/[\d.,]+/);
    return n ? (parseFloat(n[0].replace(",", ".")) || 1) : 1;
  }
  const num = parseFloat(m[1].replace(",", ".")) || 1;
  const unit = m[2].toLowerCase();
  if (unit === "г" || unit === "гр") return num / 1000;
  if (unit === "мл") return num / 1000;
  if (unit === "т") return num * 1000;
  return num;
}

export function normalizePkg(raw: string | null | undefined, hints?: PackagingHints): string {
  if (!raw) return "";
  let s = String(raw).trim();
  const lower = s.toLowerCase();
  if (/(комплект|комбі-пак|комби-пак|набір|набор)/i.test(lower)) {
    const n = lower.match(/[\d.,]+/);
    const qty = n ? (parseFloat(n[0].replace(",", ".")) || 1) : 1;
    return formatPkgNumber(qty) + " комплект";
  }

  if (/[+]/.test(s) && !/(кг|л)\s*$/i.test(s)) return s.replace(/\s+/g, "");

  const mult = s.match(/^\s*\d+\s*[*×xх]\s*(.+)$/i);
  if (mult) s = mult[1].trim();
  s = removePackageWords(s);

  const m = s.match(/(\d+(?:[.,]\d+)?)\s*([а-яёa-z]+\.?)?/i);
  if (!m) return s;
  const num = parseFloat(m[1].replace(",", ".")) || 0;
  let unit = (m[2] || (isDryProductLike(hints) ? "кг" : "л")).toLowerCase().replace(/\.+$/, "");

  if (/^кг$/.test(unit)) unit = "кг";
  else if (/^л$/.test(unit)) unit = "л";
  else if (/^(г|гр)$/.test(unit)) unit = "г";
  else if (/^мл$/.test(unit)) unit = "мл";
  else if (/^т$/.test(unit)) unit = "т";
  else unit = isDryProductLike(hints) ? "кг" : "л";

  if (isDryProductLike(hints) && (unit === "л" || unit === "мл")) {
    return liquidEquivalentToDry(num, unit);
  }
  return formatPkgNumber(num) + " " + unit;
}

export function unitFromPkg(packaging: string, hints?: PackagingHints): PackUnit {
  const s = String(packaging || "").toLowerCase().replace(/\s+/g, "");
  if (/(комплект|комбі-пак|комби-пак|набір|набор)/i.test(s)) return "комплект";
  if (/^\d+(?:[.,]\d+)?кг$/.test(s)) return "кг";
  if (/^\d+(?:[.,]\d+)?гр?$/.test(s)) return "кг";
  if (/кг/.test(s)) return "кг";
  if (isDryProductLike(hints)) return "кг";
  return "л";
}
