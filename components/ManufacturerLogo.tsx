// Логотипи виробникiв ЗЗР — нормалiзованi 256×256 з прозорим фоном.
// Файли у public/manufacturers/. Якщо мапiнгу нема — fallback на кольоровий круг з iнiцiалами.

type Meta = { file: string; bgFallback: string; initials: string };

function normalizeKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-zа-яёіїєґ0-9]/gi, "")
    .replace(/ё/g, "е")
    .replace(/ї/g, "и");
}

const MAP: Record<string, Meta> = {
  // 17 «великих» виробникiв
  basf: { file: "basf.svg", bgFallback: "#00793F", initials: "BF" },
  басф: { file: "basf.svg", bgFallback: "#00793F", initials: "BF" },
  bayer: { file: "bayer.svg", bgFallback: "#0080C9", initials: "BA" },
  байер: { file: "bayer.svg", bgFallback: "#0080C9", initials: "BA" },
  syngenta: { file: "syngenta.svg", bgFallback: "#1F3864", initials: "SY" },
  сингента: { file: "syngenta.svg", bgFallback: "#1F3864", initials: "SY" },
  corteva: { file: "corteva.png", bgFallback: "#0033A0", initials: "CO" },
  кортева: { file: "corteva.png", bgFallback: "#0033A0", initials: "CO" },
  adama: { file: "adama.png", bgFallback: "#003D7D", initials: "AD" },
  адама: { file: "adama.png", bgFallback: "#003D7D", initials: "AD" },
  fmc: { file: "fmc.svg", bgFallback: "#005EB8", initials: "FM" },
  фмс: { file: "fmc.svg", bgFallback: "#005EB8", initials: "ФМ" },
  upl: { file: "upl.svg", bgFallback: "#7B2D8E", initials: "U" },
  юпл: { file: "upl.svg", bgFallback: "#7B2D8E", initials: "UP" },
  nufarm: { file: "nufarm.png", bgFallback: "#005AB0", initials: "NF" },
  нуфарм: { file: "nufarm.png", bgFallback: "#005AB0", initials: "НФ" },
  summitagro: { file: "summit-agro.png", bgFallback: "#C8102E", initials: "СА" },
  саммитагро: { file: "summit-agro.png", bgFallback: "#C8102E", initials: "СА" },
  саммітагро: { file: "summit-agro.png", bgFallback: "#C8102E", initials: "СА" },
  defenda: { file: "defenda.png", bgFallback: "#0073AD", initials: "DF" },
  дефенда: { file: "defenda.png", bgFallback: "#0073AD", initials: "ДФ" },
  terravita: { file: "terra-vita.svg", bgFallback: "#4CAF50", initials: "TV" },
  терравита: { file: "terra-vita.svg", bgFallback: "#4CAF50", initials: "ТВ" },
  терравіта: { file: "terra-vita.svg", bgFallback: "#4CAF50", initials: "ТВ" },
  ukravit: { file: "ukravit.svg", bgFallback: "#88AB42", initials: "UK" },
  укравит: { file: "ukravit.svg", bgFallback: "#88AB42", initials: "УК" },
  укравіт: { file: "ukravit.svg", bgFallback: "#88AB42", initials: "УК" },
  alfasmartagro: { file: "alfa-smart-agro.png", bgFallback: "#E55B25", initials: "AS" },
  himagro: { file: "himagro.png", bgFallback: "#2D8C3C", initials: "HM" },
  хімагро: { file: "himagro.png", bgFallback: "#2D8C3C", initials: "ХМ" },
  pestua: { file: "pest-ua.png", bgFallback: "#E03524", initials: "P" },
  nertus: { file: "nertus.png", bgFallback: "#5CB85C", initials: "N" },
  нертус: { file: "nertus.png", bgFallback: "#5CB85C", initials: "Н" },
  noposon: { file: "noposon.png", bgFallback: "#0066CC", initials: "NP" },
  нопосон: { file: "noposon.png", bgFallback: "#0066CC", initials: "НП" },

  // Українськi дженерики
  grinexpress: { file: "grin-express.svg", bgFallback: "#2D8C3C", initials: "ГЕ" },
  грінекспрес: { file: "grin-express.svg", bgFallback: "#2D8C3C", initials: "ГЕ" },
  гринекспресс: { file: "grin-express.svg", bgFallback: "#2D8C3C", initials: "ГЕ" },
  life: { file: "life.png", bgFallback: "#88AB42", initials: "L" },
  лайф: { file: "life.png", bgFallback: "#88AB42", initials: "Л" },
  akht: { file: "akht.png", bgFallback: "#0066CC", initials: "АХ" },
  ахт: { file: "akht.png", bgFallback: "#0066CC", initials: "АХ" },
  nice: { file: "nice.png", bgFallback: "#E55B25", initials: "Н" },
  найс: { file: "nice.png", bgFallback: "#E55B25", initials: "Н" },
};

function getMeta(name: string): Meta | null {
  const key = normalizeKey(name);
  return MAP[key] ?? null;
}

function fallbackInitials(name: string): string {
  return (
    name
      .replace(/[^A-Za-zА-Яа-яІіЇїЄєҐґ]/g, "")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

export function ManufacturerLogo({ name, size = 44 }: { name: string; size?: number }) {
  const meta = getMeta(name);
  if (meta) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-md bg-white shrink-0 overflow-hidden"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <img
          src={`/manufacturers/${meta.file}`}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain"
          style={{ padding: Math.max(1, Math.round(size * 0.04)) }}
        />
      </span>
    );
  }

  // Fallback: кольоровий квадрат з iнiцiалами
  const initials = fallbackInitials(name);
  return (
    <span
      className="inline-flex items-center justify-center rounded-md font-extrabold text-white shrink-0 select-none leading-none"
      style={{
        width: size,
        height: size,
        background: "#64748b",
        fontSize: Math.max(10, Math.round(size * 0.42)),
        letterSpacing: initials.length === 1 ? 0 : -0.5,
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
