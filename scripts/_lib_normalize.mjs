// Спільні нормалізатори для скриптів імпорту/diff'у прайсу.
// Тримаємо в одному місці, щоб таблиця синонімів виробників не дрейфувала
// між _apply_originals_import.mjs, _originals_diff.mjs і майбутніми скриптами.

// === Транслітерація укр→латиниця для slug-ів ===
const TRANSLIT_MAP = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ye",
  ж: "zh", з: "z", и: "y", і: "i", ї: "yi", й: "i", к: "k", л: "l",
  м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ь: "", ю: "yu", я: "ya",
  ё: "e", ы: "y", э: "e", ъ: "",
};

export const translit = (s) => String(s || "")
  .toLowerCase()
  .split("")
  .map((c) => TRANSLIT_MAP[c] ?? c)
  .join("");

export const slugify = (s) => translit(s)
  .replace(/[^a-z0-9-]+/g, "-")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "");

// У прайсі укр літери «і»/«ї»/«й» іноді написані як латин «i»/«y».
// Перш ніж матчити по regex — приводимо до канонічного укр-вигляду.
export const normUkLat = (s) => String(s || "").toLowerCase()
  .replace(/i/g, "і")
  .replace(/y/g, "и");

// === Виробники ===
//
// Усі canonical форми — як ми пишемо їх у полі `manufacturer` каталогу.
// Slug — для побудови `*-mfr` суфіксів у slug продуктів.
// Pattern matches normalized (lowercase + ukр) input.
//
// Додавати нового виробника = один рядок.
const MANUFACTURERS = [
  { canonical: "Сингента",     slug: "synhenta",    match: /синг|synh/ },
  { canonical: "Кортева",      slug: "korteva",     match: /корт|kort/ },
  { canonical: "Басф",         slug: "basf",        match: /басф|basf/ },
  { canonical: "Байер",        slug: "baier",       match: /бай|bay|monsanto/ },
  { canonical: "Адама",        slug: "adama",       match: /адам|adama/ },
  { canonical: "ФМС",          slug: "fms",         match: /фмс|fmc/ },
  { canonical: "Самміт-Агро",  slug: "sammit-agro", match: /самм[іi]т|самми/ },
  { canonical: "Дефенда",      slug: "defenda",     match: /дефенд|defenda/ },
  { canonical: "Терра Віта",   slug: "terra-vita",  match: /терра.?в[іi]т/ },
  { canonical: "Нуфарм",       slug: "nufarm",      match: /нуфарм|nufarm/ },
  { canonical: "UPL",          slug: "upl",         match: /\bupl\b/ },
];

const findMfr = (raw) => {
  const x = normUkLat(raw);
  return MANUFACTURERS.find(m => m.match.test(x));
};

// Для запису в `lib/products.ts` (поле manufacturer).
export const manufacturerCanonical = (raw) => {
  const hit = findMfr(raw);
  return hit ? hit.canonical : String(raw || "").trim();
};

// Латиничний slug-фрагмент виробника для побудови SKU-slug.
export const manufacturerSlug = (raw) => {
  const hit = findMfr(raw);
  return hit ? hit.slug : slugify(raw);
};

// Ключ для matching (lowercase, без заголовних, без додаткових слів типу "ag")
// — використовується у _originals_diff.mjs щоб порівняти SKU прайсу з каталогом
// незалежно від варіації написання виробника.
export const manufacturerKey = (raw) => {
  const hit = findMfr(raw);
  return hit ? hit.canonical.toLowerCase() : normUkLat(raw).replace(/\s+/g, "");
};

// === Нормалізація назв SKU (для матчу, не для запису) ===
export const normName = (s) => String(s || "")
  .toLowerCase()
  .replace(/[ʼ'`]/g, "")
  .replace(/[ёе]/g, "е")
  .replace(/[іий]/g, "и")
  .replace(/i/g, "и")
  .replace(/ї/g, "и")
  .replace(/\s+/g, "")
  .replace(/[.,;()*\-—]/g, "")
  .trim();
