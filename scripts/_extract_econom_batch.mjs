// Універсальний витяг econom-tier SKU кількох виробників у JSON-батчі по N SKU.
// Запуск: node scripts/_extract_econom_batch.mjs <Виробник1> <Виробник2> ...

import fs from 'fs';

const args = process.argv.slice(2);
if (!args.length) {
  console.error('Usage: node scripts/_extract_econom_batch.mjs <Виробник1> [<Виробник2> ...]');
  process.exit(1);
}

const CHUNK = 10;
const txt = fs.readFileSync('lib/products.ts', 'utf8');
const lines = txt.split(/\r?\n/);
const items = [];

for (const ln of lines) {
  if (!/^\s*\{\s*slug:/.test(ln)) continue;
  const get = (k) => {
    const m = ln.match(new RegExp(k + ':\\s*"([^"]*)"'));
    return m ? m[1] : '';
  };
  const getArr = (k) => {
    const m = ln.match(new RegExp(k + ':\\s*\\[([^\\]]*)\\]'));
    if (!m) return [];
    return m[1].split(',').map(s => s.replace(/['"\s]/g, '')).filter(Boolean);
  };
  items.push({
    slug: get('slug'),
    code: get('code'),
    name: get('name'),
    nameRu: get('nameRu'),
    manufacturer: get('manufacturer'),
    tier: get('tier'),
    group: get('group'),
    groupSlug: get('groupSlug'),
    activeIngredient: get('activeIngredient'),
    activeIngredientRu: get('activeIngredientRu'),
    concentration: get('concentration'),
    packaging: get('packaging'),
    rate: get('rate'),
    analog: get('analog'),
    cultures: getArr('cultures'),
    stage: getArr('stage'),
  });
}

for (const mfr of args) {
  const subset = items
    .filter(i => i.manufacturer === mfr && i.tier === 'econom')
    .sort((a, b) => a.slug.localeCompare(b.slug));

  console.log(`\n=== ${mfr} ===`);
  console.log(`  econom total: ${subset.length}, unique slugs: ${new Set(subset.map(s => s.slug)).size}`);

  const safeName = mfr.replace(/\s+/g, '_').replace(/\./g, '');
  const partsCount = Math.ceil(subset.length / CHUNK);
  for (let i = 0; i < partsCount; i++) {
    const chunk = subset.slice(i * CHUNK, (i + 1) * CHUNK);
    const filename = `_batch_${safeName}_part${i + 1}.json`;
    fs.writeFileSync(filename, JSON.stringify(chunk, null, 2), 'utf8');
    console.log(`  ${filename}: ${chunk.length} SKU`);
  }
}
