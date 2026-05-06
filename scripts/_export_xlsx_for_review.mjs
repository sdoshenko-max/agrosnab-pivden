// Збираємо xlsx-файл для зручної перевірки в Excel.
// Один файл, два листи:
//   1) "Наш каталог"  — 934 SKU з кодами
//   2) "Прайс Оригінал" — 649 рядків прайсу з присвоєними кодами
// Excel відкриває нативно — фільтри, сортування, без проблем з кодуванням і роздільниками.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import xlsx from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// === Парсимо CSV-рядок (з урахуванням лапок) ===
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

// === Лист 2: прайс «Оригінал» ===
const price = readCsv("_price_with_codes_original.csv");

// Конвертуємо числові колонки з рядка в число (щоб Excel міг сортувати/фільтрувати)
const numericIdx = {
  catalog: [0], // code
  price: [0, 7, 8, 9, 16], // code, priceVat, priceWithoutVat, priceCashCalc, priceRow
};

const toSheet = (headers, rows, numericCols) => {
  const data = [headers, ...rows.map(r => r.map((cell, i) => {
    if (numericCols.includes(i)) {
      const n = parseFloat(cell);
      if (Number.isFinite(n) && cell.trim() !== "") return n;
    }
    return cell;
  }))];
  const ws = xlsx.utils.aoa_to_sheet(data);
  // Авто-ширина колонок
  ws["!cols"] = headers.map((_, i) => {
    const max = Math.max(headers[i].length, ...rows.map(r => (r[i] || "").length));
    return { wch: Math.min(50, Math.max(8, max + 2)) };
  });
  // Заморожуємо перший рядок
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };
  return ws;
};

const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, toSheet(catalog.headers, catalog.rows, numericIdx.catalog), "Наш каталог");
xlsx.utils.book_append_sheet(wb, toSheet(price.headers, price.rows, numericIdx.price), "Прайс Оригінал");

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
console.log(`  Лист 2 «Прайс Оригінал»: ${price.rows.length} рядків`);
