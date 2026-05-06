// Присвоєння кодів усім рядкам прайсу.
// Поточна версія: лист «Оригінал» (683 рядки, 11 виробників).
//
// Логіка:
//   1. Кожен рядок прайсу = товар + фасовка.
//   2. Шукаємо у нашому каталозі SKU з тим самим виробником і назвою (нормалізовано).
//   3. Якщо SKU знайдено + фасовка збігається → беремо існуючий код з _codes_catalog.csv.
//   4. Якщо SKU знайдено, але інша фасовка → новий код у тій самій категорії (як у наявного SKU).
//   5. Якщо SKU не знайдено → новий код у категорії з прайсової «Група».
//
// На виході:
//   _price_with_codes_original.csv — таблиця прайсу з присвоєними кодами
//   _NEW_CODES_PREVIEW.md — статистика і зразки нових кодів

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import xlsx from "xlsx";
import { manufacturerKey, manufacturerCanonical, normName } from "./_lib_normalize.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// === Категорія прайсу → перша цифра коду ===
const CAT_DIGIT = {
  herbitsydy: 1, funhitsydy: 2, insektitsydy: 3, protruyniky: 4,
  desykanty: 5, regulyatory: 6, adyuvanty: 7, rodentytsydy: 8,
};
const CAT_NAME = {
  1: { uk: "Гербіцид", slug: "herbitsydy" },
  2: { uk: "Фунгіцид", slug: "funhitsydy" },
  3: { uk: "Інсектицид", slug: "insektitsydy" },
  4: { uk: "Протруйник", slug: "protruyniky" },
  5: { uk: "Десикант", slug: "desykanty" },
  6: { uk: "Регулятор росту", slug: "regulyatory" },
  7: { uk: "Адʼювант", slug: "adyuvanty" },
  8: { uk: "Родентицид", slug: "rodentytsydy" },
};

const categoryDigitFromText = (raw) => {
  const x = String(raw || "").toLowerCase().replace(/[іi]/g, "и");
  if (/гербицид|герб/.test(x)) return 1;
  if (/фунгицид|фунг/.test(x)) return 2;
  if (/инсектицид|инсект/.test(x)) return 3;
  if (/протрав|протруй/.test(x)) return 4;
  if (/десикант/.test(x)) return 5;
  if (/регулятор/.test(x)) return 6;
  if (/адюв|адьюв|адʼюв|прилипач|пар|пав/.test(x)) return 7;
  if (/родентицид/.test(x)) return 8;
  return 1; // дефолт — гербіцид
};

// === Парсинг фасовки: "12*1л" → "1 л", "20л" → "20 л" ===
const parsePkg = (raw, unit) => {
  const s = String(raw || "").replace(/\s/g, "").toLowerCase();
  const m = s.match(/^(?:\d+\*)?(\d+(?:[.,]\d+)?)(л|кг|мл|г|т)?$/);
  if (m) {
    const qty = m[1].replace(",", ".");
    const u = m[2] || (unit || "л").toLowerCase();
    return `${qty} ${u}`;
  }
  return raw;
};

const num = (v) => {
  const s = String(v ?? "").replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
};

const detectCurrency = (v) => {
  const c = String(v ?? "").trim().toUpperCase();
  if (c === "EUR" || c.includes("ЄВР") || c.includes("ЕВР")) return "EUR";
  return "USD";
};

// === Парсимо прайс ===
const wb = xlsx.readFile(path.join(__dirname, "_price.xlsx"));
const ws = wb.Sheets["Оригінал"];
const data = xlsx.utils.sheet_to_json(ws, { header: 1, raw: false, blankrows: false });
const COL = { cat: 0, mfr: 1, name: 2, unit: 3, pkg: 4, cur: 5, priceCash: 6, priceVat: 7 };

