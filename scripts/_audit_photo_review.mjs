import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const folderToManufacturer = {
  "adama": ["Adama", "Адама"],
  "baier": ["Байер"],
  "basf": ["Басф"],
  "fms": ["ФМС"],
  "korteva": ["Кортева"],
  "sammit-agro": ["Самміт-Агро"],
  "synhenta": ["Сингента"],
};

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
  image: get(l, "image"),
}));

const byCode = {};
items.forEach(i => {
  if (!byCode[i.code]) byCode[i.code] = [];
  byCode[i.code].push(i);
});

const reviewDir = path.join(root, "_photo_review");
const folders = readdirSync(reviewDir).filter(f => statSync(path.join(reviewDir, f)).isDirectory());

const orphanCodes = [];
const mismatchManufacturer = [];
const okFiles = [];
const dupCodes = [];
const codesByFolder = {};

let totalFiles = 0;

for (const folder of folders) {
  const expectedManus = folderToManufacturer[folder];
  if (!expectedManus) {
    console.log(`⚠ Невідома папка: ${folder} (нема в маппінгу)`);
    continue;
  }
  const files = readdirSync(path.join(reviewDir, folder)).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  codesByFolder[folder] = [];

  for (const f of files) {
    totalFiles++;
    const code = path.basename(f, path.extname(f));
    codesByFolder[folder].push(code);

    const skus = byCode[code];
    if (!skus) {
      orphanCodes.push({ folder, file: f, code });
      continue;
    }
    if (skus.length > 1) {
      dupCodes.push({ folder, file: f, code, count: skus.length });
    }
    const wrongManu = skus.filter(s => !expectedManus.includes(s.manufacturer));
    if (wrongManu.length === skus.length) {
      mismatchManufacturer.push({
        folder,
        file: f,
        code,
        expected: expectedManus.join(" / "),
        actual: skus.map(s => `${s.manufacturer} (${s.name})`).join(" | "),
      });
    } else {
      okFiles.push({ folder, file: f, code, name: skus[0].name });
    }
  }
}

console.log(`=== Аудит _photo_review ===`);
console.log(`Файлів усього: ${totalFiles}`);
console.log(`✓ OK (код знайдено в каталозі, виробник збігається): ${okFiles.length}`);
console.log(`✗ Mismatch виробника (код є, але manufacturer інший): ${mismatchManufacturer.length}`);
console.log(`✗ Orphan коди (немає такого SKU в каталозі): ${orphanCodes.length}`);
console.log(`⚠ Дубльовані коди (кілька SKU з одним кодом): ${dupCodes.length}`);

if (mismatchManufacturer.length) {
  console.log();
  console.log(`=== ✗ MISMATCH виробника (${mismatchManufacturer.length}) — критично ===`);
  mismatchManufacturer.forEach(m => {
    console.log(`  ${m.folder}/${m.file}  code=${m.code}  очікувалось: ${m.expected}, у каталозі: ${m.actual}`);
  });
}

if (orphanCodes.length) {
  console.log();
  console.log(`=== ✗ ORPHAN коди (${orphanCodes.length}) — фото є, SKU нема ===`);
  orphanCodes.forEach(o => {
    console.log(`  ${o.folder}/${o.file}  code=${o.code}`);
  });
}

if (dupCodes.length) {
  console.log();
  console.log(`=== ⚠ Дубльовані коди (${dupCodes.length}) — на одному коді кілька SKU ===`);
  dupCodes.forEach(d => {
    const skus = byCode[d.code];
    console.log(`  ${d.folder}/${d.file}  code=${d.code}:`);
    skus.forEach(s => console.log(`    - ${s.slug} | ${s.manufacturer} | ${s.name}`));
  });
}

// Скільки SKU без фото в каталозі
const skusWithoutImage = items.filter(i => !i.image);
console.log();
console.log(`=== Покриття каталогу ===`);
console.log(`SKU усього: ${items.length}`);
console.log(`SKU без image в каталозі: ${skusWithoutImage.length}`);
console.log(`Унікальних кодів у _photo_review: ${new Set(Object.values(codesByFolder).flat()).size}`);

// Перетин: скільки з фото-кодів реально допоможуть SKU без image
const reviewCodes = new Set(Object.values(codesByFolder).flat());
const skusWithoutImageButCovered = skusWithoutImage.filter(s => reviewCodes.has(s.code));
console.log(`SKU без image, для яких є фото в _photo_review: ${skusWithoutImageButCovered.length}`);
