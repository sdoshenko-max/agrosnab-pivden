import { products } from "./products";

// Словник для відомих виробників — щоб slug-и були стабільні незалежно від
// того як translit їх відобразить. Для невідомих — fallback через translit.
const MANUFACTURER_SLUG_MAP: Record<string, string> = {
  "Сингента": "synhenta",
  "Кортева": "korteva",
  "Басф": "basf",
  "Байер": "baier",
  "Адама": "adama",
  "ФМС": "fms",
  "Самміт-Агро": "sammit-agro",
  "Дефенда": "defenda",
  "Терра Віта": "terra-vita",
  "Нуфарм": "nufarm",
  "UPL": "upl",
  "PEST.UA": "pest-ua",
  "Alfa Smart Agro": "alfa-smart-agro",
  "Himagro": "himagro",
  "Нопосон": "noposon",
  "Нертус": "nertus",
  "АХТ": "akht",
  "Укравіт": "ukravit",
  "Грін Експрес": "hrin-ekspres",
  "Найс": "nais",
  "Лайф": "laif",
  "Monsanto": "monsanto",
};

const TRANSLIT_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ye",
  ж: "zh", з: "z", и: "y", і: "i", ї: "yi", й: "i", к: "k", л: "l",
  м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ь: "", ю: "yu", я: "ya",
  ё: "e", ы: "y", э: "e", ъ: "",
};

const translit = (s: string): string => String(s || "")
  .toLowerCase()
  .split("")
  .map((c) => TRANSLIT_MAP[c] ?? c)
  .join("");

const slugify = (s: string): string => translit(s)
  .replace(/[^a-z0-9-]+/g, "-")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "");

export function manufacturerSlug(name: string): string {
  if (MANUFACTURER_SLUG_MAP[name]) return MANUFACTURER_SLUG_MAP[name];
  return slugify(name);
}

// Усі виробники в каталозі. Унікальні, з підрахунком кількості SKU.
export type ManufacturerInfo = { name: string; slug: string; count: number };

let _all: ManufacturerInfo[] | null = null;
export function allManufacturers(): ManufacturerInfo[] {
  if (_all) return _all;
  const map = new Map<string, number>();
  for (const p of products) {
    map.set(p.manufacturer, (map.get(p.manufacturer) || 0) + 1);
  }
  _all = Array.from(map.entries())
    .map(([name, count]) => ({ name, slug: manufacturerSlug(name), count }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return _all;
}

export function getManufacturerBySlug(slug: string): ManufacturerInfo | undefined {
  return allManufacturers().find(m => m.slug === slug);
}

export function getProductsByManufacturer(slug: string) {
  const m = getManufacturerBySlug(slug);
  if (!m) return [];
  return products.filter(p => p.manufacturer === m.name);
}
