// Данные собраны из Deep Research "Агрохімічний сайт_ дослідження та ціни.md"
// и прайс-листа Прайс_05.04.26.xlsx

export type Tier = "econom" | "premium" | "original";

export type Product = {
  slug: string;
  name: string;
  manufacturer: string;
  tier: Tier;
  group: string;          // Гербіцид / Фунгіцид / ...
  activeIngredient: string;
  concentration: string;
  packaging: string;      // 5 л / 20 л / 0.5 кг
  rate: string;           // норма витрати
  priceVat: number;       // ціна з ПДВ ($/л або $/кг)
  priceCash: number;      // готівка ($/л або $/кг)
  unit: "л" | "кг";
  currency: "USD" | "EUR";
  analog?: string;        // оригінал, який замінює
  saveFromOriginal?: number; // економія, %
  cultures: string[];     // slug культур
  stage: string[];        // slug етапів
  highlight?: boolean;    // показувати на головній як магніт ціни
  description?: string;
};

export type Culture = {
  slug: string;
  nameUk: string;
  nameRu: string;
  emoji: string;
  shortUk: string;
  shortRu: string;
  technologies?: { slug: string; nameUk: string; nameRu: string }[]; // для соняшника
  stages: { slug: string; nameUk: string; nameRu: string; icon: string }[];
};

export type TankMix = {
  slug: string;
  cultureSlug: string;
  titleUk: string;
  titleRu: string;
  descUk: string;
  descRu: string;
  components: { name: string; manufacturer: string; role: string; priceVat: number; priceCash: number }[];
};

