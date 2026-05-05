// Аудит цін: звіряє priceVat/priceCash/currency у lib/products.ts
// з реальним прайсом Прайс_05.04.26.xlsx.
//
// Звіт пише у scripts/_price_diff.json (для подальшого _price_apply.mjs).

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import xlsx from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const wb = xlsx.readFile(path.join(__dirname, "_price.xlsx"));

// === Знайти рядок заголовків ===
function findHeaderRow(data) {
  for (let i = 0; i < Math.min(8, data.length); i++) {
    const row = (data[i] || []).map(c => String(c || "").toLowerCase());
    const has = (regex) => row.some(c => regex.test(c));
    if (has(/назва|найменування|продукт/) && has(/без\s*пдв/) && has(/з\s*пдв/)) {
      return i;
    }
  }
  return -1;
}

// === Знайти індекси колонок ===
function findColumns(headerRow) {
  const lower = headerRow.map(c => String(c || "").toLowerCase().trim());
  const idx = (re) => lower.findIndex(c => re.test(c));
  // priceVat: «з ПДВ» але НЕ «без ПДВ»
  const priceVatIdx = lower.findIndex(c => /з\s*пдв/.test(c) && !/без\s*пдв/.test(c));
  return {
    name: idx(/назва\s*препарат|найменування|продукт|назва$/),
    pkg: idx(/фасовка|тара|тарна|упаковка|л\/кг$/),
    cur: idx(/валюта/),
    priceNoVat: idx(/без\s*пдв/),
    priceVat: priceVatIdx,
  };
}

function detectCurrency(rowCurrencyCell, sheetName) {
  const c = String(rowCurrencyCell || "").trim().toUpperCase();
  if (c === "USD" || c === "$" || c.includes("ДОЛ")) return "USD";
  if (c === "EUR" || c === "EURO" || c === "€" || c.includes("ЄВР") || c.includes("ЕВР")) return "EUR";
  return "USD";
}

