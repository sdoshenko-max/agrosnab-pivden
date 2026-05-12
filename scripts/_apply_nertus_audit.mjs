// Застосовує правки з _nertus_official_audit.json до lib/products.ts:
//   1) 17 категорій (group/groupSlug) — змінити на офіційні
//   2) 5 Group1 фасовок — поправити одиниці л → кг (Майтус/Бату/Грізний/Грізний Експерт + Володар Форте packaging)
//   3) 19 Group2 фасовок — додати ДРУГИЙ SKU з офіційною фасовкою + пропорційною ціною
//
// Запуск: node scripts/_apply_nertus_audit.mjs

import fs from 'fs';

const AUDIT = '_nertus_official_audit.json';
const PRODUCTS = 'lib/products.ts';

// --- Конфіг правок ---

const GROUP_TO_SLUG = {
  'Гербіцид': 'herbitsydy',
  'Фунгіцид': 'funhitsydy',
  'Інсектицид': 'insektitsydy',
  'Протруйник': 'protruyniky',
  'Десикант': 'desykanty',
  'Регулятор росту': 'regulyatory',
  'Адʼювант': 'adyuvanty',
  'Родентицид': 'rodentytsydy',
};

// Мапа: офіційна категорія Нертуса (множина) → наша категорія (однина)
const OFFICIAL_CAT_MAP = {
  'Гербіциди': 'Гербіцид',
  'Фунгіциди': 'Фунгіцид',
  'Iнсектициди': 'Інсектицид', // на офсайті латинська «I»
  'Інсектициди': 'Інсектицид',
  'Протруйники': 'Протруйник',
  'Десиканти': 'Десикант',
  'Регулятори росту': 'Регулятор росту',
  'Адʼюванти': 'Адʼювант',
  'Родентициди': 'Родентицид',
  // Акарицид — у нашій структурі немає, маппимо в Інсектицид як найближче
  'Акарициди': 'Інсектицид',
};

// Group 1 — чіткі помилки одиниць
const G1_FIXES = {
  '1120': { packaging: '0.25 кг', unit: 'кг', reason: 'Майтус РГ — гранули' },
  '1387': { packaging: '0.25 кг', unit: 'кг', reason: 'Бату РГ — гранули' },
  '1390': { packaging: '0.25 кг', unit: 'кг', reason: 'Грізний ВГ — гранули' },
  '1391': { packaging: '0.25 кг', unit: 'кг', reason: 'Грізний Експерт ВГ — гранули' },
  '1389': { packaging: '5 л', unit: 'л', reason: 'Володар Форте RK NEW — пусто було, з офсайту 5 л' },
};

// --- Утиліти ---

function parsePkg(s) {
  // 'каністра 5л.', '1 л', '0.25 кг', 'банка 500г.', 'пакет 25г.', '20 л'
  // ⚠ JS regex \b НЕ працює з кирилицею (правило rule_js_regex_cyrillic_word_boundary)
  // Тому замість \b використовуємо явний lookahead: після одиниці допускаємо . / пробіл / кінець / не-кирилицю
  if (!s) return null;
  // Спершу шукаємо «кг» (двосимвольний — перший пріоритет)
  let m = String(s).match(/(\d+[.,]?\d*)\s*(кг|мл)(?![а-яіїєА-ЯІЇЄ])/i);
  if (!m) m = String(s).match(/(\d+[.,]?\d*)\s*(л|г)(?![а-яіїєА-ЯІЇЄ])/i);
  if (!m) return null;
  let qty = parseFloat(m[1].replace(',', '.'));
  let unit = m[2].toLowerCase();
  if (unit === 'мл') { qty = qty / 1000; unit = 'л'; }
  if (unit === 'г')  { qty = qty / 1000; unit = 'кг'; }
  return { qty, unit };
}

function fmtPkg(qty, unit) {
  // Форматування назад у formaт каталогу: «5 л», «0.5 кг»
  const q = qty < 1 ? qty.toString() : (qty % 1 === 0 ? qty.toFixed(0) : qty.toString());
  return `${q} ${unit}`;
}

function parseProductLine(line) {
  // Витягуємо ключові поля через regex
  const fields = {};
  const stringRe = /(\w+):\s*"([^"]*)"/g;
  const numberRe = /(\w+):\s*(-?\d+\.?\d*)/g;
  let m;
  while ((m = stringRe.exec(line))) {
    fields[m[1]] = m[2];
  }
  // числа окремо (priceVat, priceCash тощо) — пройдемо ще раз
  numberRe.lastIndex = 0;
  while ((m = numberRe.exec(line))) {
    if (fields[m[1]] === undefined) {
      fields[m[1]] = parseFloat(m[2]);
    }
  }
  return fields;
}