// ===== КУЛЬТУРИ =====
export const cultures: Culture[] = [
  {
    slug: "ozyma-pshenytsa",
    nameUk: "Озима пшениця",
    nameRu: "Озимая пшеница",
    emoji: "🌾",
    shortUk: "Захист від клопа черепашки, фузаріозу колоса, кореневих гнилей в умовах посухи",
    shortRu: "Защита от клопа черепашки, фузариоза колоса, корневых гнилей в условиях засухи",
    stages: [
      { slug: "protruyuvannya", nameUk: "Протруювання насіння", nameRu: "Протравливание семян", icon: "🌱" },
      { slug: "herbicid-vesna", nameUk: "Гербіцид весна", nameRu: "Гербицид весна", icon: "💧" },
      { slug: "fungicid-t1", nameUk: "Фунгіцид Т1", nameRu: "Фунгицид Т1", icon: "🍄" },
      { slug: "fungicid-t2", nameUk: "Фунгіцид Т2/Т3", nameRu: "Фунгицид Т2/Т3", icon: "🛡️" },
      { slug: "insecticid-naliv", nameUk: "Інсектицид (налив)", nameRu: "Инсектицид (налив)", icon: "🐛" }
    ]
  },
  {
    slug: "yari-zernovi",
    nameUk: "Ярі зернові (ячмінь)",
    nameRu: "Яровые зерновые (ячмень)",
    emoji: "🌾",
    shortUk: "Контроль гельмінтоспоріозів та сітчастої плямистості",
    shortRu: "Контроль гельминтоспориозов и сетчатой пятнистости",
    stages: [
      { slug: "protruyuvannya", nameUk: "Протруювання", nameRu: "Протравливание", icon: "🌱" },
      { slug: "herbicid", nameUk: "Гербіцид", nameRu: "Гербицид", icon: "💧" },
      { slug: "fungicid", nameUk: "Фунгіцид", nameRu: "Фунгицид", icon: "🍄" }
    ]
  },
  {
    slug: "sonyashnyk",
    nameUk: "Соняшник",
    nameRu: "Подсолнечник",
    emoji: "🌻",
    shortUk: "Боротьба з вовчком, амброзією, посухою. Технології Класика / Clearfield / Express",
    shortRu: "Борьба с заразихой, амброзией, засухой. Технологии Классика / Clearfield / Express",
    technologies: [
      { slug: "klasyka", nameUk: "Класика", nameRu: "Классика" },
      { slug: "clearfield", nameUk: "Clearfield", nameRu: "Clearfield" },
      { slug: "express", nameUk: "Express (СУМО)", nameRu: "Express (СУМО)" }
    ],
    stages: [
      { slug: "protruyuvannya", nameUk: "Протруювання", nameRu: "Протравливание", icon: "🌱" },
      { slug: "gruntovyi", nameUk: "Ґрунтовий гербіцид", nameRu: "Грунтовый гербицид", icon: "💧" },
      { slug: "strakhovyi", nameUk: "Страховий гербіцид", nameRu: "Страховой гербицид", icon: "🛡️" },
      { slug: "graminitsyd", nameUk: "Грамініцид", nameRu: "Граминицид", icon: "🌾" },
      { slug: "fungicid", nameUk: "Фунгіцид", nameRu: "Фунгицид", icon: "🍄" },
      { slug: "desikatsiya", nameUk: "Десикація", nameRu: "Десикация", icon: "🍂" }
    ]
  },
  {
    slug: "kukurudza",
    nameUk: "Кукурудза",
    nameRu: "Кукуруза",
    emoji: "🌽",
    shortUk: "Контроль бур'янів до 8-10 листків, стебловий метелик, бавовникова совка",
    shortRu: "Контроль сорняков до 8-10 листьев, стеблевая бабочка, хлопковая совка",
    stages: [
      { slug: "gruntovyi", nameUk: "Ґрунтовий гербіцид", nameRu: "Грунтовый гербицид", icon: "💧" },
      { slug: "strakhovyi", nameUk: "Страховий гербіцид", nameRu: "Страховой гербицид", icon: "🛡️" },
      { slug: "insecticid", nameUk: "Інсектицид", nameRu: "Инсектицид", icon: "🐛" }
    ]
  },
  {
    slug: "soya",
    nameUk: "Соя",
    nameRu: "Соя",
    emoji: "🌱",
    shortUk: "Захист на зрошенні: павутинний кліщ, бур'яни, грибкові інфекції",
    shortRu: "Защита на орошении: паутинный клещ, сорняки, грибковые инфекции",
    stages: [
      { slug: "gruntovyi", nameUk: "Ґрунтовий гербіцид", nameRu: "Грунтовый гербицид", icon: "💧" },
      { slug: "strakhovyi", nameUk: "Страховий гербіцид", nameRu: "Страховой гербицид", icon: "🛡️" },
      { slug: "graminitsyd", nameUk: "Грамініцид", nameRu: "Граминицид", icon: "🌾" },
      { slug: "akarytsyd", nameUk: "Акарицид", nameRu: "Акарицид", icon: "🕷️" }
    ]
  },
  {
    slug: "ripak-ozymyi",
    nameUk: "Ріпак озимий",
    nameRu: "Рапс озимый",
    emoji: "🌼",
    shortUk: "Стебловий прихованохоботник, бор, рістрегуляція осінь/весна",
    shortRu: "Стеблевой скрытнохоботник, бор, ростовая регуляция осень/весна",
    stages: [
      { slug: "gruntovyi", nameUk: "Ґрунтовий гербіцид", nameRu: "Грунтовый гербицид", icon: "💧" },
      { slug: "ristregulyatsiya", nameUk: "Рістрегуляція", nameRu: "Ростовая регуляция", icon: "📐" },
      { slug: "insecticid", nameUk: "Інсектицид (весна)", nameRu: "Инсектицид (весна)", icon: "🐛" },
      { slug: "desikatsiya", nameUk: "Десикація", nameRu: "Десикация", icon: "🍂" }
    ]
  },
  {
    slug: "ripak-yaryi",
    nameUk: "Ріпак ярий",
    nameRu: "Рапс яровой",
    emoji: "🌼",
    shortUk: "Контроль хрестоцвітих блішок на сходах",
    shortRu: "Контроль крестоцветных блошек на всходах",
    stages: [
      { slug: "insecticid", nameUk: "Інсектицид (сходи)", nameRu: "Инсектицид (всходы)", icon: "🐛" },
      { slug: "gruntovyi", nameUk: "Ґрунтовий гербіцид", nameRu: "Грунтовый гербицид", icon: "💧" }
    ]
  },
  {
    slug: "sorgo",
    nameUk: "Сорго",
    nameRu: "Сорго",
    emoji: "🌾",
    shortUk: "Посухостійка альтернатива кукурудзі. Захист сходів від попелиці",
    shortRu: "Засухостойкая альтернатива кукурузе. Защита всходов от тли",
    stages: [
      { slug: "protruyuvannya", nameUk: "Протруювання", nameRu: "Протравливание", icon: "🌱" },
      { slug: "strakhovyi", nameUk: "Страховий гербіцид", nameRu: "Страховой гербицид", icon: "🛡️" },
      { slug: "insecticid", nameUk: "Інсектицид", nameRu: "Инсектицид", icon: "🐛" }
    ]
  },
  {
    slug: "horoh",
    nameUk: "Горох",
    nameRu: "Горох",
    emoji: "🟢",
    shortUk: "Найрентабельніша культура 2025. Захист від брухуса в період бутонізації",
    shortRu: "Самая рентабельная культура 2025. Защита от брухуса в период бутонизации",
    stages: [
      { slug: "gruntovyi", nameUk: "Ґрунтовий гербіцид", nameRu: "Грунтовый гербицид", icon: "💧" },
      { slug: "strakhovyi", nameUk: "Страховий гербіцид", nameRu: "Страховой гербицид", icon: "🛡️" },
      { slug: "insecticid", nameUk: "Інсектицид", nameRu: "Инсектицид", icon: "🐛" }
    ]
  },
  {
    slug: "kartoplya",
    nameUk: "Картопля",
    nameRu: "Картофель",
    emoji: "🥔",
    shortUk: "Захист від колорадського жука та фітофтори в умовах поливу",
    shortRu: "Защита от колорадского жука и фитофторы в условиях полива",
    stages: [
      { slug: "herbicid", nameUk: "Гербіцид", nameRu: "Гербицид", icon: "💧" },
      { slug: "fungicid", nameUk: "Фунгіцид", nameRu: "Фунгицид", icon: "🍄" },
      { slug: "insecticid", nameUk: "Інсектицид", nameRu: "Инсектицид", icon: "🐛" }
    ]
  }
];

