// Застосовує _price_with_codes_generics.csv до lib/products.ts:
//  - existing → переписує name (1:1 з прайсу). slug/code/priceVat/priceCash не чіпає.
//  - new-packaging → копіює базовий SKU, міняє slug/packaging/ціни/name/activeIngredient/rate.
//  - new-sku → нові SKU зі скелетом + activeIngredient/rate з прайсу + group/groupSlug.
//
// На відміну від оригіналів, для дженериків заповнюємо одразу д.р./норму
// (бо вони є в прайсі), cultures/stage лишаємо порожніми.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { translit, slugify, manufacturerSlug } from "./_lib_normalize.mjs";
import { normalizePkg, unitFromPkg } from "./_lib_packaging.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// === Парсинг CSV ===
const parseCsv = (text) => {
  const rows = [];
  text = text.replace(/^﻿/, "");
  let i = 0, cur = "", inQ = false, row = [];
  while (i < text.length) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"' && text[i+1] === '"') { cur += '"'; i += 2; continue; }
      if (ch === '"') { inQ = false; i++; continue; }
      cur += ch; i++; continue;
    }
    if (ch === '"') { inQ = true; i++; continue; }
    if (ch === ",") { row.push(cur); cur = ""; i++; continue; }
    if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i+1] === "\n") i++;
      row.push(cur); cur = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = []; i++; continue;
    }
    cur += ch; i++;
  }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  return rows;
};

const pkgToSlugFragment = (pkg) => String(pkg || "")
  .replace(/\s+/g, "")
  .toLowerCase()
  .replace(/\*/g, "x")
  .replace(/[.,]/g, "")
  .replace(/кг/g, "kg").replace(/гр/g, "gr")
  .replace(/мл/g, "ml").replace(/г/g, "g").replace(/л/g, "l")
  .replace(/[^a-z0-9-]/g, "");

const csvRows = parseCsv(readFileSync(path.join(root, "_price_with_codes_generics.csv"), "utf8"));
const header = csvRows.shift();
const COL = {}; header.forEach((h, i) => { COL[h] = i; });

// === products.ts ===
const productsPath = path.join(root, "lib", "products.ts");
let lines = readFileSync(productsPath, "utf8").split(/\r?\n/);

const skuLineRe = /^(\s*)\{\s*slug:\s*"([^"]+)",\s*code:\s*"(\d+)"(.*)\}\s*,?\s*$/;

const findSkuLineByCode = (code) => {
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(skuLineRe);
    if (m && m[3] === code) return i;
  }
  return -1;
};
const findSkuLineBySlug = (slug) => {
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(skuLineRe);
    if (m && m[2] === slug) return i;
  }
  return -1;
};

const parseSkuFields = (rest) => {
  const obj = {};
  const inner = rest.replace(/^,\s*/, "").replace(/\s*$/, "");
  const parts = []; let buf = "", depth = 0, inS = false;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (inS) { buf += c; if (c === '"' && inner[i-1] !== "\\") inS = false; continue; }
    if (c === '"') { inS = true; buf += c; continue; }
    if (c === '[') { depth++; buf += c; continue; }
    if (c === ']') { depth--; buf += c; continue; }
    if (c === ',' && depth === 0) { parts.push(buf.trim()); buf = ""; continue; }
    buf += c;
  }
  if (buf.trim()) parts.push(buf.trim());
  for (const p of parts) {
    const m = p.match(/^([a-zA-Z]+):\s*(.+)$/);
    if (m) obj[m[1]] = m[2];
  }
  return obj;
};

const FIELD_ORDER = [
  "name", "nameRu", "manufacturer", "tier", "group", "groupSlug",
  "activeIngredient", "activeIngredientRu", "concentration",
  "packaging", "rate", "priceVat", "priceCash", "priceOnRequest",
  "unit", "currency", "analog", "saveFromOriginal",
  "cultures", "stage", "technology", "highlight",
  "description", "descriptionRu", "image"
];

const buildSkuLine = (slug, code, fields, indent = "  ") => {
  const parts = [`slug: "${slug}"`, `code: "${code}"`];
  for (const key of FIELD_ORDER) {
    if (fields[key] === undefined) continue;
    parts.push(`${key}: ${fields[key]}`);
  }
  return `${indent}{ ${parts.join(", ")} },`;
};

const CAT_NAME = {
  herbitsydy: "Гербіцид", funhitsydy: "Фунгіцид", insektitsydy: "Інсектицид",
  protruyniky: "Протруйник", desykanty: "Десикант", regulyatory: "Регулятор росту",
  adyuvanty: "Адʼювант", rodentytsydy: "Родентицид",
};

