// Застосовує результати _originals_audit.mjs:
//   🟢 27 зелених (один кандидат) — оновлюємо priceVat/priceCash/currency
//   🟡 28 жовтих (кілька кандидатів) — оновлюємо ТІЛЬКИ де перший кандидат має
//       стабільний substring-матч з нашою назвою. Інакше лишаємо placeholder.
//   🔴 2 червоних — DELETE з каталогу + додати в _PRICE_IMPORT_RULES.md.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import xlsx from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// === 1. Завантажуємо прайс лист «Оригінал» ===
const wb = xlsx.readFile(path.join(__dirname, "_price.xlsx"));
const ws = wb.Sheets["Оригінал"];
const data = xlsx.utils.sheet_to_json(ws, { header: 1, raw: false, blankrows: false });
const COL = { mfr: 1, name: 2, unit: 3, pkg: 4, cur: 5, priceNoVat: 6, priceVat: 7 };

function num(v) { const s = String(v || "").replace(/\s/g, "").replace(",", "."); const n = parseFloat(s); return isNaN(n) ? null : n; }
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
    mfr, name,
    pkg: String(row[COL.pkg] || "").trim(),
    currency: detectCurrency(row[COL.cur]),
    priceVat,
  });
}

// === 2. Нормалізація + матчинг (та сама логіка що в audit) ===
function norm(s) {
  return String(s || "").toLowerCase().replace(/[ʼ'`]/g, "").replace(/[ёе]/g, "е")
    .replace(/[іий]/g, "и").replace(/i/g, "и").replace(/\s+/g, "")
    .replace(/[.,;()-]/g, "").trim();
}
function normMfr(s) {
  const x = norm(s);
  if (/(синг|synh)/i.test(x)) return "сингента";
  if (/(корт|kort)/i.test(x)) return "кортева";
  if (/(басф|basf)/i.test(x)) return "басф";
  if (/(бай|bay|monsanto)/i.test(x)) return "байер";
  if (/adama|адама/i.test(x)) return "адама";
  if (/fmc|фмс/i.test(x)) return "фмс";
  if (/август|avgust/i.test(x)) return "августа";
  if (/nippon|ниппон/i.test(x)) return "ниппонсода";
  return x;
}
// Базова основа назви — без КЕ/SC/WG/цифр/«плюс»/«про»/«форте»/«екстра»/«макс»
function stem(s) {
  return norm(s)
    .replace(/\b(ке|кс|рк|вг|тн|зп|се|ев|вр|ме|од|сд|ср|fs|sc|wg|ec|wp|ew|sl|cs|sg|wdg|gr)\b/gi, "")
    .replace(/\b\d+([.,]\d+)?\b/g, "")
    .replace(/\b(плюс|про|форте|екстра|макс|новинка|new|2026|new2026|турбо)\b/gi, "")
    .trim();
}

function findCandidates(p) {
  const targetMfr = normMfr(p.mfr);
  const myCore = norm(p.name);
  const myFirst = norm(p.name.split(/\s+/)[0]);
  const scored = priceRows.map(r => {
    const rMfr = normMfr(r.mfr);
    const rNorm = norm(r.name);
    const rFirst = norm(r.name.split(/\s+/)[0]);
    let score = 0;
    if (rMfr === targetMfr) score += 50;
    if (rNorm === myCore) score += 100;
    if (rNorm.startsWith(myCore) || myCore.startsWith(rNorm)) score += 30;
    if (rNorm.includes(myCore) || myCore.includes(rNorm)) score += 20;
    if (rFirst === myFirst && myFirst.length >= 4) score += 25;
    return { ...r, score };
  });
  return scored.filter(s => s.score >= 25).sort((a, b) => b.score - a.score).slice(0, 4);
}

// === 3. Читаємо products.ts → original-tier ===
const productsPath = path.join(root, "lib", "products.ts");
const productsTxt = readFileSync(productsPath, "utf8");
const productLines = productsTxt.split(/\r?\n/);

const originals = [];
for (const l of productLines) {
  if (!/^\s*\{\s*slug:.*tier:\s*"original"/.test(l)) continue;
  const slug = (l.match(/slug:\s*"([^"]+)"/) || [, ""])[1];
  const name = (l.match(/name:\s*"([^"]+)"/) || [, ""])[1];
  const mfr = (l.match(/manufacturer:\s*"([^"]+)"/) || [, ""])[1];
  const priceVat = num((l.match(/priceVat:\s*([\d.]+)/) || [, ""])[1]);
  const currency = (l.match(/currency:\s*"([^"]+)"/) || [, ""])[1];
  originals.push({ slug, name, mfr, priceVat, currency });
}

// === 4. Класифікуємо кожен оригінал ===
const updates = new Map(); // slug → { priceVat, priceCash, currency, source }
const skipYellow = []; // slug, name, candName, reason
const noMatch = []; // 🔴

for (const p of originals) {
  const cands = findCandidates(p);
  if (cands.length === 0) { noMatch.push(p); continue; }

  const top = cands[0];
  const second = cands[1];
  const isAmbiguous = second && (top.score - second.score) <= 30;

  // Перевіряємо чи top реально стосується нашого SKU (substring stems)
  const myStem = stem(p.name);
  const topStem = stem(top.name);
  const stemMatch = myStem.length >= 3 && topStem.length >= 3 &&
    (topStem.includes(myStem) || myStem.includes(topStem) || myStem === topStem);

  if (!stemMatch) {
    // top — це false positive (просто «найближчий рядок виробника»)
    skipYellow.push({ slug: p.slug, name: p.name, candName: top.name, reason: "stem mismatch" });
    continue;
  }

  // Якщо ambiguous (другий кандидат майже як перший) — теж лишаємо
  if (isAmbiguous) {
    const secondStem = stem(second.name);
    const secondAlsoMatches = secondStem.length >= 3 && (secondStem.includes(myStem) || myStem.includes(secondStem));
    if (secondAlsoMatches) {
      // обидва близько — небезпечно, лишаємо
      skipYellow.push({ slug: p.slug, name: p.name, candName: `${top.name} | ${second.name}`, reason: "ambiguous (2 кандидати)" });
      continue;
    }
  }

  const expectedVat = top.priceVat;
  const expectedCash = Math.round((expectedVat / 1.2) * 1.1 * 100) / 100;
  updates.set(p.slug, {
    priceVat: expectedVat,
    priceCash: expectedCash,
    currency: top.currency,
    source: top.name + " | " + (top.pkg || "") + " | " + top.currency,
  });
}

console.log(`=== План змін ===`);
console.log(`🟢 Оновити ціну/валюту: ${updates.size}`);
console.log(`🟡 Пропущено (false positive / ambiguous): ${skipYellow.length}`);
console.log(`🔴 Видалити з каталогу: ${noMatch.length}`);

// === 5. Застосувати оновлення + видалення ===
const removeSlugs = new Set(noMatch.map(p => p.slug));
let updatedCount = 0, removedCount = 0;
const newLines = productLines.filter(l => {
  const m = l.match(/^\s*\{\s*slug:\s*"([^"]+)"/);
  if (m && removeSlugs.has(m[1])) { removedCount++; return false; }
  return true;
}).map(l => {
  const m = l.match(/^\s*\{\s*slug:\s*"([^"]+)"/);
  if (!m) return l;
  const u = updates.get(m[1]);
  if (!u) return l;
  let nl = l
    .replace(/priceVat:\s*[\d.]+/, `priceVat: ${u.priceVat}`)
    .replace(/priceCash:\s*[\d.]+/, `priceCash: ${u.priceCash}`)
    .replace(/currency:\s*"(USD|EUR)"/, `currency: "${u.currency}"`);
  updatedCount++;
  return nl;
});

writeFileSync(productsPath, newLines.join("\n"), "utf8");
console.log(`Записано в lib/products.ts: ${updatedCount} оновлено, ${removedCount} видалено`);

// === 6. Оновити _PRICE_IMPORT_RULES.md — додати у «Відкинуті SKU» ===
const rulesPath = path.join(root, "_PRICE_IMPORT_RULES.md");
let rulesTxt = readFileSync(rulesPath, "utf8");
const today = new Date().toISOString().slice(0, 10);
const newRows = noMatch.map(p =>
  `| \`${p.slug}\` | ${p.name} (${p.mfr}) | оригінал, відсутній у листі «Оригінал» прайсу — не торгуємо | ${today} |`
).join("\n");

const sepLine = "|---|---|---|---|";
const insertIdx = rulesTxt.indexOf(sepLine);
if (insertIdx >= 0 && newRows) {
  const cut = insertIdx + sepLine.length;
  rulesTxt = rulesTxt.slice(0, cut) + "\n" + newRows + rulesTxt.slice(cut);
  writeFileSync(rulesPath, rulesTxt, "utf8");
  console.log(`Записано в _PRICE_IMPORT_RULES.md: ${noMatch.length} SKU`);
}

// === 7. Звіт у консоль ===
console.log(`\n=== 🟢 Оновлено (${updates.size}) ===`);
for (const [slug, u] of updates.entries()) {
  console.log(`  ${slug.padEnd(40)} priceVat=${u.priceVat} ${u.currency}`);
}
console.log(`\n=== 🟡 Пропущено — лишається placeholder (${skipYellow.length}) ===`);
for (const s of skipYellow) {
  console.log(`  ${s.slug.padEnd(40)} (${s.reason}) | top: ${s.candName.slice(0, 50)}`);
}
console.log(`\n=== 🔴 Видалено + у "Відкинуті SKU" (${noMatch.length}) ===`);
for (const p of noMatch) console.log(`  ${p.slug.padEnd(40)} ${p.name} | ${p.mfr}`);
