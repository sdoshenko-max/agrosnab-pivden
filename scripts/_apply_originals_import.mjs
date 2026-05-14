// Крок 6: застосувати весь reimport-план одним проходом.
// Читає _originals_diff.json і:
//   1) UPDATE  — оновлює priceVat / priceCash / currency для існуючих SKU
//   2) RENAME  — те саме (назва і slug на сайті лишаються; виключення обробляються вручну в SPECIAL)
//   3) GHOST   — видаляє рядки SKU з products.ts
//   4) ADD     — додає нові SKU з мінімальним набором полів
//   5) SPECIAL — salsa-korteva → ФМС, tarha-super-nissan → Самміт-Агро (slug змінюється),
//                rehent-20-g-baier → Басф (slug змінюється)
//
// Дописує редіректи в public/_redirects для тих SPECIAL, де slug змінився.
// Збираю детальний звіт `_ORIGINALS_IMPORT_RESULT.md`.

import { readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { slugify, manufacturerCanonical as mfrCanonical, manufacturerSlug as mfrToSlug } from "./_lib_normalize.mjs";
import { normalizePkg, unitFromPkg } from "./_lib_packaging.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const diff = JSON.parse(readFileSync(path.join(root, "_originals_diff.json"), "utf8"));
const productsPath = path.join(root, "lib", "products.ts");
const productsLines = readFileSync(productsPath, "utf8").split(/\r?\n/);

// Категорія з прайсу → group/groupSlug
const categoryMap = (c) => {
  const x = String(c || "").toLowerCase().replace(/[іi]/g, "и");
  if (/гербицид|герб/.test(x)) return { group: "Гербіцид", groupSlug: "herbitsydy" };
  if (/инсектицид|инсект/.test(x)) return { group: "Інсектицид", groupSlug: "insektitsydy" };
  if (/фунгицид|фунг/.test(x)) return { group: "Фунгіцид", groupSlug: "funhitsydy" };
  if (/протрав|протруй/.test(x)) return { group: "Протруйник", groupSlug: "protruyniky" };
  if (/десикант/.test(x)) return { group: "Десикант", groupSlug: "desykanty" };
  if (/регулятор/.test(x)) return { group: "Регулятор росту", groupSlug: "regulyatory" };
  if (/адюв|адʼюв|прилипач|пар|пав/.test(x)) return { group: "Адʼювант", groupSlug: "adyuvanty" };
  if (/родентицид/.test(x)) return { group: "Родентицид", groupSlug: "rodentytsydy" };
  // дефолт — гербіцид
  return { group: "Гербіцид", groupSlug: "herbitsydy" };
};

// Парсинг фасовки з рядка прайсу: "12*1л" / "4*5л" / "20л" / "1кг" / "10*1л"
const parsePackaging = (raw, unit, hints = {}) => {
  const s = String(raw || "").replace(/\s/g, "").toLowerCase();
  // знаходимо число + одиницю в кінці
  const m = s.match(/^(?:(\d+)\*)?(\d+(?:[.,]\d+)?)(л|кг|мл|г|т)?$/);
  if (m) {
    const qty = m[2].replace(",", ".");
    const u = m[3] || (unit || "л").toLowerCase();
    return normalizePkg(`${qty} ${u}`, hints);
  }
  // fallback — як було, прибрати множник
  const m2 = s.match(/^(?:\d+\*)?(.+)$/);
  return normalizePkg(m2 ? m2[1] : raw, hints);
};

// === Збираємо зміни для products.ts ===
const updateBySlug = new Map(); // slug → {priceVat, priceCash, currency, manufacturer?}
const ghostSlugs = new Set();

// SPECIAL — підготовка
const SPECIAL = {
  "salsa-korteva": { newManufacturer: "ФМС", keepSlug: true },
  "tarha-super-nissan": { newSlug: "tarha-super-sammit-agro", newManufacturer: "Самміт-Агро", oldUrl: "tarha-super-nissan" },
  "rehent-20-g-baier": { newSlug: "rehent-20-g-basf", newManufacturer: "Басф", oldUrl: "rehent-20-g-baier" },
};

// UPDATE: prepare price changes
for (const r of diff.buckets.update) {
  const pkg = r.pickedPackaging;
  updateBySlug.set(r.currentSlug, {
    priceVat: pkg.priceVat,
    priceCash: pkg.priceCash, // вже з націнкою +10% (з парсера)
    currency: pkg.currency,
  });
}

// RENAME: те ж саме, але виключаючи SPECIAL (їх обробимо окремо)
for (const r of diff.buckets.rename) {
  const pkg = r.pickedPackaging;
  const upd = {
    priceVat: pkg.priceVat,
    priceCash: pkg.priceCash,
    currency: pkg.currency,
  };
  if (SPECIAL[r.currentSlug]) {
    upd.newManufacturer = SPECIAL[r.currentSlug].newManufacturer;
    upd.newSlug = SPECIAL[r.currentSlug].newSlug;
  }
  updateBySlug.set(r.currentSlug, upd);
}

// GHOST: позначити для видалення
for (const g of diff.buckets.ghost) {
  ghostSlugs.add(g.slug);
}

// === Генеруємо нові SKU для ADD ===
const existingSlugs = new Set();
for (const l of productsLines) {
  const m = l.match(/slug:\s*"([^"]+)"/);
  if (m) existingSlugs.add(m[1]);
}

