// Повернення видалених SKU + перекласифікація на нові категорії.
// Вхід: /tmp/products_old.ts (з commit 46d82d5 — до hard cleanup)
//        lib/products.ts        (поточний — 333 SKU)
// Вихід: оновлений lib/products.ts з повернутими SKU + правильним group/groupSlug.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const oldTxt = readFileSync(path.join(__dirname, "_products_old.txt"), "utf8");
const curTxt = readFileSync(path.join(root, "lib", "products.ts"), "utf8");

function lineSlug(l) { const m = l.match(/^\s*\{\s*slug:\s*"([^"]+)"/); return m ? m[1] : null; }
const oldLines = oldTxt.split(/\r?\n/);
const curLines = curTxt.split(/\r?\n/);
const curSlugs = new Set(curLines.map(lineSlug).filter(Boolean));

// Видалені SKU
const deleted = oldLines.filter(l => {
  const s = lineSlug(l);
  return s && !curSlugs.has(s);
});

// Класифікатор для кожної видаленої лінії — повертає { code, name, slug }
const dict = [
  // === ПРОТРУЙНИКИ — суміш для насіння або однокомпонентний для насіннєвої обробки ===
  // Маркери: ТН (тестодип), FS (flowable seed), органічний протруйник, ризобактерії
  // Перевіряємо в порядку: спершу адʼюванти/родентициди/біопрепарати, потім решта
  // === АДʼЮВАНТИ ===
  ["етоксилат нонилфенол", "A"], ["этоксилат нонилфенол", "A"],
  ["нонилфенол", "A"],
  ["поліоксиетилен", "A"], ["полиоксиэтилен", "A"],
  ["трисилоксан", "A"],
  ["полідиметилсилоксан", "A"], ["полидиметилсилоксан", "A"],
  ["піногасник", "A"], ["пиногасник", "A"],
  ["склеювач", "A"], ["склеивач", "A"],
  ["адьювант", "A"], ["адʼювант", "A"], ["адъювант", "A"], ["адюван", "A"],
  ["прилипач", "A"],
  ["поліглюкопіраноза", "A"], ["полиглюкопираноза", "A"],
  ["рапс-клей", "A"],
  ["комплекс неорганічних", "A"],
  ["допоміжні речовини", "A"],
  ["амiнокислоти", "A"], ["амінокислоти", "A"], ["аминокислоты", "A"],
  ["поліоксиетильована", "A"], ["полиоксиэтилированная", "A"],
  ["ріпакова олія", "A"], ["рапсовое масло", "A"],
  ["жири кислоти", "A"], ["жирні кислоти", "A"],
  ["емульгатор", "A"], ["эмульгатор", "A"],
  ["поліспирти", "A"], ["полиспирты", "A"], ["поліатомні спирти", "A"], ["многоатомные спирты", "A"], ["багатоатомні спирти", "A"],
  ["модифікований трисилоксан", "A"],
  // === РОДЕНТИЦИДИ ===
  ["бродіфакум", "Ro"], ["бродифакум", "Ro"], ["brodifacoum", "Ro"],
  ["етанол сульфату натрію", "Ro"], ["этанол сульфата натрия", "Ro"],
  ["фосфід алюмінію", "Ro"], ["фосфид алюминия", "Ro"],
  // === БІОПРЕПАРАТИ для насіння → протруйники ===
  ["bradyrhizobium", "P"],
  ["trichoderma", "P"],
  ["bacillus", "P"],
  ["ризобактерії", "P"], ["ризобактерии", "P"],
  ["органічний протруйник", "P"],
  // === ДЕСИКАНТИ ===
  ["дикват", "D"], ["диквата", "D"], ["диквату", "D"], ["диквіт", "D"],
  ["глюфосинат", "D"], ["глуфосинат", "D"],
  // === РЕГУЛЯТОРИ РОСТУ ===
  ["хлормекват", "R"],
  ["мепікват", "R"], ["мепикват", "R"], ["міпікват", "R"], ["мипикват", "R"],
  ["етефон", "R"], ["этефон", "R"],
  ["тринексапак", "R"],
  ["паклобутразол", "R"],
  ["прогексадіон", "R"], ["прогексадион", "R"],
  // === ПРОТРУЙНИКИ — багатокомпонентна суміш або позначений ТН/FS ===
  // Залишимо це як fallback по slug-у
];

const codeToCategory = {
  P: { name: "Протруйник", slug: "protruyniky" },
  D: { name: "Десикант", slug: "desykanty" },
  R: { name: "Регулятор", slug: "regulyatory" },
  A: { name: "Адʼювант", slug: "adyuvanty" },
  Ro: { name: "Родентицид", slug: "rodentytsydy" },
};

function classify(line) {
  const ai = (line.match(/activeIngredient:\s*"([^"]+)"/) || [, ""])[1].toLowerCase().replace(/['ʼ`]/g, "");
  const slug = lineSlug(line) || "";
  // Спочатку маркер у slug — суфікс -tn-/_tn_/-fs-
  // Ставимо явні правила для протруйників
  if (/-tn-|-fs-/i.test(slug)) {
    // Перевіряємо чи це не родентицид/десикант (щоб не зловити крос-кейс)
    for (const [k, code] of dict) if (ai.includes(k) && (code === "Ro" || code === "D" || code === "R" || code === "A")) return code;
    return "P";
  }
  for (const [k, code] of dict) if (ai.includes(k)) return code;
  // Якщо не впізнано — суміш у protruyniky? Краще перевіримо багатокомпонентність.
  const partsCount = (ai.match(/\+/g) || []).length;
  if (partsCount >= 1) {
    // Багато діючих → найімовірніше протруйник насіннєвий
    if (/тіаметоксам|тебуконазол|тиаметоксам|флудиоксоніл|імідаклоприд/.test(ai)) return "P";
  }
  return null;
}

const restoredByCategory = {};
const unclassified = [];

for (const line of deleted) {
  const code = classify(line);
  if (!code) { unclassified.push(line); continue; }
  // Замінюємо group і groupSlug
  const { name, slug } = codeToCategory[code];
  let newLine = line
    .replace(/group:\s*"[^"]*"/, `group: "${name}"`)
    .replace(/groupSlug:\s*"[^"]*"/, `groupSlug: "${slug}"`);
  // Видалити image-поле, бо файлу в public/products/ нема (після cleanup ми їх стерли)
  newLine = newLine.replace(/,?\s*image:\s*"[^"]+"/, "");
  // Знову переконатись що формат об'єкта закінчується на " }"
  if (!newLine.endsWith(" },")) {
    newLine = newLine.replace(/\s*}\s*,?\s*$/, " },");
  }
  restoredByCategory[code] = restoredByCategory[code] || [];
  restoredByCategory[code].push(newLine);
}

