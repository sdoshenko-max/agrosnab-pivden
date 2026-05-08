// Застосовує прайс «Оригінал» до каталогу:
// 1. Для existing — переписує `name` (1:1 з прайсу).
// 2. Для new-packaging — створює новий SKU копіюванням базового + зміна фасовки/ціни/назви/slug.
// 3. Для new-sku — створює SKU зі скелетом (порожні activeIngredient/rate/cultures/stage).
// Виправляє хибно класифіковані fuzzy (нормалізує фасовку перед порівнянням).

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { translit, slugify, manufacturerSlug } from "./_lib_normalize.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const CAT_FROM_DIGIT = {
  "1": { group: "Гербіцид",       groupSlug: "herbitsydy" },
  "2": { group: "Фунгіцид",       groupSlug: "funhitsydy" },
  "3": { group: "Інсектицид",     groupSlug: "insektitsydy" },
  "4": { group: "Протруйник",     groupSlug: "protruyniky" },
  "5": { group: "Десикант",       groupSlug: "desykanty" },
  "6": { group: "Регулятор росту", groupSlug: "regulyatory" },
  "7": { group: "Адʼювант",       groupSlug: "adyuvanty" },
  "8": { group: "Родентицид",     groupSlug: "rodentytsydy" },
};

// Нормалізація фасовки для матчу: "0,25 кг" === "0.25 кг", "5л" === "5 л"
const normPkg = (raw) => String(raw || "")
  .replace(/\s+/g, "")
  .toLowerCase()
  .replace(",", ".");

// Розмір фасовки для slug: "5 л" → "5l", "0.25 кг" → "025kg", "20*250гр" → "20x250gr"
const pkgToSlugFragment = (pkg) => {
  return String(pkg || "")
    .replace(/\s+/g, "")
    .toLowerCase()
    .replace(/\*/g, "x")
    .replace(/[.,]/g, "")
    .replace(/л\b/g, "l")
    .replace(/кг\b/g, "kg")
    .replace(/гр\b/g, "gr")
    .replace(/г\b/g, "g")
    .replace(/[^a-z0-9-]/g, "");
};

const unitFromPkg = (pkg) => {
  const x = String(pkg || "").toLowerCase();
  if (/кг|гр|\bг\b/.test(x)) return "кг";
  return "л";
};

// === Парсинг CSV (просто, з підтримкою quoted) ===
const parseCsv = (text) => {
  const lines = [];
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

const csvText = readFileSync(path.join(root, "_price_with_codes_original.csv"), "utf8");
const csvRows = parseCsv(csvText);
const header = csvRows.shift();
const COL = {};
header.forEach((h, idx) => { COL[h] = idx; });

// === Завантажуємо products.ts ===
const productsPath = path.join(root, "lib", "products.ts");
let productsText = readFileSync(productsPath, "utf8");
const lines = productsText.split(/\r?\n/);

// Витягуємо всі SKU з регулярки
const skuLineRe = /^(\s*)\{\s*slug:\s*"([^"]+)".*\}\s*,?\s*$/;

const findSkuLine = (slug) => {
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(skuLineRe);
    if (m && m[2] === slug) return i;
  }
  return -1;
};

// Парсимо повну строку SKU у об'єкт полів (зберігаємо все, що є)
const parseSkuLine = (line) => {
  const obj = { _line: line };
  // Ловимо пари key: value (значення може бути "string", number, boolean, [array])
  const inner = line.replace(/^\s*\{\s*/, "").replace(/\s*\},?\s*$/, "");
  // Ділимо по ", " на верхньому рівні (з врахуванням [] і "")
  const parts = [];
  let buf = "", depth = 0, inS = false;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (inS) {
      buf += c;
      if (c === '"' && inner[i-1] !== '\\') inS = false;
      continue;
    }
    if (c === '"') { inS = true; buf += c; continue; }
    if (c === '[') { depth++; buf += c; continue; }
    if (c === ']') { depth--; buf += c; continue; }
    if (c === ',' && depth === 0) { parts.push(buf.trim()); buf = ""; continue; }
    buf += c;
  }
  if (buf.trim()) parts.push(buf.trim());
  for (const p of parts) {
    const m = p.match(/^([a-zA-Z]+):\s*(.+)$/);
    if (!m) continue;
    obj[m[1]] = m[2];
  }
  return obj;
};

// Будуємо SKU-строку з об'єкта (порядок полів — як у поточних SKU)
const FIELD_ORDER = [
  "slug", "name", "nameRu", "manufacturer", "tier", "group", "groupSlug",
  "activeIngredient", "activeIngredientRu", "concentration",
  "packaging", "rate", "priceVat", "priceCash", "priceOnRequest",
  "unit", "currency", "analog", "saveFromOriginal",
  "cultures", "stage", "technology", "highlight",
  "description", "descriptionRu", "image"
];

const buildSkuLine = (obj, indent = "  ") => {
  const fields = [];
  for (const key of FIELD_ORDER) {
    if (obj[key] === undefined || obj[key] === null || obj[key] === "_line") continue;
    fields.push(`${key}: ${obj[key]}`);
  }
  return `${indent}{ ${fields.join(", ")} },`;
};