// ===== ХІТИ ЦІНИ — МАГНІТИ ГОЛОВНОЇ =====
export const products: Product[] = [
  {
    slug: "spiner-rk",
    name: "Спінер РК",
    manufacturer: "PEST.UA",
    tier: "econom",
    group: "Гербіцид",
    activeIngredient: "Гліфосат (ізопропіламінна сіль)",
    concentration: "480 г/л",
    packaging: "20 л",
    rate: "2,0–8,0 л/га",
    priceVat: 3.38,
    priceCash: 3.10,
    unit: "л",
    currency: "USD",
    analog: "Раундап",
    saveFromOriginal: 55,
    cultures: ["sonyashnyk", "kukurudza", "soya", "kartoplya"],
    stage: ["gruntovyi", "desikatsiya"],
    highlight: true,
    description: "Гербіцид суцільної дії для тотальної очистки полів до посіву та десикації перед збиранням урожаю."
  },
  {
    slug: "gefest-pro",
    name: "Гефест Про",
    manufacturer: "Нопосон",
    tier: "econom",
    group: "Гербіцид",
    activeIngredient: "Гліфосат (калійна сіль)",
    concentration: "614 г/л",
    packaging: "20 л",
    rate: "1,4–5,0 л/га",
    priceVat: 5.02,
    priceCash: 4.60,
    unit: "л",
    currency: "USD",
    analog: "Раундап Макс",
    saveFromOriginal: 33,
    cultures: ["sonyashnyk", "kukurudza", "soya"],
    stage: ["gruntovyi", "desikatsiya"],
    highlight: true,
    description: "Гліфосат у формі калійної солі — швидше проникає в рослину, ефективніший в умовах посухи."
  },
  {
    slug: "satis",
    name: "Сатіс",
    manufacturer: "Нопосон",
    tier: "econom",
    group: "Гербіцид",
    activeIngredient: "Флорасулам + 2,4-Д ефір",
    concentration: "6,25 + 452 г/л",
    packaging: "5 л",
    rate: "0,4–0,6 л/га",
    priceVat: 5.17,
    priceCash: 4.74,
    unit: "л",
    currency: "USD",
    analog: "Прима (Corteva)",
    saveFromOriginal: 60,
    cultures: ["ozyma-pshenytsa", "yari-zernovi", "kukurudza", "sorgo"],
    stage: ["herbicid-vesna", "strakhovyi"],
    highlight: true,
    description: "Класичний контроль дводольних бур'янів на зернових. Працює від +5°C — ідеально для ранньої весни."
  },
  {
    slug: "torlayting",
    name: "Торлайтінг",
    manufacturer: "Нопосон",
    tier: "econom",
    group: "Гербіцид",
    activeIngredient: "Імазамокс + Імазапір",
    concentration: "33 + 15 г/л",
    packaging: "20 л",
    rate: "1,0–1,2 л/га",
    priceVat: 9.45,
    priceCash: 8.66,
    unit: "л",
    currency: "USD",
    analog: "Євро-Лайтнінг (BASF)",
    saveFromOriginal: 60,
    cultures: ["sonyashnyk"],
    stage: ["strakhovyi"],
    highlight: true,
    description: "Страховий гербіцид для технології Clearfield. Єдиний надійний інструмент проти нових рас вовчка."
  },
  {
    slug: "titon-duo",
    name: "Тітон Дуо",
    manufacturer: "Нопосон",
    tier: "econom",
    group: "Гербіцид",
    activeIngredient: "Мезотріон + Нікосульфурон",
    concentration: "75 + 30 г/л",
    packaging: "5 л",
    rate: "1,25–2,0 л/га",
    priceVat: 9.59,
    priceCash: 8.79,
    unit: "л",
    currency: "USD",
    analog: "Елюміс (Syngenta)",
    saveFromOriginal: 69,
    cultures: ["kukurudza"],
    stage: ["strakhovyi"],
    highlight: true,
    description: "Двокомпонентний страховий гербіцид для кукурудзи. Безпечний до 8-го листка, контролює лободу і паслін."
  },
  {
    slug: "geliantex",
    name: "Геліантекс",
    manufacturer: "Corteva",
    tier: "original",
    group: "Гербіцид",
    activeIngredient: "Галауксифен-метил (Arylex)",
    concentration: "68,5 г/л",
    packaging: "1 л",
    rate: "0,5–1,0 л/га",
    priceVat: 459.36,
    priceCash: 421.08,
    unit: "л",
    currency: "USD",
    cultures: ["sonyashnyk"],
    stage: ["strakhovyi"],
    description: "Інноваційна молекула Arylex для соняшника. Працює там, де імідазолінони втрачають ефективність."
  }
];

