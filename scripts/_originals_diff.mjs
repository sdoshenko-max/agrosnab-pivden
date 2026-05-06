// Крок 2 reimport-плану: diff staging-файлу проти поточного каталогу.
// Виходи: _originals_diff.json + _ORIGINALS_DIFF_SUMMARY.md
//
// Для кожного SKU з прайсу шукаємо матч у lib/products.ts:
//   1) точний (name + manufacturer, нормалізовані)
//   2) через таблицю мапінгу в _PRICE_IMPORT_RULES.md (наша назва ↔ назва в прайсі)
//   3) fuzzy за першим словом + виробник
// Кошики: UPDATE / ADD / RENAME / GHOST.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { manufacturerKey, normName } from "./_lib_normalize.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// === Завантажуємо staging ===
const staging = JSON.parse(readFileSync(path.join(root, "_originals_staging.json"), "utf8"));

// === Витягуємо tier:"original" з products.ts ===
const productsTxt = readFileSync(path.join(root, "lib", "products.ts"), "utf8");
const productLines = productsTxt.split(/\r?\n/);
const currentOriginals = [];
for (const l of productLines) {
  if (!/^\s*\{\s*slug:.*tier:\s*"original"/.test(l)) continue;
  const get = (re) => (l.match(re) || [, ""])[1];
  currentOriginals.push({
    slug: get(/slug:\s*"([^"]+)"/),
    name: get(/name:\s*"([^"]+)"/),
    nameRu: get(/nameRu:\s*"([^"]+)"/),
    manufacturer: get(/manufacturer:\s*"([^"]+)"/),
    activeIngredient: get(/activeIngredient:\s*"([^"]+)"/),
    packaging: get(/packaging:\s*"([^"]+)"/),
    priceVat: parseFloat(get(/priceVat:\s*([\d.]+)/)) || null,
    priceCash: parseFloat(get(/priceCash:\s*([\d.]+)/)) || null,
    currency: get(/currency:\s*"([^"]+)"/),
    priceOnRequest: /priceOnRequest:\s*true/.test(l),
  });
}

