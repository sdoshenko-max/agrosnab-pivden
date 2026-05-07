// Застосовує результати ресерч-агентів з _research/<vendor>.json до lib/products.ts.
// Структура research-файлу: { producer, researchedAt, items: [{slug, name, activeIngredient, activeIngredientRu, rate, source, skipReason?}] }
// Матчить за slug. Items з null AI або null rate — пропускає (лишає поле порожнім).
//
// Поля які оновлюємо: activeIngredient, activeIngredientRu, rate.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const VENDORS = ["basf", "baier", "terra-vita", "korteva", "nufarm", "fms", "upl"];

const dataBySlug = {};
let totalItems = 0, fullItems = 0, partialItems = 0, nullItems = 0;

for (const vendor of VENDORS) {
  const fp = path.join(root, "_research", `${vendor}.json`);
  const j = JSON.parse(readFileSync(fp, "utf8"));
  for (const it of j.items) {
    totalItems++;
    const hasAI = it.activeIngredient && it.activeIngredient.trim();
    const hasRate = it.rate && it.rate.trim();
    if (hasAI && hasRate) fullItems++;
    else if (hasAI || hasRate) partialItems++;
    else { nullItems++; continue; }
    dataBySlug[it.slug] = it;
  }
}
console.log(`Зчитано: ${totalItems} items (повних ${fullItems}, часткових ${partialItems}, null ${nullItems})`);
console.log(`До застосування: ${Object.keys(dataBySlug).length} slugs.`);

const productsPath = path.join(root, "lib", "products.ts");
let lines = readFileSync(productsPath, "utf8").split(/\r?\n/);

const skuLineRe = /^(\s*)\{\s*slug:\s*"([^"]+)",(.*)\}\s*,?\s*$/;

const parseSkuFields = (rest) => {
  const obj = {};
  const order = [];
  const inner = rest.replace(/^,\s*/, "").replace(/\s*$/, "");
  const parts = [];
  let buf = "", depth = 0, inS = false;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (inS) {
      buf += c;
      if (c === '"' && inner[i - 1] !== "\\") inS = false;
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
    if (m) { obj[m[1]] = m[2]; order.push(m[1]); }
  }
  return { obj, order };
};

let updatedCount = 0;
const matchedSlugs = new Set();

for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(skuLineRe);
  if (!m) continue;
  const indent = m[1];
  const slug = m[2];
  const rest = m[3];
  const data = dataBySlug[slug];
  if (!data) continue;

  const { obj: fields, order } = parseSkuFields(rest);

  let touched = false;
  if (data.activeIngredient && data.activeIngredient.trim()) {
    fields.activeIngredient = JSON.stringify(data.activeIngredient);
    touched = true;
  }
  if (data.activeIngredientRu && data.activeIngredientRu.trim()) {
    fields.activeIngredientRu = JSON.stringify(data.activeIngredientRu);
    touched = true;
  }
  if (data.rate && data.rate.trim()) {
    fields.rate = JSON.stringify(data.rate);
    touched = true;
  }

  if (!touched) continue;

  const parts = [`slug: "${slug}"`];
  for (const key of order) {
    if (key === "slug") continue;
    parts.push(`${key}: ${fields[key]}`);
  }
  lines[i] = `${indent}{ ${parts.join(", ")} },`;
  updatedCount++;
  matchedSlugs.add(slug);
}

writeFileSync(productsPath, lines.join("\n"), "utf8");

const missing = Object.keys(dataBySlug).filter(s => !matchedSlugs.has(s));
console.log(`✅ Готово.`);
console.log(`   Оновлено SKU в products.ts: ${updatedCount}`);
if (missing.length) {
  console.log(`   ⚠ Не знайдено в products.ts (${missing.length}): ${missing.slice(0, 20).join(", ")}${missing.length > 20 ? ' ...' : ''}`);
}
