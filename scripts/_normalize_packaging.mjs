// Міграційний скрипт: проблеми №2 + №3 + №4.
//
// 1. Нормалізує `packaging` для всіх SKU (4*5л. → 5 л; 0,25кг → 0.25 кг; 500гр → 500 г).
// 2. Виправляє `unit` за нормалізованою фасовкою (г|гр→кг; мл→л).
// 3. Знаходить дублі (slug + normPkg + manufacturer) — лишає менший код, видаляє інші.
// 4. Додає 301 редіректи у public/_redirects.
// 5. Оновлює _codes_catalog.csv (прибирає рядки видалених кодів).

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizePkg, unitFromPkg } from "./_lib_packaging.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// === products.ts ===
const productsPath = path.join(root, "lib", "products.ts");
const lines = readFileSync(productsPath, "utf8").split(/\r?\n/);
const skuLineRe = /^(\s*)\{\s*slug:\s*"([^"]+)",\s*code:\s*"(\d+)"(.*)\}\s*,?\s*$/;

const parseFields = (rest) => {
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

const buildLine = (slug, code, fields, indent = "  ") => {
  const parts = [`slug: "${slug}"`, `code: "${code}"`];
  for (const key of FIELD_ORDER) {
    if (fields[key] === undefined) continue;
    parts.push(`${key}: ${fields[key]}`);
  }
  return `${indent}{ ${parts.join(", ")} },`;
};

const unquote = (value) => String(value || "").replace(/^"|"$/g, "");
const packagingHintsFromFields = (fields) => ({
  name: unquote(fields.name),
  activeIngredient: unquote(fields.activeIngredient),
  rate: unquote(fields.rate),
});

// === Прохід 1: нормалізація packaging + unit ===
const skuList = []; // [{lineIdx, slug, code, fields, pkgOriginal, pkgNormalized}]
let renamedPkg = 0;
let fixedUnit = 0;

for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(skuLineRe);
  if (!m) continue;
  const slug = m[2], code = m[3];
  const fields = parseFields(m[4]);
  const pkgOld = (fields.packaging || '""').replace(/^"|"$/g, "");
  const packagingHints = packagingHintsFromFields(fields);
  const pkgNew = normalizePkg(pkgOld, packagingHints);
  const unitOld = (fields.unit || '"л"').replace(/^"|"$/g, "");
  const unitNew = unitFromPkg(pkgNew, packagingHints);
  if (pkgOld !== pkgNew) { fields.packaging = JSON.stringify(pkgNew); renamedPkg++; }
  if (unitOld !== unitNew) { fields.unit = JSON.stringify(unitNew); fixedUnit++; }
  skuList.push({ lineIdx: i, slug, code, fields, pkgNew, manufacturer: (fields.manufacturer || '""').replace(/^"|"$/g, "") });
}

// === Прохід 2: знайти дублі (slug + manufacturer + packaging) ===
const groups = new Map();
for (const s of skuList) {
  const key = `${s.slug}|||${s.manufacturer}|||${s.pkgNew}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(s);
}
const dupGroups = Array.from(groups.values()).filter(g => g.length > 1);

const toDelete = []; // {code, lineIdx, keptCode, slug}
for (const grp of dupGroups) {
  // Сортуємо за code asc — менший код = canonical (старіший)
  grp.sort((a, b) => Number(a.code) - Number(b.code));
  const kept = grp[0];
  for (let i = 1; i < grp.length; i++) {
    toDelete.push({ code: grp[i].code, lineIdx: grp[i].lineIdx, keptCode: kept.code, slug: kept.slug });
  }
}

// Видаляємо дублі (з кінця, щоб індекси не зсувалися)
const toDeleteIdx = new Set(toDelete.map(d => d.lineIdx));
const newLines = lines.filter((_, i) => !toDeleteIdx.has(i));

// === Прохід 3: переписати рядки SKU що залишилися ===
for (let i = 0; i < newLines.length; i++) {
  const m = newLines[i].match(skuLineRe);
  if (!m) continue;
  const slug = m[2], code = m[3];
  const fields = parseFields(m[4]);
  const pkgOld = (fields.packaging || '""').replace(/^"|"$/g, "");
  const packagingHints = packagingHintsFromFields(fields);
  const pkgNew = normalizePkg(pkgOld, packagingHints);
  const unitNew = unitFromPkg(pkgNew, packagingHints);
  if (pkgOld !== pkgNew) fields.packaging = JSON.stringify(pkgNew);
  fields.unit = JSON.stringify(unitNew);
  newLines[i] = buildLine(slug, code, fields, m[1]);
}

writeFileSync(productsPath, newLines.join("\n"), "utf8");

// === Оновлюємо _codes_catalog.csv ===
const codesPath = path.join(root, "_codes_catalog.csv");
let codesCsv = readFileSync(codesPath, "utf8");
const deletedCodes = new Set(toDelete.map(d => d.code));
const codesLines = codesCsv.split(/\r?\n/);
const newCodesLines = codesLines.filter(l => {
  const m = l.match(/^(\d+),/);
  return !m || !deletedCodes.has(m[1]);
});
writeFileSync(codesPath, newCodesLines.join("\n"), "utf8");

// === Додаємо 301-редіректи у public/_redirects ===
const redirectsPath = path.join(root, "public", "_redirects");
let redirects = readFileSync(redirectsPath, "utf8");
if (!redirects.endsWith("\n")) redirects += "\n";
redirects += "\n# Auto-generated 2026-05-06: дедуплікація фасовок (Проблеми №3+№4)\n";
for (const d of toDelete) {
  redirects += `/produkt/${d.slug}/${d.code}/    /produkt/${d.slug}/${d.keptCode}/    301\n`;
  redirects += `/ru/produkt/${d.slug}/${d.code}/ /ru/produkt/${d.slug}/${d.keptCode}/ 301\n`;
}
writeFileSync(redirectsPath, redirects, "utf8");

// === Звіт ===
let md = `# Міграція: нормалізація фасовки + дедуплікація\n\n`;
md += `## Підсумок\n\n`;
md += `| Дія | Кількість |\n|---|---|\n`;
md += `| SKU з нормалізованою фасовкою | ${renamedPkg} |\n`;
md += `| SKU з виправленим unit | ${fixedUnit} |\n`;
md += `| Груп дублів знайдено | ${dupGroups.length} |\n`;
md += `| SKU видалено (дублі) | ${toDelete.length} |\n\n`;
md += `## Видалені дублі\n\n`;
md += `| Slug | Видалений код | Залишений код | Фасовка |\n|---|---|---|---|\n`;
for (const d of toDelete.slice(0, 100)) {
  md += `| ${d.slug} | ${d.code} | ${d.keptCode} | (див. каталог) |\n`;
}
if (toDelete.length > 100) md += `\n*… і ще ${toDelete.length - 100}.*\n`;
writeFileSync(path.join(root, "_PACKAGING_MIGRATION_REPORT.md"), md, "utf8");

console.log(`✅ Готово.`);
console.log(`   Нормалізовано packaging: ${renamedPkg}`);
console.log(`   Виправлено unit:         ${fixedUnit}`);
console.log(`   Груп дублів:             ${dupGroups.length}`);
console.log(`   SKU видалено:            ${toDelete.length}`);
console.log(`   Редіректи додано:        ${toDelete.length * 2} (UA + RU)`);