const priceRows = [];
for (let i = 0; i < data.length; i++) {
  const row = data[i] || [];
  const mfr = String(row[COL.mfr] ?? "").trim();
  const name = String(row[COL.name] ?? "").trim();
  const priceVat = num(row[COL.priceVat]);
  if (!mfr || !name || priceVat === null || priceVat === 0) continue;
  const priceWithoutVat = num(row[COL.priceCash]);
  priceRows.push({
    rowNum: i + 1,
    category: String(row[COL.cat] ?? "").trim(),
    catDigit: categoryDigitFromText(row[COL.cat]),
    producer: mfr,
    producerCanonical: manufacturerCanonical(mfr),
    producerKey: manufacturerKey(mfr),
    name,
    rawPkg: String(row[COL.pkg] ?? "").trim(),
    pkg: parsePkg(row[COL.pkg], row[COL.unit]),
    unit: String(row[COL.unit] ?? "").trim(),
    currency: detectCurrency(row[COL.cur]),
    priceVat,
    priceWithoutVat,
    priceCashCalc: priceWithoutVat !== null ? Math.round(priceWithoutVat * 1.10 * 100) / 100 : null,
  });
}
console.log(`Прайс «Оригінал»: ${priceRows.length} робочих рядків`);

// === Читаємо наш каталог + коди ===
const productsTxt = readFileSync(path.join(root, "lib", "products.ts"), "utf8");
const catalog = [];
for (const l of productsTxt.split(/\r?\n/)) {
  if (!/^\s*\{\s*slug:/.test(l)) continue;
  const get = (re) => (l.match(re) || [, ""])[1];
  catalog.push({
    slug: get(/slug:\s*"([^"]+)"/),
    name: get(/name:\s*"([^"]+)"/),
    manufacturer: get(/manufacturer:\s*"([^"]+)"/),
    mfrKey: manufacturerKey(get(/manufacturer:\s*"([^"]+)"/)),
    packaging: get(/packaging:\s*"([^"]+)"/),
    tier: get(/tier:\s*"([^"]+)"/),
    groupSlug: get(/groupSlug:\s*"([^"]+)"/),
    group: get(/group:\s*"([^"]+)"/),
  });
}

const codesCsv = readFileSync(path.join(root, "_codes_catalog.csv"), "utf8");
const codeBySlug = {};
const slugByCode = {};
for (const line of codesCsv.replace(/^﻿/, "").split(/\r?\n/).slice(1)) {
  const m = line.match(/^(\d+),(?:"([^"]*)"|([^,]*)),(?:"[^"]*"|[^,]*),(?:[^,]*),(?:"[^"]*"|[^,]*),(.+)$/);
  if (m) {
    const code = m[1];
    const slug = m[4].trim();
    codeBySlug[slug] = code;
    slugByCode[code] = slug;
  }
}

// === Лічильники наступних вільних кодів у кожній категорії ===
const nextCode = {};
for (let d = 1; d <= 8; d++) {
  const codesInCat = Object.keys(slugByCode)
    .filter(c => c.startsWith(String(d)) && c.length === 4)
    .map(c => parseInt(c.slice(1), 10));
  const max = codesInCat.length ? Math.max(...codesInCat) : 0;
  nextCode[d] = max + 1;
}

// === Індекси для матчу в каталозі ===
const cleanName = (s) => String(s || "")
  .replace(/\b(КЕ|КС|КП|МД|РК|ВГ|ТН|FS|EC|SC|WG|SE|МКС|в\.р\.|в\.г\.|з\.п\.|к\.с\.|к\.е\.|с\.п\.|с\.е\.|с\.т\.с\.)\b/gi, "")
  .replace(/\d+(\.\d+)?\s*(г\/л|г\/кг|sl|cs|od|wp|ec|sc|wg|fs)\b/gi, "")
  .replace(/\s+/g, " ").trim();

