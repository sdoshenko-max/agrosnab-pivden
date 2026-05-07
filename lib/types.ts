export type Tier = "econom" | "premium" | "original";

export type Product = {
  slug: string;
  code: string;
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
  priceOnRequest?: boolean;
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

export type TankMix = {
  slug: string;
  cultureSlug: string;
  titleUk: string;
  titleRu: string;
  descUk: string;
  descRu: string;
  components: {
    slug?: string;        // якщо співпадає з products[] — для додавання в кошик
    name: string;
    manufacturer: string;
    role: string;
    ratePerHa: number;    // л/кг на гектар
    packSize: number;     // фасовка (5, 10, 20)
    unit: "л" | "кг";
    priceVat: number;     // ціна за 1 л/кг
    priceCash: number;
  }[];
};

export function calcCash(priceVat: number): number {
  return Math.round((priceVat / 1.2) * 1.1 * 100) / 100;
}

// Витягуємо розмір фасовки в базовій одиниці (л або кг).
// "5 л" → 5; "0.5 кг" → 0.5; "500 г" → 0.5; "50 мл" → 0.05; "1 т" → 1000.
// Для комбо-фасовок типу "1кг+5л" — повертає число першої частини.
// (JS regex \b не працює з кирилицею — використовуємо явну перевірку без \b.)
export function getPackSize(packaging: string): number {
  const s = String(packaging || "").toLowerCase();
  // Парсимо число + одиницю. Порядок альтернатив у regex важливий:
  // довші варіанти першими (кг перед г, мл перед л) інакше "кг" зматчить як "г".
  const m = s.match(/(\d+(?:[.,]\d+)?)\s*(кг|мл|гр|г|л|т)/);
  if (!m) {
    const n = s.match(/[\d.,]+/);
    return n ? (parseFloat(n[0].replace(",", ".")) || 1) : 1;
  }
  const num = parseFloat(m[1].replace(",", ".")) || 1;
  const unit = m[2];
  if (unit === "г" || unit === "гр") return num / 1000;  // 500 г → 0.5 (кг)
  if (unit === "мл") return num / 1000;                  // 50 мл → 0.05 (л)
  if (unit === "т") return num * 1000;                   // 1 т → 1000 (кг)
  return num; // кг, л — базова одиниця
}

// Нормалізує запис фасовки до канонічної форми:
//   "4*5л.", "5л.", "5 л", "5л" → "5 л"
//   "0,25 кг", "0.25кг" → "0.25 кг"
//   "500гр", "500 г" → "500 г"
//   "10*500гр" → "500 г"
//   "0,5л пляш" → "0.5 л"
//   "40гр+100г/л" → "40гр+100г/л" (комбо лишається без змін)
export function normalizePkg(raw: string | null | undefined): string {
  if (!raw) return "";
  let s = String(raw).trim();
  // Комбо-форми ("1кг+5л", "40гр+100г/л") — лишаємо як є
  if (/[+]/.test(s) && !/(кг|л)\s*$/.test(s)) {
    return s.replace(/\s+/g, "");
  }
  // Видаляємо мультиплікатор: "4*5л" → "5л", "20*250гр" → "250гр", "4×5 л" → "5 л"
  const mult = s.match(/^\s*\d+\s*[*×xх]\s*(.+)$/i);
  if (mult) s = mult[1].trim();
  // Прибираємо описові слова: "пляш", "флакон", "ящик", "пак", "банка"
  s = s.replace(/\b(пляш(к[аи])?|флакон|ящик|ящ|пак(ет)?|банк[аи]?|туба|каніст(р[аи])?)\b/gi, "").trim();
  // Витягуємо число + одиницю
  const m = s.match(/(\d+(?:[.,]\d+)?)\s*([а-яёa-z]+\.?)?/i);
  if (!m) return s;
  const num = parseFloat(m[1].replace(",", ".")) || 0;
  let unit = (m[2] || "л").toLowerCase().replace(/\.+$/, "");
  // Канонічні одиниці
  if (/^кг$/.test(unit)) unit = "кг";
  else if (/^л$/.test(unit)) unit = "л";
  else if (/^(г|гр)$/.test(unit)) unit = "г";
  else if (/^мл$/.test(unit)) unit = "мл";
  else if (/^т$/.test(unit)) unit = "т";
  else unit = "л"; // fallback
  // Число без зайвих нулів
  const numStr = String(num).replace(/^0\.0+$/, "0");
  return `${numStr} ${unit}`;
}

// Базова одиниця для фасовки: "500 г" → "кг", "5 л" → "л", "50 мл" → "л".
// (JS regex \b не працює з кирилицею, тому через нормалізацію.)
export function unitFromPkg(packaging: string): "л" | "кг" {
  const s = String(packaging || "").toLowerCase().replace(/\s+/g, "");
  if (/^\d+(?:[.,]\d+)?кг$/.test(s)) return "кг";
  if (/^\d+(?:[.,]\d+)?гр?$/.test(s)) return "кг"; // 500г, 500гр
  if (/кг/.test(s)) return "кг"; // на всяк випадок: "0.25кг", "10*500гр"
  return "л";
}
