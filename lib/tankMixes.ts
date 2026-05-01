import type { TankMix } from "./types";

export const tankMixes: TankMix[] = [
  {
    slug: "pshenytsa-prapor",
    cultureSlug: "ozyma-pshenytsa",
    titleUk: "Озима пшениця — фаза прапорцевого листка",
    titleRu: "Озимая пшеница — фаза флагового листа",
    descUk: "Захист від хвороб колоса, листкового апарату та клопа черепашки під час стресових температур.",
    descRu: "Защита от болезней колоса, листового аппарата и клопа черепашки при стрессовых температурах.",
    components: [
      { name: "Міланіт", manufacturer: "Нопосон", role: "Фунгіцид", ratePerHa: 0.5, packSize: 5, unit: "л", priceVat: 14.61, priceCash: 13.39 },
      { name: "Хлорпірівіт-агро", manufacturer: "Укравіт", role: "Інсектицид", ratePerHa: 1.0, packSize: 5, unit: "л", priceVat: 11.39, priceCash: 10.44 },
      { name: "Скудеро Мульті РК", manufacturer: "Adama", role: "Антистресант", ratePerHa: 1.5, packSize: 10, unit: "л", priceVat: 6.11, priceCash: 5.60 },
      { name: "Кайт РК", manufacturer: "PEST.UA", role: "Прилипач", ratePerHa: 0.15, packSize: 5, unit: "л", priceVat: 2.48, priceCash: 2.28 }
    ]
  },
  {
    slug: "sonyashnyk-clearfield",
    cultureSlug: "sonyashnyk",
    titleUk: "Соняшник — страховий захист Clearfield",
    titleRu: "Подсолнечник — страховая защита Clearfield",
    descUk: "Після внесення імідазолінонів соняшник отримує стрес. Додавання амінокислот обов'язкове.",
    descRu: "После имидазолинонов подсолнечник в стрессе. Добавление аминокислот обязательно.",
    components: [
      { slug: "torlayting", name: "Торлайтінг", manufacturer: "Нопосон", role: "Гербіцид", ratePerHa: 1.1, packSize: 20, unit: "л", priceVat: 9.45, priceCash: 8.66 },
      { name: "Аміно Ксеріон", manufacturer: "Adama", role: "Антистресант", ratePerHa: 0.5, packSize: 5, unit: "л", priceVat: 31.92, priceCash: 29.26 },
      { name: "Акінак", manufacturer: "Нопосон", role: "Інсектицид", ratePerHa: 0.2, packSize: 5, unit: "л", priceVat: 8.63, priceCash: 7.92 }
    ]
  },
  {
    slug: "kukurudza-5-7-lystkiv",
    cultureSlug: "kukurudza",
    titleUk: "Кукурудза — страховий захист, 5-7 листків",
    titleRu: "Кукуруза — страховая защита, 5-7 листьев",
    descUk: "Контроль дводольних та злакових бур'янів при нестачі вологи.",
    descRu: "Контроль двудольных и злаковых сорняков при недостатке влаги.",
    components: [
      { name: "Мігель КС", manufacturer: "PEST.UA", role: "Гербіцид злаковий", ratePerHa: 1.0, packSize: 5, unit: "л", priceVat: 5.27, priceCash: 4.83 },
      { name: "Мікодин РК", manufacturer: "Himagro", role: "Гербіцид дводольний", ratePerHa: 0.8, packSize: 5, unit: "л", priceVat: 7.48, priceCash: 6.85 },
      { name: "Скудеро ZN+PK", manufacturer: "Adama", role: "Мікродобриво з цинком", ratePerHa: 1.0, packSize: 10, unit: "л", priceVat: 7.87, priceCash: 7.21 }
    ]
  },
  {
    slug: "ripak-ozymyi-vesna",
    cultureSlug: "ripak-ozymyi",
    titleUk: "Ріпак озимий — ранньовесняне відновлення",
    titleRu: "Рапс озимый — ранневесеннее восстановление",
    descUk: "Прихованохоботник + фунгіцидна рістрегуляція + бор.",
    descRu: "Скрытнохоботник + фунгицидная регуляция + бор.",
    components: [
      { name: "Командор Гранд", manufacturer: "Alfa Smart Agro", role: "Інсектицид", ratePerHa: 0.15, packSize: 5, unit: "л", priceVat: 24.20, priceCash: 22.18 },
      { name: "Беркут КЕ", manufacturer: "Нертус", role: "Фунгіцид-ретардант", ratePerHa: 0.6, packSize: 5, unit: "л", priceVat: 14.28, priceCash: 13.09 },
      { name: "Скудеро Борон РК", manufacturer: "Adama", role: "Мікродобриво", ratePerHa: 1.5, packSize: 10, unit: "л", priceVat: 5.73, priceCash: 5.25 },
      { name: "Талант ПАР", manufacturer: "Нертус", role: "Прилипач", ratePerHa: 0.15, packSize: 5, unit: "л", priceVat: 8.81, priceCash: 8.07 }
    ]
  },
  {
    slug: "soya-vehetatsiya",
    cultureSlug: "soya",
    titleUk: "Соя — захист на зрошенні",
    titleRu: "Соя — защита на орошении",
    descUk: "Тепличні умови для грибків та павутинного кліща.",
    descRu: "Тепличные условия для грибков и паутинного клеща.",
    components: [
      { name: "Резидент КС", manufacturer: "Нертус", role: "Акарицид", ratePerHa: 0.9, packSize: 5, unit: "л", priceVat: 31.58, priceCash: 28.94 },
      { name: "Теквіл КЕ", manufacturer: "Alfa Smart Agro", role: "Фунгіцид", ratePerHa: 0.8, packSize: 5, unit: "л", priceVat: 26.40, priceCash: 24.20 },
      { name: "Експерт Гроу", manufacturer: "Adama", role: "Стимулятор росту", ratePerHa: 1.0, packSize: 5, unit: "л", priceVat: 32.76, priceCash: 30.03 }
    ]
  }
];