const stats = { renameOnly: 0, existingNoChange: 0, newPkg: 0, newSku: 0, skipped: 0 };
const newSkus = [];
const newCodesCatalogRows = [];
const log = [];

for (const row of csvRows) {
  const code = row[COL["Код"]];
  const action = row[COL["Дія"]];
  const sheet = row[COL["Лист"]];
  const manufacturer = row[COL["Виробник"]];
  const priceName = row[COL["Назва (прайс)"]];
  const pkg = row[COL["Фасовка"]];
  const dr = row[COL["Діюча речовина"]];
  const rate = row[COL["Норма"]];
  const categorySlug = row[COL["Категорія slug"]];
  const categoryName = row[COL["Категорія UA"]];
  const priceVat = parseFloat(row[COL["Ціна з ПДВ"]]) || 0;
  const priceCash = parseFloat(row[COL["Готівка ×1.10"]]) || 0;
  const currency = row[COL["Валюта"]] || "USD";
  const ourSlug = row[COL["Slug (наш)"]];

  if (action.startsWith("existing")) {
    const idx = findSkuLineByCode(code);
    if (idx === -1) { log.push(`SKIP existing ${code} ${ourSlug} — code не знайдено`); stats.skipped++; continue; }
    const m = lines[idx].match(skuLineRe);
    const obj = parseSkuFields(m[4]);
    const oldName = obj.name?.replace(/^"|"$/g, "");
    if (oldName !== priceName) {
      obj.name = JSON.stringify(priceName);
      stats.renameOnly++;
    } else {
      stats.existingNoChange++;
    }
    lines[idx] = buildSkuLine(m[2], m[3], obj);

  } else if (action.startsWith("new-packaging")) {
    const baseIdx = findSkuLineBySlug(ourSlug);
    if (baseIdx === -1) { log.push(`SKIP new-pkg ${code} — base ${ourSlug} not found`); stats.skipped++; continue; }
    const baseM = lines[baseIdx].match(skuLineRe);
    const baseFields = parseSkuFields(baseM[4]);
    const baseSlug = baseM[2];
    const packagingHints = {
      name: priceName,
      activeIngredient: dr || (baseFields.activeIngredient || "").replace(/^"|"$/g, ""),
      rate: rate || (baseFields.rate || "").replace(/^"|"$/g, ""),
    };
    const normalizedPkg = normalizePkg(pkg, packagingHints);

    const mfrSlug = manufacturerSlug(manufacturer);
    const sizeFrag = pkgToSlugFragment(normalizedPkg);
    const newSlug = baseSlug; // тримаємо базовий slug — фасовка розрізняється кодом

    const newFields = { ...baseFields };
    newFields.name = JSON.stringify(priceName);
    newFields.nameRu = JSON.stringify(priceName);
    newFields.packaging = JSON.stringify(normalizedPkg);
    newFields.unit = JSON.stringify(unitFromPkg(normalizedPkg, packagingHints));
    newFields.priceVat = String(priceVat);
    newFields.priceCash = String(priceCash);
    newFields.currency = JSON.stringify(currency);
    if (dr) {
      newFields.activeIngredient = JSON.stringify(dr);
      newFields.activeIngredientRu = JSON.stringify(dr);
    }
    if (rate) newFields.rate = JSON.stringify(rate);
    delete newFields.image;

    newSkus.push({ obj: newFields, code, slug: newSlug, action, manufacturer, name: priceName, pkg: normalizedPkg, categorySlug });
    newCodesCatalogRows.push({ code, name: priceName, manufacturer, tier: baseFields.tier?.replace(/^"|"$/g, "") || "econom", group: CAT_NAME[categorySlug] || categoryName, slug: newSlug });
    stats.newPkg++;

  } else if (action.startsWith("new-sku")) {
    // Slug: <name>-<size>-<mfr>
    const mfrSlug = manufacturerSlug(manufacturer);
    const packagingHints = { name: priceName, activeIngredient: dr, rate };
    const normalizedPkg = normalizePkg(pkg, packagingHints);
    const sizeFrag = pkgToSlugFragment(normalizedPkg);
    const nameSlug = slugify(translit(priceName));
    const baseSlug = `${nameSlug}-${mfrSlug}`;
    // Якщо такий slug вже існує — додаємо розмір
    let finalSlug = baseSlug;
    if (findSkuLineBySlug(finalSlug) !== -1 && sizeFrag) {
      finalSlug = `${nameSlug}-${sizeFrag}-${mfrSlug}`;
    }

    // Tier: для дженериків econom (більшість), для оригіналів original. По замовчуванню — econom.
    const tier = "econom";

    const newFields = {
      name: JSON.stringify(priceName),
      nameRu: JSON.stringify(priceName),
      manufacturer: JSON.stringify(manufacturer),
      tier: JSON.stringify(tier),
      group: JSON.stringify(CAT_NAME[categorySlug] || "Гербіцид"),
      groupSlug: JSON.stringify(categorySlug || "herbitsydy"),
      activeIngredient: JSON.stringify(dr || ""),
      activeIngredientRu: JSON.stringify(dr || ""),
      concentration: '""',
      packaging: JSON.stringify(normalizedPkg || ""),
      rate: JSON.stringify(rate || ""),
      priceVat: String(priceVat),
      priceCash: String(priceCash),
      unit: JSON.stringify(unitFromPkg(normalizedPkg, packagingHints)),
      currency: JSON.stringify(currency),
      cultures: "[]",
      stage: "[]",
    };
    newSkus.push({ obj: newFields, code, slug: finalSlug, action, manufacturer, name: priceName, pkg: normalizedPkg, categorySlug });
    newCodesCatalogRows.push({ code, name: priceName, manufacturer, tier, group: CAT_NAME[categorySlug] || "Гербіцид", slug: finalSlug });
    stats.newSku++;
  }
}

