// Заповнює порожні поля в lib/products.ts (cultures, stage, description, descriptionRu)
// з даних довгих описів у lib/_descriptions/originals.ts.
//
// Логіка:
//   - Працює тільки з товарами де slug є в originals.ts (наразі — оригінали з описами).
//   - Заповнює ТІЛЬКИ порожні поля (cultures: [], stage: [], description: "", descriptionRu: "").
//     Якщо поле вже заповнене — НЕ перезаписує.
//   - Cultures детектує з ключових слів у тексті опису (UA версія).
//   - Stage детектує з product.group + ключових слів («ґрунтовий», «страховий», «десикат» тощо).
//   - Короткий опис = перший інтро-абзац (перед першим emoji-маркером), обрізаний до ~280 chars.
//
// Запуск:
//   node scripts/_apply_descriptions_to_products.mjs           # реальний апдейт
//   node scripts/_apply_descriptions_to_products.mjs --dry     # лише звіт без запису

import fs from 'fs';

const PRODUCTS = 'lib/products.ts';
const DESCRIPTIONS = 'lib/_descriptions/originals.ts';
const DRY = process.argv.includes('--dry');
const MANU_ARG = (process.argv.find(a => a.startsWith('--manufacturer=')) || '').replace('--manufacturer=', '');
if (!MANU_ARG) {
  console.error('Вкажи --manufacturer=Назва (наприклад --manufacturer=ФМС)');
  process.exit(1);
}

// 1. Парсимо описи — slug → { ru, ua }.
function parseDescriptions(text) {
  const map = new Map();
  const re = /"([a-z0-9-]+)":\s*\{\s*ru:\s*`([\s\S]*?)`,\s*ua:\s*`([\s\S]*?)`,?\s*\},/g;
  let m;
  while ((m = re.exec(text))) map.set(m[1], { ru: m[2], ua: m[3] });
  return map;
}

// 2. Витягуємо інтро (перший абзац до першого emoji-розділювача).
const SECTION_EMOJI_RE = /[🔬🧪⚙🎯📋⏱✅🧴⚠📦🚚📌]/u;
function extractIntro(text, maxLen = 280) {
  const lines = text.trim().split(/\n\s*\n+/);
  let intro = '';
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    // Пропускаємо warning блоки на початку (⚠ ВНИМАНИЕ / ⚠ УВАГА — це не контент-інтро)
    if (t.startsWith('⚠ ВНИМАНИЕ') || t.startsWith('⚠ УВАГА')) continue;
    if (SECTION_EMOJI_RE.test(t.split('\n')[0])) break;
    intro = t;
    break;
  }
  if (intro.length <= maxLen) return intro;
  // Обрізаємо по реченням — шукаємо останню крапку до maxLen.
  const cut = intro.slice(0, maxLen);
  const lastDot = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (lastDot > maxLen * 0.6) return cut.slice(0, lastDot + 1);
  // Інакше — по слову.
  const lastSpace = cut.lastIndexOf(' ');
  return cut.slice(0, lastSpace > 0 ? lastSpace : maxLen) + '...';
}

