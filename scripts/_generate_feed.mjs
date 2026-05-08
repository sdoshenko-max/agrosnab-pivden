// Генерує public/feed.xml — YML-фід для Prom.ua / Rozetka / Hotline / OLX Бізнес.
// Ціна — готівка (priceCash) × актуальний курс НБУ → гривня.
//
// Запуск:
//   node scripts/_generate_feed.mjs
//   node scripts/_generate_feed.mjs --rate-usd=44.5 --rate-eur=51.7   # ручний курс
//   node scripts/_generate_feed.mjs --dry                              # без запису

import fs from 'fs';
import path from 'path';

const SITE = 'https://agrosnab-pivden.com';
const PRODUCTS_FILE = 'lib/products.ts';
const CULTURES_FILE = 'lib/cultures.ts';
const GROUPS_FILE = 'lib/groups.ts';
const OUT_FILE = 'public/feed.xml';

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => {
      const [k, v] = a.replace(/^--/, '').split('=');
      return [k, v ?? true];
    }),
);

// 1. Курс monobank (rateSell — найближчий до міжбанку)
// API: https://api.monobank.ua/bank/currency
// Коди ISO 4217: USD=840, EUR=978, UAH=980. Rate-limit: 1 запит/хв.
async function getRates() {
  if (args['rate-usd'] && args['rate-eur']) {
    return { USD: +args['rate-usd'], EUR: +args['rate-eur'], source: 'argv' };
  }
  try {
    const res = await fetch('https://api.monobank.ua/bank/currency');
    if (!res.ok) throw new Error(`Mono HTTP ${res.status}`);
    const data = await res.json();
    const usd = data.find(d => d.currencyCodeA === 840 && d.currencyCodeB === 980);
    const eur = data.find(d => d.currencyCodeA === 978 && d.currencyCodeB === 980);
    if (!usd?.rateSell || !eur?.rateSell) throw new Error('Mono: USD/EUR rateSell missing');
    return { USD: +usd.rateSell.toFixed(2), EUR: +eur.rateSell.toFixed(2), source: 'Mono' };
  } catch (e) {
    console.warn(`Не вдалось отримати курс Mono (${e.message}), fallback 44.00 / 51.70`);
    return { USD: 44.00, EUR: 51.70, source: 'fallback' };
  }
}

// 2. Парсимо products.ts рядково
function parseProducts() {
  const text = fs.readFileSync(PRODUCTS_FILE, 'utf8');
  const products = [];
  for (const line of text.split('\n')) {
    if (!/^\s*\{\s*slug:/.test(line)) continue;
    const get = (k) => {
      const re = new RegExp('(?:^|,\\s*|\\{\\s*)' + k + ':\\s*"([^"]*)"');
      const m = line.match(re);
      return m ? m[1] : '';
    };
    const getNum = (k) => {
      const re = new RegExp('(?:^|,\\s*)' + k + ':\\s*([0-9.]+)');
      const m = line.match(re);
      return m ? +m[1] : 0;
    };
    const getArr = (k) => {
      const re = new RegExp('(?:^|,\\s*)' + k + ':\\s*\\[([^\\]]*)\\]');
      const m = line.match(re);
      if (!m) return [];
      return m[1].split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
    };
    const getBool = (k) => {
      const re = new RegExp('(?:^|,\\s*)' + k + ':\\s*(true|false)');
      const m = line.match(re);
      return m ? m[1] === 'true' : false;
    };

    products.push({
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
      packaging: get('packaging'),
      rate: get('rate'),
      priceVat: getNum('priceVat'),
      priceCash: getNum('priceCash'),
      unit: get('unit'),
      currency: get('currency') || 'USD',
      cultures: getArr('cultures'),
      stage: getArr('stage'),
      analog: get('analog'),
      image: get('image'),
      priceOnRequest: getBool('priceOnRequest'),
    });
  }
  return products;
}

// 3. Парсимо cultures (slug → nameUk/Ru)
function parseCultures() {
  const text = fs.readFileSync(CULTURES_FILE, 'utf8');
  const map = new Map();
  const blockRe = /\{\s*slug:\s*"([^"]+)",[\s\S]*?nameUk:\s*"([^"]+)",\s*nameRu:\s*"([^"]+)"/g;
  let m;
  while ((m = blockRe.exec(text))) map.set(m[1], { uk: m[2], ru: m[3] });
  return map;
}