const idxExact = new Map(); // mfrKey + normName(name) → sku[]
const idxClean = new Map();
const idxFirst = new Map(); // mfrKey + firstWord → sku[]
const addToIdx = (idx, key, sku) => { if (!idx.has(key)) idx.set(key, []); idx.get(key).push(sku); };
for (const c of catalog) {
  addToIdx(idxExact, `${c.mfrKey}||${normName(c.name)}`, c);
  addToIdx(idxClean, `${c.mfrKey}||${normName(cleanName(c.name))}`, c);
  const fw = normName(c.name.split(/\s+/)[0]);
  if (fw.length >= 4) addToIdx(idxFirst, `${c.mfrKey}||${fw}`, c);
}

const findSku = (priceRow) => {
  const k1 = `${priceRow.producerKey}||${normName(priceRow.name)}`;
  if (idxExact.has(k1)) return { sku: idxExact.get(k1)[0], q: "exact" };
  const k2 = `${priceRow.producerKey}||${normName(cleanName(priceRow.name))}`;
  if (idxClean.has(k2)) return { sku: idxClean.get(k2)[0], q: "exact" };
  const fw = normName(priceRow.name.split(/\s+/)[0]);
  const k3 = `${priceRow.producerKey}||${fw}`;
  if (idxFirst.has(k3)) {
    const arr = idxFirst.get(k3);
    if (arr.length === 1) return { sku: arr[0], q: "fuzzy" };
    const best = arr.sort((a, b) => normName(a.name).length - normName(b.name).length)[0];
    return { sku: best, q: "fuzzy" };
  }
  return null;
};

// === Головна петля: присвоюємо код кожному рядку прайсу ===
const result = [];
let stats = { existing: 0, newPkg: 0, newSku: 0, fuzzy: 0 };
const newCodesAssigned = []; // для звіту

const matchPkg = (a, b) => {
  const na = (a || "").replace(/\s+/g, "").toLowerCase();
  const nb = (b || "").replace(/\s+/g, "").toLowerCase();
  return na === nb;
};

for (const p of priceRows) {
  const found = findSku(p);
  let code = "";
  let action = "";
  let ourSlug = "", ourName = "", ourPackaging = "", ourTier = "", ourCategory = "";
  let catDigit = p.catDigit;

  if (found) {
    const sku = found.sku;
    ourSlug = sku.slug; ourName = sku.name; ourPackaging = sku.packaging;
    ourTier = sku.tier; ourCategory = sku.group;
    catDigit = CAT_DIGIT[sku.groupSlug] ?? p.catDigit;

    if (matchPkg(sku.packaging, p.pkg)) {
      // Існуючий код
      code = codeBySlug[sku.slug] || "";
      action = "existing";
      stats.existing++;
    } else {
      // Інша фасовка — новий код у тій же категорії
      const num = nextCode[catDigit]++;
      code = `${catDigit}${String(num).padStart(3, "0")}`;
      action = "new-packaging";
      stats.newPkg++;
      newCodesAssigned.push({ code, name: p.name, producer: p.producerCanonical, pkg: p.pkg, reason: `нова фасовка для ${codeBySlug[sku.slug] || "?"}` });
    }
    if (found.q === "fuzzy") { action += " (fuzzy)"; stats.fuzzy++; }
  } else {
    // Новий товар — новий код у категорії з прайсової «Група»
    const num = nextCode[catDigit]++;
    code = `${catDigit}${String(num).padStart(3, "0")}`;
    action = "new-sku";
    stats.newSku++;
    newCodesAssigned.push({ code, name: p.name, producer: p.producerCanonical, pkg: p.pkg, reason: "новий товар (нема в каталозі)" });
  }

  result.push({
    code, action, priceRow: p.rowNum,
    priceCategory: p.category, priceProducer: p.producerCanonical,
    priceName: p.name, pricePackaging: p.rawPkg, pricePkgNorm: p.pkg,
    priceVat: p.priceVat, priceWithoutVat: p.priceWithoutVat,
    priceCashCalc: p.priceCashCalc, currency: p.currency,
    ourName, ourPackaging, ourTier, ourCategory, ourSlug,
  });
}