// 3. Детектор культур із тексту опису. УВАГА: НЕ використовуємо \b з кирилицею
// (JS regex \b не працює перед кириличним символом — це відома пастка).
const CULTURE_KEYS = [
  // [slug, regex]
  ['ozyma-pshenytsa', /(?:озим(?:а|у|ої|ою|ій|их|ою?)\s+пшениц|пшениц(?:і|ю|я|ою)\s+(?:колосов|озим)|озимая\s+пшениц|пшениц(?:а|ы|у|е|ой)\s+озим|озима пшениц|озимая пшениц)/iu],
  ['yari-zernovi', /(?:ярі\s+зернов|яровые\s+зерновые|ячмін|ячмен)/iu],
  ['sonyashnyk', /(?:соняшник|подсолнечник)/iu],
  ['kukurudza', /(?:кукурудз|кукуруз)/iu],
  ['ripak-ozymyi', /(?:ріпак\s+озим|рапс\s+озим)/iu],
  ['ripak-yaryi', /(?:ріпак\s+яр|рапс\s+яров)/iu],
  ['soya', /(?:\bсоя\b|\bсої\b|\bсою\b|\bсоєю\b|\bсое\b|\bсои\b|\bсою\b|на\s+со[єёе])/iu],
  ['horoh', /(?:горох|гороху|горохе)/iu],
  ['kartoplya', /(?:картопл|картофел)/iu],
  ['sorgo', /сорго/iu],
];
function detectCultures(text) {
  const found = new Set();
  for (const [slug, re] of CULTURE_KEYS) {
    if (re.test(text)) found.add(slug);
  }
  // Якщо є просто «ріпак» / «рапс» без озим/ярий — додаємо обидва.
  if (/(?:ріпак|рапс)/iu.test(text) && !found.has('ripak-ozymyi') && !found.has('ripak-yaryi')) {
    found.add('ripak-ozymyi');
    found.add('ripak-yaryi');
  }
  // Якщо є «зернові» загалом — додаємо обидва.
  if (/зернових?|зерновые|зерновых|зерновым/iu.test(text)) {
    found.add('ozyma-pshenytsa');
    found.add('yari-zernovi');
  }
  // «Пшениц» без явного «озим» — все одно ozyma-pshenytsa (на півдні України майже завжди).
  if (/пшениц/iu.test(text) && !found.has('ozyma-pshenytsa')) {
    found.add('ozyma-pshenytsa');
  }
  return [...found];
}

// 4. Детектор stage за групою + ключовими словами.
function detectStage(group, text) {
  const t = text.toLowerCase();
  switch (group) {
    case 'Гербіцид': {
      // Грамініциди (д.р.)
      if (/(?:клетодим|хізалофоп|хизалофоп|галоксифоп|пропаквізафоп|пропаквизафоп|феноксапроп|квізалофоп|квизалофоп|пропоксикарбазон|піноксаден|пиноксаден|тралкоксидим)/iu.test(text)) return ['graminitsyd'];
      if (t.includes('десикан') || /\bдикват|глюфосинат|карфентразон/iu.test(text)) return ['desikatsiya'];
      if (/(?:ґрунтов|почвен|до\s+сходів|до\s+всходов|довсход|до\s+посіву|до\s+посева|передпосівн|предпосевн)/iu.test(text)) return ['gruntovyi'];
      if (/(?:страхов|по\s+сходах|по\s+всходам|післясход|послевсход)/iu.test(text)) return ['strakhovyi'];
      // Для гербіцидів пшениці — herbicid-vesna якщо в тексті «пшениц + весна» / «пшениц + кущення»
      if (/(?:пшениц|пшеница|зернов).{0,50}(?:весн|кущенн|кущения)/iu.test(t)) return ['herbicid-vesna'];
      return ['herbicid'];
    }
    case 'Фунгіцид':
      // Якщо це фунгіцид-протравитель (норма «л/т»)
      if (/[\d,.]+\s*(?:л|кг)\s*\/\s*т\b/iu.test(text)) return ['protruyuvannya'];
      return ['fungicid'];
    case 'Інсектицид':
      return ['insecticid'];
    case 'Протруйник':
      return ['protruyuvannya'];
    case 'Регулятор росту':
      return ['regulyator'];
    case 'Десикант':
      return ['desikatsiya'];
    case 'Адʼювант':
    case "Ад'ювант":
      return [];
    default:
      return [];
  }
}

// 5. Парсимо існуючий рядок продукту з products.ts → витягуємо поточні значення полів.
function getField(line, key, type = 'string') {
  if (type === 'array') {
    const re = new RegExp(`(?:^|,\\s*)${key}:\\s*\\[([^\\]]*)\\]`);
    const m = line.match(re);
    if (!m) return null;
    return m[1].split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
  }
  const re = new RegExp(`(?:^|,\\s*|\\{\\s*)${key}:\\s*"([^"]*)"`);
  const m = line.match(re);
  return m ? m[1] : null;
}

// 6. Update лінії — додаємо/оновлюємо поля.
function updateLine(line, updates) {
  let result = line;
  for (const [key, value] of Object.entries(updates)) {
    const isArray = Array.isArray(value);
    const valStr = isArray
      ? '[' + value.map(v => `"${v}"`).join(', ') + ']'
      : `"${value.replace(/"/g, '\\"')}"`;
    if (isArray) {
      // Замінюємо існуючий або додаємо.
      const re = new RegExp(`(${key}:\\s*)\\[[^\\]]*\\]`);
      if (re.test(result)) {
        result = result.replace(re, `$1${valStr}`);
      } else {
        // Додаємо перед image: або наприкінці перед закриваючою }
        result = insertField(result, key, valStr);
      }
    } else {
      const re = new RegExp(`(${key}:\\s*)"[^"]*"`);
      if (re.test(result)) {
        result = result.replace(re, `$1${valStr}`);
      } else {
        result = insertField(result, key, valStr);
      }
    }
  }
  return result;
}