const adds = [];
const skipped = [];
const newSlugSet = new Set();
for (const a of diff.buckets.add) {
  const cat = categoryMap(a.category);
  const mfr = mfrCanonical(a.producer);
  const baseName = a.name.trim();
  let baseSlug = `${slugify(baseName)}-${mfrToSlug(a.producer)}`.replace(/-+/g, "-");
  let slug = baseSlug;
  let n = 2;
  while (existingSlugs.has(slug) || newSlugSet.has(slug)) {
    slug = `${baseSlug}-${n++}`;
  }
  newSlugSet.add(slug);

  // Обираємо першу фасовку як «основну»
  const pkg = a.packagings[0];
  const packagingHints = { name: baseName };
  const packaging = parsePackaging(pkg.packaging, a.unit, packagingHints);
  // Тип unit обмежений до "л" | "кг". Нестандартні одиниці (уп, компл, шт)
  // намагаюся розпізнати за фасовкою; якщо не виходить — пропускаю SKU.
  let unit;
  if (a.unit === "л" || a.unit === "кг") unit = unitFromPkg(packaging, packagingHints);
  else if (/кг/i.test(packaging) && !/л/i.test(packaging)) unit = "кг";
  else if (/л/i.test(packaging) && !/кг/i.test(packaging)) unit = "л";
  else if (/\d+(?:[.,]\d+)?\s*(кг|г|гр|л|мл)/i.test(packaging)) unit = unitFromPkg(packaging, packagingHints);
  else { skipped.push({producer: a.producer, name: a.name, reason: `unit="${a.unit}", packaging="${pkg.packaging}"`}); continue; }

  // Об'єкт для рядка products.ts. БЕЗ activeIngredient/activeIngredientRu/cultures/stage/image —
  // це поля для пізнішого ресерч-проходу (крок 3 чек-листа).
  adds.push({
    slug,
    name: baseName,
    nameRu: baseName, // переклад на потім
    manufacturer: mfr,
    tier: "original",
    group: cat.group,
    groupSlug: cat.groupSlug,
    activeIngredient: "",
    activeIngredientRu: "",
    concentration: "",
    packaging,
    rate: "",
    priceVat: pkg.priceVat,
    priceCash: pkg.priceCash,
    unit,
    currency: pkg.currency,
    cultures: [],
    stage: [],
  });
}

