// Крок 1 reimport-плану: парсимо лист «Оригінал» прайсу → _originals_staging.json
//
// Один SKU у прайсі може мати кілька фасовок (12*1л, 4*5л) і дві ціни
// (без ПДВ = готівка, з ПДВ). Групуємо за (producer, name), зберігаємо всі
// фасовки в масиві. Diff-скрипт (крок 2) сам вирішить, яку взяти.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import xlsx from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const wb = xlsx.readFile(path.join(__dirname, "_price.xlsx"));
const ws = wb.Sheets["Оригінал"];
const data = xlsx.utils.sheet_to_json(ws, { header: 1, raw: false, blankrows: false });

const COL = { cat: 0, mfr: 1, name: 2, unit: 3, pkg: 4, cur: 5, priceCash: 6, priceVat: 7 };

const num = (v) => {
  const s = String(v ?? "").replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
};

const detectCurrency = (v) => {
  const c = String(v ?? "").trim().toUpperCase();
  if (c === "EUR" || c === "EURO" || c === "€" || c.includes("ЄВР") || c.includes("ЕВР")) return "EUR";
  if (c === "UAH" || c === "ГРН" || c.includes("ГРН")) return "UAH";
  return "USD";
};

const groups = new Map();
let scanned = 0, kept = 0, skipped = 0;

for (let i = 0; i < data.length; i++) {
  const row = data[i] || [];
  scanned++;
  const cat = String(row[COL.cat] ?? "").trim();
  const mfr = String(row[COL.mfr] ?? "").trim();
  const name = String(row[COL.name] ?? "").trim();
  const priceVat = num(row[COL.priceVat]);
  const priceCash = num(row[COL.priceCash]);
  if (!mfr || !name || priceVat === null || priceVat === 0) { skipped++; continue; }

  const key = `${mfr}||${name}`;
  if (!groups.has(key)) {
    groups.set(key, {
      producer: mfr,
      category: cat,
      name,
      unit: String(row[COL.unit] ?? "").trim(),
      packagings: [],
    });
  }
  groups.get(key).packagings.push({
    sourceRow: i + 1,
    packaging: String(row[COL.pkg] ?? "").trim(),
    currency: detectCurrency(row[COL.cur]),
    priceVat,
    priceCash,
  });
  kept++;
}

const staging = [...groups.values()].sort((a, b) => {
  if (a.producer !== b.producer) return a.producer.localeCompare(b.producer, "uk");
  return a.name.localeCompare(b.name, "uk");
});

const summary = {};
for (const g of staging) summary[g.producer] = (summary[g.producer] || 0) + 1;

const out = {
  source: "Прайс_05.04.26.xlsx, лист Оригінал",
  generatedAt: new Date().toISOString(),
  scannedRows: scanned,
  keptRows: kept,
  skippedRows: skipped,
  uniqueSkus: staging.length,
  byProducer: summary,
  skus: staging,
};

writeFileSync(path.join(root, "_originals_staging.json"), JSON.stringify(out, null, 2), "utf8");

console.log(`Сканування: ${scanned} рядків, збережено ${kept}, пропущено ${skipped}`);
console.log(`Унікальних SKU (groupBy producer+name): ${staging.length}`);
console.log(`По виробниках:`);
for (const [p, c] of Object.entries(summary).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${p}: ${c}`);
}
console.log(`\nАртефакт: _originals_staging.json`);
