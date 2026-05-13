// Cross-check coverage скрипт для 15 запланованих бакових сумішей.
// Тільки читання products.ts — нічого не змінює.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const txt = readFileSync(path.join(root, "lib", "products.ts"), "utf8");
const lines = txt.split("\n").filter(l => /^\s*\{\s*slug:/.test(l));

const get = (l, key) => {
  const re = new RegExp(`(?:^|[ ,])${key}:\\s*"([^"]*)"`);
  const m = l.match(re);
  return m ? m[1] : "";
};

const items = lines.map(l => ({
  slug: get(l, "slug"),
  code: get(l, "code"),
  name: get(l, "name"),
  manufacturer: get(l, "manufacturer"),
  ai: get(l, "activeIngredient"),
  packaging: get(l, "packaging"),
  rate: get(l, "rate"),
  group: get(l, "group"),
  groupSlug: get(l, "groupSlug"),
  tier: get(l, "tier"),
}));

console.log(`=== Завантажено ${items.length} SKU ===\n`);

// Нормалізатор: lowercase, кириличні/латинські варіації, прибираємо «,» і пробіли в концентраціях
const norm = s => (s || "").toLowerCase()
  .replace(/ё/g, "е")
  .replace(/і/g, "и")  // укр и → рос и для пошуку перетину
  .replace(/[\s,]+/g, " ")
  .trim();

// Шукає по підстроці в activeIngredient (case-insensitive, після нормалізації)
function find(criteria) {
  const { ai, concentration, group, tier, exclude } = criteria;
  const aiNorm = norm(ai);
  return items.filter(it => {
    const itAi = norm(it.ai);
    if (!itAi.includes(aiNorm)) return false;
    if (concentration && !itAi.includes(norm(concentration))) return false;
    if (group && !norm(it.groupSlug || it.group).includes(norm(group))) return false;
    if (tier && it.tier !== tier) return false;
    if (exclude && itAi.includes(norm(exclude))) return false;
    return true;
  });
}

// Виведення результату пошуку компонента
function reportComponent(label, criteria) {
  const results = find(criteria);
  if (results.length === 0) {
    console.log(`  ❌ ${label}: MISSING (шукав: ${JSON.stringify(criteria)})`);
    return { found: false, label, criteria, results: [] };
  }
  // Найкращий tier: спочатку econom, потім premium, потім original
  const tierRank = { econom: 0, premium: 1, original: 2 };
  results.sort((a, b) => (tierRank[a.tier] ?? 9) - (tierRank[b.tier] ?? 9));
  const top = results.slice(0, 3);
  console.log(`  ✅ ${label}: знайдено ${results.length}`);
  top.forEach(p => {
    console.log(`     • [${p.tier}] ${p.code || "—"} ${p.slug} | ${p.name} | ${p.manufacturer} | AI: ${p.ai}`);
  });
  return { found: true, label, criteria, results: top };
}

// === 15 СУМІШЕЙ ===

const mixes = [
  {
    n: 1,
    title: "Соняшник Express: трибенурон + ПАР",
    priority: "Критична",
    components: [
      ["Трибенурон-метил 750 г/кг", { ai: "трибенурон", concentration: "750" }],
      ["ПАР неіонний (опц.)", { ai: "пар", group: "ad" }],
    ],
  },
  {
    n: 2,
    title: "Соняшник ґрунтовий: S-метолахлор+тербутилазин АБО ацетохлор+тербутилазин",
    priority: "Критична",
    components: [
      ["S-метолахлор", { ai: "метолахлор" }],
      ["Тербутилазин", { ai: "тербутилазин" }],
      ["Ацетохлор (альтернатива)", { ai: "ацетохлор" }],
    ],
  },
  {
    n: 3,
    title: "Соняшник десикація: дикват + ПАР",
    priority: "Критична",
    components: [
      ["Дикват 150 г/л", { ai: "дикват" }],
    ],
  },
  {
    n: 4,
    title: "Соняшник інсектицид V6+: лямбда-цигалотрин + сірка",
    priority: "Критична",
    components: [
      ["Лямбда-цигалотрин 50 г/л", { ai: "цигалотрин" }],
      ["Сірка змочувана (опц.)", { ai: "сірк" }],
    ],
  },
  {
    n: 5,
    title: "Соя ґрунтова: пропізохлор + прометрин (+ кломазон опц.)",
    priority: "Критична",
    components: [
      ["Пропізохлор 720 г/л", { ai: "пропізохлор" }],
      ["Прометрин 500 г/л", { ai: "прометрин" }],
      ["Кломазон 360 г/л (опц.)", { ai: "кломазон" }],
    ],
  },
  {
    n: 6,
    title: "Соя кліщ: гекситиазокс + лямбда-цигалотрин + Сількер",
    priority: "Критична",
    components: [
      ["Гекситиазокс 100 г/кг (Ніссоран)", { ai: "гекситиазокс" }],
      ["Лямбда-цигалотрин 50 г/л", { ai: "цигалотрин" }],
      ["ПАР Сількер/силіконовий (опц.)", { ai: "сількер" }],
    ],
  },
  {
    n: 7,
    title: "Пшениця T1: тіофанат + тебуконазол + тринексапак",
    priority: "Критична",
    components: [
      ["Тіофанат-метил 500 г/л", { ai: "тіофанат" }],
      ["Тебуконазол 430 г/л", { ai: "тебуконазол", concentration: "430" }],
      ["Тринексапак-етил 250 г/л", { ai: "тринексапак" }],
    ],
  },
  {
    n: 8,
    title: "Пшениця T3 колос: протіоконазол+тебуконазол + інсектицид + бор",
    priority: "Критична",
    components: [
      ["Протіоконазол", { ai: "протіоконазол" }],
      ["Тебуконазол (у комбінації)", { ai: "тебуконазол" }],
      ["Лямбда-цигалотрин", { ai: "цигалотрин" }],
      ["Бор (мікро, опц.)", { ai: "бор" }],
    ],
  },
  {
    n: 9,
    title: "Кукурудза CL-падалиця: мезотріон + никосульфурон + римсульфурон (Сігур)",
    priority: "Важлива",
    components: [
      ["Мезотріон", { ai: "мезотріон" }],
      ["Никосульфурон", { ai: "никосульфурон" }],
      ["Римсульфурон", { ai: "римсульфурон" }],
    ],
  },
  {
    n: 10,
    title: "Кукурудза 2 баки: 2,4-Д+флорасулам / никосульфурон 100",
    priority: "Важлива",
    components: [
      ["2,4-Д ефір", { ai: "2,4-д" }],
      ["Флорасулам", { ai: "флорасулам" }],
      ["Никосульфурон 100 г/л (Альвіус-аналог)", { ai: "никосульфурон", concentration: "100" }],
    ],
  },
  {
    n: 11,
    title: "Пшениця no-till: гліфосат + 2,4-Д ефір + ПАР",
    priority: "Важлива",
    components: [
      ["Гліфосат 480 г/л", { ai: "гліфосат" }],
      ["2,4-Д ефір 600 г/л", { ai: "2,4-д" }],
    ],
  },
  {
    n: 12,
    title: "Ріпак озимий бутонізація: ацетаміприд + хлорпірифос+циперметрин + тебуконазол+азоксистробін",
    priority: "Важлива",
    components: [
      ["Ацетаміприд 200 г/кг (Канонір)", { ai: "ацетаміприд" }],
      ["Хлорпірифос (Фосорган Дуо)", { ai: "хлорпірифос" }],
      ["Циперметрин", { ai: "циперметрин" }],
      ["Тебуконазол + азоксистробін", { ai: "азоксистробін" }],
    ],
  },
  {
    n: 13,
    title: "Ріпак озимий цвітіння: тіофанат+тебуконазол+цифлуфенамід (Ютака) + бор",
    priority: "Важлива",
    components: [
      ["Тіофанат-метил", { ai: "тіофанат" }],
      ["Тебуконазол", { ai: "тебуконазол" }],
      ["Цифлуфенамід (Ютака)", { ai: "цифлуфенамід" }],
      ["Бор (опц.)", { ai: "бор" }],
    ],
  },
  {
    n: 14,
    title: "Горох гербіцид: бентазон+МЦПА (Базагран М) АБО бентазон+імазетапір",
    priority: "Важлива",
    components: [
      ["Бентазон 250 г/л + МЦПА (Базагран М)", { ai: "бентазон" }],
      ["МЦПА (у комбінації)", { ai: "мцпа" }],
      ["Імазетапір (альтернатива)", { ai: "імазетапір" }],
    ],
  },
  {
    n: 15,
    title: "Горох інсекто-фунгіцид: лямбда-цигалотрин + азоксистробін+ципроконазол",
    priority: "Важлива",
    components: [
      ["Лямбда-цигалотрин", { ai: "цигалотрин" }],
      ["Азоксистробін", { ai: "азоксистробін" }],
      ["Ципроконазол", { ai: "ципроконазол" }],
    ],
  },
];

const report = [];
for (const mix of mixes) {
  console.log(`\n────────────────────────────────────────────`);
  console.log(`#${mix.n} [${mix.priority}] ${mix.title}`);
  console.log(`────────────────────────────────────────────`);
  const compResults = mix.components.map(([label, crit]) => reportComponent(label, crit));
  const blocking = compResults.filter(r => !r.found && !r.label.includes("опц"));
  const status = blocking.length === 0 ? "OK" : `BLOCKED (${blocking.length} компонент(ів) відсутні)`;
  console.log(`\n  → СТАТУС: ${status}`);
  report.push({ ...mix, compResults, status });
}

// Підсумок
console.log(`\n\n========== ПІДСУМОК ==========`);
const ok = report.filter(r => r.status === "OK").length;
console.log(`Готові до drafts (всі обов'язкові компоненти присутні): ${ok} / ${report.length}`);
console.log(`Блоковані: ${report.length - ok}`);
console.log();
report.forEach(r => {
  console.log(`  #${r.n} ${r.status === "OK" ? "✅" : "❌"} ${r.status.padEnd(35)} ${r.title}`);
});
