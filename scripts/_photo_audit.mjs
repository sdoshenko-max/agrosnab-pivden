// Аудит фото: для кожного SKU перевіряє наявність /products/<code>.jpg і /products/<slug>.jpg
// Виводить звіт _PHOTO_AUDIT.md з розбивкою по виробниках і пріоритетами.

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const photosDir = path.join(root, "public", "products");

// === Збираємо список фото у public/products/ ===
const photoFiles = new Set();
if (existsSync(photosDir)) {
  for (const f of readdirSync(photosDir)) {
    if (/\.(jpg|jpeg|png|webp)$/i.test(f)) {
      photoFiles.add(f.toLowerCase());
    }
  }
}

// === Парсимо products.ts ===
const text = readFileSync(path.join(root, "lib", "products.ts"), "utf8");
const skuRe = /^\s*\{\s*slug:\s*"([^"]+)",\s*code:\s*"(\d+)",\s*name:\s*"([^"]+)",\s*nameRu:\s*"[^"]*",\s*manufacturer:\s*"([^"]+)",\s*tier:\s*"([^"]+)",\s*group:\s*"([^"]+)"/;

const skus = [];
for (const line of text.split(/\r?\n/)) {
  const m = line.match(skuRe);
  if (!m) continue;
  skus.push({
    slug: m[1], code: m[2], name: m[3], manufacturer: m[4], tier: m[5], group: m[6],
  });
}

// === Класифікація: hasCode / hasSlug / none ===
const stats = {
  total: skus.length,
  hasCode: 0,
  hasSlugOnly: 0,
  none: 0,
};
const byManufacturer = new Map();
const byCategory = new Map();
const noneList = [];

const has = (filename) => photoFiles.has(filename.toLowerCase());

for (const sku of skus) {
  const codeJpg = `${sku.code}.jpg`;
  const slugJpg = `${sku.slug}.jpg`;
  let status;
  if (has(codeJpg)) status = "hasCode";
  else if (has(slugJpg)) status = "hasSlugOnly";
  else status = "none";
  stats[status]++;

  const m = sku.manufacturer;
  if (!byManufacturer.has(m)) byManufacturer.set(m, { total: 0, hasCode: 0, hasSlugOnly: 0, none: 0 });
  const bm = byManufacturer.get(m);
  bm.total++; bm[status]++;

  const c = sku.group;
  if (!byCategory.has(c)) byCategory.set(c, { total: 0, hasCode: 0, hasSlugOnly: 0, none: 0 });
  const bc = byCategory.get(c);
  bc.total++; bc[status]++;

  if (status === "none") noneList.push(sku);
}

// === Згенеруємо звіт ===
let md = `# Аудит фото товарів\n\nЗгенеровано: ${new Date().toISOString().slice(0, 19)}\n\n`;
md += `## Підсумок (${stats.total} SKU)\n\n`;
md += `| Стан | К-сть | % |\n|---|---:|---:|\n`;
md += `| ✅ Унікальне фото за кодом | ${stats.hasCode} | ${(stats.hasCode/stats.total*100).toFixed(1)}% |\n`;
md += `| 🟡 Лише generic-фото за slug | ${stats.hasSlugOnly} | ${(stats.hasSlugOnly/stats.total*100).toFixed(1)}% |\n`;
md += `| ❌ Немає фото взагалі | ${stats.none} | ${(stats.none/stats.total*100).toFixed(1)}% |\n\n`;

md += `## По виробниках\n\n`;
md += `| Виробник | Total | З кодом | Тільки slug | Без фото |\n|---|---:|---:|---:|---:|\n`;
const mfrSorted = Array.from(byManufacturer.entries()).sort((a, b) => b[1].none - a[1].none);
for (const [m, s] of mfrSorted) {
  md += `| ${m} | ${s.total} | ${s.hasCode} | ${s.hasSlugOnly} | **${s.none}** |\n`;
}

md += `\n## По категоріях\n\n`;
md += `| Категорія | Total | З кодом | Тільки slug | Без фото |\n|---|---:|---:|---:|---:|\n`;
for (const [c, s] of byCategory.entries()) {
  md += `| ${c} | ${s.total} | ${s.hasCode} | ${s.hasSlugOnly} | **${s.none}** |\n`;
}

md += `\n## Без фото — топ-100 (потребують найбільшої уваги)\n\n`;
md += `| Код | Назва | Виробник | Tier |\n|---|---|---|---|\n`;
for (const sku of noneList.slice(0, 100)) {
  md += `| ${sku.code} | ${sku.name} | ${sku.manufacturer} | ${sku.tier} |\n`;
}
if (noneList.length > 100) md += `\n*… і ще ${noneList.length - 100} SKU без фото.*\n`;

writeFileSync(path.join(root, "_PHOTO_AUDIT.md"), md, "utf8");

console.log(`✅ Готово. _PHOTO_AUDIT.md створено.`);
console.log(`   Всього SKU:                ${stats.total}`);
console.log(`   ✅ Унікальне фото (code):  ${stats.hasCode}`);
console.log(`   🟡 Generic фото (slug):    ${stats.hasSlugOnly}`);
console.log(`   ❌ Без фото:               ${stats.none}`);
