// Варіант A: URL = /produkt/<slug>/<code>/
// 1. Додає поле `code` кожному SKU (з _codes_catalog.csv).
// 2. Для нових SKU (new-packaging — нова фасовка існуючого товару) перейменовує
//    slug на базовий, щоб під одним slug жили всі фасовки одного продукта.
// 3. New-sku (новий товар) — slug лишає як є.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

// === codes catalog: slug → code ===
const codesRows = parseCsv(readFileSync(path.join(root, "_codes_catalog.csv"), "utf8"));
codesRows.shift();
const codeBySlug = {};
for (const r of codesRows) {
  const code = r[0]; const slug = r[5];
  if (slug) codeBySlug[slug] = code;
}

// === price with codes: для new-packaging ourSlug = базовий slug ===
const priceRows = parseCsv(readFileSync(path.join(root, "_price_with_codes_original.csv"), "utf8"));
const priceHeader = priceRows.shift();
const PCOL = {}; priceHeader.forEach((h, i) => { PCOL[h] = i; });

// Map нового_slug → базовий_slug (для new-packaging)
// Ключ — це поточний slug у lib/products.ts (наприклад apollo-kc-5-adama),
// значення — базовий slug (apollo-kc-adama).
// Будуємо через зворотний мапинг: за кодом 3152 знаходимо в CSV рядок, дивимось ourSlug.
const baseBycode = {};
for (const r of priceRows) {
  const code = r[PCOL["Код"]];
  const action = r[PCOL["Дія"]];
  const ourSlug = r[PCOL["Slug"]];
  if (action.startsWith("new-packaging") && ourSlug) {
    baseBycode[code] = ourSlug;
  }
}

// === Завантажуємо products.ts ===
const productsPath = path.join(root, "lib", "products.ts");
let lines = readFileSync(productsPath, "utf8").split(/\r?\n/);

const skuLineRe = /^(\s*)\{\s*slug:\s*"([^"]+)"(.*)\}\s*,?\s*$/;

let renamedSlug = 0;
let addedCode = 0;
let missingCode = [];

for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(skuLineRe);
  if (!m) continue;
  const indent = m[1];
  let currentSlug = m[2];
  const rest = m[3];

  let code = codeBySlug[currentSlug];
  if (!code) {
    missingCode.push(currentSlug);
    continue;
  }
  // Якщо це new-packaging — перейменувати slug на базовий
  let finalSlug = currentSlug;
  if (baseBycode[code]) {
    finalSlug = baseBycode[code];
    renamedSlug++;
  }

  // Якщо поле `code:` уже є — пропускаємо. Інакше додаємо одразу після slug.
  if (rest.includes("code:")) {
    // оновлюємо тільки slug якщо змінився
    if (finalSlug !== currentSlug) {
      lines[i] = `${indent}{ slug: "${finalSlug}"${rest}},`;
    }
    continue;
  }
  // Додаємо `code:` зразу після `slug:`
  lines[i] = `${indent}{ slug: "${finalSlug}", code: "${code}"${rest}},`;
  addedCode++;
}

writeFileSync(productsPath, lines.join("\n"), "utf8");

console.log(`✅ Готово.`);
console.log(`   Додано code:        ${addedCode}`);
console.log(`   Перейменовано slug: ${renamedSlug} (нові фасовки → базовий slug)`);
if (missingCode.length) console.log(`   ⚠ Без коду: ${missingCode.length} (${missingCode.slice(0,5).join(", ")}...)`);
