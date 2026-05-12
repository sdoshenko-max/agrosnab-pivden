// Застосовує CATEGORY_FIX-зведення з econom-tier (2026-05-12)
// Знайдено агентами під час генерації описів. JSON не чіпали тоді — тепер виправляємо.
//
// Запуск: node scripts/_apply_category_fixes_econom.mjs

import fs from 'fs';

// Мапа slug → { group, groupSlug } куди переводимо
const FIXES = {
  // ===== Авангард-лінійка Укравіт (33 SKU) → Мікродобрива =====
  "avanhard-crystalmax-b-21-ukravit":      { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-azot-mikro-ukravit":           { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-bobovi-ukravit":               { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-bor-ukravit":                  { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-buryak-ukravit":               { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-vynohrad-ukravit":             { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-zernovi-ukravit":              { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-kalii-ukravit":                { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-kaltsii-ukravit":              { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-kaltsii-mikro-ukravit":        { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-kartoplya-ukravit":            { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-kremnii-bio-marky-a-ukravit":  { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-kukurudza-ukravit":            { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-marhanets-ukravit":            { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-mid-ukravit":                  { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-molibden-ukravit":             { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-ovochevi-ukravit":             { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-plodovi-ukravit":              { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-ripak-ukravit":                { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-sirka-azot-mikro-ukravit":     { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-sonyashnyk-ukravit":           { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-start-ukravit":                { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-fosfit-k-ukravit":             { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-fosfit-k-mikro-rk-ukravit":    { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-fosfit-k-tsynk-ukravit":       { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-r-fosfor-ukravit":             { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-r-fosfor-kalii-ukravit":       { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "avanhard-r-tsynk-ukravit":              { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "hrou-amino-avanhard-dkm-ukravit":       { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "hrou-humat-avanhard-dkm-ukravit":       { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "stymul-avanhard-ukravit":               { group: "Мікродобрива", groupSlug: "mikrodobryva" },

  // ===== Решта Укравіт CATEGORY_FIX (точкові) =====
  "as-selektyv-tn-ukravit":                { group: "Протруйник", groupSlug: "protruyniky" },
  "enerhodar-ks-ukravit":                  { group: "Фунгіцид", groupSlug: "funhitsydy" },
  "fenomen-praim-vh-ukravit":              { group: "Фунгіцид", groupSlug: "funhitsydy" },
  "inferno-vh-ukravit":                    { group: "Фунгіцид", groupSlug: "funhitsydy" },
  "kapkan-prynada-ukravit":                { group: "Родентицид", groupSlug: "rodentytsydy" },
  "maximize-ukravit":                      { group: "Біопрепарати", groupSlug: "biopreparaty" },
  "selfos-tb-ukravit":                     { group: "Родентицид", groupSlug: "rodentytsydy" },
  "terramax-dry-ukravit":                  { group: "Біопрепарати", groupSlug: "biopreparaty" },

  // ===== Лайф — Біопрепарати =====
  "azotolaif-laif":                        { group: "Біопрепарати", groupSlug: "biopreparaty" },
  "destern-laif":                          { group: "Біопрепарати", groupSlug: "biopreparaty" },
  "fitolaif-laif":                         { group: "Біопрепарати", groupSlug: "biopreparaty" },
  "fosfolaif-laif":                        { group: "Біопрепарати", groupSlug: "biopreparaty" },
  "funhiklin-laif":                        { group: "Біопрепарати", groupSlug: "biopreparaty" },
  "funhlaif-laif":                         { group: "Біопрепарати", groupSlug: "biopreparaty" },
  "hvarofit-laif":                         { group: "Біопрепарати", groupSlug: "biopreparaty" },
  "insekturyn-laif":                       { group: "Біопрепарати", groupSlug: "biopreparaty" },
  "pmk-bd-destruktsiya-laif":              { group: "Біопрепарати", groupSlug: "biopreparaty" },
  "pmk-d-destruktsiya-laif":               { group: "Біопрепарати", groupSlug: "biopreparaty" },
  "pmk-u-laif":                            { group: "Біопрепарати", groupSlug: "biopreparaty" },
  "pmk-zr-laif":                           { group: "Біопрепарати", groupSlug: "biopreparaty" },
  "sidon-soya-laif":                       { group: "Біопрепарати", groupSlug: "biopreparaty" },
  "sklerostop-laif":                       { group: "Біопрепарати", groupSlug: "biopreparaty" },
  "sporazyn-laif":                         { group: "Біопрепарати", groupSlug: "biopreparaty" },

  // ===== Лайф — Мікродобрива =====
  "bofos-laif":                            { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "bor-molibden-laif":                     { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "bor100-kyslyi-laif":                    { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "bor150-luzhnyi-laif":                   { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "foskal-laif":                           { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "fulvimaks-laif":                        { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "humate-500-laif":                       { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "kalii-turbo-laif":                      { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "kaltsii-200-laif":                      { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "karbamid-z-nyzkym-biuretynom-52000hrn-t-z-pdv-laif": { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "kobalt-molibden-laif":                  { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "mid-turbo-laif":                        { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "molibden-laif-laif":                    { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "ovochevyi-turbo-laif":                  { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "rozumnyi-azot-laif":                    { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "sirka-turbo-laif":                      { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "start-life-npk-18-6-9-laif":            { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "start-life-npk-3-18-18-laif":           { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "start-life-npk-5-20-5-laif":            { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "start-life-npk-8-24-0-laif":            { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "start-life-nrs-9-20-3-laif":            { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "start-life-rk-25-22-laif":              { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "start-life-rk-5-30-laif":               { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "tsyfos-mineral-universalnyi-ultrakhelat-laif": { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "tsyfos-orhanik-lystovyi-laif":          { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "tsynk-120-laif":                        { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "tsynk-aktyv-laif":                      { group: "Мікродобрива", groupSlug: "mikrodobryva" },

  // ===== Лайф — Адʼюванти =====
  "neptun-ph-korektor-kyslyi-laif":        { group: "Адʼюванти", groupSlug: "adyuvanty" },
  "neptun-ph-korektor-stabilizator-laif":  { group: "Адʼюванти", groupSlug: "adyuvanty" },
  "oil-turbo-laif":                        { group: "Адʼюванти", groupSlug: "adyuvanty" },
  "spyrtovyi-turbolyp-laif":               { group: "Адʼюванти", groupSlug: "adyuvanty" },
  "turbolyp-prylypach-hruntovyi-laif":     { group: "Адʼюванти", groupSlug: "adyuvanty" },

  // ===== Грін Експрес — точкові =====
  "dibenzon-hrin-ekspres":                 { group: "Інсектицид", groupSlug: "insektitsydy" },
  "drahun-hrin-ekspres":                   { group: "Інсектицид", groupSlug: "insektitsydy" },
  "eskort-bio-hrin-ekspres":               { group: "Адʼюванти", groupSlug: "adyuvanty" },
  "eskort-hrin-ekspres":                   { group: "Адʼюванти", groupSlug: "adyuvanty" },
  "eskort-komplekt-hrin-ekspres":          { group: "Адʼюванти", groupSlug: "adyuvanty" },
  "eskort-oil-hrin-ekspres":               { group: "Адʼюванти", groupSlug: "adyuvanty" },
  "eskort-turbo-hrin-ekspres":             { group: "Адʼюванти", groupSlug: "adyuvanty" },
  "fertail-hrin-ekspres":                  { group: "Мікродобрива", groupSlug: "mikrodobryva" },
  "fluoryt-hrin-ekspres":                  { group: "Фунгіцид", groupSlug: "funhitsydy" },
  "metalaks-hrin-ekspres":                 { group: "Фунгіцид", groupSlug: "funhitsydy" },
  "ornament-hrin-ekspres":                 { group: "Протруйник", groupSlug: "protruyniky" },
  "stedis-hrin-ekspres":                   { group: "Фунгіцид", groupSlug: "funhitsydy" },
  "triniti-hrin-ekspres":                  { group: "Фунгіцид", groupSlug: "funhitsydy" },

  // ===== АХТ — точкові =====
  // "piryzoks-akht" — залишаємо в Інсектициди (немає окремої групи Акарициди, агент сам так радив)
  "sylion-akht":                           { group: "Адʼюванти", groupSlug: "adyuvanty" },
};

const PATH = 'lib/products.ts';
let text = fs.readFileSync(PATH, 'utf8');

let touched = 0;
const stats = {};

// Кожен SKU = один рядок з `{ slug: "...", ..., group: "...", groupSlug: "..." }`
// Для кожного slug у мапі знаходимо рядки і робимо заміну.
for (const [slug, target] of Object.entries(FIXES)) {
  const slugLiteral = `"${slug}"`;
  // Знаходимо всі рядки з цим slug
  const lines = text.split('\n');
  let matched = 0;
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].includes(`slug: ${slugLiteral}`)) continue;
    const oldGroupM = lines[i].match(/group:\s*"([^"]+)"/);
    if (!oldGroupM) continue;
    const oldGroup = oldGroupM[1];
    if (oldGroup === target.group) continue; // уже правильна
    lines[i] = lines[i]
      .replace(/group:\s*"[^"]+"/, `group: "${target.group}"`)
      .replace(/groupSlug:\s*"[^"]+"/, `groupSlug: "${target.groupSlug}"`);
    matched++;
    touched++;
    stats[`${oldGroup} → ${target.group}`] = (stats[`${oldGroup} → ${target.group}`] || 0) + 1;
  }
  text = lines.join('\n');
  if (matched === 0) console.warn(`  ⚠ not found or already correct: ${slug}`);
}

fs.writeFileSync(PATH, text, 'utf8');
console.log(`\n✓ Оновлено ${touched} SKU у ${PATH}\n`);
console.log("Переходи між групами:");
for (const [k, c] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k}: ${c}`);
}
