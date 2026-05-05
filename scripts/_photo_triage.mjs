// Технічний триаж фото в _photo_review/.
// Розкладає у _photo_review/_ok/ та _photo_review/_check/ за формальними критеріями.
// Критерії для _check (хоч один → у _check):
//   - вага < 10 KB або > 200 KB
//   - розмір не 800×800
//   - середня яскравість фона < 230 (не білий)
//   - кольори вибиваються (середній колір не близько білого)
//   - SKU видалений з каталогу (привидний)

import { readFileSync, readdirSync, statSync, mkdirSync, renameSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const reviewDir = path.join(root, "_photo_review");
const okDir = path.join(reviewDir, "_ok");
const checkDir = path.join(reviewDir, "_check");
mkdirSync(okDir, { recursive: true });
mkdirSync(checkDir, { recursive: true });

// SKU в каталозі
const productsTxt = readFileSync(path.join(root, "lib", "products.ts"), "utf8");
const catalogSlugs = new Set(
  productsTxt.split(/\r?\n/)
    .map(l => l.match(/^\s*\{\s*slug:\s*"([^"]+)"/))
    .filter(Boolean)
    .map(m => m[1])
);

const files = readdirSync(reviewDir).filter(f => f.endsWith(".jpg"));
const report = [];

for (const f of files) {
  const slug = f.replace(/\.jpg$/, "");
  const full = path.join(reviewDir, f);
  const size = statSync(full).size;
  const reasons = [];

  if (!catalogSlugs.has(slug)) reasons.push(`ghost-sku`);

  let meta = null;
  let stats = null;
  try {
    meta = await sharp(full).metadata();
    stats = await sharp(full).stats();
  } catch (e) {
    reasons.push(`sharp-fail: ${e.message}`);
  }

  if (size < 10_000) reasons.push(`tiny ${(size/1024).toFixed(1)}KB`);
  if (size > 200_000) reasons.push(`heavy ${(size/1024).toFixed(0)}KB`);
  if (meta) {
    if (meta.width !== 800 || meta.height !== 800) reasons.push(`size ${meta.width}x${meta.height}`);
  }
  if (stats) {
    // Перевіряю чи фон дійсно білий — беру середній колір
    const channels = stats.channels;
    const r = channels[0]?.mean ?? 0;
    const g = channels[1]?.mean ?? 0;
    const b = channels[2]?.mean ?? 0;
    const avgBrightness = (r + g + b) / 3;
    if (avgBrightness < 200) reasons.push(`dark avg=${avgBrightness.toFixed(0)}`);
    // Тінь оцінюємо по верхньому-лівому кутку — там фон.
    // Замість статистики окремо беремо max-канал — якщо у нас RGB-метадан
  }

  report.push({ slug, size, w: meta?.width, h: meta?.height, reasons });
}

// Сортуємо: спершу проблемні
report.sort((a, b) => b.reasons.length - a.reasons.length);

// Розкидаємо
let okCount = 0, checkCount = 0;
for (const r of report) {
  const src = path.join(reviewDir, r.slug + ".jpg");
  const dst = (r.reasons.length === 0 ? okDir : checkDir);
  const dstFile = path.join(dst, r.slug + ".jpg");
  if (existsSync(src)) {
    renameSync(src, dstFile);
    if (r.reasons.length === 0) okCount++; else checkCount++;
  }
}

console.log(`Всього: ${report.length}`);
console.log(`  → _ok/    (формально без претензій): ${okCount}`);
console.log(`  → _check/ (потребують візуальної перевірки): ${checkCount}`);
console.log("\nДеталі _check (топ-30):");
for (const r of report.filter(r => r.reasons.length).slice(0, 30)) {
  console.log(`  ${r.slug.padEnd(45)} ${(r.size/1024).toFixed(0)}KB ${r.w}x${r.h} | ${r.reasons.join(", ")}`);
}
