// Конвертує фото з _photo_review/<vendor>/<code>.<ext>:
//   - resize до 800×800 з білим тлом (fit: contain)
//   - flatten прозорість на біле
//   - JPEG mozjpeg, авто-тюнінг quality поки <=200KB
//   - зберігає в public/products/<slug>.jpg
//   - оновлює `image: "/products/<slug>.jpg"` у lib/products.ts (за code)
//
// Використання: node scripts/_apply_photos.mjs <vendor1> <vendor2> ...
// Без аргументів — обробляє ВСІ папки в _photo_review/.

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const reviewDir = path.join(root, "_photo_review");
const productsDir = path.join(root, "public", "products");
mkdirSync(productsDir, { recursive: true });

const vendorArgs = process.argv.slice(2);
const allVendors = readdirSync(reviewDir).filter(d => statSync(path.join(reviewDir, d)).isDirectory());
const vendors = vendorArgs.length ? vendorArgs : allVendors;

// === Парсимо products.ts: code → slug ===
const productsPath = path.join(root, "lib", "products.ts");
const txt = readFileSync(productsPath, "utf8");
let lines = txt.split("\n");

const skuLineRe = /^(\s*)\{\s*slug:\s*"([^"]+)",(.*)\}\s*,?\s*$/;
const get = (l, key) => {
  const re = new RegExp(`(?:^|[ ,])${key}:\\s*"([^"]*)"`);
  const m = l.match(re);
  return m ? m[1] : "";
};

const codeToInfo = {};  // code -> { slug, lineIdx }
const slugToCodes = {}; // slug -> [code, ...]
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(skuLineRe);
  if (!m) continue;
  const slug = m[2];
  const code = get(lines[i], "code");
  if (!code) continue;
  codeToInfo[code] = { slug, lineIdx: i };
  if (!slugToCodes[slug]) slugToCodes[slug] = [];
  slugToCodes[slug].push(code);
}

console.log(`Каталог: ${Object.keys(codeToInfo).length} SKU за кодами, ${Object.keys(slugToCodes).length} унікальних slug.`);

const TARGET_SIZE = 800;
const MAX_BYTES = 200_000;

async function convert(input, output) {
  let q = 90;
  let buf;
  while (q >= 40) {
    buf = await sharp(input)
      .flatten({ background: "#ffffff" })
      .resize(TARGET_SIZE, TARGET_SIZE, { fit: "contain", background: "#ffffff" })
      .jpeg({ quality: q, mozjpeg: true })
      .toBuffer();
    if (buf.length <= MAX_BYTES) break;
    q -= 10;
  }
  writeFileSync(output, buf);
  return { quality: q, size: buf.length };
}

const results = [];
const slugsTouched = new Set();

for (const vendor of vendors) {
  const vDir = path.join(reviewDir, vendor);
  if (!statSync(vDir).isDirectory()) continue;
  const files = readdirSync(vDir).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  console.log(`\n=== ${vendor} (${files.length} файлів) ===`);

  // Дедуп: для одного code (з різних розширень) бере перший
  const seen = new Set();
  for (const f of files) {
    const code = path.basename(f, path.extname(f));
    if (seen.has(code)) continue;
    seen.add(code);

    const info = codeToInfo[code];
    if (!info) {
      console.log(`  ⚠ ${vendor}/${f}: code=${code} не знайдено в каталозі — пропуск`);
      results.push({ vendor, file: f, code, status: "no-sku" });
      continue;
    }
    const { slug } = info;
    if (slugsTouched.has(slug)) {
      // Slug уже отримав фото з іншого code (різна фасовка) — пропускаємо повтор
      results.push({ vendor, file: f, code, slug, status: "skip-already-applied" });
      continue;
    }

    const input = path.join(vDir, f);
    const output = path.join(productsDir, `${slug}.jpg`);
    try {
      const { quality, size } = await convert(input, output);
      slugsTouched.add(slug);
      results.push({ vendor, file: f, code, slug, status: "ok", quality, size });
      process.stdout.write(`  ✓ ${slug}.jpg (q=${quality}, ${(size / 1024).toFixed(0)} KB)\n`);
    } catch (e) {
      results.push({ vendor, file: f, code, slug, status: "error", error: e.message });
      console.log(`  ✗ ${vendor}/${f}: ${e.message}`);
    }
  }
}

console.log(`\n=== Конвертація завершена ===`);
console.log(`OK: ${results.filter(r => r.status === "ok").length}`);
console.log(`Skip (slug уже оброблено): ${results.filter(r => r.status === "skip-already-applied").length}`);
console.log(`No SKU: ${results.filter(r => r.status === "no-sku").length}`);
console.log(`Errors: ${results.filter(r => r.status === "error").length}`);

// === Оновлюємо image у products.ts для всіх slug-ів, що отримали фото ===
const fieldRe = /(image:\s*)"[^"]*"/;
let updatedLines = 0;
for (const slug of slugsTouched) {
  for (const code of slugToCodes[slug] || []) {
    const info = codeToInfo[code];
    const i = info.lineIdx;
    const newImage = `/products/${slug}.jpg`;
    const line = lines[i];
    if (fieldRe.test(line)) {
      // Поле image вже є — оновлюємо
      lines[i] = line.replace(fieldRe, `$1"${newImage}"`);
      updatedLines++;
    } else {
      // Поля image нема — додаємо перед '}' в кінці рядка
      // Формат: { ..., stage: [...] },  →  { ..., stage: [...], image: "..." },
      const closeMatch = line.match(/^(.*\S)\s*\},?(\s*)$/);
      if (closeMatch) {
        lines[i] = `${closeMatch[1]}, image: "${newImage}" },${closeMatch[2]}`;
        updatedLines++;
      }
    }
  }
}

writeFileSync(productsPath, lines.join("\n"), "utf8");
console.log(`\nОновлено рядків у products.ts: ${updatedLines}`);
console.log(`Унікальних slug з новим фото: ${slugsTouched.size}`);