function num(v) {
  const s = String(v || "").replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function getPackSize(pkg) {
  // "5 л", "20л", "0,5 кг", "4*5л", "0.25 кг"
  const s = String(pkg || "");
  const m = s.match(/(\d+[.,]?\d*)\s*(л|кг|мл|г)?/i);
  if (!m) return null;
  return parseFloat(m[1].replace(",", "."));
}

// === Збираємо рядки прайсу ===
const priceRows = []; // { sheet, name, pkgRaw, packSize, currency, priceNoVat, priceVat }

for (const sn of wb.SheetNames) {
  const ws = wb.Sheets[sn];
  const data = xlsx.utils.sheet_to_json(ws, { header: 1, raw: false, blankrows: false });
  const hdrIdx = findHeaderRow(data);
  if (hdrIdx === -1) continue;
  const cols = findColumns(data[hdrIdx]);
  if (cols.name === -1 || cols.priceVat === -1) continue;

  for (let i = hdrIdx + 1; i < data.length; i++) {
    const row = data[i] || [];
    const name = String(row[cols.name] || "").trim();
    if (!name) continue;
    // Пропускаємо рядки-заголовки секцій ("ГЕРБІЦИДИ", "ФУНГІЦИДИ" тощо)
    if (/^[А-ЯҐІЇЄ\s]+$/i.test(name) && name.length < 20 && !name.includes(",") && !name.includes(" ")) continue;
    const priceVat = num(row[cols.priceVat]);
    if (priceVat === null || priceVat === 0) continue;
    const priceNoVat = num(row[cols.priceNoVat]);
    const pkgRaw = cols.pkg >= 0 ? String(row[cols.pkg] || "").trim() : "";
    const packSize = getPackSize(pkgRaw);
    const cur = detectCurrency(cols.cur >= 0 ? row[cols.cur] : null, sn);
    priceRows.push({ sheet: sn, name, pkgRaw, packSize, currency: cur, priceNoVat, priceVat });
  }
}

console.log(`Прочитано рядків прайсу: ${priceRows.length}`);

// === Нормалізація імен для матчу ===
function norm(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[ʼ'`]/g, "")
    .replace(/[ёе]/g, "е")
    // Українська «і» (U+0456) і латинська «i» (U+0069) — обидві → «и»
    .replace(/[іийiі]/g, "и")
    .replace(/\s+/g, "")
    .replace(/[.,;()]/g, "")
    .replace(/-/g, "")
    .trim();
}

// "Stem" — базова основа назви для нечіткого матчу.
// Прибираємо суфікси типу «КЕ», «КС», «РК», «ВГ», «ТН», «SC», «WG», «EC», «ОД» і т.д.,
// а також концентраційні цифри типу «25», «330», «480 SC».
function stem(s) {
  return norm(s)
    .replace(/\b(ке|кс|рк|вг|тн|зп|се|ев|вр|ме|од|сд|ср|fs|sc|wg|ec|wp|ew|sl|cs|sg|wdg|gr)\b/gi, "")
    .replace(/\b\d+(\.\d+)?\b/g, "")
    .replace(/\b(плюс|про|форте|екстра|макс|максi|максi|новинка|new|2026|new2026)\b/gi, "")
    .trim();
}

// Індекс прайсу: ключ = norm(name) → масив рядків
const priceIndex = new Map();
const priceStemIndex = new Map();
for (const pr of priceRows) {
  const k = norm(pr.name);
  if (!priceIndex.has(k)) priceIndex.set(k, []);
  priceIndex.get(k).push(pr);
  // нечіткий індекс
  const st = stem(pr.name);
  if (st && st.length >= 4) {
    if (!priceStemIndex.has(st)) priceStemIndex.set(st, []);
    priceStemIndex.get(st).push(pr);
  }
}

// === Читаємо products.ts ===
const productsTxt = readFileSync(path.join(root, "lib", "products.ts"), "utf8");
const lines = productsTxt.split(/\r?\n/);
const products = [];
for (const l of lines) {
  if (!/^\s*\{\s*slug:/.test(l)) continue;
  const slug = (l.match(/slug:\s*"([^"]+)"/) || [, ""])[1];
  const name = (l.match(/name:\s*"([^"]+)"/) || [, ""])[1];
  const mfr = (l.match(/manufacturer:\s*"([^"]+)"/) || [, ""])[1];
  const tier = (l.match(/tier:\s*"([^"]+)"/) || [, ""])[1];
  const pkg = (l.match(/packaging:\s*"([^"]+)"/) || [, ""])[1];
  const priceVat = num((l.match(/priceVat:\s*([\d.]+)/) || [, ""])[1]);
  const priceCash = num((l.match(/priceCash:\s*([\d.]+)/) || [, ""])[1]);
  const currency = (l.match(/currency:\s*"([^"]+)"/) || [, ""])[1];
  const unit = (l.match(/unit:\s*"([^"]+)"/) || [, ""])[1];
  products.push({ slug, name, mfr, tier, pkg, priceVat, priceCash, currency, unit, packSize: getPackSize(pkg) });
}

// === Матчинг ===
const result = { matched: [], multiMatch: [], notFound: [], noChange: [], formulaMismatch: [] };

for (const p of products) {
  let candidates = priceIndex.get(norm(p.name)) || [];
  let matchType = "exact";
  if (candidates.length === 0) {
    // Нечіткий матч за стемом
    const st = stem(p.name);
    if (st && st.length >= 4) {
      const stemHits = priceStemIndex.get(st) || [];
      // Фільтруємо за виробником (не плутаємо «Раундап Макс» Monsanto з Байер)
      const sameMfr = stemHits.filter(c => norm(c.sheet) === norm(p.mfr) || stem(c.sheet) === stem(p.mfr));
      candidates = sameMfr.length ? sameMfr : stemHits;
      if (candidates.length) matchType = "stem";
    }
  }
  if (candidates.length === 0) {
    // Substring пошук — наша назва міститься у назві прайсу
    const myStem = stem(p.name);
    if (myStem && myStem.length >= 5) {
      const partial = priceRows.filter(c => stem(c.name).includes(myStem) || myStem.includes(stem(c.name)));
      if (partial.length) {
        candidates = partial.slice(0, 5);
        matchType = "partial";
      }
    }
  }
  if (candidates.length === 0) {
    result.notFound.push({ slug: p.slug, name: p.name, mfr: p.mfr, tier: p.tier, currentPriceVat: p.priceVat });
    continue;
  }
  // Звужуємо по фасовці якщо є кандидатів кілька
  let best;
  if (candidates.length === 1) best = candidates[0];
  else {
    const same = candidates.filter(c => p.packSize && c.packSize && Math.abs(c.packSize - p.packSize) < 0.01);
    if (same.length === 1) best = same[0];
    else if (same.length > 1) best = same[0]; // беремо першу зі співпадаючою фасовкою
    else best = candidates[0];
  }

  const expectedPriceVat = best.priceVat;
  // priceCash рахується ЗАВЖДИ нашою формулою з нової priceVat — це знижка за готівку, не закупочна ціна
  const expectedPriceCash = Math.round((expectedPriceVat / 1.2) * 1.1 * 100) / 100;
  const formulaCash = Math.round((p.priceVat / 1.2) * 1.1 * 100) / 100;

  // Перевірка валюти
  const currencyChange = best.currency !== p.currency;

  // Перевірка ціни
  const diffVat = Math.abs((p.priceVat || 0) - expectedPriceVat);
  // Якщо priceVat ОК — просто перевіряємо чи priceCash рахується правильно за формулою
  const diffCash = Math.abs((p.priceCash || 0) - formulaCash);
  const formulaOff = diffCash > 0.05;

  const needsUpdate = diffVat > 0.05 || formulaOff || currencyChange;

  if (!needsUpdate) {
    result.noChange.push({ slug: p.slug });
    continue;
  }

  // Кілька кандидатів — повідомляємо як warning
  if (candidates.length > 1 && !candidates.some(c => p.packSize && c.packSize && Math.abs(c.packSize - p.packSize) < 0.01)) {
    result.multiMatch.push({
      slug: p.slug,
      name: p.name,
      packSize: p.packSize,
      candidates: candidates.map(c => ({ sheet: c.sheet, pkgRaw: c.pkgRaw, packSize: c.packSize, priceVat: c.priceVat, currency: c.currency })),
    });
    continue;
  }

  // Partial-матчі — у multiMatch (потребують ручного перегляду, не auto-update)
  if (matchType === "partial") {
    result.multiMatch.push({
      slug: p.slug, name: p.name, packSize: p.packSize, mfr: p.mfr,
      currentVat: p.priceVat, currentCurrency: p.currency,
      candidates: [{ sheet: best.sheet, name: best.name, pkgRaw: best.pkgRaw, packSize: best.packSize, priceVat: best.priceVat, currency: best.currency }],
      reason: "partial-name match — потребує підтвердження",
    });
    continue;
  }

  result.matched.push({
    slug: p.slug,
    name: p.name,
    bestPriceName: best.name,
    sheet: best.sheet,
    pkgPrice: best.pkgRaw,
    pkgCatalog: p.pkg,
    currentVat: p.priceVat,
    expectedVat: expectedPriceVat,
    currentCash: p.priceCash,
    expectedCash: expectedPriceCash,
    currentCurrency: p.currency,
    expectedCurrency: best.currency,
    matchType,
    formulaOff,
  });

  if (formulaOff && diffVat < 0.05) result.formulaMismatch.push({ slug: p.slug, priceVat: p.priceVat, priceCash: p.priceCash, formulaCash });
}

writeFileSync(path.join(__dirname, "_price_diff.json"), JSON.stringify(result, null, 2));

console.log(`\n=== ПІДСУМОК ===`);
console.log(`Усього SKU:           ${products.length}`);
console.log(`🟢 Збігається:        ${result.noChange.length}`);
console.log(`🟡 Потребує оновлення: ${result.matched.length}`);
console.log(`⚠ Кілька кандидатів:  ${result.multiMatch.length}`);
console.log(`🔴 Не знайдено в прайсі: ${result.notFound.length}`);
console.log(`📐 Помилки формули priceCash: ${result.formulaMismatch.length}`);

// Розклад matched по причинах
const reasons = { vatOnly: 0, cashOnly: 0, both: 0, currency: 0, formula: 0 };
for (const m of result.matched) {
  if (m.currentCurrency !== m.expectedCurrency) reasons.currency++;
  const dVat = Math.abs(m.currentVat - m.expectedVat) > 0.05;
  const dCash = Math.abs(m.currentCash - m.expectedCash) > 0.05;
  if (dVat && dCash) reasons.both++;
  else if (dVat) reasons.vatOnly++;
  else if (dCash) reasons.cashOnly++;
  if (m.formulaOff) reasons.formula++;
}
console.log(`\n=== Розбивка matched ===`);
console.log(`  тільки priceVat:        ${reasons.vatOnly}`);
console.log(`  тільки priceCash:       ${reasons.cashOnly}`);
console.log(`  обидві ціни:            ${reasons.both}`);
console.log(`  різна валюта (USD/EUR): ${reasons.currency}`);
console.log(`  поточна формула криво:  ${reasons.formula}`);

// Розкид по tier для notFound
const byTier = {};
for (const n of result.notFound) {
  byTier[n.tier] = (byTier[n.tier] || 0) + 1;
}
console.log(`\n=== Не знайдено по tier ===`);
for (const [t, c] of Object.entries(byTier)) console.log(`  ${t}: ${c}`);

console.log(`\nДеталі: scripts/_price_diff.json`);
