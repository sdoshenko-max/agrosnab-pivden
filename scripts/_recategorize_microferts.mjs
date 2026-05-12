// Переводить 51 SKU у нову категорiю «Мiкродобрива» / mikrodobryva.
// Коди НЕ мiняємо (Варiант Б — iснуючi SKU зберiгають iсторичний код).
// Запуск: node scripts/_recategorize_microferts.mjs

import fs from 'fs';

const CODES = [
  // Найс — 17 SKU (НАЙС-серiя + VECTA)
  '6072','6073','6074','6075','6076','6077','6078','6079','6080','6081','6082','6083','6084','6085','6086','6087','6088',
  // Лайф — 15 SKU (гумати/амiнокислоти/мiкроелементи/Турбо-серiя)
  '6089','6091','6092','6094','6095','6096','6097','6098','6107','6123','6124','6125','6126','6127','6128',
  // Сингента — 6 SKU (Бороплюс×2, Брексiл×2, Iзабiон, Квантiс)
  '1201','1202','1203','1370','2152','2155',
  // Адама — 7 SKU (Скудеро×5, Амiно Ксерiон×2)
  '1019','1020','1021','1022','1023','6001','6023',
  // Himagro — 4 SKU (Акселератор Бор/Молiбден/ВП 3-11-38/Амiсил)
  '6028','6029','6030','6031',
  // Кортева — 1 SKU (Бiофорж)
  '7007',
  // Укравiт — 1 SKU (Авангард CrystalMax Fe)
  '6039',
];

const NEW_GROUP = 'Мікродобрива';
const NEW_SLUG  = 'mikrodobryva';

const txt = fs.readFileSync('lib/products.ts', 'utf8');
const lines = txt.split(/\r?\n/);
const codeSet = new Set(CODES);
let changed = 0;
const report = [];

const newLines = lines.map(line => {
  if (!/^\s*\{\s*slug:/.test(line)) return line;
  const cm = line.match(/code:\s*"([^"]*)"/);
  if (!cm || !codeSet.has(cm[1])) return line;
  const slug = (line.match(/slug:\s*"([^"]*)"/) || [])[1];
  const name = (line.match(/name:\s*"([^"]*)"/) || [])[1];
  const oldGroup = (line.match(/group:\s*"([^"]*)"/) || [])[1];
  if (oldGroup === NEW_GROUP) return line;
  let nl = line.replace(/group:\s*"[^"]*"/, `group: "${NEW_GROUP}"`);
  nl = nl.replace(/groupSlug:\s*"[^"]*"/, `groupSlug: "${NEW_SLUG}"`);
  changed++;
  report.push(`  ${cm[1]}  ${slug}  ${name}  (${oldGroup} → Мікродобрива)`);
  return nl;
});

if (changed !== CODES.length) {
  console.log(`⚠ Очiкував ${CODES.length}, виправив ${changed}. Може якiсь коди не знайденi?`);
  const found = new Set();
  for (const line of newLines) {
    const cm = line.match(/code:\s*"([^"]*)"/);
    if (cm) found.add(cm[1]);
  }
  for (const c of CODES) if (!found.has(c)) console.log(`  Не знайдено: ${c}`);
}

fs.writeFileSync('lib/products.ts', newLines.join('\n'), 'utf8');
console.log(`✓ Переведено ${changed} SKU у категорiю «Мікродобрива»`);
for (const r of report) console.log(r);
