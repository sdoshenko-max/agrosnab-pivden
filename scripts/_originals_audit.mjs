// Спецаудит цін original-tier SKU.
// Для кожного оригінала з products.ts шукаю кандидатів у листі «Оригінал»
// прайсу і пропоную найкращу ціну.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import xlsx from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const wb = xlsx.readFile(path.join(__dirname, "_price.xlsx"));
const ws = wb.Sheets["Оригінал"];
const data = xlsx.utils.sheet_to_json(ws, { header: 1, raw: false, blankrows: false });

// Парсимо лист «Оригінал». Заголовок на r3:
// Група | ВИРОБНИК | НАЙМЕНУВАННЯ | л/кг | кан*Тара | валюта | Ціна без ПДВ | Ціна з ПДВ
const COL = { mfr: 1, name: 2, unit: 3, pkg: 4, cur: 5, priceNoVat: 6, priceVat: 7 };

function num(v) {
  const s = String(v || "").replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}
function detectCurrency(v) {
  const c = String(v || "").trim().toUpperCase();
  if (c === "USD" || c === "$" || c.includes("ДОЛ")) return "USD";
  if (c === "EUR" || c === "EURO" || c === "€" || c.includes("ЄВР") || c.includes("ЕВР")) return "EUR";
  return "USD";
}

const priceRows = [];
for (let i = 4; i < data.length; i++) {
  const row = data[i] || [];
  const name = String(row[COL.name] || "").trim();
  const mfr = String(row[COL.mfr] || "").trim();
  const priceVat = num(row[COL.priceVat]);
  if (!name || !mfr || priceVat === null || priceVat === 0) continue;
  priceRows.push({
    mfr,
    name,
    pkg: String(row[COL.pkg] || "").trim(),
    unit: String(row[COL.unit] || "").trim(),
    currency: detectCurrency(row[COL.cur]),
    priceVat,
    priceNoVat: num(row[COL.priceNoVat]),
  });
}
console.log(`Прочитано рядків з листа «Оригінал»: ${priceRows.length}`);

