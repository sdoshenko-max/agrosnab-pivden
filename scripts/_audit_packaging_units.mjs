import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDryProductLike, normalizePkg, unitFromPkg } from "./_lib_packaging.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const productsPath = path.join(root, "lib", "products.ts");
const lines = readFileSync(productsPath, "utf8").split(/\r?\n/);
const skuLineRe = /^(\s*)\{\s*slug:\s*"([^"]+)",\s*code:\s*"(\d+)"(.*)\}\s*,?\s*$/;

function parseFields(rest) {
  const obj = {};
  const inner = rest.replace(/^,\s*/, "").replace(/\s*$/, "");
  const parts = [];
  let buf = "", depth = 0, inS = false;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (inS) {
      buf += c;
      if (c === '"' && inner[i - 1] !== "\\") inS = false;
      continue;
    }
    if (c === '"') { inS = true; buf += c; continue; }
    if (c === "[") { depth++; buf += c; continue; }
    if (c === "]") { depth--; buf += c; continue; }
    if (c === "," && depth === 0) { parts.push(buf.trim()); buf = ""; continue; }
    buf += c;
  }
  if (buf.trim()) parts.push(buf.trim());
  for (const p of parts) {
    const m = p.match(/^([a-zA-Z]+):\s*(.+)$/);
    if (m) obj[m[1]] = m[2];
  }
  return obj;
}

const unquote = (value) => String(value || "").replace(/^"|"$/g, "");
const hasLiquidPack = (packaging) => /(л|мл)/i.test(packaging);
const explicitLiquid = (text) => /(^|[^a-zа-яёіїєґ0-9])(ліквід|liquid|рк|р\.к|кс|к\.с|ке|к\.е|мк|м\.к|се|с\.е|ме|м\.е|вс|в\.с)(?=$|[^a-zа-яёіїєґ0-9])/i.test(text);
const hasDrySignal = (text) =>
  /г\s*\/\s*кг/i.test(text)
  || /(^|[^a-zа-яёіїєґ0-9])(вг|в\.г|вдг|в\.д\.г|зп|з\.п|вп|в\.п|сг|с\.г|тб)(?=$|[^a-zа-яёіїєґ0-9])/i.test(text)
  || /(^|[^а-яёіїєґ])(кг|г|гр)\s*\/\s*(га|т|100)/i.test(text);

function isLiquidRodentConcentrate(product) {
  if (product.groupSlug !== "rodentytsydy" || product.unit !== "л") return false;
  const text = [product.name, product.rate].join(" ").toLowerCase();
  return /(^|[^а-яёіїєґ])р(?=$|[^а-яёіїєґ])/.test(text)
    || /мл\s+на\s+1\s*кг\s+принади/.test(text)
    || /мл\s+на\s+1\s*кг\s+приманки/.test(text);
}

const hard = [];
const concentration = [];
const ambiguous = [];

for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(skuLineRe);
  if (!m) continue;
  const fields = parseFields(m[4]);
  const product = {
    line: i + 1,
    slug: m[2],
    code: m[3],
    name: unquote(fields.name),
    groupSlug: unquote(fields.groupSlug),
    activeIngredient: unquote(fields.activeIngredient),
    packaging: unquote(fields.packaging),
    rate: unquote(fields.rate),
    unit: unquote(fields.unit),
    concentration: unquote(fields.concentration),
  };
  const hints = { name: product.name, activeIngredient: product.activeIngredient, rate: product.rate };
  const text = [product.name, product.activeIngredient, product.rate].join(" ").toLowerCase();
  const normalizedPkg = normalizePkg(product.packaging, hints);
  const normalizedUnit = product.packaging ? unitFromPkg(normalizedPkg, hints) : product.unit;

  if (isDryProductLike(hints) && product.packaging && (normalizedPkg !== product.packaging || normalizedUnit !== product.unit)) {
    hard.push(Object.assign({}, product, { normalizedPkg, normalizedUnit }));
  }
  if (!explicitLiquid(text) && /г\s*\/\s*кг/i.test(product.activeIngredient) && !/г\s*\/\s*л/i.test(product.activeIngredient) && /г\s*\/\s*л/i.test(product.concentration)) {
    concentration.push(product);
  }
  if (!isLiquidRodentConcentrate(product) && !isDryProductLike(hints) && hasLiquidPack(product.packaging) && hasDrySignal(text)) {
    ambiguous.push(product);
  }
}

console.log("Hard dry/liquid mismatches: " + hard.length);
console.log("Concentration g/kg vs g/l mismatches: " + concentration.length);
console.log("Ambiguous liquid-looking rows with dry signals: " + ambiguous.length);

for (const item of hard.slice(0, 80)) {
  console.log("HARD " + item.line + " " + item.code + " " + item.name + ": " + item.packaging + "/" + item.unit + " -> " + item.normalizedPkg + "/" + item.normalizedUnit);
}
for (const item of concentration.slice(0, 80)) {
  console.log("CONC " + item.line + " " + item.code + " " + item.name + ": " + item.concentration);
}
for (const item of ambiguous.slice(0, 40)) {
  console.log("AMBIG " + item.line + " " + item.code + " " + item.name + ": " + item.packaging + "/" + item.unit + "; " + item.activeIngredient + "; " + item.rate);
}

if (hard.length || concentration.length) process.exit(1);
