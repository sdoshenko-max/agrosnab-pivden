# Ручна звірка цін — SKU без авто-матчу з прайсом

> Звіт згенеровано 2026-05-05 скриптом `scripts/_price_audit.mjs`. Це SKU, для яких автоматичний пошук у `Прайс_05.04.26.xlsx` нічого схожого не знайшов. Імовірні причини: оригінали без аналога в прайсі (продаємо під замовлення), нестандартна транслітерація, або перейменування.

**Як заповнити:**
1. Подивись на свій прайс / прайс-лист постачальника / іншу довідку.
2. У колонці «Реальна priceVat» постав ціну за 1 л/кг **з ПДВ**.
3. У колонці «Currency» постав USD або EUR.
4. Якщо товар не існує / не продаємо — постав `DELETE` у колонці priceVat. Я тоді видалю SKU з каталогу.
5. Якщо не міняємо — лишай порожнім.
6. Коли заповнено — мені кажеш «застосуй `_PRICE_UNMATCHED_REVIEW.md`» і я прочитаю + зроблю оновлення одним коммітом.

## ORIGINAL (27 SKU)

| Slug | Назва | Виробник | Поточна priceVat | Реальна priceVat | Currency |
|---|---|---|---|---|---|
| `adeksar-plyus-basf` | Адексар Плюс | Басф | 35 | | |
| `bazys-75-wg-korteva` | Базис 75 WG | Кортева | 22 | | |
| `haucho-plyus-baier` | Гаучо Плюс | Байер | 60 | | |
| `hranstar-hold-korteva` | Гранстар Голд | Кортева | 22 | | |
| `hranstar-pro-korteva` | Гранстар Про | Кортева | 22 | | |
| `delano-synhenta` | Делано | Сингента | 35 | | |
| `kalibr-korteva` | Калібр | Кортева | 22 | | |
| `kallysto-480-sc-synhenta` | Каллисто 480 SC | Сингента | 22 | | |
| `karate-zeon-050-cs-synhenta` | Карате Зеон 050 CS | Сингента | 45 | | |
| `klio-basf` | Кліо | Басф | 22 | | |
| `kolosal-pro-avhusta` | Колосаль Про | Августа | 35 | | |
| `konfidor-maksi-baier` | Конфідор Максі | Байер | 45 | | |
| `lamador-baier` | Ламадор | Байер | 60 | | |
| `lastik-top-baier` | Ластік Топ | Байер | 22 | | |
| `marshal-25-ec-adama` | Маршал 25 EC | Adama | 45 | | |
| `merlin-fleks-480-sc-baier` | Мерлін Флекс 480 SC | Байер | 22 | | |
| `mospilan-20-sp-nippon-soda` | Моспілан 20 SP | Nippon Soda | 45 | | |
| `nurel-d-korteva` | Нурел Д | Кортева | 45 | | |
| `raksil-ultra-120-fs-baier` | Раксіл Ультра 120 FS | Байер | 60 | | |
| `rehlon-super-synhenta` | Реглон Супер | Сингента | 18 | | |
| `talstar-fms` | Талстар | ФМС | 45 | | |
| `tapir-basf` | Тапір | Басф | 22 | | |
| `falkon-460-ec-baier` | Фалькон 460 EC | Байер | 35 | | |
| `fokstrot-ekspert-adama` | Фокстрот Експерт | Adama | 22 | | |
| `kharnes-monsanto` | Харнес | Monsanto | 22 | | |
| `yuniver-baier` | Юнівер | Байер | 35 | | |
| `yunta-kvadro-373-4-fs-baier` | Юнта Квадро 373,4 FS | Байер | 60 | | |

## ECONOM (20 SKU)

| Slug | Назва | Виробник | Поточна priceVat | Реальна priceVat | Currency |
|---|---|---|---|---|---|
| `avatar-noposon` | АВАТАР | Нопосон | 5.68 | | |
| `akinak-noposon` | АКІНАК | Нопосон | 8.63 | | |
| `akura-himagro` | АКУРА | Himagro | 12.07 | | |
| `belenus-noposon` | БЕЛЕНУС | Нопосон | 5.71 | | |
| `blok-noposon` | БЛОК | Нопосон | 5.89 | | |
| `bredli-himagro` | БРЕДЛІ | Himagro | 59.8 | | |
| `bryhid-noposon` | БРИГІД | Нопосон | 25.83 | | |
| `zahrei-noposon` | ЗАГРЕЙ | Нопосон | 5.76 | | |
| `kaizer-nertus` | Кайзер | Нертус | 12.63 | | |
| `karbon-noposon` | КАРБОН | Нопосон | 9.67 | | |
| `koloryt-himagro` | КОЛОРИТ | Himagro | 36.23 | | |
| `likoris-noposon` | ЛІКОРІС | Нопосон | 16.97 | | |
| `nirvana-noposon` | НІРВАНА | Нопосон | 8.12 | | |
| `nyustar-himagro` | НЬЮСТАР | Himagro | 10.35 | | |
| `prolif-himagro` | ПРОЛІФ | Himagro | 4.03 | | |
| `satis-noposon` | САТІС | Нопосон | 5.17 | | |
| `super-oil-k-himagro` | Супер Р-оіл, К | Himagro | 18.98 | | |
| `tetris-pest-ua` | Тетріс | PEST.UA | 13.35 | | |
| `torlayting-noposon` | ТОРЛАЙТІНГ | Нопосон | 8.59 | | |
| `trynavata-tn-nertus` | Тринаванта, ТН | Нертус | 20.5 | | |

## PREMIUM (2 SKU)

| Slug | Назва | Виробник | Поточна priceVat | Реальна priceVat | Currency |
|---|---|---|---|---|---|
| `delavit-ukravit` | Делавіт | Укравіт | 33.58 | | |
| `fas-ukravit` | Фас | Укравіт | 6.33 | | |

