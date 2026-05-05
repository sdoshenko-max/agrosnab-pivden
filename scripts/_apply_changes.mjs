// Застосовує рішення з _decisions.json до lib/products.ts
// EDIT: міняє group/groupSlug у рядку SKU
// DELETE: видаляє рядок повністю

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsPath = path.join(__dirname, "..", "lib", "products.ts");
const decisionsPath = path.join(__dirname, "_decisions.json");

const decisions = JSON.parse(readFileSync(decisionsPath, "utf8"));
const decisionBySlug = new Map(decisions.map(d => [d.slug, d]));

const codeToGroup = {
  H: { name: "Гербіцид", slug: "herbitsydy" },
  F: { name: "Фунгіцид", slug: "funhitsydy" },
  I: { name: "Інсектицид", slug: "insektitsydy" },
};

const txt = readFileSync(productsPath, "utf8");
const lines = txt.split(/\r?\n/);

const out = [];
let edited = 0, deleted = 0, kept = 0, untouched = 0;

for (const line of lines) {
  const skuMatch = line.match(/^\s*\{\s*slug:\s*"([^"]+)"/);
  if (!skuMatch) {
    out.push(line);
    untouched++;
    continue;
  }
  const slug = skuMatch[1];
  const d = decisionBySlug.get(slug);
  if (!d) {
    // на всяк випадок
    out.push(line);
    kept++;
    continue;
  }
  if (d.decision === "DELETE") {
    deleted++;
    continue; // пропускаємо рядок — видаляємо
  }
  if (d.decision === "EDIT") {
    const g = codeToGroup[d.to];
    let newLine = line
      .replace(/group:\s*"[^"]*"/, `group: "${g.name}"`)
      .replace(/groupSlug:\s*"[^"]*"/, `groupSlug: "${g.slug}"`);
    out.push(newLine);
    edited++;
    continue;
  }
  // KEEP
  out.push(line);
  kept++;
}

writeFileSync(productsPath, out.join("\n"), "utf8");

console.log(`Готово.`);
console.log(`  Залишено без змін:  ${kept}`);
console.log(`  Категорія змінена:  ${edited}`);
console.log(`  Видалено:           ${deleted}`);
console.log(`  Інші рядки файлу:   ${untouched}`);
