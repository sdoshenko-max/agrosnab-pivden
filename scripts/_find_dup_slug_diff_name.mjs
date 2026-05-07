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
  code: get(l, "code"),
  name: get(l, "name"),
  packaging: get(l, "packaging"),
  manufacturer: get(l, "manufacturer"),
}));

const bySlug = {};
items.forEach(i => (bySlug[i.slug] = bySlug[i.slug] || []).push(i));

console.log("Дублі slug де NAME ВІДРІЗНЯЄТЬСЯ між рядками:");
console.log();
let count = 0;
Object.entries(bySlug).forEach(([slug, arr]) => {
  if (arr.length < 2) return;
  const names = new Set(arr.map(x => x.name));
  if (names.size > 1) {
    count++;
    console.log(`✗ ${slug}:`);
    arr.forEach(x => console.log(`    code=${x.code}  name="${x.name}"  pkg="${x.packaging}"  ${x.manufacturer}`));
  }
});
console.log();
console.log(`Всього багів (slug дублікат + name різні): ${count}`);
