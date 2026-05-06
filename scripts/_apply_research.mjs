// Застосовує результати ресерч-агентів з _research_temp/*.json до lib/products.ts.
// Для кожного SKU за `code`: оновлює activeIngredient, activeIngredientRu,
// concentration, rate, cultures, stage. Поля що мали NOT_FOUND — пропускає
// (лишає порожніми, як було).

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// === Збираємо всі дані з _research_temp/ ===
const tempDir = path.join(root, "_research_temp");
const dataByCode = {};
let totalRecords = 0;
let notFoundCount = 0;
for (const f of readdirSync(tempDir)) {
  if (!f.endsWith(".json")) continue;
  const arr = JSON.parse(readFileSync(path.join(tempDir, f), "utf8"));
  for (const r of arr) {
    if (!r.code) continue;
    if (r.activeIngredient === "NOT_FOUND") { notFoundCount++; continue; }
    dataByCode[r.code] = r;
    totalRecords++;
  }
}
console.log(`Зчитано ${totalRecords} записів з ${readdirSync(tempDir).length} файлів (NOT_FOUND: ${notFoundCount})`);

// === Завантажуємо products.ts ===
const productsPath = path.join(root, "lib", "products.ts");
let lines = readFileSync(productsPath, "utf8").split(/\r?\n/);

const skuLineRe = /^(\s*)\{\s*slug:\s*"([^"]+)",\s*code:\s*"(\d+)"(.*)\}\s*,?\s*$/;

// Парсинг полів усередині рядка SKU (повертає об'єкт key→raw_value-string)
const parseSkuFields = (rest) => {
  const obj = {};
  const inner = rest.replace(/^,\s*/, "").replace(/\s*$/, "");
  const parts = [];
  let buf = "", depth = 0, inS = false;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (inS) {
      buf += c;
      if (c === '"' && inner[i-1] !== "\\") inS = false;
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
    if (m) obj[m[1]] = m[2];
  }
  return obj;
};

// Поля у фіксованому порядку — як у поточних SKU
const FIELD_ORDER = [
  "name", "nameRu", "manufacturer", "tier", "group", "groupSlug",
  "activeIngredient", "activeIngredientRu", "concentration",
  "packaging", "rate", "priceVat", "priceCash", "priceOnRequest",
  "unit", "currency", "analog", "saveFromOriginal",
  "cultures", "stage", "technology", "highlight",
  "description", "descriptionRu", "image"
];

let updated = 0;
let missingInProducts = [];

for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(skuLineRe);
  if (!m) continue;
  const indent = m[1];
  const slug = m[2];
  const code = m[3];
  const rest = m[4];

  const data = dataByCode[code];
  if (!data) continue;

  const fields = parseSkuFields(rest);

  // Застосовуємо нові значення, якщо вони не порожні
  if (data.activeIngredient && data.activeIngredient !== "") fields.activeIngredient = JSON.stringify(data.activeIngredient);
  if (data.activeIngredientRu && data.activeIngredientRu !== "") fields.activeIngredientRu = JSON.stringify(data.activeIngredientRu);
  if (data.concentration && data.concentration !== "") fields.concentration = JSON.stringify(data.concentration);
  if (data.rate && data.rate !== "") fields.rate = JSON.stringify(data.rate);
  if (Array.isArray(data.cultures)) fields.cultures = `[${data.cultures.map(c => `"${c}"`).join(", ")}]`;
  if (Array.isArray(data.stage)) fields.stage = `[${data.stage.map(s => `"${s}"`).join(", ")}]`;

  // Збираємо рядок назад
  const parts = [`slug: "${slug}"`, `code: "${code}"`];
  for (const key of FIELD_ORDER) {
    if (fields[key] === undefined) continue;
    parts.push(`${key}: ${fields[key]}`);
  }
  lines[i] = `${indent}{ ${parts.join(", ")} },`;
  updated++;
  delete dataByCode[code];
}

for (const code of Object.keys(dataByCode)) {
  missingInProducts.push(code);
}

writeFileSync(productsPath, lines.join("\n"), "utf8");

console.log(`✅ Готово.`);
console.log(`   Оновлено SKU: ${updated}`);
if (missingInProducts.length) {
  console.log(`   ⚠ Не знайдено в products.ts (з research): ${missingInProducts.join(", ")}`);
}
