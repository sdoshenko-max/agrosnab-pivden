import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const txt = readFileSync(path.join(root, "lib", "products.ts"), "utf8");
const lines = txt.split("\n").filter(l => /^\s*\{\s*slug:/.test(l));

const get = (l, key) => {
  const re = new RegExp(`(?:^|[ ,])${key}:\\s*"([^"]*)"`);
  const m = l.match(re);
  return m ? m[1] : "";
};

const items = lines.map(l => ({
  slug: get(l, "slug"),
  name: get(l, "name"),
  manufacturer: get(l, "manufacturer"),
  ai: get(l, "activeIngredient"),
  packaging: get(l, "packaging"),
  rate: get(l, "rate"),
  desc: get(l, "description"),
  image: get(l, "image"),
  group: get(l, "group"),
  tier: get(l, "tier"),
}));

console.log("=== Каталог lib/products.ts ===");
console.log("Всього SKU-рядків:", items.length);

const byProd = {};
items.forEach(i => {
  const k = i.manufacturer + "||" + i.name;
  (byProd[k] = byProd[k] || []).push(i);
});
const productsKeys = Object.keys(byProd);
console.log("Унікальних товарів (manufacturer+name):", productsKeys.length);
console.log("SKU-рядків / товар:", (items.length / productsKeys.length).toFixed(2));
console.log("Товарів з 2+ фасовками:", productsKeys.filter(k => byProd[k].length > 1).length);

const dist = {};
productsKeys.forEach(k => {
  const n = byProd[k].length;
  dist[n] = (dist[n] || 0) + 1;
});
console.log();
console.log("Розподіл за кількістю фасовок:");
Object.entries(dist).sort((a, b) => +a[0] - +b[0]).forEach(([n, c]) => {
  console.log(`  ${n} фас. → ${c} товарів`);
});

const empty = (k) => items.filter(i => !i[k]).length;
console.log();
console.log("Заповненість полів (% порожніх):");
["name", "manufacturer", "ai", "rate", "packaging", "desc", "image", "group"].forEach(k => {
  const n = empty(k);
  console.log(`  ${k.padEnd(15)} ${n.toString().padStart(5)} / ${items.length}  (${(100 * n / items.length).toFixed(1)}%)`);
});

let rateConflicts = 0, aiConflicts = 0;
const multi = productsKeys.filter(k => byProd[k].length > 1);
multi.forEach(k => {
  const arr = byProd[k];
  const rates = new Set(arr.map(x => x.rate).filter(Boolean));
  const ais = new Set(arr.map(x => x.ai).filter(Boolean));
  if (rates.size > 1) rateConflicts++;
  if (ais.size > 1) aiConflicts++;
});
console.log();
console.log("Розбіжності серед фасовок одного товару:");
console.log(`  rate різний у ${rateConflicts} з ${multi.length} мульти-фасовкових`);
console.log(`  AI різний у ${aiConflicts} з ${multi.length}`);

console.log();
console.log("Top-10 товарів за кількістю фасовок:");
productsKeys.sort((a, b) => byProd[b].length - byProd[a].length).slice(0, 10).forEach(k => {
  const arr = byProd[k];
  console.log(`  ${k.padEnd(40)} → ${arr.length} SKU. Фасовки: ${arr.map(x => x.packaging).filter(Boolean).join(", ")}`);
});

console.log();
console.log("Tier breakdown:");
const tiers = {};
items.forEach(i => tiers[i.tier] = (tiers[i.tier] || 0) + 1);
Object.entries(tiers).forEach(([t, n]) => console.log(`  ${t}: ${n}`));