function updateField(line, key, newValue, isString = true) {
  // Заміна значення поля у TS-рядку
  const escVal = isString ? `"${newValue}"` : newValue;
  const re = new RegExp(`(${key}:\\s*)("[^"]*"|\\d+\\.?\\d*)`);
  return line.replace(re, `$1${escVal}`);
}

// --- Початок ---

const audit = JSON.parse(fs.readFileSync(AUDIT, 'utf8'));
const ts = fs.readFileSync(PRODUCTS, 'utf8');
const lines = ts.split(/\r?\n/);

// Індекс code → idxLine для Нертус-SKU
const codeToIdx = {};
const codeToLine = {};
for (let i = 0; i < lines.length; i++) {
  const ln = lines[i];
  if (!/^\s*\{\s*slug:/.test(ln)) continue;
  const fields = parseProductLine(ln);
  if (fields.manufacturer !== 'Нертус') continue;
  codeToIdx[fields.code] = i;
  codeToLine[fields.code] = ln;
}
console.log(`Нертус SKU у products.ts: ${Object.keys(codeToIdx).length}`);

// 1) КАТЕГОРІЇ
let categoriesFixed = 0;
const categoryReports = [];
for (const sku of audit.skus) {
  if (sku.category?.match) continue;
  if (!sku.category?.official) continue; // якщо пусто на офсайті — пропускаємо
  const ourCat = OFFICIAL_CAT_MAP[sku.category.official];
  if (!ourCat) {
    console.log(`  ⚠ Невідома офіційна категорія: '${sku.category.official}' для ${sku.code}`);
    continue;
  }
  const ourSlug = GROUP_TO_SLUG[ourCat];
  if (!ourSlug) {
    console.log(`  ⚠ Немає groupSlug для '${ourCat}'`);
    continue;
  }
  const idx = codeToIdx[sku.code];
  if (idx === undefined) continue;
  let line = lines[idx];
  line = updateField(line, 'group', ourCat);
  line = updateField(line, 'groupSlug', ourSlug);
  lines[idx] = line;
  categoriesFixed++;
  categoryReports.push(`  ${sku.code}  ${sku.name_catalog}  → ${ourCat}/${ourSlug}`);
}
console.log(`\n✓ Категорій виправлено: ${categoriesFixed}`);
for (const r of categoryReports) console.log(r);

// 2) GROUP 1 — чіткі помилки
let g1Fixed = 0;
const g1Reports = [];
for (const [code, fix] of Object.entries(G1_FIXES)) {
  const idx = codeToIdx[code];
  if (idx === undefined) {
    console.log(`  ⚠ Не знайшов SKU ${code}`);
    continue;
  }
  let line = lines[idx];
  // Якщо packaging пусте — треба ВСТАВИТИ packaging, а не replace
  if (!/packaging:\s*"[^"]+"/.test(line)) {
    // пусте "" — замінюємо
    line = line.replace(/packaging:\s*""/, `packaging: "${fix.packaging}"`);
  } else {
    line = updateField(line, 'packaging', fix.packaging);
  }
  line = updateField(line, 'unit', fix.unit);
  lines[idx] = line;
  g1Fixed++;
  g1Reports.push(`  ${code}  ${fix.reason}  → packaging="${fix.packaging}", unit="${fix.unit}"`);
}
console.log(`\n✓ Group1 фасовок виправлено: ${g1Fixed}`);
for (const r of g1Reports) console.log(r);

