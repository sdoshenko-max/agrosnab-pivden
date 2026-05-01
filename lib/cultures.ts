import type { Culture } from "./types";

export const cultures: Culture[] = [
{
    slug: "ozyma-pshenytsa",
    nameUk: "Озима пшениця",
    nameRu: "Озимая пшеница",
    emoji: "🌾",
    shortUk: "Захист від клопа черепашки, фузаріозу колоса, кореневих гнилей в умовах посухи",
    shortRu: "Защита от клопа черепашки, фузариоза колоса, корневых гнилей в условиях засухи",
    image: "/cultures/ozyma-pshenytsa.jpg",
    stages: [
      { slug: "protruyuvannya", nameUk: "Протруювання насіння", nameRu: "Протравливание семян", icon: "🌱" },
      { slug: "herbicid-vesna", nameUk: "Гербіцид весна", nameRu: "Гербицид весна", icon: "💧" },
      { slug: "fungicid-t1", nameUk: "Фунгіцид Т1", nameRu: "Фунгицид Т1", icon: "🍄" },
      { slug: "fungicid-t2", nameUk: "Фунгіцид Т2/Т3", nameRu: "Фунгицид Т2/Т3", icon: "🛡️" },
      { slug: "insecticid-naliv", nameUk: "Інсектицид (налив)", nameRu: "Инсектицид (налив)", icon: "🐛" }
    ]
  },
  {
    slug: "sonyashnyk",
    nameUk: "Соняшник",
    nameRu: "Подсолнечник",
    emoji: "🌻",
    shortUk: "Боротьба з вовчком, амброзією, посухою. Технології Класика / Clearfield / Express",
    shortRu: "Борьба с заразихой, амброзией, засухой. Технологии Классика / Clearfield / Express",
    longUk: "Соняшник — стратегічна культура Півдня. На Миколаївщині, Херсонщині та Одещині основні виклики — посуха, агресивний вовчок (раси F, G, H), амброзія полинолиста та лобода біла. Ґрунтові гербіциди часто втрачають ефективність через відсутність весняних опадів — акцент переноситься на страхові обробки. Залежно від гібрида обирається технологія: Класика, Clearfield або Express.",
    longRu: "Подсолнечник — стратегическая культура Юга. На Николаевщине, Херсонщине и Одесщине основные вызовы — засуха, агрессивная заразиха (расы F, G, H), амброзия полыннолистная и марь белая. Почвенные гербициды часто теряют эффективность из-за отсутствия весенних осадков — акцент на страховых обработках. В зависимости от гибрида выбирается технология: Классика, Clearfield или Express.",
    image: "/cultures/sonyashnyk.jpg",
    technologies: [
      { slug: "klasyka", nameUk: "Класика", nameRu: "Классика",
        descUk: "Звичайні гібриди — захист тільки ґрунтовими гербіцидами + грамініциди.",
        descRu: "Обычные гибриды — защита только почвенными гербицидами + граминициды." },
      { slug: "clearfield", nameUk: "Clearfield", nameRu: "Clearfield",
        descUk: "Гібриди, стійкі до імідазолінонів. Єдиний надійний інструмент проти нових рас вовчка.",
        descRu: "Гибриды, устойчивые к имидазолинонам. Единственный надёжный инструмент против новых рас заразихи." },
      { slug: "express", nameUk: "Express (СУМО)", nameRu: "Express (СУМО)",
        descUk: "Гібриди, стійкі до трибенурон-метилу. Доступніша альтернатива Clearfield.",
        descRu: "Гибриды, устойчивые к трибенурон-метилу. Более доступная альтернатива Clearfield." }
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
    image: "/cultures/kukurudza.jpg",
    shortUk: "Контроль бур'янів до 8-10 листків, стебловий метелик, бавовникова совка",
    shortRu: "Контроль сорняков до 8-10 листьев, стеблевая бабочка, хлопковая совка",
    stages: [
      { slug: "gruntovyi", nameUk: "Ґрунтовий гербіцид", nameRu: "Грунтовый гербицид", icon: "💧" },
      { slug: "strakhovyi", nameUk: "Страховий гербіцид", nameRu: "Страховой гербицид", icon: "🛡️" },
      { slug: "insecticid", nameUk: "Інсектицид", nameRu: "Инсектицид", icon: "🐛" }
    ]
  },
  {
    slug: "yari-zernovi",
    nameUk: "Ярі зернові (ячмінь)",
    nameRu: "Яровые зерновые (ячмень)",
    emoji: "🌾",
    image: "/cultures/yari-zernovi.jpg",
    shortUk: "Контроль гельмінтоспоріозів та сітчастої плямистості",
    shortRu: "Контроль гельминтоспориозов и сетчатой пятнистости",
    stages: [
      { slug: "protruyuvannya", nameUk: "Протруювання", nameRu: "Протравливание", icon: "🌱" },
      { slug: "herbicid", nameUk: "Гербіцид", nameRu: "Гербицид", icon: "💧" },
      { slug: "fungicid", nameUk: "Фунгіцид", nameRu: "Фунгицид", icon: "🍄" }
    ]
  },
  {
    slug: "soya",
    nameUk: "Соя", nameRu: "Соя", emoji: "🌱",
    image: "/cultures/soya.jpg",
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
    nameUk: "Ріпак озимий", nameRu: "Рапс озимый", emoji: "🌼",
    image: "/cultures/ripak-ozymyi.jpg",
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
    nameUk: "Ріпак ярий", nameRu: "Рапс яровой", emoji: "🌼",
    image: "/cultures/ripak-yaryi.jpg",
    shortUk: "Контроль хрестоцвітих блішок на сходах",
    shortRu: "Контроль крестоцветных блошек на всходах",
    stages: [
      { slug: "insecticid", nameUk: "Інсектицид (сходи)", nameRu: "Инсектицид (всходы)", icon: "🐛" },
      { slug: "gruntovyi", nameUk: "Ґрунтовий гербіцид", nameRu: "Грунтовый гербицид", icon: "💧" }
    ]
  },
  {
    slug: "kartoplya",
    nameUk: "Картопля", nameRu: "Картофель", emoji: "🥔",
    image: "/cultures/kartoplya.jpg",
    shortUk: "Захист від колорадського жука та фітофтори в умовах поливу",
    shortRu: "Защита от колорадского жука и фитофторы в условиях полива",
    stages: [
      { slug: "herbicid", nameUk: "Гербіцид", nameRu: "Гербицид", icon: "💧" },
      { slug: "fungicid", nameUk: "Фунгіцид", nameRu: "Фунгицид", icon: "🍄" },
      { slug: "insecticid", nameUk: "Інсектицид", nameRu: "Инсектицид", icon: "🐛" }
    ]
  },
  {
    slug: "sorgo",
    nameUk: "Сорго", nameRu: "Сорго", emoji: "🌾",
    image: "/cultures/sorgo.jpg",
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
    nameUk: "Горох", nameRu: "Горох", emoji: "🟢",
    image: "/cultures/horoh.jpg",
    shortUk: "Найрентабельніша культура 2025. Захист від брухуса в період бутонізації",
    shortRu: "Самая рентабельная культура 2025. Защита от брухуса в период бутонизации",
    stages: [
      { slug: "gruntovyi", nameUk: "Ґрунтовий гербіцид", nameRu: "Грунтовый гербицид", icon: "💧" },
      { slug: "strakhovyi", nameUk: "Страховий гербіцид", nameRu: "Страховой гербицид", icon: "🛡️" },
      { slug: "insecticid", nameUk: "Інсектицид", nameRu: "Инсектицид", icon: "🐛" }
    ]
  }

];
