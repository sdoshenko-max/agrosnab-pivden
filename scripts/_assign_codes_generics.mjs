// Парсить 14 листів дженериків з прайсу і присвоює коди:
//   existing  — точний матч з нашим каталогом за (name + manufacturer + pkg)
//   new-packaging — товар є, але інша фасовка
//   new-sku   — новий товар
//
// Виводить: _price_with_codes_generics.csv та _GENERICS_PREVIEW.md

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import xlsx from "xlsx";
import { manufacturerKey, normName } from "./_lib_normalize.mjs";
import { SHEETS, inferCategoryFromAI, isCategoryRow, CAT_DIGIT, CAT_NAME } from "./_generics_config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const num = (v) => {
  const s = String(v ?? "").replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
};

// Нормалізація фасовки. Якщо в комірці число (5) і unit невідомий — повертаємо "5 л".
const parsePkg = (raw, defaultUnit = "л") => {
  if (raw === null || raw === undefined || raw === "") return null;
  const s = String(raw).replace(/\s/g, "").toLowerCase().replace(",", ".");
  // Витягуємо число + одиницю
  const m = s.match(/^(?:\d+\*)?(\d+(?:\.\d+)?)([а-яёa-z]+)?$/);
  if (m) {
    const qty = m[1];
    let unit = m[2];
    if (!unit) unit = defaultUnit;
    if (/^кг|^kg/.test(unit)) unit = "кг";
    else if (/^л|^l/.test(unit)) unit = "л";
    else if (/^г|^gr|^g/.test(unit)) unit = "г";
    else if (/^мл|^ml/.test(unit)) unit = "мл";
    else unit = defaultUnit;
    return `${qty} ${unit}`;
  }
  return String(raw).trim();
};

const detectCurrency = (v) => {
  const c = String(v ?? "").trim().toUpperCase();
  if (c === "EUR" || c.includes("ЄВР") || c.includes("ЕВР") || c === "€") return "EUR";
  return "USD";
};

const wb = xlsx.readFile(path.join(__dirname, "_price.xlsx"));

// === Завантажуємо каталог + коди ===
const productsTxt = readFileSync(path.join(root, "lib", "products.ts"), "utf8");
const catalog = [];
for (const l of productsTxt.split(/\r?\n/)) {
  if (!/^\s*\{\s*slug:/.test(l)) continue;
  const get = (re) => (l.match(re) || [, ""])[1];
  catalog.push({
    slug: get(/slug:\s*"([^"]+)"/),
    code: get(/code:\s*"(\d+)"/),
    name: get(/name:\s*"([^"]+)"/),
    manufacturer: get(/manufacturer:\s*"([^"]+)"/),
    mfrKey: manufacturerKey(get(/manufacturer:\s*"([^"]+)"/)),
    packaging: get(/packaging:\s*"([^"]+)"/),
    tier: get(/tier:\s*"([^"]+)"/),
    groupSlug: get(/groupSlug:\s*"([^"]+)"/),
    group: get(/group:\s*"([^"]+)"/),
  });
}