// === Прохід по CSV ===
const stats = { existing: 0, renameOnly: 0, newPkg: 0, newSku: 0, skipped: 0 };
const renames = []; // {slug, oldName, newName}
const newSkus = []; // {sku-object, code}
const log = [];

const newCodesCatalogRows = []; // нові рядки в _codes_catalog.csv

for (const row of csvRows) {
  const code      = row[COL["Код"]];
  let action      = row[COL["Дія"]];
  const priceName = row[COL["Назва (прайс)"]];
  const priceMfr  = row[COL["Виробник (прайс)"]];
  const rawPkg    = row[COL["Фасовка прайс"]];
  const normPkgPrice = row[COL["Норм. фасовка"]];
  const priceCat  = row[COL["Категорія прайс"]];
  const priceVat  = parseFloat(row[COL["Ціна з ПДВ"]]);
  const priceWoVat = parseFloat(row[COL["Без ПДВ"]]);
  const priceCash = priceWoVat ? Math.round(priceWoVat * 1.10 * 100) / 100 : 0;
  const currency  = row[COL["Валюта"]] || "USD";
  const ourSlug   = row[COL["Slug"]];
  const ourPkg    = row[COL["Фасовка (наша)"]];

  // Виправлення fuzzy: якщо нормалізовані фасовки збігаються — переводимо в existing
  const sameFasovka = normPkg(normPkgPrice) === normPkg(ourPkg);
  if (action.includes("fuzzy") && action.startsWith("new-packaging") && sameFasovka) {
    action = "existing (fuzzy-corrected)";
  }
  if (action.includes("fuzzy") && action.startsWith("existing") && !sameFasovka) {
    action = "new-packaging (fuzzy-promoted)";
  }

  if (action.startsWith("existing")) {
    // Переписуємо name
    const idx = findSkuLine(ourSlug);
    if (idx === -1) {
      log.push(`SKIP existing ${code} ${ourSlug} — slug не знайдено в products.ts`);
      stats.skipped++;
      continue;
    }
    const obj = parseSkuLine(lines[idx]);
    const oldName = obj.name?.replace(/^"|"$/g, "");
    const newName = priceName;
    if (oldName !== newName) {
      obj.name = JSON.stringify(newName);
      renames.push({ slug: ourSlug, oldName, newName, code });
      stats.renameOnly++;
    } else {
      stats.existing++;
    }
    lines[idx] = buildSkuLine(obj);
  } else if (action.startsWith("new-packaging")) {
    const baseIdx = findSkuLine(ourSlug);
    let baseObj = null;
    if (baseIdx !== -1) baseObj = parseSkuLine(lines[baseIdx]);
    if (!baseObj) {
      log.push(`SKIP new-pkg ${code} ${ourSlug} — базовий slug не знайдено`);
      stats.skipped++;
      continue;
    }
    // Копіюємо базовий, замінюємо потрібні поля
    // ВАЖЛИВО: slug у нової фасовки = базовий slug (1:1), без додавання sizeFrag.
    // Так компонент ProductPage збирає варіанти `p.slug === product.slug` і малює перемикач фасовки.
    // Розрізняє варіанти `code`, не slug. Дедуплікація нижче пропускає такі new-packaging-колізії.
    const newObj = { ...baseObj };
    const newSlug = baseObj.slug.replace(/^"|"$/g, "");
    newObj.slug = JSON.stringify(newSlug);
    newObj.name = JSON.stringify(priceName);
    newObj.nameRu = JSON.stringify(priceName);
    newObj.packaging = JSON.stringify(normPkgPrice);
    newObj.unit = JSON.stringify(unitFromPkg(normPkgPrice));
    newObj.priceVat = String(priceVat);
    newObj.priceCash = String(priceCash);
    newObj.currency = JSON.stringify(currency);
    delete newObj.image; // нова фасовка без фото
    delete newObj._line;
    newSkus.push({ obj: newObj, code, action, baseSlug: ourSlug, keepBaseSlug: true });
    newCodesCatalogRows.push({
      code,
      name: priceName,
      manufacturer: baseObj.manufacturer?.replace(/^"|"$/g, "") || "",
      tier: "original",
      group: baseObj.group?.replace(/^"|"$/g, "") || "",
      slug: newSlug,
    });
    stats.newPkg++;
  } else if (action.startsWith("new-sku")) {
    const cat = CAT_FROM_DIGIT[code[0]];
    const mfrSlug = manufacturerSlug(priceMfr);
    const sizeFrag = pkgToSlugFragment(normPkgPrice);
    const nameSlugBase = slugify(translit(priceName));
    const newSlug = `${nameSlugBase}-${sizeFrag}-${mfrSlug}`;
    const newObj = {
      slug: JSON.stringify(newSlug),
      name: JSON.stringify(priceName),
      nameRu: JSON.stringify(priceName),
      manufacturer: JSON.stringify(priceMfr),
      tier: '"original"',
      group: JSON.stringify(cat?.group || "Гербіцид"),
      groupSlug: JSON.stringify(cat?.groupSlug || "herbitsydy"),
      activeIngredient: '""',
      activeIngredientRu: '""',
      concentration: '""',
      packaging: JSON.stringify(normPkgPrice),
      rate: '""',
      priceVat: String(priceVat),
      priceCash: String(priceCash),
      unit: JSON.stringify(unitFromPkg(normPkgPrice)),
      currency: JSON.stringify(currency),
      cultures: "[]",
      stage: "[]",
    };
    newSkus.push({ obj: newObj, code, action, baseSlug: null });
    newCodesCatalogRows.push({
      code,
      name: priceName,
      manufacturer: priceMfr,
      tier: "original",
      group: cat?.group || "Гербіцид",
      slug: newSlug,
    });
    stats.newSku++;
  }
}