function insertField(line, key, valStr) {
  // Вставляємо перед `image:` або, якщо немає, перед закриваючою `}` (з комою).
  const insertion = `${key}: ${valStr}, `;
  if (/image:/.test(line)) {
    return line.replace(/(\s)(image:)/, `$1${insertion}$2`);
  }
  return line.replace(/(\s+\}\s*,?\s*)$/, `, ${key}: ${valStr}$1`);
}

// === Main ===
const productsText = fs.readFileSync(PRODUCTS, 'utf8');
const descriptionsText = fs.readFileSync(DESCRIPTIONS, 'utf8');
const descMap = parseDescriptions(descriptionsText);
console.log(`Описів у словнику: ${descMap.size}`);

const lines = productsText.split('\n');
let touched = 0, skipped = 0, alreadyOk = 0;
const stats = { cultures: 0, stage: 0, description: 0, descriptionRu: 0 };
const samples = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!/^\s*\{\s*slug:/.test(line)) continue;

  const slug = getField(line, 'slug');
  if (!slug || !descMap.has(slug)) { skipped++; continue; }

  const manufacturer = getField(line, 'manufacturer') || '';
  if (manufacturer !== MANU_ARG) { skipped++; continue; }

  const desc = descMap.get(slug);
  const group = getField(line, 'group') || '';
  const cultures = getField(line, 'cultures', 'array') || [];
  const stage = getField(line, 'stage', 'array') || [];
  const descRu = getField(line, 'description');
  const descUa = getField(line, 'descriptionRu'); // у нас descRu = ru, descriptionRu в схемі = ru? перевіримо

  // У products.ts схема:  description = UA, descriptionRu = RU
  const existingDescUk = getField(line, 'description');
  const existingDescRu = getField(line, 'descriptionRu');

  const updates = {};

  if (cultures.length === 0) {
    const detected = detectCultures(desc.ua);
    if (detected.length) {
      updates.cultures = detected;
      stats.cultures++;
    }
  }

  if (stage.length === 0) {
    const detected = detectStage(group, desc.ua);
    if (detected.length) {
      updates.stage = detected;
      stats.stage++;
    }
  }

  if (!existingDescUk) {
    updates.description = extractIntro(desc.ua);
    if (updates.description) stats.description++;
  }

  if (!existingDescRu) {
    updates.descriptionRu = extractIntro(desc.ru);
    if (updates.descriptionRu) stats.descriptionRu++;
  }

  if (Object.keys(updates).length === 0) {
    alreadyOk++;
    continue;
  }

  const newLine = updateLine(line, updates);
  if (newLine !== line) {
    lines[i] = newLine;
    touched++;
    if (samples.length < 3) samples.push({ slug, updates });
  }
}

console.log(`\nСтатистика:`);
console.log(`  Зачеплено рядків: ${touched}`);
console.log(`  Не потребує апдейту: ${alreadyOk}`);
console.log(`  Пропущено (немає опису): ${skipped} (із них продукти можуть бути не з нашого пулу)`);
console.log(`  Заповнено полів: cultures=${stats.cultures}, stage=${stats.stage}, description=${stats.description}, descriptionRu=${stats.descriptionRu}`);

console.log('\n--- ПРИКЛАДИ ---');
for (const s of samples) {
  console.log(`\n${s.slug}:`);
  for (const [k, v] of Object.entries(s.updates)) {
    const display = Array.isArray(v) ? `[${v.join(', ')}]` : (v.length > 100 ? v.slice(0, 100) + '...' : v);
    console.log(`  ${k}: ${display}`);
  }
}

if (DRY) {
  console.log('\n--dry: файл НЕ записано.');
} else {
  fs.writeFileSync(PRODUCTS, lines.join('\n'));
  console.log(`\n✓ ${PRODUCTS} оновлено`);
}
