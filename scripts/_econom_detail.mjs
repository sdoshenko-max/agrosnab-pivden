// Для каждого econom-товара что не нашёлся в прайсе — ищем кандидатов
// в листе ТОГО ЖЕ виробника по совпадению ДВ.
// Дополняет _PRICE_FINAL_REPORT.md новой секцией.

import { readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import xlsx from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const wb = xlsx.readFile(path.join(__dirname, "_price.xlsx"));

// Маппинг наш виробник → лист
const mfrToSheet = {
  "Нопосон": "Нопосон",
  "Нертус": "Нертус",
  "PEST.UA": "PEST.UA",
  "Himagro": "Himagro",
  "Укравіт": "Укравіт",
  "Alfa Smart Agro": "ALFASMARTAGRO",
};

function num(v) {
  const s = String(v || "").replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function findHeaderRow(data) {
  for (let i = 0; i < Math.min(8, data.length); i++) {
    const row = (data[i] || []).map(c => String(c || "").toLowerCase());
    const hasName = row.some(c => /назва|найменування|продукт/.test(c));
    const hasPriceVat = row.some(c => /з\s*пдв/.test(c) && !/без\s*пдв/.test(c));
    if (hasName && hasPriceVat) return i;
  }
  return -1;
}
function findColumns(headerRow) {
  const lower = headerRow.map(c => String(c || "").toLowerCase().trim());
  const idx = (re) => lower.findIndex(c => re.test(c));
  const priceVatIdx = lower.findIndex(c => /з\s*пдв/.test(c) && !/без\s*пдв/.test(c));
  return {
    name: idx(/назва\s*препарат|найменування|продукт|назва$/),
    pkg: idx(/фасовка|тара|тарна|упаковка|л\/кг$/),
    ai: idx(/діюча|складові|склад\s*перапрату/),
    priceVat: priceVatIdx,
  };
}

// Збираємо всі рядки за листами
const sheets = {};
for (const sn of wb.SheetNames) {
  const ws = wb.Sheets[sn];
  const data = xlsx.utils.sheet_to_json(ws, { header: 1, raw: false, blankrows: false });
  const hdrIdx = findHeaderRow(data);
  if (hdrIdx === -1) continue;
  const cols = findColumns(data[hdrIdx]);
  if (cols.name === -1 || cols.priceVat === -1) continue;
  const rows = [];
  for (let i = hdrIdx + 1; i < data.length; i++) {
    const row = data[i] || [];
    const name = String(row[cols.name] || "").trim();
    if (!name) continue;
    if (/^[А-ЯҐІЇЄ\s]+$/i.test(name) && name.length < 20 && !name.includes(",") && !name.includes(" ")) continue;
    const priceVat = num(row[cols.priceVat]);
    if (priceVat === null || priceVat === 0) continue;
    rows.push({
      name,
      pkg: cols.pkg >= 0 ? String(row[cols.pkg] || "").trim() : "",
      ai: cols.ai >= 0 ? String(row[cols.ai] || "").trim() : "",
      priceVat,
    });
  }
  sheets[sn] = rows;
}

// Витягую econom-товари without match
const productsTxt = readFileSync(path.join(root, "lib", "products.ts"), "utf8");
const productLines = productsTxt.split(/\r?\n/).filter(l => /^\s*\{\s*slug:/.test(l));
const products = new Map();
for (const l of productLines) {
  const slug = (l.match(/slug:\s*"([^"]+)"/) || [, ""])[1];
  products.set(slug, {
    slug,
    name: (l.match(/name:\s*"([^"]+)"/) || [, ""])[1],
    mfr: (l.match(/manufacturer:\s*"([^"]+)"/) || [, ""])[1],
    tier: (l.match(/tier:\s*"([^"]+)"/) || [, ""])[1],
    group: (l.match(/group:\s*"([^"]+)"/) || [, ""])[1],
    pkg: (l.match(/packaging:\s*"([^"]+)"/) || [, ""])[1],
    ai: (l.match(/activeIngredient:\s*"([^"]+)"/) || [, ""])[1],
    priceVat: num((l.match(/priceVat:\s*([\d.]+)/) || [, ""])[1]),
    currency: (l.match(/currency:\s*"([^"]+)"/) || [, ""])[1],
  });
}

const priceDiff = JSON.parse(readFileSync(path.join(__dirname, "_price_diff.json"), "utf8"));

function aiKeys(ai) {
  return (ai || "").toLowerCase()
    .replace(/[іий]/g, "и").replace(/i/g, "и")
    .split(/[,;+]/)
    .map(s => s.replace(/\d+\s*(г\/л|г\/кг|%)/gi, "").replace(/[\s\d.,/]/g, "").trim())
    .filter(s => s.length >= 5);
}
function norm(s) {
  return String(s || "").toLowerCase().replace(/[іий]/g, "и").replace(/i/g, "и");
}

let md = `\n\n---\n\n## 🔵 ECONOM детальный поиск по ДВ (для тех 22 SKU выше)\n\n`;
md += `Для каждого econom-SKU без матча — top-3 кандидата из листа того же производителя, у которых совпадает действующее вещество.\n\n`;

for (const nf of priceDiff.notFound) {
  const p = products.get(nf.slug);
  if (!p || p.tier === "original") continue;

  const sheet = mfrToSheet[p.mfr];
  if (!sheet || !sheets[sheet]) {
    md += `### \`${nf.slug}\` — ${p.name} (${p.mfr})\n\n🔴 Лист «${p.mfr}» не парсится / не существует.\n\n`;
    continue;
  }

  const myAiKeys = aiKeys(p.ai);
  const candidates = [];
  for (const r of sheets[sheet]) {
    let hits = 0;
    if (myAiKeys.length && r.ai) {
      const rai = norm(r.ai);
      for (const k of myAiKeys) if (rai.includes(k)) hits++;
    }
    // Перевіряємо також за назвою
    const nameMatch = norm(r.name).includes(norm(p.name).slice(0, 4)) || norm(p.name).includes(norm(r.name).slice(0, 4));
    if (hits || nameMatch) {
      candidates.push({ ...r, hits, nameMatch });
    }
  }
  candidates.sort((a, b) => (b.hits - a.hits) || (b.nameMatch - a.nameMatch));

  md += `### \`${nf.slug}\` — ${p.name} (${p.mfr})\n\n`;
  md += `Сайт: **${p.priceVat} ${p.currency}** | ДВ: \`${p.ai}\` | Pack: ${p.pkg}\n\n`;
  if (!candidates.length) {
    md += `🔴 В листе «${sheet}» нет препаратов со совпадающим ДВ или названием. Похоже, товар снят с продаж.\n\n`;
    continue;
  }
  md += `| Кандидат в прайсе | Pack | Ціна з ПДВ | ДВ | Совп. ДВ | Совп. имя |\n`;
  md += `|---|---|---|---|---|---|\n`;
  for (const c of candidates.slice(0, 5)) {
    md += `| ${c.name} | ${c.pkg} | **${c.priceVat}** | ${(c.ai || "").slice(0, 50)} | ${c.hits} | ${c.nameMatch ? "✓" : ""} |\n`;
  }
  md += `\n`;
}

appendFileSync(path.join(root, "_PRICE_FINAL_REPORT.md"), md, "utf8");
console.log(`Дописано до _PRICE_FINAL_REPORT.md`);
