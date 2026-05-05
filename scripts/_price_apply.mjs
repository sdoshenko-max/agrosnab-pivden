// Застосовує оновлення цін у lib/products.ts:
//   1. Усі SKU з matched (13 exact/stem)
//   2. SKU з multiMatch які в whitelist PARTIAL_APPROVED (10 partial)
//
// Не комітить — тільки змінює файл.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const PARTIAL_APPROVED = new Set([
  "alto-super-330-ec-synhenta",
  "dual-hold-960-ec-synhenta",
  "tilt-turbo-synhenta",
  "urahan-forte-synhenta",
  "aktara-25-wg-synhenta",
  "biskaiya-240-od-baier",
  "enzhio-247-sc-synhenta",
  "kalipso-480-sc-baier",
  "rehent-20-g-baier",
  "fastak-100-basf",
]);

const diff = JSON.parse(readFileSync(path.join(__dirname, "_price_diff.json"), "utf8"));

// Список (slug → { priceVat, priceCash, currency })
const updates = new Map();

for (const m of diff.matched) {
  updates.set(m.slug, { priceVat: m.expectedVat, priceCash: m.expectedCash, currency: m.expectedCurrency });
}
for (const m of diff.multiMatch) {
  if (!PARTIAL_APPROVED.has(m.slug)) continue;
  const c = m.candidates[0];
  const priceVat = c.priceVat;
  const priceCash = Math.round((priceVat / 1.2) * 1.1 * 100) / 100;
  updates.set(m.slug, { priceVat, priceCash, currency: c.currency });
}

console.log(`До оновлення: ${updates.size} SKU`);

const productsPath = path.join(root, "lib", "products.ts");
let txt = readFileSync(productsPath, "utf8");
const lines = txt.split(/\r?\n/);

let updated = 0;
const newLines = lines.map(l => {
  const m = l.match(/^\s*\{\s*slug:\s*"([^"]+)"/);
  if (!m) return l;
  const u = updates.get(m[1]);
  if (!u) return l;
  let nl = l
    .replace(/priceVat:\s*[\d.]+/, `priceVat: ${u.priceVat}`)
    .replace(/priceCash:\s*[\d.]+/, `priceCash: ${u.priceCash}`)
    .replace(/currency:\s*"(USD|EUR)"/, `currency: "${u.currency}"`);
  updated++;
  return nl;
});

writeFileSync(productsPath, newLines.join("\n"), "utf8");
console.log(`Оновлено рядків у products.ts: ${updated}`);

// === Генеруємо звіт по 49 не знайдених для ручної перевірки ===
const reportPath = path.join(root, "_PRICE_UNMATCHED_REVIEW.md");
const today = new Date().toISOString().slice(0, 10);
let md = `# Ручна звірка цін — SKU без авто-матчу з прайсом\n\n`;
md += `> Звіт згенеровано ${today} скриптом \`scripts/_price_audit.mjs\`. Це SKU, для яких автоматичний пошук у \`Прайс_05.04.26.xlsx\` нічого схожого не знайшов. Імовірні причини: оригінали без аналога в прайсі (продаємо під замовлення), нестандартна транслітерація, або перейменування.\n\n`;
md += `**Як заповнити:**\n`;
md += `1. Подивись на свій прайс / прайс-лист постачальника / іншу довідку.\n`;
md += `2. У колонці «Реальна priceVat» постав ціну за 1 л/кг **з ПДВ**.\n`;
md += `3. У колонці «Currency» постав USD або EUR.\n`;
md += `4. Якщо товар не існує / не продаємо — постав \`DELETE\` у колонці priceVat. Я тоді видалю SKU з каталогу.\n`;
md += `5. Якщо не міняємо — лишай порожнім.\n`;
md += `6. Коли заповнено — мені кажеш «застосуй \`_PRICE_UNMATCHED_REVIEW.md\`» і я прочитаю + зроблю оновлення одним коммітом.\n\n`;

const byTier = { original: [], econom: [], premium: [] };
for (const n of diff.notFound) {
  byTier[n.tier] = byTier[n.tier] || [];
  byTier[n.tier].push(n);
}

for (const tier of ["original", "econom", "premium"]) {
  const list = byTier[tier] || [];
  if (!list.length) continue;
  md += `## ${tier.toUpperCase()} (${list.length} SKU)\n\n`;
  md += `| Slug | Назва | Виробник | Поточна priceVat | Реальна priceVat | Currency |\n`;
  md += `|---|---|---|---|---|---|\n`;
  for (const n of list.sort((a, b) => a.name.localeCompare(b.name))) {
    md += `| \`${n.slug}\` | ${n.name} | ${n.mfr} | ${n.currentPriceVat} | | |\n`;
  }
  md += `\n`;
}

writeFileSync(reportPath, md, "utf8");
console.log(`Звіт по 49 SKU: _PRICE_UNMATCHED_REVIEW.md`);