// === Парсимо таблицю мапінгу з _PRICE_IMPORT_RULES.md ===
const rulesTxt = readFileSync(path.join(root, "_PRICE_IMPORT_RULES.md"), "utf8");
const mapping = []; // [{slug, ourName, priceName}]
const tableRe = /^\|\s*`([a-z0-9-]+)`\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/gm;
// Знаходимо секцію "Мапа назв оригіналів"
const mapSection = rulesTxt.split(/^##\s+/m).find(s => s.startsWith("Мапа назв оригіналів"));
if (mapSection) {
  let m;
  while ((m = tableRe.exec(mapSection)) !== null) {
    if (m[1] === "Slug" || m[1] === "slug") continue;
    mapping.push({ slug: m[1], ourName: m[2].trim(), priceName: m[3].trim() });
  }
}

// Локальні аліаси під поточну назву використання у скрипті.
const norm = normName;
const normMfr = manufacturerKey;

const cleanName = (s) => {
  // Зрізає типові постфікси «КЕ», «КС», «в.р.», «Турбо», «Pro», цифри з «г/л» і т.ін.
  return String(s || "")
    .replace(/\b(КЕ|КС|КП|МД|РК|ВГ|ТН|FS|EC|SC|WG|SE|РК|в\.р\.|в\.г\.|з\.п\.|к\.с\.|к\.е\.|с\.п\.|с\.е\.|КЕ|МКС|с\.т\.с\.)\b/gi, "")
    .replace(/\d+(\.\d+)?\s*(г\/л|г\/кг|ec|sc|wg|fs|sl|cs|od|wp|с|г)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
};

// === Індекси для пошуку ===
const indexExact = new Map(); // norm(name)+normMfr → currentSku
const indexCleanName = new Map(); // norm(cleanName)+normMfr → currentSku
const indexBySlug = new Map();
for (const c of currentOriginals) {
  const k1 = `${norm(c.name)}||${normMfr(c.manufacturer)}`;
  const k2 = `${norm(cleanName(c.name))}||${normMfr(c.manufacturer)}`;
  if (!indexExact.has(k1)) indexExact.set(k1, c);
  if (!indexCleanName.has(k2)) indexCleanName.set(k2, c);
  indexBySlug.set(c.slug, c);
}

// === Mapping-індекс: priceName + manufacturer (з мапінг-таблиці) ===
const indexByMapping = new Map(); // norm(priceName) → {slug, ourName}
for (const m of mapping) {
  // priceName може містити слеш-варіанти ("Пульсар 40 / Пульсар Флекс ...")
  // беремо перший фрагмент до «*(» або « / »
  const variants = m.priceName
    .replace(/\*\(.*$/, "")
    .split(/\s*\/\s*/)
    .map(s => s.replace(/\*.*/g, "").trim())
    .filter(Boolean);
  for (const v of variants) {
    indexByMapping.set(norm(v), m);
  }
}

// === Diff loop ===
const buckets = { update: [], add: [], rename: [] };
const matchedSlugs = new Set();

for (const sku of staging.skus) {
  const targetMfr = normMfr(sku.producer);
  const k1 = `${norm(sku.name)}||${targetMfr}`;
  const k2 = `${norm(cleanName(sku.name))}||${targetMfr}`;

  let matched = indexExact.get(k1);
  let matchType = matched ? "exact_name+mfr" : null;

  if (!matched) {
    matched = indexCleanName.get(k2);
    if (matched) matchType = "clean_name+mfr";
  }

  if (!matched) {
    // спробуємо через мапінг-таблицю
    const mapHit = indexByMapping.get(norm(sku.name)) || indexByMapping.get(norm(cleanName(sku.name)));
    if (mapHit) {
      matched = indexBySlug.get(mapHit.slug);
      matchType = "mapping_table";
    }
  }

  if (!matched) {
    buckets.add.push({
      producer: sku.producer,
      category: sku.category,
      name: sku.name,
      unit: sku.unit,
      packagings: sku.packagings,
    });
    continue;
  }

  matchedSlugs.add(matched.slug);

  // Шукаємо найкращу фасовку — ту, що відповідає поточній каталоговій
  const targetPkg = (matched.packaging || "").replace(/\s/g, "").toLowerCase();
  const findPkg = sku.packagings.find(p => {
    const pn = p.packaging.replace(/\s/g, "").toLowerCase();
    return pn.endsWith(targetPkg) || pn.includes(targetPkg);
  }) || sku.packagings[0];

  const diffs = [];
  if (matched.priceVat && Math.abs(matched.priceVat - findPkg.priceVat) > 0.05) {
    diffs.push({ field: "priceVat", current: matched.priceVat, new: findPkg.priceVat });
  }
  if (matched.priceCash && Math.abs(matched.priceCash - findPkg.priceCash) > 0.05) {
    diffs.push({ field: "priceCash", current: matched.priceCash, new: findPkg.priceCash });
  }
  if (matched.currency && matched.currency !== findPkg.currency) {
    diffs.push({ field: "currency", current: matched.currency, new: findPkg.currency });
  }

  const needsRename = matchType === "mapping_table" && norm(matched.name) !== norm(sku.name);
  const target = needsRename ? buckets.rename : buckets.update;
  target.push({
    currentSlug: matched.slug,
    currentName: matched.name,
    currentManufacturer: matched.manufacturer,
    currentPriceVat: matched.priceVat,
    currentPriceCash: matched.priceCash,
    currentCurrency: matched.currency,
    currentPackaging: matched.packaging,
    priceOnRequestNow: matched.priceOnRequest,
    matchedBy: matchType,
    priceProducer: sku.producer,
    priceCategory: sku.category,
    priceName: sku.name,
    priceUnit: sku.unit,
    pickedPackaging: findPkg,
    allPackagings: sku.packagings,
    diffs,
  });
}

const ghosts = currentOriginals.filter(c => !matchedSlugs.has(c.slug));
buckets.ghost = ghosts;

// === Підрахунки по виробниках ===
const byProducer = {};
const incrProducer = (p, key) => {
  byProducer[p] = byProducer[p] || { update: 0, add: 0, rename: 0, ghost: 0 };
  byProducer[p][key]++;
};
buckets.update.forEach(r => incrProducer(r.priceProducer, "update"));
buckets.add.forEach(r => incrProducer(r.producer, "add"));
buckets.rename.forEach(r => incrProducer(r.priceProducer, "rename"));
buckets.ghost.forEach(r => incrProducer(r.manufacturer, "ghost"));

const out = {
  generatedAt: new Date().toISOString(),
  stats: {
    currentOriginals: currentOriginals.length,
    priceOriginals: staging.uniqueSkus,
    update: buckets.update.length,
    add: buckets.add.length,
    rename: buckets.rename.length,
    ghost: buckets.ghost.length,
  },
  byProducer,
  buckets,
};

writeFileSync(path.join(root, "_originals_diff.json"), JSON.stringify(out, null, 2), "utf8");

// === Markdown summary ===
let md = `# Originals reimport — diff summary\n\n`;
md += `> Згенеровано ${new Date().toISOString()}. Скрипт \`scripts/_originals_diff.mjs\`.\n\n`;
md += `## Підсумок\n\n`;
md += `| Метрика | Значення |\n|---|---|\n`;
md += `| SKU в каталозі (tier="original") | ${currentOriginals.length} |\n`;
md += `| SKU в прайсі (лист «Оригінал»)   | ${staging.uniqueSkus} |\n`;
md += `| 🔄 UPDATE (є на сайті, ціна/курс розійшлися) | **${buckets.update.length}** |\n`;
md += `| ➕ ADD (нові, треба завантажити)             | **${buckets.add.length}** |\n`;
md += `| ✎ RENAME (mapping-таблиця, перейменувати)   | **${buckets.rename.length}** |\n`;
md += `| 👻 GHOST (на сайті є, у прайсі зник)        | **${buckets.ghost.length}** |\n\n`;

md += `## По виробниках\n\n`;
md += `| Виробник | UPDATE | ADD | RENAME | GHOST |\n|---|---|---|---|---|\n`;
const allProds = Object.keys(byProducer).sort((a, b) =>
  (byProducer[b].add + byProducer[b].update) - (byProducer[a].add + byProducer[a].update));
for (const p of allProds) {
  const s = byProducer[p];
  md += `| ${p} | ${s.update} | ${s.add} | ${s.rename} | ${s.ghost} |\n`;
}

md += `\n## RENAME (потребують редіректу)\n\n`;
if (buckets.rename.length === 0) md += `_Порожньо._\n`;
else {
  md += `| Slug | Зараз на сайті | У прайсі | Як знайдено |\n|---|---|---|---|\n`;
  for (const r of buckets.rename) {
    md += `| \`${r.currentSlug}\` | ${r.currentName} (${r.currentManufacturer}) | ${r.priceName} (${r.priceProducer}) | ${r.matchedBy} |\n`;
  }
}

md += `\n## GHOST (на сайті є, у прайсі НЕМАЄ)\n\n`;
if (buckets.ghost.length === 0) md += `_Порожньо._\n`;
else {
  md += `| Slug | Назва | Виробник | Ціна на сайті | priceOnRequest? |\n|---|---|---|---|---|\n`;
  for (const g of buckets.ghost) {
    md += `| \`${g.slug}\` | ${g.name} | ${g.manufacturer} | ${g.priceVat ?? "—"} ${g.currency ?? ""} | ${g.priceOnRequest ? "так" : "ні"} |\n`;
  }
}

md += `\n## UPDATE preview (топ-15 по абсолютній різниці ціни)\n\n`;
const updWithDiff = buckets.update.filter(r => r.diffs.length > 0);
const sortedUpd = updWithDiff.slice().sort((a, b) => {
  const da = a.diffs.find(x => x.field === "priceVat");
  const db = b.diffs.find(x => x.field === "priceVat");
  if (!da || !db) return 0;
  return Math.abs(db.new - db.current) - Math.abs(da.new - da.current);
}).slice(0, 15);
md += `| Slug | Поле | Було | Стане |\n|---|---|---|---|\n`;
for (const r of sortedUpd) {
  for (const d of r.diffs) {
    md += `| \`${r.currentSlug}\` | ${d.field} | ${d.current} ${r.currentCurrency || ""} | ${d.new} ${r.pickedPackaging.currency} |\n`;
  }
}
md += `\n*(Повний UPDATE-список — ${buckets.update.length} SKU — у \`_originals_diff.json\`.)*\n`;

md += `\n## ADD preview (5 рядків з кожного виробника)\n\n`;
for (const p of allProds) {
  const adds = buckets.add.filter(r => r.producer === p).slice(0, 5);
  if (adds.length === 0) continue;
  md += `### ${p} (показано ${adds.length} з ${buckets.add.filter(r => r.producer === p).length})\n\n`;
  md += `| Категорія | Назва | Фасовки |\n|---|---|---|\n`;
  for (const a of adds) {
    const pkgs = a.packagings.map(p => `${p.packaging} = ${p.priceVat} ${p.currency}`).join("; ");
    md += `| ${a.category} | ${a.name} | ${pkgs} |\n`;
  }
  md += `\n`;
}

writeFileSync(path.join(root, "_ORIGINALS_DIFF_SUMMARY.md"), md, "utf8");

console.log(`\n=== DIFF SUMMARY ===`);
console.log(`Поточних оригіналів у каталозі: ${currentOriginals.length}`);
console.log(`SKU у прайсі:                   ${staging.uniqueSkus}`);
console.log(`🔄 UPDATE: ${buckets.update.length}`);
console.log(`➕ ADD:    ${buckets.add.length}`);
console.log(`✎ RENAME: ${buckets.rename.length}`);
console.log(`👻 GHOST:  ${buckets.ghost.length}`);
console.log(`\nАртефакти: _originals_diff.json + _ORIGINALS_DIFF_SUMMARY.md`);
