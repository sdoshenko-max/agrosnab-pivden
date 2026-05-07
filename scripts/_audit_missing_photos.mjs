import { readFileSync, readdirSync, writeFileSync, statSync } from "node:fs";
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
  image: get(l, "image"),
  tier: get(l, "tier"),
}));

const reviewDir = path.join(root, "_photo_review");
const reviewCodes = new Set();
for (const folder of readdirSync(reviewDir)) {
  const fp = path.join(reviewDir, folder);
  if (!statSync(fp).isDirectory()) continue;
  for (const f of readdirSync(fp)) {
    if (!/\.(jpe?g|png|webp)$/i.test(f)) continue;
    reviewCodes.add(path.basename(f, path.extname(f)));
  }
}

const noImage = items.filter(i => !i.image);
const noImageNoCandidate = noImage.filter(i => !reviewCodes.has(i.code));
const noImageWithCandidate = noImage.filter(i => reviewCodes.has(i.code));

const groupBy = (arr, key) => {
  const m = {};
  for (const x of arr) (m[x[key]] = m[x[key]] || []).push(x);
  return m;
};

const noCandByManu = groupBy(noImageNoCandidate, "manufacturer");
const withCandByManu = groupBy(noImageWithCandidate, "manufacturer");

console.log("=== Підсумок ===");
console.log(`Всього SKU: ${items.length}`);
console.log(`З image: ${items.length - noImage.length}`);
console.log(`Без image: ${noImage.length}`);
console.log(`  - з кандидатом у _photo_review/: ${noImageWithCandidate.length}`);
console.log(`  - без кандидата (треба шукати нові): ${noImageNoCandidate.length}`);

console.log();
console.log("=== Без фото і без кандидата у review (треба пошук) ===");
console.log("Виробник | SKU без фото");
console.log("---|---");
const sorted = Object.entries(noCandByManu).sort((a, b) => b[1].length - a[1].length);
for (const [manu, arr] of sorted) {
  console.log(`${manu} | ${arr.length}`);
}

console.log();
console.log("=== Розподіл по tier (без кандидата) ===");
const tiers = {};
for (const x of noImageNoCandidate) tiers[x.tier] = (tiers[x.tier] || 0) + 1;
for (const [t, n] of Object.entries(tiers)) console.log(`  ${t}: ${n}`);

// === Запис повного списку у markdown ===
const lines_out = [
  "# Список SKU без фото",
  "",
  `**Згенеровано:** ${new Date().toISOString()}`,
  `**Всього без фото:** ${noImage.length} з ${items.length}`,
  `- Уже мають кандидата в \`_photo_review/\`: ${noImageWithCandidate.length}`,
  `- Без кандидата (треба пошук нових): ${noImageNoCandidate.length}`,
  "",
  "---",
  "",
  "## A. SKU без фото і без кандидата (потрібен новий пошук)",
  "",
];

for (const [manu, arr] of sorted) {
  lines_out.push(`### ${manu} — ${arr.length} SKU`);
  lines_out.push("");
  lines_out.push("| Код | Назва | Група | Фасовка | Тир |");
  lines_out.push("|---|---|---|---|---|");
  arr.sort((a, b) => a.name.localeCompare(b.name, "uk"));
  for (const x of arr) {
    lines_out.push(`| ${x.code} | ${x.name} | ${x.group} | ${x.packaging} | ${x.tier} |`);
  }
  lines_out.push("");
}

lines_out.push("---");
lines_out.push("");
lines_out.push("## B. SKU без фото, але кандидат уже є в `_photo_review/` (Сергій зараз робить ревʼю)");
lines_out.push("");

const withCandSorted = Object.entries(withCandByManu).sort((a, b) => b[1].length - a[1].length);
for (const [manu, arr] of withCandSorted) {
  lines_out.push(`### ${manu} — ${arr.length} SKU`);
  lines_out.push("");
  lines_out.push("| Код | Назва | Група | Фасовка |");
  lines_out.push("|---|---|---|---|");
  arr.sort((a, b) => a.name.localeCompare(b.name, "uk"));
  for (const x of arr) {
    lines_out.push(`| ${x.code} | ${x.name} | ${x.group} | ${x.packaging} |`);
  }
  lines_out.push("");
}

writeFileSync(path.join(root, "_PHOTO_MISSING.md"), lines_out.join("\n"), "utf8");
console.log();
console.log("→ Повний список збережено: _PHOTO_MISSING.md");