// === Експорт CSV ===
const headers = [
  "Код", "Дія", "Назва (прайс)", "Виробник (прайс)", "Фасовка прайс", "Норм. фасовка",
  "Категорія прайс", "Ціна з ПДВ", "Без ПДВ", "Готівка ×1.10", "Валюта",
  "Назва (наша)", "Фасовка (наша)", "Tier", "Категорія наша", "Slug", "№ рядка прайсу"
];
const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const csv = [
  headers.join(","),
  ...result.sort((a, b) => Number(a.code) - Number(b.code)).map(r => [
    r.code, r.action, cell(r.priceName), cell(r.priceProducer), cell(r.pricePackaging), cell(r.pricePkgNorm),
    cell(r.priceCategory), r.priceVat ?? "", r.priceWithoutVat ?? "", r.priceCashCalc ?? "", r.currency,
    cell(r.ourName), cell(r.ourPackaging), r.ourTier, cell(r.ourCategory), cell(r.ourSlug), r.priceRow
  ].join(","))
].join("\n");
writeFileSync(path.join(root, "_price_with_codes_original.csv"), "﻿" + csv, "utf8");

// === MD підсумок ===
let md = `# Прайс з кодами — лист «Оригінал»\n\n`;
md += `Усього рядків з валідною ціною: **${result.length}**\n\n`;
md += `| Дія | К-сть | Що означає |\n|---|---|---|\n`;
md += `| ✅ existing | ${stats.existing} | Точний матч — код вже є у нас (1001-8009) |\n`;
md += `| 🆕 new-packaging | ${stats.newPkg} | Товар у нас є, але інша фасовка → новий код |\n`;
md += `| 🆕 new-sku | ${stats.newSku} | Товара взагалі нема у каталозі → новий код |\n`;
md += `| 🟠 з них fuzzy | ${stats.fuzzy} | Знайдено приблизним матчем — перевір вручну |\n\n`;

md += `## Нові коди по категоріях\n\n`;
md += `| Кат | Було | Зараз | Додано |\n|---|---|---|---|\n`;
for (let d = 1; d <= 8; d++) {
  const oldMax = Object.keys(slugByCode).filter(c => c.startsWith(String(d)) && c.length === 4)
    .map(c => parseInt(c.slice(1), 10));
  const oldCount = oldMax.length ? Math.max(...oldMax) : 0;
  const added = nextCode[d] - 1 - oldCount;
  if (added > 0) md += `| ${d}xxx (${CAT_NAME[d].uk}) | ${oldCount} | ${nextCode[d] - 1} | +${added} |\n`;
}

md += `\n## Перші 30 нових кодів\n\n`;
md += `| Код | Назва (прайс) | Виробник | Фасовка | Причина |\n|---|---|---|---|---|\n`;
for (const c of newCodesAssigned.slice(0, 30)) {
  md += `| **${c.code}** | ${c.name} | ${c.producer} | ${c.pkg} | ${c.reason} |\n`;
}
if (newCodesAssigned.length > 30) md += `\n*… і ще ${newCodesAssigned.length - 30} нових кодів — повний список у CSV.*\n`;

writeFileSync(path.join(root, "_NEW_CODES_PREVIEW.md"), md, "utf8");

console.log(`\n=== РЕЗУЛЬТАТ ===`);
console.log(`existing:       ${stats.existing}`);
console.log(`new-packaging:  ${stats.newPkg}`);
console.log(`new-sku:        ${stats.newSku}`);
console.log(`(з них fuzzy:   ${stats.fuzzy})`);
console.log(`\nВихідні файли:`);
console.log(`  _price_with_codes_original.csv  — повна таблиця прайсу з кодами`);
console.log(`  _NEW_CODES_PREVIEW.md           — статистика і зразки`);
console.log(`  (наш каталог з кодами вже у _codes_catalog.csv)`);