// === Дедуплікація нових slug-ів (раптом колізії) ===
// Виняток: new-packaging навмисно ділить slug із базовим SKU (це і є зв'язка варіантів) — не суфіксуємо.
const seenSlugs = new Set();
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(skuLineRe);
  if (m) seenSlugs.add(m[2]);
}
for (const ns of newSkus) {
  let slug = ns.obj.slug.replace(/^"|"$/g, "");
  if (ns.keepBaseSlug) {
    ns.finalSlug = slug;
    continue;
  }
  let suffix = 2;
  while (seenSlugs.has(slug)) {
    slug = `${slug.replace(/-\d+$/, "")}-${suffix++}`;
  }
  ns.obj.slug = JSON.stringify(slug);
  ns.finalSlug = slug;
  seenSlugs.add(slug);
}
// Оновлюємо новий codes_catalog (slug міг змінитися)
for (const r of newCodesCatalogRows) {
  const ns = newSkus.find(n => n.code === r.code);
  if (ns) r.slug = ns.finalSlug;
}

// === Вставляємо нові SKU перед закриваючою `];` ===
const closeIdx = lines.findIndex(l => /^\];?\s*$/.test(l));
if (closeIdx === -1) {
  console.error("Не знайшов закриваючу `];` у products.ts");
  process.exit(1);
}
const newLines = newSkus.map(ns => buildSkuLine(ns.obj));
lines.splice(closeIdx, 0, ...newLines);

// === Перевірка: кому в кінці останнього рядка SKU ===
// Останній SKU перед `];` має закінчуватися комою — все ок (buildSkuLine завжди ставить кому)

// === Записуємо ===
writeFileSync(productsPath, lines.join("\n"), "utf8");

// === Оновлюємо _codes_catalog.csv ===
const codesPath = path.join(root, "_codes_catalog.csv");
let codesCsv = readFileSync(codesPath, "utf8");
if (!codesCsv.endsWith("\n")) codesCsv += "\n";
const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
for (const r of newCodesCatalogRows) {
  codesCsv += [r.code, cell(r.name), cell(r.manufacturer), r.tier, cell(r.group), r.slug].join(",") + "\n";
}
writeFileSync(codesPath, codesCsv, "utf8");

// === Лог ===
let md = `# Застосування прайсу до каталогу — звіт\n\n`;
md += `## Підсумок\n\n`;
md += `| Дія | Кількість |\n|---|---|\n`;
md += `| Перейменовано (existing з різним name) | ${stats.renameOnly} |\n`;
md += `| Existing без змін (name вже збігається) | ${stats.existing} |\n`;
md += `| Нові SKU (нова фасовка) | ${stats.newPkg} |\n`;
md += `| Нові SKU (новий товар) | ${stats.newSku} |\n`;
md += `| Пропущено | ${stats.skipped} |\n\n`;
md += `## Перейменування (топ 30)\n\n`;
md += `| Код | Slug | Стара назва | Нова назва (з прайсу) |\n|---|---|---|---|\n`;
for (const r of renames.slice(0, 30)) {
  md += `| ${r.code} | ${r.slug} | ${r.oldName} | ${r.newName} |\n`;
}
if (renames.length > 30) md += `\n*… і ще ${renames.length - 30}.*\n`;
md += `\n## Нові SKU\n\n`;
md += `| Код | Slug | Назва | Фасовка | Тип |\n|---|---|---|---|---|\n`;
for (const ns of newSkus) {
  md += `| ${ns.code} | ${ns.finalSlug} | ${ns.obj.name.replace(/^"|"$/g, "")} | ${ns.obj.packaging.replace(/^"|"$/g, "")} | ${ns.action} |\n`;
}
if (log.length) {
  md += `\n## Попередження\n\n`;
  for (const l of log) md += `- ${l}\n`;
}
writeFileSync(path.join(root, "_PRICE_APPLY_REPORT.md"), md, "utf8");

console.log(`✅ Готово.`);
console.log(`   Перейменовано: ${stats.renameOnly}`);
console.log(`   Без змін: ${stats.existing}`);
console.log(`   Нових (фасовка): ${stats.newPkg}`);
console.log(`   Нових (товар): ${stats.newSku}`);
console.log(`   Пропущено: ${stats.skipped}`);
console.log(`   Файли: lib/products.ts, _codes_catalog.csv, _PRICE_APPLY_REPORT.md`);
