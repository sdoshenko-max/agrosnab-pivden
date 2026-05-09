// Збирає lib/_descriptions/originals.ts з:
//   1) існуючих entry в самому файлі (зберігає вже зроблені вручну партії 1+2)
//   2) snippet-файлів _batch_<MANUFACTURER>_descriptions.snippet.ts (то що написали агенти)
//
// Логіка дедуплікації: якщо slug є і в основному файлі, і в snippet — пріоритет у
// СНІПЕТА (свіжіше). Це дозволяє переписати помилкові ручні описи новим snippet'ом.
//
// Запуск: node scripts/_merge_originals_descriptions.mjs

import fs from 'fs';
import path from 'path';

const MAIN = 'lib/_descriptions/originals.ts';
const HEADER = `// Розгорнуті маркетингові описи оригіналів для Prom.ua фіда (public/feed.xml)
// і сторінок сайту /produkt/[slug]. Ключ — slug з lib/products.ts.
// Якщо у одного товара кілька SKU (різна фасовка) — опис один на slug,
// фасовка береться з самого Product при рендері фіда.
//
// Структура опису фіксована (узгоджено 2026-05-08):
//   1) Інтро (1 абзац: бренд + виробник + призначення)
//   2) 🔬 Діюча речовина — назва, концентрація, хімічний клас
//   3) 🧪 Препаративна форма
//   4) ⚙️ Механізм дії
//   5) 🎯 Спектр дії
//   6) 📋 Регламент застосування
//   7) ⏱ Період захисної дії
//   8) ✅ Переваги
//   9) 🧴 Сумісність
//   10) ⚠️ Клас небезпеки
//   11) 📦 Фасовка
//   12) 🚚 Доставка / самовивіз — стандартний хвіст: «Самовивіз: м. Миколаїв.
//       Доставка по всій Україні Новою Поштою 1–3 дні. Оплата: готівка/безготівка,
//       працюємо з ПДВ.»
//
// Цей файл зібраний скриптом scripts/_merge_originals_descriptions.mjs з:
//   - історичних ручних entries (партія 1 + UPL партія 2)
//   - snippet-файлів _batch_<MANUFACTURER>_descriptions.snippet.ts (партії агентів)

export const originalsDescriptions: Record<string, { ru: string; ua: string }> = {

`;
const FOOTER = `\n};\n`;

// Парсимо TS-файл і витягуємо entries у вигляді мапи slug → cdataBlock (рядок як у файлі).
function parseEntries(text) {
  const entries = new Map();
  const re = /"([a-z0-9-]+)":\s*\{\s*ru:\s*`([\s\S]*?)`,\s*ua:\s*`([\s\S]*?)`,?\s*\},/g;
  let m;
  while ((m = re.exec(text))) {
    const [_, slug, ru, ua] = m;
    entries.set(slug, { ru, ua });
  }
  return entries;
}

function formatEntry(slug, { ru, ua }) {
  return `  "${slug}": {
    ru: \`${ru}\`,
    ua: \`${ua}\`,
  },\n\n`;
}

// 1. Читаємо існуючі entries з основного файла (партії 1 + UPL партія 2).
const mainText = fs.existsSync(MAIN) ? fs.readFileSync(MAIN, 'utf8') : '';
const merged = parseEntries(mainText);
console.log(`Початкових entries у ${MAIN}: ${merged.size}`);

// 2. Шукаємо всі _batch_*_descriptions.snippet.ts і додаємо звідти.
const files = fs.readdirSync('.').filter(f => f.startsWith('_batch_') && f.endsWith('_descriptions.snippet.ts'));
console.log(`Знайдено snippet-файлів: ${files.length}`);
for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  const local = parseEntries(text);
  let added = 0, replaced = 0;
  for (const [slug, val] of local) {
    if (merged.has(slug)) replaced++;
    else added++;
    merged.set(slug, val);
  }
  console.log(`  ${f}: ${local.size} entries (нових: ${added}, перезаписано: ${replaced})`);
}

// 3. Сортуємо по slug і записуємо.
const sorted = [...merged.entries()].sort((a, b) => a[0].localeCompare(b[0]));
const out = HEADER + sorted.map(([slug, val]) => formatEntry(slug, val)).join('') + FOOTER;
fs.writeFileSync(MAIN, out);
console.log(`\n✓ Записано ${sorted.length} entries у ${MAIN} (відсортовано за slug)`);