// === Дедуплікація нових slug-ів ===
const seenSlugs = new Set();
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(skuLineRe);
  if (m) seenSlugs.add(m[2]);
}
for (const ns of newSkus) {
  if (ns.action.startsWith("new-packaging")) continue; // new-pkg → той самий slug, дублікати ОК
  let slug = ns.slug;
  let suffix = 2;
  while (seenSlugs.has(slug)) {
    slug = `${ns.slug.replace(/-\d+$/, "")}-${suffix++}`;
  }
  ns.slug = slug;
  seenSlugs.add(slug);
}
// Оновлюємо codes catalog
for (const r of newCodesCatalogRows) {
  const ns = newSkus.find(n => n.code === r.code);
  if (ns) r.slug = ns.slug;
}

// === Вставляємо нові SKU перед `];` ===
const closeIdx = lines.findIndex(l => /^\];?\s*$/.test(l));
if (closeIdx === -1) { console.error("Не знайдено `];`"); process.exit(1); }
const newLines = newSkus.map(ns => buildSkuLine(ns.slug, ns.code, ns.obj));
lines.splice(closeIdx, 0, ...newLines);

writeFileSync(productsPath, lines.join("\n"), "utf8");

// === codes_catalog.csv ===
const codesPath = path.join(root, "_codes_catalog.csv");
let codesCsv = readFileSync(codesPath, "utf8");
if (!codesCsv.endsWith("\n")) codesCsv += "\n";
const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
for (const r of newCodesCatalogRows) {
  codesCsv += [r.code, cell(r.name), cell(r.manufacturer), r.tier, cell(r.group), r.slug].join(",") + "\n";
}
writeFileSync(codesPath, codesCsv, "utf8");

// === Звіт ===
let md = `# Застосування дженериків — звіт\n\n`;
md += `## Підсумок\n\n`;
md += `| Дія | Кількість |\n|---|---|\n`;
md += `| Перейменовано (existing з різним name) | ${stats.renameOnly} |\n`;
md += `| Existing без змін (name збігається) | ${stats.existingNoChange} |\n`;
md += `| Нові SKU (нова фасовка) | ${stats.newPkg} |\n`;
md += `| Нові SKU (новий товар) | ${stats.newSku} |\n`;
md += `| Пропущено | ${stats.skipped} |\n\n`;
if (log.length) {
  md += `## Попередження\n\n`;
  for (const l of log.slice(0, 50)) md += `- ${l}\n`;
}
writeFileSync(path.join(root, "_GENERICS_APPLY_REPORT.md"), md, "utf8");

console.log(`✅ Готово.`);
console.log(`   Перейменовано:    ${stats.renameOnly}`);
console.log(`   Existing без змін: ${stats.existingNoChange}`);
console.log(`   Нові (фасовка):   ${stats.newPkg}`);
console.log(`   Нові (товар):     ${stats.newSku}`);
console.log(`   Пропущено:        ${stats.skipped}`);