// 3) GROUP 2 — додаткові SKU з офіційною фасовкою + пропорційна ціна
// Збираємо існуючі коди по категоріях для генерації нових
const existingCodesByGroup = {};
for (let i = 0; i < lines.length; i++) {
  const ln = lines[i];
  if (!/^\s*\{\s*slug:/.test(ln)) continue;
  const f = parseProductLine(ln);
  if (!f.code || !f.groupSlug) continue;
  if (!existingCodesByGroup[f.groupSlug]) existingCodesByGroup[f.groupSlug] = new Set();
  existingCodesByGroup[f.groupSlug].add(f.code);
}

// Префікси кодів по groupSlug — реальна мапа з products.ts (підраховано на існуючих SKU)
//   1xxx=herbitsydy (549)  2xxx=funhitsydy (352)   3xxx=insektitsydy (197)
//   4xxx=protruyniky (66)  5xxx=desykanty (20)     6xxx=regulyatory (155)
//   7xxx=adyuvanty (33)    8xxx=rodentytsydy (10)
const CODE_PREFIX = {
  herbitsydy:   '1',
  funhitsydy:   '2',
  insektitsydy: '3',
  protruyniky:  '4',
  desykanty:    '5',
  regulyatory:  '6',
  adyuvanty:    '7',
  rodentytsydy: '8',
};

function generateCode(groupSlug) {
  const prefix = CODE_PREFIX[groupSlug];
  if (!prefix) return null;
  const existing = existingCodesByGroup[groupSlug] || new Set();
  // Знайти найбільший номер з префіксом
  let maxN = 0;
  for (const c of existing) {
    if (c.startsWith(prefix) && c.length === 4) {
      const n = parseInt(c.slice(1), 10);
      if (!isNaN(n) && n > maxN) maxN = n;
    }
  }
  const newN = maxN + 1;
  const newCode = `${prefix}${String(newN).padStart(3, '0')}`;
  existing.add(newCode);
  existingCodesByGroup[groupSlug] = existing;
  return newCode;
}

// Group 2 — все що не Group 1, не match, і офіційна фасовка є
const g1Codes = new Set(Object.keys(G1_FIXES));
const newSkus = [];
const g2Reports = [];

for (const sku of audit.skus) {
  if (sku.packaging?.match) continue;
  if (g1Codes.has(sku.code)) continue;
  if (!sku.packaging?.official) continue; // якщо офсайт без фасовки — пропускаємо
  const idx = codeToIdx[sku.code];
  if (idx === undefined) continue;

  // Парс старої і нової фасовки
  const oldPkg = parsePkg(sku.packaging.catalog);
  const newPkg = parsePkg(sku.packaging.official);
  if (!oldPkg || !newPkg) {
    console.log(`  ⚠ Не зміг розпарсити фасовку для ${sku.code}: catalog='${sku.packaging.catalog}', official='${sku.packaging.official}'`);
    continue;
  }
  // Якщо одиниці різні (л vs кг) — пропускаємо, це інша проблема
  if (oldPkg.unit !== newPkg.unit) {
    console.log(`  ⚠ ${sku.code} ${sku.name_catalog} — різні одиниці (${oldPkg.unit} vs ${newPkg.unit}), пропускаю`);
    continue;
  }
  const ratio = newPkg.qty / oldPkg.qty;

  // Парс ціни з рядка
  const oldFields = parseProductLine(lines[idx]);
  const oldVat = parseFloat(oldFields.priceVat);
  const oldCash = parseFloat(oldFields.priceCash);
  const newVat = +(oldVat * ratio).toFixed(2);
  const newCash = +(oldCash * ratio).toFixed(2);

  // Генеруємо новий код
  const newCode = generateCode(oldFields.groupSlug);
  if (!newCode) {
    console.log(`  ⚠ Не зміг згенерувати код для ${sku.code} (groupSlug=${oldFields.groupSlug})`);
    continue;
  }

  // Створюємо новий рядок на основі старого
  let newLine = lines[idx];
  newLine = updateField(newLine, 'code', newCode);
  newLine = updateField(newLine, 'packaging', fmtPkg(newPkg.qty, newPkg.unit));
  newLine = updateField(newLine, 'priceVat', newVat, false);
  newLine = updateField(newLine, 'priceCash', newCash, false);

  newSkus.push({ idx, newLine, oldCode: oldFields.code, newCode, oldPkg: sku.packaging.catalog, newPkg: fmtPkg(newPkg.qty, newPkg.unit), oldVat, newVat });
  g2Reports.push(`  ${sku.code} → новий ${newCode}  ${sku.name_catalog}  ${sku.packaging.catalog} → ${fmtPkg(newPkg.qty, newPkg.unit)}  (ціна ${oldVat} → ${newVat} USD)`);
}

console.log(`\n✓ Group2 нових SKU: ${newSkus.length}`);
for (const r of g2Reports) console.log(r);

// Вставляємо нові SKU одразу ПІСЛЯ оригінальних рядків (зворотній порядок щоб індекси не зсувалися)
newSkus.sort((a, b) => b.idx - a.idx);
for (const ns of newSkus) {
  lines.splice(ns.idx + 1, 0, ns.newLine);
}

// Записуємо
fs.writeFileSync(PRODUCTS, lines.join('\n'), 'utf8');

console.log('\n=== ПІДСУМОК ===');
console.log(`  Категорій виправлено: ${categoriesFixed}`);
console.log(`  Group1 фасовок: ${g1Fixed}`);
console.log(`  Group2 нових SKU: ${newSkus.length}`);
console.log(`✓ lib/products.ts оновлено`);