// === Читаємо products.ts → original-tier SKU ===
const productsTxt = readFileSync(path.join(root, "lib", "products.ts"), "utf8");
const productLines = productsTxt.split(/\r?\n/);
const originals = [];
for (const l of productLines) {
  if (!/^\s*\{\s*slug:.*tier:\s*"original"/.test(l)) continue;
  const slug = (l.match(/slug:\s*"([^"]+)"/) || [, ""])[1];
  const name = (l.match(/name:\s*"([^"]+)"/) || [, ""])[1];
  const mfr = (l.match(/manufacturer:\s*"([^"]+)"/) || [, ""])[1];
  const pkg = (l.match(/packaging:\s*"([^"]+)"/) || [, ""])[1];
  const priceVat = num((l.match(/priceVat:\s*([\d.]+)/) || [, ""])[1]);
  const currency = (l.match(/currency:\s*"([^"]+)"/) || [, ""])[1];
  originals.push({ slug, name, mfr, pkg, priceVat, currency });
}
console.log(`Original-tier SKU у каталозі: ${originals.length}`);

// === Нормалізація для матчу ===
function norm(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[ʼ'`]/g, "")
    .replace(/[ёе]/g, "е")
    .replace(/[іий]/g, "и")
    .replace(/i/g, "и")
    .replace(/\s+/g, "")
    .replace(/[.,;()-]/g, "")
    .trim();
}
function normMfr(s) {
  // Виробники в каталозі і в прайсі можуть не співпадати точно
  // (Сингента/Synhenta, Кортева/Korteva, BASF/Басф, Bayer/Байер, Adama, Monsanto/Bayer тощо)
  const x = norm(s);
  if (/(синг|synh)/i.test(x)) return "сингента";
  if (/(корт|kort)/i.test(x)) return "кортева";
  if (/(басф|basf|нобасф)/i.test(x)) return "басф";
  if (/(бай|bay|monsanto)/i.test(x)) return "байер";
  if (/adama|адама/i.test(x)) return "адама";
  if (/fmc|фмс/i.test(x)) return "фмс";
  if (/август|avgust/i.test(x)) return "августа";
  if (/nippon|ниппон/i.test(x)) return "ниппонсода";
  return x;
}

// === Для кожного оригіналу — шукаємо кандидатів ===
function findCandidates(p) {
  const targetMfr = normMfr(p.mfr);
  const myCore = norm(p.name);
  // Перше слово назви — найменш мутабельне
  const myFirstWord = norm(p.name.split(/\s+/)[0]);

  const scored = priceRows.map(r => {
    const rMfr = normMfr(r.mfr);
    const rNorm = norm(r.name);
    const rFirst = norm(r.name.split(/\s+/)[0]);

    let score = 0;
    if (rMfr === targetMfr) score += 50;
    if (rNorm === myCore) score += 100;
    if (rNorm.startsWith(myCore) || myCore.startsWith(rNorm)) score += 30;
    if (rNorm.includes(myCore) || myCore.includes(rNorm)) score += 20;
    if (rFirst === myFirstWord && myFirstWord.length >= 4) score += 25;
    return { ...r, score };
  });

  return scored.filter(s => s.score >= 25).sort((a, b) => b.score - a.score).slice(0, 4);
}

const report = [];
for (const p of originals) {
  const cands = findCandidates(p);
  const exact = cands.find(c => norm(c.name) === norm(p.name) && normMfr(c.mfr) === normMfr(p.mfr));
  const best = exact || cands[0];
  report.push({ ...p, candidates: cands, best });
}

// === Згенеруємо markdown-звіт ===
const today = new Date().toISOString().slice(0, 10);
let md = `# Original-tier — звірка цін з прайсом\n\n`;
md += `> Згенеровано ${today}. Скрипт \`scripts/_originals_audit.mjs\`. Для кожного original-SKU показую поточну ціну в каталозі і знайдені кандидати в листі «Оригінал» прайсу. Сергій ставить позначку у колонці **«Взяти»**: ✓ — застосувати ціну, ✗ — пропустити, або вписати свій варіант ціни/валюти.\n\n`;

const groups = {
  withMatch: [],     // знайдено хоча б один кандидат (score ≥ 25)
  ambiguous: [],     // знайдено 2+ кандидати з близьким score
  noMatch: [],       // нічого не знайдено
};
for (const r of report) {
  if (!r.candidates.length) groups.noMatch.push(r);
  else if (r.candidates.length >= 2 && r.candidates[1].score >= r.candidates[0].score - 30) groups.ambiguous.push(r);
  else groups.withMatch.push(r);
}

md += `## 🟢 Один очевидний кандидат (${groups.withMatch.length})\n\n`;
md += `Це найбільш впевнені пропозиції. Якщо ціна виглядає нормально — постав ✓ у колонку «Взяти».\n\n`;
md += `| Slug | Каталог | → | Прайс знайшов | Cur | Взяти? |\n`;
md += `|---|---|---|---|---|---|\n`;
for (const r of groups.withMatch) {
  const c = r.best;
  md += `| \`${r.slug}\` | ${r.priceVat || "—"} ${r.currency || ""} (${r.name}) | → | **${c.priceVat}** ${c.currency} (${c.name}, ${c.pkg}) | ${c.currency} |  |\n`;
}
md += `\n`;

md += `## 🟡 Кілька можливих варіантів — обери (${groups.ambiguous.length})\n\n`;
md += `Знайдено кілька рядків у прайсі з близькими назвами. Постав ✓ біля того, який реально продається на сайті, або вписуй свою ціну.\n\n`;
for (const r of groups.ambiguous) {
  md += `### \`${r.slug}\` — ${r.name} (${r.mfr}), поточно: ${r.priceVat || "—"} ${r.currency || "USD"}\n\n`;
  md += `| # | Прайс назва | Виробник | Pack | Ціна з ПДВ | Cur | Взяти |\n`;
  md += `|---|---|---|---|---|---|---|\n`;
  r.candidates.forEach((c, i) => {
    md += `| ${i + 1} | ${c.name} | ${c.mfr} | ${c.pkg} | **${c.priceVat}** | ${c.currency} |  |\n`;
  });
  md += `\n`;
}

md += `## 🔴 Не знайдено в прайсі (${groups.noMatch.length})\n\n`;
md += `Для цих SKU у листі «Оригінал» немає схожих рядків. Або ти продаєш їх під замовлення (тоді залиши placeholder), або взагалі не продаєш (постав DELETE).\n\n`;
md += `| Slug | Назва | Виробник | Поточна priceVat | Реальна priceVat | Cur |\n`;
md += `|---|---|---|---|---|---|\n`;
for (const r of groups.noMatch) {
  md += `| \`${r.slug}\` | ${r.name} | ${r.mfr} | ${r.priceVat} ${r.currency} | | |\n`;
}

writeFileSync(path.join(root, "_PRICE_ORIGINALS_REVIEW.md"), md, "utf8");

console.log(`\n=== ПІДСУМОК ===`);
console.log(`Original SKU всього:        ${originals.length}`);
console.log(`🟢 Один кандидат:            ${groups.withMatch.length}`);
console.log(`🟡 Кілька варіантів:         ${groups.ambiguous.length}`);
console.log(`🔴 Без матчу:                ${groups.noMatch.length}`);
console.log(`\nЗвіт: _PRICE_ORIGINALS_REVIEW.md`);