// === Перебудова products.ts: проходимо рядки, видаляємо ghost, оновлюємо update, додаємо ADD у кінець масиву ===
const newLines = [];
let updated = 0, deleted = 0, slugRenamed = 0, mfrRenamed = 0;
let arrayCloseLineIdx = -1;

for (let i = 0; i < productsLines.length; i++) {
  const line = productsLines[i];
  const slugMatch = line.match(/slug:\s*"([^"]+)"/);
  if (slugMatch) {
    const slug = slugMatch[1];
    if (ghostSlugs.has(slug)) {
      deleted++;
      continue; // skip line
    }
    let newLine = line;
    const upd = updateBySlug.get(slug);
    if (upd) {
      // оновлюємо ціни
      newLine = newLine.replace(/priceVat:\s*[\d.]+/, `priceVat: ${upd.priceVat}`);
      newLine = newLine.replace(/priceCash:\s*[\d.]+/, `priceCash: ${upd.priceCash}`);
      newLine = newLine.replace(/currency:\s*"[^"]*"/, `currency: "${upd.currency}"`);
      // прибрати priceOnRequest:true якщо було (UPDATE: тепер є реальна ціна)
      newLine = newLine.replace(/,\s*priceOnRequest:\s*true/g, "");
      // SPECIAL: змінити manufacturer та slug
      if (upd.newManufacturer) {
        newLine = newLine.replace(/manufacturer:\s*"[^"]*"/, `manufacturer: "${upd.newManufacturer}"`);
        mfrRenamed++;
      }
      if (upd.newSlug) {
        newLine = newLine.replace(/slug:\s*"[^"]+"/, `slug: "${upd.newSlug}"`);
        // image теж міняємо, якщо мав посилатись на старий slug
        const oldSlugInImage = `/products/${slug}.jpg`;
        const newSlugInImage = `/products/${upd.newSlug}.jpg`;
        newLine = newLine.replace(oldSlugInImage, newSlugInImage);
        slugRenamed++;
      }
      updated++;
    }
    newLines.push(newLine);
    continue;
  }

  // Шукаємо рядок з закриттям масиву "];" — туди вставимо ADD
  if (/^\];?\s*$/.test(line) && arrayCloseLineIdx === -1) {
    arrayCloseLineIdx = newLines.length;
  }
  newLines.push(line);
}

// === Вставляємо ADD перед закриттям масиву ===
const addsAsCode = adds.map(a => {
  const fields = [
    `slug: ${JSON.stringify(a.slug)}`,
    `name: ${JSON.stringify(a.name)}`,
    `nameRu: ${JSON.stringify(a.nameRu)}`,
    `manufacturer: ${JSON.stringify(a.manufacturer)}`,
    `tier: ${JSON.stringify(a.tier)}`,
    `group: ${JSON.stringify(a.group)}`,
    `groupSlug: ${JSON.stringify(a.groupSlug)}`,
    `activeIngredient: ${JSON.stringify(a.activeIngredient)}`,
    `activeIngredientRu: ${JSON.stringify(a.activeIngredientRu)}`,
    `concentration: ${JSON.stringify(a.concentration)}`,
    `packaging: ${JSON.stringify(a.packaging)}`,
    `rate: ${JSON.stringify(a.rate)}`,
    `priceVat: ${a.priceVat}`,
    `priceCash: ${a.priceCash}`,
    `unit: ${JSON.stringify(a.unit)}`,
    `currency: ${JSON.stringify(a.currency)}`,
    `cultures: []`,
    `stage: []`,
  ];
  return `  { ${fields.join(", ")} },`;
});

if (arrayCloseLineIdx === -1) throw new Error("could not find ']' line in products.ts");
newLines.splice(arrayCloseLineIdx, 0, ...addsAsCode);

writeFileSync(productsPath, newLines.join("\n"), "utf8");

