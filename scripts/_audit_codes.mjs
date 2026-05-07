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
  manufacturer: get(l, "manufacturer"),
  group: get(l, "group"),
  packaging: get(l, "packaging"),
}));

console.log("Всього SKU:", items.length);

const noCode = items.filter(i => !i.code);
console.log("Без коду:", noCode.length);
if (noCode.length) noCode.slice(0, 15).forEach(x => console.log(`  - ${x.slug} | ${x.manufacturer} | ${x.name}`));

const badFmt = items.filter(i => i.code && !/^\d{4}$/.test(i.code));
console.log("Код не 4-значний:", badFmt.length);
if (badFmt.length) badFmt.slice(0, 15).forEach(x => console.log(`  - ${x.code} | ${x.slug}`));

const codes = items.map(i => i.code).filter(Boolean);
const dup = {};
codes.forEach(c => (dup[c] = (dup[c] || 0) + 1));
const dups = Object.entries(dup).filter(([, n]) => n > 1);
console.log("Дубльованих кодів:", dups.length);
if (dups.length) {
  dups.forEach(([c, n]) => {
    console.log(`  code ${c} × ${n}:`);
    items.filter(i => i.code === c).forEach(i => console.log(`    - ${i.slug} | ${i.manufacturer} | ${i.name} | ${i.packaging}`));
  });
}

const ranges = {};
codes.forEach(c => {
  const r = c[0] + "xxx";
  ranges[r] = (ranges[r] || 0) + 1;
});
console.log();
console.log("Діапазони кодів (за категоріями):");
Object.entries(ranges).sort().forEach(([r, n]) => console.log(`  ${r}: ${n}`));