function parseGroups() {
  const text = fs.readFileSync(GROUPS_FILE, 'utf8');
  const map = new Map();
  const re = /\{\s*slug:\s*"([^"]+)",\s*nameUk:\s*"([^"]+)",\s*nameRu:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(text))) map.set(m[1], { uk: m[2], ru: m[3] });
  return map;
}

// 4. XML утиліти
const escape = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const cdata = (s) => `<![CDATA[${String(s ?? '').replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;

// 5. Опис генератор
function buildDescription(p, culturesMap, lang = 'uk') {
  const isRu = lang === 'ru';
  const name = isRu && p.nameRu ? p.nameRu : p.name;
  const ai = isRu && p.activeIngredientRu ? p.activeIngredientRu : p.activeIngredient;
  const groupTxt = p.group;
  const tierTxt = p.tier === 'original'
    ? (isRu ? 'оригинал' : 'оригінал')
    : p.tier === 'premium'
      ? (isRu ? 'премиум-генерик' : 'преміум-дженерик')
      : (isRu ? 'эконом-генерик' : 'економ-дженерик');

  const cultureNames = (p.cultures || [])
    .map(s => culturesMap.get(s))
    .filter(Boolean)
    .map(c => isRu ? c.ru : c.uk);
  const cultureTxt = cultureNames.length
    ? (isRu ? 'Культуры: ' : 'Культури: ') + cultureNames.join(', ') + '.'
    : '';

  const analogTxt = p.analog
    ? (isRu ? `Аналог: ${p.analog}.` : `Аналог: ${p.analog}.`)
    : '';

  const lines = [
    `${groupTxt} ${name} (${p.manufacturer}, ${tierTxt}).`,
    ai ? (isRu ? `Действующее вещество: ${ai}.` : `Діюча речовина: ${ai}.`) : '',
    p.rate ? (isRu ? `Норма расхода: ${p.rate}.` : `Норма витрати: ${p.rate}.`) : '',
    p.packaging ? (isRu ? `Фасовка: ${p.packaging}.` : `Фасовка: ${p.packaging}.`) : '',
    cultureTxt,
    analogTxt,
    isRu
      ? 'Доставка по всей Украине. Наличный/безналичный расчёт.'
      : 'Доставка по всій Україні. Готівка/безготівка.',
  ].filter(Boolean);

  return lines.join(' ');
}

// 6. Головна функція
async function main() {
  const rates = await getRates();
  console.log(`Курс: USD=${rates.USD}, EUR=${rates.EUR} (${rates.source})`);

  const products = parseProducts();
  console.log(`Товарів у каталозі: ${products.length}`);

  const culturesMap = parseCultures();
  const groupsMap = parseGroups();
  console.log(`Культур: ${culturesMap.size}, груп: ${groupsMap.size}`);

  // Категорії: numeric ID → groupSlug
  const groupSlugs = [...groupsMap.keys()];
  const categoryIdMap = new Map(groupSlugs.map((s, i) => [s, i + 1]));

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // === Генерація XML ===
  const out = [];
  out.push('<?xml version="1.0" encoding="UTF-8"?>');
  out.push(`<yml_catalog date="${dateStr}">`);
  out.push('  <shop>');
  out.push('    <name>Агроснаб Південь</name>');
  out.push('    <company>ТОВ «АГРОСНАБ-ПІВДЕНЬ»</company>');
  out.push(`    <url>${SITE}</url>`);
  out.push('    <currencies>');
  out.push('      <currency id="UAH" rate="1"/>');
  out.push('    </currencies>');
  out.push('    <categories>');
  for (const [slug, names] of groupsMap.entries()) {
    out.push(`      <category id="${categoryIdMap.get(slug)}">${escape(names.uk)}</category>`);
  }
  out.push('    </categories>');
  out.push('    <offers>');

  let skipped = 0;
  for (const p of products) {
    if (!p.code || !p.slug) { skipped++; continue; }

    const usdRate = p.currency === 'EUR' ? rates.EUR : rates.USD;
    const priceUah = Math.round(p.priceCash * usdRate);
    if (priceUah <= 0 && !p.priceOnRequest) { skipped++; continue; }

    const categoryId = categoryIdMap.get(p.groupSlug) || 1;
    const url = `${SITE}/produkt/${p.slug}`;
    const urlRu = `${SITE}/ru/produkt/${p.slug}`;
    const picture = p.image ? `${SITE}${p.image}` : '';

    out.push(`      <offer id="${escape(p.code)}" available="true">`);
    out.push(`        <name>${escape(p.nameRu || p.name)}</name>`);
    out.push(`        <name_ua>${escape(p.name)}</name_ua>`);
    out.push(`        <url>${escape(urlRu)}</url>`);
    out.push(`        <price>${priceUah}</price>`);
    out.push('        <currencyId>UAH</currencyId>');
    out.push(`        <categoryId>${categoryId}</categoryId>`);
    if (picture) out.push(`        <picture>${escape(picture)}</picture>`);
    out.push(`        <vendor>${escape(p.manufacturer)}</vendor>`);
    out.push(`        <vendorCode>${escape(p.code)}</vendorCode>`);
    out.push(`        <description>${cdata(buildDescription(p, culturesMap, 'ru'))}</description>`);
    out.push(`        <description_ua>${cdata(buildDescription(p, culturesMap, 'uk'))}</description_ua>`);

    // Характеристики
    out.push(`        <param name="Виробник">${escape(p.manufacturer)}</param>`);
    out.push(`        <param name="Код запчастини">${escape(p.code)}</param>`);
    if (p.packaging) out.push(`        <param name="Фасовка">${escape(p.packaging)}</param>`);
    if (p.activeIngredient) {
      // Prom обмежує param-значення 255 символами. Чистимо переноси і обрізаємо.
      const aiClean = p.activeIngredient.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
      const aiTrimmed = aiClean.length > 250 ? aiClean.slice(0, 247) + '...' : aiClean;
      out.push(`        <param name="Діюча речовина">${escape(aiTrimmed)}</param>`);
    }
    if (p.rate) out.push(`        <param name="Норма витрати">${escape(p.rate)}</param>`);
    out.push(`        <param name="Категорія">${escape(p.group)}</param>`);
    out.push(`        <param name="Тип">${escape(
      p.tier === 'original' ? 'Оригінал' : p.tier === 'premium' ? 'Преміум-дженерик' : 'Економ-дженерик'
    )}</param>`);
    if (p.analog) out.push(`        <param name="Аналог">${escape(p.analog)}</param>`);
    if (p.cultures.length) {
      const cultureNames = p.cultures.map(s => culturesMap.get(s)?.uk).filter(Boolean).join(', ');
      if (cultureNames) out.push(`        <param name="Культури">${escape(cultureNames)}</param>`);
    }

    out.push('      </offer>');
  }

  out.push('    </offers>');
  out.push('  </shop>');
  out.push('</yml_catalog>');

  const xml = out.join('\n');
  const sizeKB = (xml.length / 1024).toFixed(1);

  console.log(`Згенеровано офферів: ${products.length - skipped} (пропущено: ${skipped})`);
  console.log(`Розмір фіда: ${sizeKB} KB`);

  if (args.dry) {
    console.log('--dry: файл НЕ записано.');
  } else {
    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
    fs.writeFileSync(OUT_FILE, xml);
    console.log(`✓ ${OUT_FILE} записано. Після пушу буде доступний за ${SITE}/feed.xml`);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
