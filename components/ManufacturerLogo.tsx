// Placeholder-логотипи виробникiв: кольоровий круг з ініціалами.
// Фірмовий колір бренду + 1-2 літери (латинські/кирилиця як на упаковці).
// Пізніше можна замінити окремими SVG-файлами через ManufacturerLogoFile якщо потрібен real-logo лук.

type Meta = { color: string; initials: string };

function normalizeKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-zа-яёіїєґ0-9]/gi, "")
    .replace(/ё/g, "е")
    .replace(/ї/g, "и");
}

const MAP: Record<string, Meta> = {
  // Латинські (як в офіційному написанні)
  basf: { color: "#00793F", initials: "BF" },
  bayer: { color: "#0080C9", initials: "BA" },
  syngenta: { color: "#1F3864", initials: "SY" },
  corteva: { color: "#0033A0", initials: "CO" },
  adama: { color: "#003D7D", initials: "AD" },
  fmc: { color: "#005EB8", initials: "FM" },
  upl: { color: "#7B2D8E", initials: "U" },
  nufarm: { color: "#005AB0", initials: "NF" },
  himagro: { color: "#2D8C3C", initials: "HM" },
  pestua: { color: "#E03524", initials: "P" },
  alfasmartagro: { color: "#E55B25", initials: "AS" },

  // Кирилицею як у каталозі
  басф: { color: "#00793F", initials: "BF" },
  байер: { color: "#0080C9", initials: "BA" },
  сингента: { color: "#1F3864", initials: "SY" },
  кортева: { color: "#0033A0", initials: "CO" },
  адама: { color: "#003D7D", initials: "AD" },
  фмс: { color: "#005EB8", initials: "ФМ" },
  юпиэл: { color: "#7B2D8E", initials: "UP" },
  нуфарм: { color: "#005AB0", initials: "НФ" },
  саммитагро: { color: "#C8102E", initials: "СА" },
  саммітагро: { color: "#C8102E", initials: "СА" },
  дефенда: { color: "#0073AD", initials: "ДФ" },
  терравита: { color: "#4CAF50", initials: "ТВ" },
  терравіта: { color: "#4CAF50", initials: "ТВ" },
  укравит: { color: "#88AB42", initials: "УК" },
  укравіт: { color: "#88AB42", initials: "УК" },
  нертус: { color: "#5CB85C", initials: "Н" },
  нопосон: { color: "#0066CC", initials: "НП" },
};

function getMeta(name: string): Meta {
  const key = normalizeKey(name);
  if (MAP[key]) return MAP[key];
  // Fallback: нейтральний сірий з першими 2 буквами
  const initials = name
    .replace(/[^A-Za-zА-Яа-яІіЇїЄєҐґ]/g, "")
    .slice(0, 2)
    .toUpperCase();
  return { color: "#64748b", initials: initials || "?" };
}

export function ManufacturerLogo({ name, size = 20 }: { name: string; size?: number }) {
  const { color, initials } = getMeta(name);
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-extrabold text-white shrink-0 select-none leading-none"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: Math.max(8, Math.round(size * 0.42)),
        letterSpacing: initials.length === 1 ? 0 : -0.5,
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
