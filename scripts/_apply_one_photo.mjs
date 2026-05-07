// Конвертація одного фото з _photo_review в public/products під заданий slug.
// Використання: node scripts/_apply_one_photo.mjs <input> <slug>

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const [, , input, slug] = process.argv;
if (!input || !slug) {
  console.error("Usage: node _apply_one_photo.mjs <input> <slug>");
  process.exit(1);
}

const productsDir = path.join(root, "public", "products");
mkdirSync(productsDir, { recursive: true });

const inputPath = path.resolve(root, input);
const outputPath = path.join(productsDir, `${slug}.jpg`);

let q = 90;
let buf;
while (q >= 40) {
  buf = await sharp(inputPath)
    .flatten({ background: "#ffffff" })
    .resize(800, 800, { fit: "contain", background: "#ffffff" })
    .jpeg({ quality: q, mozjpeg: true })
    .toBuffer();
  if (buf.length <= 200_000) break;
  q -= 10;
}
writeFileSync(outputPath, buf);
console.log(`OK ${slug}.jpg q=${q} ${(buf.length / 1024).toFixed(0)} KB`);
