// Сканер placeholder-цін у lib/products.ts.
// Шукає підозрілі одинакові priceVat (типові заглушки) і всі SKU із списку
// "Оригінали без прайсової ціни" з _PRICE_IMPORT_RULES.md.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const productsTxt = readFileSync(path.join(root, "lib", "products.ts"), "utf8");
const lines = productsTxt.split(/\r?\n/);

function num(v) {
  const s = String(v || "").replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

const products = [];
for (const l of lines) {
  if (!/^\s*\{\s*slug:/.test(l)) continue;
  const slug = (l.match(/slug:\s*"([^"]+)"/) || [, ""])[1];
  const name = (l.match(/name:\s*"([^"]+)"/) || [, ""])[1];
  const mfr = (l.match(/manufacturer:\s*"([^"]+)"/) || [, ""])[1];
  const tier = (l.match(/tier:\s*"([^"]+)"/) || [, ""])[1];
  const group = (l.match(/group:\s*"([^"]+)"/) || [, ""])[1];
  const ai = (l.match(/activeIngredient:\s*"([^"]+)"/) || [, ""])[1];
  const pkg = (l.match(/packaging:\s*"([^"]+)"/) || [, ""])[1];
  const priceVat = num((l.match(/priceVat:\s*([\d.]+)/) || [, ""])[1]);
  const priceCash = num((l.match(/priceCash:\s*([\d.]+)/) || [, ""])[1]);
  const currency = (l.match(/currency:\s*"([^"]+)"/) || [, ""])[1];
  products.push({ slug, name, mfr, tier, group, ai, pkg, priceVat, priceCash, currency });
}

console.log(`Усього SKU: ${products.length}`);

// Групуємо по (priceVat, currency, tier) — однакові ціни в одному tier — підозра на placeholder
const buckets = new Map();
for (const p of products) {
  const key = `${p.priceVat}_${p.currency}_${p.tier}`;
  if (!buckets.has(key)) buckets.set(key, []);
  buckets.get(key).push(p);
}

const suspicious = [];
for (const [key, arr] of buckets.entries()) {
  if (arr.length >= 3) suspicious.push({ key, count: arr.length, products: arr });
}
suspicious.sort((a, b) => b.count - a.count);

console.log(`\n=== Підозрілі однакові ціни (placeholder?) ===`);
for (const s of suspicious) {
  console.log(`\n${s.key} — ${s.count} SKU:`);
  for (const p of s.products) {
    console.log(`  ${p.slug.padEnd(40)} ${p.name.padEnd(35)} ${p.mfr.padEnd(20)} ${p.tier.padEnd(10)} ${p.group.padEnd(15)} ${p.priceVat} ${p.currency}`);
  }
}

// Спецсписок з _PRICE_IMPORT_RULES.md (рядки 116-136)
const knownPlaceholders = [
  "bazys-75-wg-korteva", "delano-synhenta", "fokstrot-ekspert-adama",
  "haucho-plyus-baier", "hranstar-hold-korteva", "hranstar-pro-korteva",
  "kalibr-korteva", "kallysto-480-sc-synhenta", "klio-basf",
  "konfidor-maksi-baier", "lamador-baier", "lastik-top-baier",
  "marshal-25-ec-adama", "merlin-fleks-480-sc-baier", "mospilan-20-sp-nippon-soda",
  "nurel-d-korteva", "raksil-ultra-120-fs-baier", "rehlon-super-synhenta",
  "tapir-basf", "yuniver-baier", "yunta-kvadro-373-4-fs-baier",
];

console.log(`\n=== Список з _PRICE_IMPORT_RULES.md ===`);
for (const slug of knownPlaceholders) {
  const p = products.find(x => x.slug === slug);
  if (!p) {
    console.log(`  ${slug.padEnd(40)} ❌ не знайдено в каталозі`);
    continue;
  }
  console.log(`  ${slug.padEnd(40)} ${p.name.padEnd(30)} ${p.priceVat} ${p.currency} (${p.tier})`);
}

// Експортуємо результат
const placeholderSlugs = new Set();
for (const s of suspicious) {
  for (const p of s.products) placeholderSlugs.add(p.slug);
}
for (const s of knownPlaceholders) placeholderSlugs.add(s);

const placeholderProducts = products.filter(p => placeholderSlugs.has(p.slug));
writeFileSync(
  path.join(__dirname, "_placeholders.json"),
  JSON.stringify(placeholderProducts, null, 2),
);
console.log(`\nВикладено у _placeholders.json: ${placeholderProducts.length} SKU`);
