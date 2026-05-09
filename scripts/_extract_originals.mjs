// Витягує всі tier="original" з lib/products.ts → _originals_list.json
// Запуск: node scripts/_extract_originals.mjs

import fs from 'fs';

const SRC = 'lib/products.ts';
const OUT = '_originals_list.json';

const text = fs.readFileSync(SRC, 'utf8');
const out = [];

for (const line of text.split('\n')) {
  if (!/^\s*\{\s*slug:/.test(line)) continue;
  if (!/tier:\s*"original"/.test(line)) continue;

  const get = (k) => {
    const re = new RegExp('(?:^|,\\s*|\\{\\s*)' + k + ':\\s*"([^"]*)"');
    const m = line.match(re);
    return m ? m[1] : '';
  };
  const getArr = (k) => {
    const re = new RegExp('(?:^|,\\s*)' + k + ':\\s*\\[([^\\]]*)\\]');
    const m = line.match(re);
    if (!m) return [];
    return m[1].split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
  };

  out.push({
    slug: get('slug'),
    code: get('code'),
    name: get('name'),
    nameRu: get('nameRu'),
    manufacturer: get('manufacturer'),
    group: get('group'),
    groupSlug: get('groupSlug'),
    activeIngredient: get('activeIngredient'),
    activeIngredientRu: get('activeIngredientRu'),
    packaging: get('packaging'),
    rate: get('rate'),
    cultures: getArr('cultures'),
  });
}

out.sort((a, b) => a.slug.localeCompare(b.slug));
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(`Витягнуто ${out.length} оригіналів → ${OUT}`);

// Розклад по виробниках
const byManu = {};
for (const p of out) {
  byManu[p.manufacturer] = (byManu[p.manufacturer] || 0) + 1;
}
console.log('\nРозподіл по виробниках:');
for (const [m, c] of Object.entries(byManu).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${m}: ${c}`);
}
