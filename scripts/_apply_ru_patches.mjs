// Зливає всі _ru_patches/*.json у lib/articles.ts.
// Для кожного патча знаходить об'єкт article з відповідним slug,
// вставляє RU-поля (titleRu/descriptionRu/bodyRu, опціонально blocksRu/subtitleRu/categoryRu/readingTimeRu)
// перед закриваючою `}` об'єкта.
//
// Серіалізує всі значення через JSON.stringify (TS приймає JSON literal як валідний JS expression).

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARTICLES_TS = join(__dirname, "..", "lib", "articles.ts");
const PATCHES_DIR = join(__dirname, "..", "_ru_patches");

function findObjectEnd(text, openIdx) {
  // Знайти позицію `}` що закриває об'єкт, починаючи з відкриваючої `{` на openIdx.
  let depth = 0;
  let inString = null;
  let inTemplate = false;
  let templateExpr = 0;
  for (let i = openIdx; i < text.length; i++) {
    const ch = text[i];
    const prev = i > 0 ? text[i - 1] : "";
    if (inString) {
      if (ch === inString && prev !== "\\") inString = null;
      continue;
    }
    if (inTemplate) {
      if (ch === "`" && prev !== "\\" && templateExpr === 0) {
        inTemplate = false;
      } else if (ch === "$" && text[i + 1] === "{") {
        templateExpr += 1;
        i += 1;
      } else if (ch === "}" && templateExpr > 0) {
        templateExpr -= 1;
      }
      continue;
    }
    if (ch === '"' || ch === "'") { inString = ch; continue; }
    if (ch === "`") { inTemplate = true; continue; }
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

const patchFiles = readdirSync(PATCHES_DIR).filter((f) => f.endsWith(".json"));
console.log(`Patches found: ${patchFiles.length}`);

let src = readFileSync(ARTICLES_TS, "utf8");
let appliedCount = 0;

for (const file of patchFiles) {
  const patch = JSON.parse(readFileSync(join(PATCHES_DIR, file), "utf8"));
  const slug = patch.slug;
  if (!slug) {
    console.warn(`  skip ${file}: no slug`);
    continue;
  }

  // Знайти `slug: "X"` і відкатитися назад до `{` який починає цей об'єкт.
  const slugMarker = `slug: "${slug}"`;
  const slugIdx = src.indexOf(slugMarker);
  if (slugIdx === -1) {
    console.warn(`  skip ${slug}: not found in articles.ts`);
    continue;
  }
  // Шукаємо найближчу `{` назад
  let openIdx = slugIdx;
  while (openIdx >= 0 && src[openIdx] !== "{") openIdx -= 1;
  if (openIdx < 0) {
    console.warn(`  skip ${slug}: no opening {`);
    continue;
  }
  const closeIdx = findObjectEnd(src, openIdx);
  if (closeIdx < 0) {
    console.warn(`  skip ${slug}: no closing }`);
    continue;
  }

  // Перевірити, чи titleRu вже є в цьому об'єкті — щоб ідемпотентно
  const objText = src.slice(openIdx, closeIdx + 1);
  if (objText.includes("titleRu:")) {
    console.log(`  skip ${slug}: already has RU fields`);
    continue;
  }

  // Зібрати RU-поля
  const fields = [];
  if (patch.titleRu) fields.push(`    titleRu: ${JSON.stringify(patch.titleRu)},`);
  if (patch.descriptionRu) fields.push(`    descriptionRu: ${JSON.stringify(patch.descriptionRu)},`);
  if (patch.bodyRu) fields.push(`    bodyRu: ${JSON.stringify(patch.bodyRu)},`);
  if (patch.subtitleRu) fields.push(`    subtitleRu: ${JSON.stringify(patch.subtitleRu)},`);
  if (patch.categoryRu) fields.push(`    categoryRu: ${JSON.stringify(patch.categoryRu)},`);
  if (patch.readingTimeRu) fields.push(`    readingTimeRu: ${JSON.stringify(patch.readingTimeRu)},`);
  if (patch.blocksRu && Array.isArray(patch.blocksRu)) {
    fields.push(`    blocksRu: ${JSON.stringify(patch.blocksRu, null, 2).split("\n").map((l, idx) => idx === 0 ? l : "    " + l).join("\n")},`);
  }
  if (fields.length === 0) {
    console.warn(`  skip ${slug}: empty patch`);
    continue;
  }

  // Вставляємо перед `}`. Шукаємо позицію кінця попередньої строки: відступаємо назад поки не буде `\n`.
  let insertAt = closeIdx;
  // Зрозуміти, чи перед `}` стоїть кома після останнього поля. Зазвичай останнє поле теж має кому.
  // Безпечно: вставляємо новий рядок з полями перед `}`.
  const insert = "\n" + fields.join("\n") + "\n  ";
  src = src.slice(0, insertAt) + insert + src.slice(insertAt);
  appliedCount += 1;
  console.log(`  applied ${slug}: +${fields.length} fields`);
}

writeFileSync(ARTICLES_TS, src);
console.log(`\nDone: ${appliedCount}/${patchFiles.length} patches applied.`);
