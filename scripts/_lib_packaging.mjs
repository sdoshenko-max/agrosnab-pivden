export function isDryProductLike(hints = {}) {
  const text = [hints.name || "", hints.activeIngredient || "", hints.rate || ""].join(" ").toLowerCase();
  if (!text.trim()) return false;

  const sep = "[^a-zа-яёіїєґ0-9]";
  const hasDryForm = new RegExp("(^|" + sep + ")(вг|в\\.г|вдг|в\\.д\\.г|зп|з\\.п|вп|в\\.п|сг|с\\.г|тб)(?=$|" + sep + ")", "i").test(text);
  const hasDryActive = /г\s*\/\s*кг/i.test(text);
  const hasDryRate = /(^|[^а-яёіїєґ])(кг|г|гр)\s*\/\s*(га|т|100)/i.test(text);
  const hasLiquidActive = /г\s*\/\s*л/i.test(text);
  const hasLiquidRate = /(л|мл)\s*\/\s*(га|т|100)/i.test(text);
  const explicitlyLiquid = new RegExp("(^|" + sep + ")(ліквід|liquid|рк|р\\.к|кс|к\\.с|ке|к\\.е|мк|м\\.к|се|с\\.е|ме|м\\.е|вс|в\\.с|концентрат\\s+суспензії|эмульсии)(?=$|" + sep + ")", "i").test(text);

  if (explicitlyLiquid) return false;
  if (hasLiquidActive && !hasDryActive && !hasDryRate) return false;
  if (hasLiquidActive && hasLiquidRate && !hasDryActive && !hasDryRate) return false;
  if (hasDryActive && !hasLiquidActive) return true;
  if ((hasDryForm || hasDryActive) && hasDryRate) return true;
  if (hasDryForm && !explicitlyLiquid) return true;
  return false;
}

function removePackageWords(value) {
  return String(value)
    .replace(/(^|[\s,;()])(?:пляш(?:к[аи])?|флакон|ящик|ящ|пак(?:ет)?|банк[аи]?|туба|каніст(?:р[аи])?)(?=$|[\s,;()])/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatPkgNumber(num) {
  return String(num).replace(/^0\.0+$/, "0");
}

function liquidEquivalentToDry(num, unit) {
  const kg = unit === "мл" ? num / 1000 : num;
  if (kg >= 1) return formatPkgNumber(kg) + " кг";
  const grams = Math.round(kg * 1000 * 1000) / 1000;
  return formatPkgNumber(grams) + " г";
}

export function normalizePkg(raw, hints = {}) {
  if (!raw) return "";
  let s = String(raw).trim();
  const lower = s.toLowerCase();
  if (/(комплект|комбі-пак|комби-пак|набір|набор)/i.test(lower)) {
    const n = lower.match(/[\d.,]+/);
    const qty = n ? (parseFloat(n[0].replace(",", ".")) || 1) : 1;
    return formatPkgNumber(qty) + " комплект";
  }
  if (/[+]/.test(s) && !/(кг|л)\s*$/i.test(s)) return s.replace(/\s+/g, "");

  const mult = s.match(/^\s*\d+\s*[*×xх]\s*(.+)$/i);
  if (mult) s = mult[1].trim();
  s = removePackageWords(s);

  const m = s.match(/(\d+(?:[.,]\d+)?)\s*([а-яёa-z]+\.?)?/i);
  if (!m) return s;

  const num = parseFloat(m[1].replace(",", ".")) || 0;
  let unit = (m[2] || (isDryProductLike(hints) ? "кг" : "л")).toLowerCase().replace(/\.+$/, "");

  if (/^кг$/.test(unit)) unit = "кг";
  else if (/^л$/.test(unit)) unit = "л";
  else if (/^(г|гр)$/.test(unit)) unit = "г";
  else if (/^мл$/.test(unit)) unit = "мл";
  else if (/^т$/.test(unit)) unit = "т";
  else unit = isDryProductLike(hints) ? "кг" : "л";

  if (isDryProductLike(hints) && (unit === "л" || unit === "мл")) {
    return liquidEquivalentToDry(num, unit);
  }
  return formatPkgNumber(num) + " " + unit;
}

export function unitFromPkg(packaging, hints = {}) {
  const s = String(packaging || "").toLowerCase().replace(/\s+/g, "");
  if (/(комплект|комбі-пак|комби-пак|набір|набор)/i.test(s)) return "комплект";
  if (/^\d+(?:[.,]\d+)?кг$/.test(s)) return "кг";
  if (/^\d+(?:[.,]\d+)?гр?$/.test(s)) return "кг";
  if (/кг/.test(s)) return "кг";
  if (isDryProductLike(hints)) return "кг";
  return "л";
}