// === codes by code (для пошуку нових кодів у категорії) ===
const codesCsv = readFileSync(path.join(root, "_codes_catalog.csv"), "utf8");
const slugByCode = {};
for (const line of codesCsv.replace(/^﻿/, "").split(/\r?\n/).slice(1)) {
  const m = line.match(/^(\d+),(?:"[^"]*"|[^,]*),(?:"[^"]*"|[^,]*),(?:[^,]*),(?:"[^"]*"|[^,]*),(.+)$/);
  if (m) slugByCode[m[1]] = m[6] || "";
}
const nextCode = {};
for (let d = 1; d <= 8; d++) {
  const codes = Object.keys(slugByCode)
    .filter(c => c.startsWith(String(d)) && c.length === 4)
    .map(c => parseInt(c.slice(1), 10));
  nextCode[d] = (codes.length ? Math.max(...codes) : 0) + 1;
}

const cleanName = (s) => String(s || "")
  .replace(/\b(КЕ|КС|КП|МД|РК|ВГ|ТН|FS|EC|SC|WG|SE|МКС|в\.р\.|в\.г\.|з\.п\.|к\.с\.|к\.е\.|с\.п\.|с\.е\.|с\.т\.с\.)\b/gi, "")
  .replace(/\d+(\.\d+)?\s*(г\/л|г\/кг|sl|cs|od|wp|ec|sc|wg|fs)\b/gi, "")
  .replace(/\s+/g, " ").trim();

const idxExact = new Map(); // mfrKey + normName(name) → sku[]
const idxClean = new Map();
const addToIdx = (idx, key, sku) => { if (!idx.has(key)) idx.set(key, []); idx.get(key).push(sku); };
for (const c of catalog) {
  addToIdx(idxExact, `${c.mfrKey}||${normName(c.name)}`, c);
  addToIdx(idxClean, `${c.mfrKey}||${normName(cleanName(c.name))}`, c);
}

const findSku = (mfrKey, name) => {
  const k1 = `${mfrKey}||${normName(name)}`;
  if (idxExact.has(k1)) return { sku: idxExact.get(k1)[0], q: "exact" };
  const k2 = `${mfrKey}||${normName(cleanName(name))}`;
  if (idxClean.has(k2)) return { sku: idxClean.get(k2)[0], q: "fuzzy" };
  return null;
};

const matchPkg = (a, b) => {
  const na = (a || "").replace(/\s+/g, "").toLowerCase().replace(",", ".");
  const nb = (b || "").replace(/\s+/g, "").toLowerCase().replace(",", ".");
  return na === nb;
};

// === Обробка кожного листа ===
const result = []; // CSV рядки
const stats = { total: 0, existing: 0, newPkg: 0, newSku: 0, skippedNoPrice: 0, skippedNoName: 0 };
const newCodesAssigned = [];
const perSheet = {};

for (const cfg of SHEETS) {
  const ws = wb.Sheets[cfg.sheet];
  if (!ws) { console.error(`⚠ Лист ${cfg.sheet} не знайдено`); continue; }
  const data = xlsx.utils.sheet_to_json(ws, { header: 1, raw: false, blankrows: false, defval: "" });
  let currentInlineCategory = null;
  let perSheetStats = { total: 0, existing: 0, newPkg: 0, newSku: 0 };

  for (let i = cfg.dataStart; i < data.length; i++) {
    const row = data[i] || [];
    const name = String(row[cfg.cols.name] ?? "").trim();
    if (!name) continue;

    // Категорія з inline-row?
    if (cfg.categoryFrom === "inline-row") {
      const cat = isCategoryRow(row);
      if (cat) { currentInlineCategory = cat; continue; }
    }

    // Категорія з col-A (GreenFORT)?
    let colACategory = null;
    if (cfg.categoryFrom === "col-a") {
      const cellA = String(row[cfg.cols.categoryCol] ?? "").trim();
      const cat = isCategoryRow([cellA]);
      if (cat) colACategory = cat;
    }

    // Ціни
    const priceVatRaw = num(row[cfg.cols.priceVat]);
    const priceWoVatRaw = num(row[cfg.cols.priceWoVat]);
    if (priceWoVatRaw === null && priceVatRaw === null) { stats.skippedNoPrice++; continue; }
    if (priceWoVatRaw === 0 && (priceVatRaw === 0 || priceVatRaw === null)) { stats.skippedNoPrice++; continue; }
    const priceWoVat = priceWoVatRaw ?? 0;
    let priceVat = priceVatRaw;
    if (priceVat === null && cfg.priceVatFrom === "calc") priceVat = Math.round(priceWoVat * 1.20 * 100) / 100;
    if (priceVat === null) priceVat = Math.round(priceWoVat * 1.20 * 100) / 100;
    const priceCash = Math.round(priceWoVat * 1.10 * 100) / 100;

    // Фасовка
    let pkgRaw = "";
    if (cfg.cols.pkg !== undefined) pkgRaw = row[cfg.cols.pkg];
    const pkg = parsePkg(pkgRaw) || cfg.defaultPackaging || "";

    const dr = String(row[cfg.cols.dr] ?? "").trim();
    const rate = cfg.cols.rate !== undefined ? String(row[cfg.cols.rate] ?? "").trim() : "";
    const currency = cfg.cols.currency !== undefined ? detectCurrency(row[cfg.cols.currency]) : "USD";

    // Категорія
    let categorySlug = null;
    if (cfg.categoryFrom === "inline-row") categorySlug = currentInlineCategory;
    else if (cfg.categoryFrom === "col-a") categorySlug = colACategory;
    else if (cfg.categoryFrom === "ai") categorySlug = inferCategoryFromAI(dr);
    if (!categorySlug && cfg.defaultCategory) categorySlug = cfg.defaultCategory;
    if (!categorySlug) categorySlug = "herbitsydy"; // fallback

    const mfrKey = manufacturerKey(cfg.manufacturer);
    const found = findSku(mfrKey, name);
    let action = "", code = "", ourSlug = "", ourName = "", ourPkg = "", ourTier = "";
    let catDigit = CAT_DIGIT[categorySlug];

    if (found) {
      const sku = found.sku;
      ourSlug = sku.slug; ourName = sku.name; ourPkg = sku.packaging; ourTier = sku.tier;
      catDigit = CAT_DIGIT[sku.groupSlug] ?? catDigit;
      categorySlug = sku.groupSlug; // для existing — категорія з каталогу

      if (matchPkg(sku.packaging, pkg)) {
        code = sku.code;
        action = "existing";
        stats.existing++; perSheetStats.existing++;
      } else {
        const n = nextCode[catDigit]++;
        code = `${catDigit}${String(n).padStart(3, "0")}`;
        action = "new-packaging";
        stats.newPkg++; perSheetStats.newPkg++;
        newCodesAssigned.push({ code, name, manufacturer: cfg.manufacturer, pkg, reason: `нова фасовка для ${sku.code}` });
      }
      if (found.q === "fuzzy") action += " (fuzzy)";
    } else {
      const n = nextCode[catDigit]++;
      code = `${catDigit}${String(n).padStart(3, "0")}`;
      action = "new-sku";
      stats.newSku++; perSheetStats.newSku++;
      newCodesAssigned.push({ code, name, manufacturer: cfg.manufacturer, pkg, reason: "новий товар" });
    }

    stats.total++; perSheetStats.total++;
    result.push({
      code, action, sheet: cfg.sheet,
      manufacturer: cfg.manufacturer,
      name, pkg, dr, rate,
      categorySlug, categoryName: CAT_NAME[categorySlug],
      priceVat, priceWoVat, priceCash, currency,
      ourSlug, ourName, ourPkg, ourTier,
      rowNum: i + 1,
    });
  }
  perSheet[cfg.sheet] = perSheetStats;
}

// === Експорт CSV ===
const headers = [
  "Код", "Дія", "Лист", "Виробник", "Назва (прайс)", "Фасовка", "Діюча речовина", "Норма",
  "Категорія slug", "Категорія UA",
  "Ціна з ПДВ", "Без ПДВ", "Готівка ×1.10", "Валюта",
  "Slug (наш)", "Назва (наша)", "Фасовка (наша)", "Tier",
  "№ рядка"
];
const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const csv = [
  headers.join(","),
  ...result.sort((a, b) => Number(a.code) - Number(b.code)).map(r => [
    r.code, r.action, cell(r.sheet), cell(r.manufacturer),
    cell(r.name), cell(r.pkg), cell(r.dr), cell(r.rate),
    r.categorySlug, cell(r.categoryName),
    r.priceVat ?? "", r.priceWoVat ?? "", r.priceCash ?? "", r.currency,
    cell(r.ourSlug), cell(r.ourName), cell(r.ourPkg), r.ourTier,
    r.rowNum
  ].join(","))
].join("\n");
writeFileSync(path.join(root, "_price_with_codes_generics.csv"), "﻿" + csv, "utf8");

// === Звіт ===
let md = `# Прайс дженериків — звіт парсера\n\n`;
md += `Усього робочих рядків: **${stats.total}**\n\n`;
md += `| Дія | Кількість |\n|---|---|\n`;
md += `| ✅ existing | ${stats.existing} |\n`;
md += `| 🆕 new-packaging | ${stats.newPkg} |\n`;
md += `| 🆕 new-sku | ${stats.newSku} |\n`;
md += `| ⚠ skippedNoPrice | ${stats.skippedNoPrice} |\n\n`;
md += `## По листам\n\n| Лист | Total | Existing | New-pkg | New-sku |\n|---|---|---|---|---|\n`;
for (const cfg of SHEETS) {
  const s = perSheet[cfg.sheet] || {};
  md += `| ${cfg.sheet} | ${s.total||0} | ${s.existing||0} | ${s.newPkg||0} | ${s.newSku||0} |\n`;
}
md += `\n## Перші 30 нових кодів\n\n| Код | Назва | Виробник | Фасовка | Тип |\n|---|---|---|---|---|\n`;
for (const c of newCodesAssigned.slice(0, 30)) {
  md += `| **${c.code}** | ${c.name} | ${c.manufacturer} | ${c.pkg} | ${c.reason} |\n`;
}
if (newCodesAssigned.length > 30) md += `\n*… і ще ${newCodesAssigned.length - 30} нових кодів — повний список у CSV.*\n`;
writeFileSync(path.join(root, "_GENERICS_PREVIEW.md"), md, "utf8");

console.log(`\n=== РЕЗУЛЬТАТ ===`);
console.log(`Total:           ${stats.total}`);
console.log(`existing:        ${stats.existing}`);
console.log(`new-packaging:   ${stats.newPkg}`);
console.log(`new-sku:         ${stats.newSku}`);
console.log(`skipped (price): ${stats.skippedNoPrice}`);
console.log(`\nФайли: _price_with_codes_generics.csv, _GENERICS_PREVIEW.md`);