console.log("Видалених SKU усього:", deleted.length);
console.log("Класифіковано:");
for (const code of ["P", "D", "R", "A", "Ro"]) {
  const arr = restoredByCategory[code] || [];
  console.log(`  ${codeToCategory[code].name.padEnd(15)} (${codeToCategory[code].slug.padEnd(15)}) ${arr.length}`);
}
console.log("Не класифіковано:", unclassified.length);
if (unclassified.length) {
  console.log("Не класифіковано приклади:");
  for (const l of unclassified.slice(0, 5)) {
    const slug = lineSlug(l);
    const ai = (l.match(/activeIngredient:\s*"([^"]+)"/) || [, ""])[1];
    console.log(`  ${slug.padEnd(40)} | ${ai}`);
  }
}

// Готова частина для вставлення у products.ts (перед закриваючим ];)
let restoredBlock = "";
const order = ["P", "D", "R", "A", "Ro"];
for (const code of order) {
  const arr = restoredByCategory[code] || [];
  if (!arr.length) continue;
  restoredBlock += `\n  // === Повернуто: ${codeToCategory[code].name} (${arr.length}) ===\n`;
  restoredBlock += arr.join("\n") + "\n";
}
// Додаємо unclassified як коментар, щоб людина вирішила
if (unclassified.length) {
  restoredBlock += `\n  // === Потребує ручної класифікації (${unclassified.length}) — закоментовано ===\n`;
  restoredBlock += unclassified.map(l => "  // " + l.trim()).join("\n") + "\n";
}

// Вставляємо у поточний products.ts перед "];"
const closing = "];";
const idx = curTxt.lastIndexOf(closing);
if (idx === -1) { console.error("Не знайшов ']' у products.ts"); process.exit(1); }
const newTxt = curTxt.slice(0, idx) + restoredBlock + curTxt.slice(idx);
writeFileSync(path.join(root, "lib", "products.ts"), newTxt, "utf8");
console.log(`\nlib/products.ts оновлено. Додано рядків: ${Object.values(restoredByCategory).flat().length} класифікованих + ${unclassified.length} закоментованих.`);