// === Дописуємо редіректи в public/_redirects для SPECIAL ===
const redirectsPath = path.join(root, "public", "_redirects");
const newRedirects = [];
for (const [oldSlug, conf] of Object.entries(SPECIAL)) {
  if (!conf.newSlug) continue;
  newRedirects.push(`/produkt/${oldSlug}/    /produkt/${conf.newSlug}/    301`);
  newRedirects.push(`/produkt/${oldSlug}     /produkt/${conf.newSlug}/    301`);
  newRedirects.push(`/ru/produkt/${oldSlug}/ /ru/produkt/${conf.newSlug}/ 301`);
  newRedirects.push(`/ru/produkt/${oldSlug}  /ru/produkt/${conf.newSlug}/ 301`);
}
if (newRedirects.length > 0) {
  appendFileSync(redirectsPath, "\n" + newRedirects.join("\n") + "\n", "utf8");
}

// === Звіт ===
const report = [
  `# Originals reimport — результат застосування`,
  ``,
  `> Виконано ${new Date().toISOString()}. Скрипт \`scripts/_apply_originals_import.mjs\`.`,
  ``,
  `## Зміни в \`lib/products.ts\``,
  ``,
  `| Кошик | К-сть |`,
  `|---|---|`,
  `| 🔄 UPDATE (priceVat/priceCash/currency) | ${updated} |`,
  `| 👻 GHOST (видалено рядків) | ${deleted} |`,
  `| ➕ ADD (додано нових SKU) | ${adds.length} |`,
  `| ✎ Manufacturer перейменовано | ${mfrRenamed} |`,
  `| ✎ Slug перейменовано (з 301-редіректом) | ${slugRenamed} |`,
  ``,
  `## Нові редіректи (додано в \`public/_redirects\`)`,
  ``,
  newRedirects.length === 0 ? "_Порожньо._" : "```\n" + newRedirects.join("\n") + "\n```",
  ``,
  `## ADD: розподіл по виробниках`,
  ``,
  `| Виробник | Додано SKU |`,
  `|---|---|`,
];
const addByMfr = {};
for (const a of adds) addByMfr[a.manufacturer] = (addByMfr[a.manufacturer] || 0) + 1;
for (const [m, c] of Object.entries(addByMfr).sort((a, b) => b[1] - a[1])) {
  report.push(`| ${m} | ${c} |`);
}
report.push("");
report.push(`## ⚠ Що НЕ заповнено для нових 581 SKU`);
report.push("");
report.push(`- \`activeIngredient\` / \`activeIngredientRu\` — порожньо. Треба ресерч на офсайтах виробників (крок 3 чек-листа). На сайті відобразиться як «—».`);
report.push(`- \`concentration\` — порожньо.`);
report.push(`- \`rate\` (норма витрати) — порожньо.`);
report.push(`- \`cultures\` — порожній масив. Товар не з'явиться в списках за культурою. Треба додати після ресерчу.`);
report.push(`- \`stage\` — порожній масив.`);
report.push(`- \`image\` — поле відсутнє. Сайт показуватиме placeholder. Фото — на крок 8 (post-import).`);

if (skipped.length > 0) {
  report.push("");
  report.push(`## ⚠ Пропущені при ADD (${skipped.length})`);
  report.push("");
  report.push("Не змогли визначити тип одиниці (\"л\"/\"кг\") — це переважно комплекти з різнотипними компонентами:");
  report.push("");
  report.push("| Виробник | Назва | Причина |");
  report.push("|---|---|---|");
  for (const s of skipped) {
    report.push(`| ${s.producer} | ${s.name} | ${s.reason} |`);
  }
}

writeFileSync(path.join(root, "_ORIGINALS_IMPORT_RESULT.md"), report.join("\n"), "utf8");

console.log(`\n=== ЗАСТОСОВАНО ===`);
console.log(`UPDATE: ${updated}, GHOST: ${deleted}, ADD: ${adds.length}`);
console.log(`Manufacturer renamed: ${mfrRenamed}, Slug renamed: ${slugRenamed}`);
console.log(`\nЗвіт: _ORIGINALS_IMPORT_RESULT.md`);
