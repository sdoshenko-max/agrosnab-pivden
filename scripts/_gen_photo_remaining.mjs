import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const TARGET_MANUFACTURER = process.argv[2] || "Укравіт";
const TARGET_FOLDER = process.argv[3] || "ukravit";

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
  ai: get(l, "activeIngredient"),
}));

const remaining = items.filter(i => i.manufacturer === TARGET_MANUFACTURER && !i.image);
console.log(`${TARGET_MANUFACTURER} без фото: ${remaining.length}`);

const outDir = path.join(root, "_photo_review", TARGET_FOLDER);
mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "_remaining.json");
const out = remaining.map(({ slug, code, name, group, packaging, ai }) => ({
  slug, code, name, group, packaging, activeIngredient: ai,
}));
writeFileSync(outFile, JSON.stringify(out, null, 2), "utf8");
console.log(`Записано: ${outFile}`);
