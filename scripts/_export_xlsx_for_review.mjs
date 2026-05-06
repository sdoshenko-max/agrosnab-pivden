// Збираємо xlsx-файл для зручної перевірки в Excel.
// Один файл, два листи:
//   1) "Наш каталог" — всі SKU з кодами (з _codes_catalog.csv)
//   2) "Прайс" — об'єднані рядки оригіналів + дженериків (з _price_with_codes_original.csv
//      і _price_with_codes_generics.csv) з присвоєними кодами. Спільні колонки.
// Excel відкриває нативно — фільтри, сортування, без проблем з кодуванням і роздільниками.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import xlsx from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// === Парсинг CSV (з підтримкою лапок) ===
const parseCsvLine = (line) => {
  const out = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') { inQ = false; }
      else { cur += c; }
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { out.push(cur); cur = ""; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
};

const readCsv = (file) => {
  const text = readFileSync(path.join(root, file), "utf8").replace(/^﻿/, "");
  const lines = text.split(/\r?\n/).filter(l => l.length > 0);
  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map(parseCsvLine);
  return { headers, rows };
};

// === Лист 1: наш каталог ===
const catalog = readCsv("_codes_catalog.csv");

// === Лист 2: прайс (Оригінал + дженерики) ===
const orig = readCsv("_price_with_codes_original.csv");
const gen = readCsv("_price_with_codes_generics.csv");

// Спільні колонки (порядок) — зберігає історичний layout «Прайс Оригінал»,
// додано «Лист», «Діюча речовина», «Норма» (для дженериків). Для оригіналу
// «Лист» = «Оригінал», «Діюча речовина» і «Норма» порожні.
const PRICE_HEADERS = [
  "Код", "Дія", "Лист",
  "Назва (прайс)", "Виробник (прайс)",
  "Фасовка прайс", "Норм. фасовка", "Категорія прайс",
  "Діюча речовина", "Норма",
  "Ціна з ПДВ", "Без ПДВ", "Готівка ×1.10", "Валюта",
  "Назва (наша)", "Фасовка (наша)", "Tier", "Категорія наша",
  "Slug", "№ рядка прайсу",
];

// Helper: вибрати з рядка значення за заголовком
const get = (row, headers, name) => {
  const idx = headers.indexOf(name);
  return idx === -1 ? "" : (row[idx] ?? "");
};

const priceRows = [];

// З оригіналу
for (const r of orig.rows) {
  priceRows.push([
    get(r, orig.headers, "Код"),
    get(r, orig.headers, "Дія"),
    "Оригінал",
    get(r, orig.headers, "Назва (прайс)"),
    get(r, orig.headers, "Виробник (прайс)"),
    get(r, orig.headers, "Фасовка прайс"),
    get(r, orig.headers, "Норм. фасовка"),
    get(r, orig.headers, "Категорія прайс"),
    "", // Діюча речовина — для оригіналу не заповнено в прайсі
    "", // Норма
    get(r, orig.headers, "Ціна з ПДВ"),
    get(r, orig.headers, "Без ПДВ"),
    get(r, orig.headers, "Готівка ×1.10"),
    get(r, orig.headers, "Валюта"),
    get(r, orig.headers, "Назва (наша)"),
    get(r, orig.headers, "Фасовка (наша)"),
    get(r, orig.headers, "Tier"),
    get(r, orig.headers, "Категорія наша"),
    get(r, orig.headers, "Slug"),
    get(r, orig.headers, "№ рядка прайсу"),
  ]);
}

// З дженериків — мапимо колонки
for (const r of gen.rows) {
  priceRows.push([
    get(r, gen.headers, "Код"),
    get(r, gen.headers, "Дія"),
    get(r, gen.headers, "Лист"),
    get(r, gen.headers, "Назва (прайс)"),
    get(r, gen.headers, "Виробник"),
    get(r, gen.headers, "Фасовка"),
    get(r, gen.headers, "Фасовка"), // нормалізована вже
    get(r, gen.headers, "Категорія UA"),
    get(r, gen.headers, "Діюча речовина"),
    get(r, gen.headers, "Норма"),
    get(r, gen.headers, "Ціна з ПДВ"),
    get(r, gen.headers, "Без ПДВ"),
    get(r, gen.headers, "Готівка ×1.10"),
    get(r, gen.headers, "Валюта"),
    get(r, gen.headers, "Назва (наша)"),
    get(r, gen.headers, "Фасовка (наша)"),
    get(r, gen.headers, "Tier"),
    "", // Категорія наша — у дженериків в _codes_catalog
    get(r, gen.headers, "Slug (наш)"),
    get(r, gen.headers, "№ рядка"),
  ]);
}

// Сортуємо за кодом (числово)
priceRows.sort((a, b) => Number(a[0]) - Number(b[0]));

// Числові колонки для конвертації (щоб Excel сортував/фільтрував коректно)
const numericPriceCols = [0, 10, 11, 12, 19]; // Код, Ціна з ПДВ, Без ПДВ, Готівка, № рядка

const toSheet = (headers, rows, numericCols) => {
  const data = [headers, ...rows.map(r => r.map((cell, i) => {
    if (numericCols.includes(i)) {
      const n = parseFloat(cell);
      if (Number.isFinite(n) && String(cell).trim() !== "") return n;
    }
    return cell;
  }))];
  const ws = xlsx.utils.aoa_to_sheet(data);
  ws["!cols"] = headers.map((_, i) => {
    const max = Math.max(headers[i].length, ...rows.map(r => String(r[i] || "").length));
    return { wch: Math.min(50, Math.max(8, max + 2)) };
  });
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };
  return ws;
};

const numericCatCols = [0]; // code

const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, toSheet(catalog.headers, catalog.rows, numericCatCols), "Наш каталог");
xlsx.utils.book_append_sheet(wb, toSheet(PRICE_HEADERS, priceRows, numericPriceCols), "Прайс");

const outPath = path.join(root, "_codes_review.xlsx");
try {
  xlsx.writeFile(wb, outPath);
} catch (e) {
  if (e.code === "EBUSY") {
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const altPath = path.join(root, `_codes_review_${ts}.xlsx`);
    xlsx.writeFile(wb, altPath);
    console.log(`⚠ Основний файл зайнятий (Excel?), записав у ${altPath}`);
    process.exit(0);
  }
  throw e;
}

console.log(`✓ Створено: ${outPath}`);
console.log(`  Лист 1 «Наш каталог»: ${catalog.rows.length} рядків`);
console.log(`  Лист 2 «Прайс»: ${priceRows.length} рядків (${orig.rows.length} оригінал + ${gen.rows.length} дженерики)`);