// ===== БАКОВІ СУМІШІ =====
export const tankMixes: TankMix[] = [
  {
    slug: "pshenytsa-prapor",
    cultureSlug: "ozyma-pshenytsa",
    titleUk: "Озима пшениця — фаза прапорцевого листка",
    titleRu: "Озимая пшеница — фаза флагового листа",
    descUk: "Комплексний захист від хвороб колоса, листкового апарату та клопа черепашки під час стресових температур.",
    descRu: "Комплексная защита от болезней колоса, листового аппарата и клопа черепашки в стрессовые температуры.",
    components: [
      { name: "Міланіт", manufacturer: "Нопосон", role: "Фунгіцид", priceVat: 14.61, priceCash: 13.39 },
      { name: "Хлорпірівіт-агро", manufacturer: "Укравіт", role: "Інсектицид", priceVat: 11.39, priceCash: 10.44 },
      { name: "Скудеро Мульті РК", manufacturer: "Adama", role: "Антистресант", priceVat: 6.11, priceCash: 5.60 },
      { name: "Кайт РК", manufacturer: "PEST.UA", role: "Прилипач", priceVat: 2.48, priceCash: 2.28 }
    ]
  },
  {
    slug: "sonyashnyk-clearfield",
    cultureSlug: "sonyashnyk",
    titleUk: "Соняшник — страховий захист Clearfield",
    titleRu: "Подсолнечник — страховая защита Clearfield",
    descUk: "Після внесення імідазолінонів соняшник отримує стрес. Додавання амінокислот обов'язкове.",
    descRu: "После внесения имидазолинонов подсолнечник получает стресс. Добавление аминокислот обязательно.",
    components: [
      { name: "Торлайтінг", manufacturer: "Нопосон", role: "Гербіцид", priceVat: 9.45, priceCash: 8.66 },
      { name: "Аміно Ксеріон", manufacturer: "Adama", role: "Антистресант", priceVat: 31.92, priceCash: 29.26 },
      { name: "Акінак", manufacturer: "Нопосон", role: "Інсектицид", priceVat: 8.63, priceCash: 7.92 }
    ]
  },
  {
    slug: "kukurudza-5-7-lystkiv",
    cultureSlug: "kukurudza",
    titleUk: "Кукурудза — страховий захист, 5-7 листків",
    titleRu: "Кукуруза — страховая защита, 5-7 листьев",
    descUk: "Широкий спектр контролю дводольних та злакових бур'янів при нестачі вологи.",
    descRu: "Широкий спектр контроля двудольных и злаковых сорняков при недостатке влаги.",
    components: [
      { name: "Мігель КС", manufacturer: "PEST.UA", role: "Гербіцид злаковий", priceVat: 5.27, priceCash: 4.83 },
      { name: "Мікодин РК", manufacturer: "Himagro", role: "Гербіцид дводольний", priceVat: 7.48, priceCash: 6.85 },
      { name: "Скудеро ZN+PK", manufacturer: "Adama", role: "Мікродобриво з цинком", priceVat: 7.87, priceCash: 7.21 }
    ]
  },
  {
    slug: "ripak-ozymyi-vesna",
    cultureSlug: "ripak-ozymyi",
    titleUk: "Ріпак озимий — ранньовесняне відновлення",
    titleRu: "Рапс озимый — ранневесеннее восстановление",
    descUk: "Захист від стеблового прихованохоботника + фунгіцидна рістрегуляція + бор для цвітіння.",
    descRu: "Защита от стеблевого скрытнохоботника + фунгицидная регуляция + бор для цветения.",
    components: [
      { name: "Командор Гранд", manufacturer: "Alfa Smart Agro", role: "Інсектицид", priceVat: 24.20, priceCash: 22.18 },
      { name: "Беркут КЕ", manufacturer: "Нертус", role: "Фунгіцид-ретардант", priceVat: 14.28, priceCash: 13.09 },
      { name: "Скудеро Борон РК", manufacturer: "Adama", role: "Мікродобриво", priceVat: 5.73, priceCash: 5.25 },
      { name: "Талант ПАР", manufacturer: "Нертус", role: "Прилипач", priceVat: 8.81, priceCash: 8.07 }
    ]
  },
  {
    slug: "soya-vehetatsiya",
    cultureSlug: "soya",
    titleUk: "Соя — захист на зрошенні",
    titleRu: "Соя — защита на орошении",
    descUk: "Мікроклімат зрошуваних полів створює тепличні умови для грибків та павутинного кліща.",
    descRu: "Микроклимат орошаемых полей создаёт тепличные условия для грибков и паутинного клеща.",
    components: [
      { name: "Резидент КС", manufacturer: "Нертус", role: "Акарицид", priceVat: 31.58, priceCash: 28.94 },
      { name: "Теквіл КЕ", manufacturer: "Alfa Smart Agro", role: "Фунгіцид", priceVat: 26.40, priceCash: 24.20 },
      { name: "Експерт Гроу", manufacturer: "Adama", role: "Стимулятор росту", priceVat: 32.76, priceCash: 30.03 }
    ]
  }
];

export const highlightedProducts = products.filter(p => p.highlight);
