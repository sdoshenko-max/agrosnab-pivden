# Фото товарів — статус виконання

> Робота по додаванню фото для кожного SKU каталогу. Ціль 1 — візуальний апгрейд сторінок товарів і magnets головної. Ціль 2 — підготовка каталогу до Google Merchant Center.

**Загалом дженериків (tier != original):** 339 SKU (було 342, -3 видалено: evadro, elister, tanart — не існують у виробника)
**Стратегія:** 7 пачок по 50 SKU. У кожній пачці 5 десяток.

## Вимоги до фото (обовʼязкові)

| Параметр | Значення |
|---|---|
| Формат файлу | **JPG** (не PNG, не WebP — для одноманітності) |
| Розмір (вага) | **≤200 KB** після стиснення |
| Резолюція | ресайз до **800×800 px**, `fit: inside, withoutEnlargement: true` |
| Фон | **білий** `#ffffff` (через `sharp.flatten`) — прозорі PNG обовʼязково сплющуються |
| Якість JPEG | quality 82, mozjpeg |
| Композиція | канистра/упаковка **повністю в кадрі, по центру**, без обрізів |
| Вотермарки | ❌ НЕ використовуємо фото з вотермарками інших дилерів |
| Унікальність | один файл = один SKU. Дублі заборонені (Google Merchant Center банить дублі) |
| Заборонені бренди | Сингента, Кортева, BASF, Байер, Adama (їх товар ми не продаємо, ризик DMCA) |

**Джерела (за пріоритетом):**
1. Сайт виробника: `pest.com.ua` (PEST.UA), `himagro.com.ua` (Himagro), `nopomos.com.ua` / `hectare.ua` (Нопосон), `alfasmartagro.com` (Alfa Smart Agro), `nertus.com.ua` (Нертус), `ukravit.ua` (Укравіт).
2. Дилерські агрегатори без вотермарок: `agrotema.ltd`, `zernina.com.ua`, `lnzweb.com`, `cropagro.com.ua`.
3. WordPress: суфікс `-378x378.png` зрізаємо → отримуємо оригінал.
4. Bitrix (pest.com.ua): `/upload/iblock/<хеш>/...png` без `resize_cache/.../240_280_1/`.

**Куди кладемо:** `Сайт/public/products/<slug>.jpg`
**Як привʼязуємо:** у `Сайт/lib/products.ts` полі `image: "/products/<slug>.jpg"`

**На сторінці товару:**
- Фото центроване в білому квадратному блоці зліва (вже працює — `ProductPage.tsx`).
- Має бути **клікабельне** (lightbox-перегляд оригіналу). ⏳ TODO — окрема задача.

**Статус виконання загальний:** 🟢 320 / 339 (94%) — Пачки 1–7 закриті 2026-05-05/06.

- Активних SKU з фото: **288** (385 SKU у каталозі × ~75% покриття; original-tier не маємо фото за DMCA-ризиком).
- Відкинуто Сергієм при review: **12** (Аптека садівника / роздрібні форми — список у `_PRICE_IMPORT_RULES.md`).
- NOT FOUND: **7** (1 китайська упаковка + 6 нових 2026-Укравіт, ще не існують у виробника).

---

## Пачка 1 — SKU 1–50 (50 шт) ✅

**Статус пачки:** 🟢 50 / 50 — закрита 2026-05-05

### Пачка 1.1 — позиції 1–10 ✅

- [x] **1.** `spiner-rk-pest-ua` — Спінер, РК | PEST.UA | Гербіцид *(pest.com.ua)*
- [x] **2.** `satis-noposon` — САТІС | Нопосон | Гербіцид *(аналог: Пріма) — hectare.ua*
- [x] **3.** `torlayting-noposon` — ТОРЛАЙТІНГ | Нопосон | Гербіцид *(аналог: Євро-Лайтнінг) — hectare.ua*
- [x] **4.** `hepi-star-noposon` — ХЕПІ СТАР | Нопосон | Гербіцид *(аналог: Гранстар) — hectare.ua*
- [x] **5.** `titon-noposon` — ТІТОН | Нопосон | Гербіцид *(аналог: Мілагро) — agrotema.ltd*
- [x] **6.** `stelium-ultra-tn-alfa-smart-agro` — Стеліум Ультра, ТН | Alfa Smart Agro | Фунгіцид *(alfasmartagro.com)*
- [x] **7.** `hefest-noposon` — ГЕФЕСТ | Нопосон | Гербіцид *(аналог: Раундап) — hectare.ua*
- [x] **8.** `total-rk-himagro` — ТОТАЛ, РК | Himagro | Гербіцид *(аналог: Раундап) — himagro.com.ua*
- [x] **9.** `hefest-pro-noposon` — ГЕФЕСТ ПРО | Нопосон | Гербіцид *(аналог: Раундап Макс) — hectare.ua*
- [x] **10.** `total-k-vr-himagro` — ТОТАЛ К, ВР | Himagro | Гербіцид *(аналог: Ураган Форте) — himagro.com.ua*

### Пачка 1.2 — позиції 11–20 ✅

- [x] **11.** `dykvat-rk-himagro` — ДИКВАТ, РК | Himagro | Десикант *(аналог: Реглон Супер)*
- [x] **12.** `mehalyp-pauer-noposon` — МЕГАЛИП ПАУЕР | Нопосон | Інсектицид
- [x] **13.** `avatar-noposon` — АВАТАР | Нопосон | Інсектицид *(аналог: Харнес)*
- [x] **14.** `belenus-noposon` — БЕЛЕНУС | Нопосон | Інсектицид *(аналог: Пропоніт)*
- [x] **15.** `zahrei-noposon` — ЗАГРЕЙ | Нопосон | Інсектицид *(аналог: Примекстра TZ Голд)*
- [x] **16.** `nirvana-noposon` — НІРВАНА | Нопосон | Інсектицид *(аналог: Нурел Д)*
- [x] **17.** `akinak-noposon` — АКІНАК | Нопосон | Інсектицид *(аналог: Конфідор + Карате зеон)*
- [x] **18.** `blok-noposon` — БЛОК | Нопосон | Фунгіцид *(аналог: Фолікур)*
- [x] **19.** `karbon-noposon` — КАРБОН | Нопосон | Фунгіцид *(аналог: Імпакт)*
- [x] **20.** `likoris-noposon` — ЛІКОРІС | Нопосон | Фунгіцид *(аналог: Амістар Екстра)*

### Пачка 1.3 — позиції 21–30 ✅

- [x] **21.** `bryhid-noposon` — БРИГІД | Нопосон | Фунгіцид *(аналог: Круізер + Раксіл + Азоксистробін)*
- [x] **22.** `kait-rk-pest-ua` — Кайт, РК | PEST.UA | Гербіцид
- [x] **23.** `batman-rk-pest-ua` — Батман, РК | PEST.UA | Гербіцид
- [x] **24.** `prospero-ks-pest-ua` — Просперо, КС | PEST.UA | Гербіцид
- [x] **25.** `spiner-ekstra-rk-pest-ua` — Спінер Екстра, РК | PEST.UA | Гербіцид
- [x] **26.** `berhen-rk-pest-ua` — Берген, РК | PEST.UA | Гербіцид
- [x] **27.** `stiven-ke-pest-ua` — Стівен, КЕ | PEST.UA | Інсектицид
- [x] **28.** `lyuter-ke-pest-ua` — Лютер, КЕ | PEST.UA | Інсектицид
- [x] **29.** `myhel-ks-pest-ua` — Мигель, КС | PEST.UA | Інсектицид
- [x] **30.** `prahmat-ke-pest-ua` — Прагмат, КЕ | PEST.UA | Інсектицид

### Пачка 1.4 — позиції 31–40 ✅

- [x] **31.** `forynt-ke-pest-ua` — Форинт, КЕ | PEST.UA | Інсектицид
- [x] **32.** `alberto-tn-pest-ua` — Альберто,ТН | PEST.UA | Інсектицид
- [x] **33.** `anders-ke-pest-ua` — Андерс, КЕ | PEST.UA | Інсектицид
- [x] **34.** `lainer-tn-pest-ua` — Лайнер, ТН | PEST.UA | Інсектицид
- [x] **35.** `punktyr-vh-pest-ua` — Пунктир, ВГ | PEST.UA | Інсектицид
- [x] **36.** `tronomit-vh-pest-ua` — Трономіт, ВГ | PEST.UA | Інсектицид
- [x] **37.** `median-tn-pest-ua` — Медіан, ТН | PEST.UA | Фунгіцид
- [x] **38.** `aperol-ke-pest-ua` — Аперол, КЕ | PEST.UA | Фунгіцид
- [x] **39.** `heimer-ks-pest-ua` — Геймер, КС | PEST.UA | Фунгіцид
- [x] **40.** `tetris-pest-ua` — Тетріс | PEST.UA | Фунгіцид

### Пачка 1.5 — позиції 41–50 ✅

- [x] **41.** `meha-dykvat-rk-himagro` — МЕГА ДИКВАТ, РК | Himagro | Десикант
- [x] **42.** `antymysha-hp-himagro` — АНТИМИША, ГП | Himagro | Інсектицид
- [x] **43.** `faraon-ke-himagro` — ФАРАОН, КЕ | Himagro | Інсектицид *(аналог: Нурел Д)*
- [x] **44.** `fostran-ke-himagro` — ФОСТРАН, КЕ | Himagro | Інсектицид *(аналог: Бі-58)*
- [x] **45.** `nyustar-himagro` — НЬЮСТАР | Himagro | Інсектицид
- [x] **46.** `operkot-akro-ke-himagro` — ОПЕРКОТ АКРО, КЕ | Himagro | Інсектицид *(аналог: Конфідор+ Карате)*
- [x] **47.** `zenit-rk-himagro` — ЗЕНІТ, РК | Himagro | Інсектицид *(аналог: Конфідор)*
- [x] **48.** `taurus-zp-himagro` — ТАУРУС, ЗП | Himagro | Інсектицид *(аналог: Санмайт)*
- [x] **49.** `rancho-ks-himagro` — РАНЧО, КС | Himagro | Інсектицид *(аналог: Пончо)*
- [x] **50.** `koloryt-himagro` — КОЛОРИТ | Himagro | Інсектицид

---

## Пачка 2 — SKU 51–100 (50 шт) ⚠ 49/50

**Статус пачки:** 🟢 49 / 50 (1 NOT FOUND: milafuron-ks-kytai-nertus — китайської упаковки не знайдено)

### Пачка 2.1 — позиції 51–60 ✅

- [x] **51.** `heksoran-ks-himagro` — ГЕКСОРАН, КС | Himagro | Інсектицид *(аналог: Ніссоран)*
- [x] **52.** `tebuzan-ultra-tn-himagro` — ТЕБУЗАН УЛЬТРА, ТН | Himagro | Протруйник *(аналог: Раксил Ультра)*
- [x] **53.** `nominal-ultra-tn-himagro` — НОМІНАЛ УЛЬТРА, ТН | Himagro | Протруйник *(аналог: Круїзер)*
- [x] **54.** `bimaks-tn-himagro` — БІМАКС, ТН | Himagro | Протруйник
- [x] **55.** `nitrohen-kvik-rk-himagro` — НІТРОГЕН КВІК, РК | Himagro | Протруйник
- [x] **56.** `sydhard-tn-himagro` — СИДГАРД, ТН | Himagro | Протруйник *(аналог: Максим 025)*
- [x] **57.** `triolan-tn-himagro` — ТРІОЛАН, ТН | Himagro | Протруйник
- [x] **58.** `tiaben-t-tn-himagro` — ТІАБЕН Т, ТН | Himagro | Протруйник
- [x] **59.** `nitrohen-t-zp-himagro` — НІТРОГЕН Т, ЗП | Himagro | Протруйник
- [x] **60.** `baktolaiv-sid-zp-himagro` — БАКТОЛАЙВ СІД, ЗП | Himagro | Протруйник

### Пачка 2.2 — позиції 61–70 ✅

- [x] **61.** `prolif-himagro` — ПРОЛІФ | Himagro | Регулятор росту
- [x] **62.** `stoprost-rk-himagro` — СТОПРОСТ, РК * | Himagro | Регулятор росту
- [x] **63.** `poliamin-vr-himagro-2` — ПОЛІАМІН, ВР | Himagro | Регулятор росту
- [x] **64.** `akura-himagro` — АКУРА | Himagro | Регулятор росту
- [x] **65.** `super-oil-k-himagro` — СУПЕР ОІЛ, К | Himagro | Регулятор росту
- [x] **66.** `bona-plyus-rk-himagro` — БОНА ПЛЮС, РК | Himagro | Регулятор росту
- [x] **67.** `bona-supervet-rk-himagro` — БОНА СУПЕРВЕТ, РК | Himagro | Регулятор росту
- [x] **68.** `laifsul-vh-himagro` — Лайфсул, ВГ | Himagro | Фунгіцид
- [x] **69.** `doktor-krop-ks-himagro` — ДОКТОР КРОП, КС | Himagro | Фунгіцид *(аналог: Дерозал)*
- [x] **70.** `tebufor-ke-himagro` — ТЕБУФОР, КЕ | Himagro | Фунгіцид

### Пачка 2.3 — позиції 71–80 ✅

- [x] **71.** `tiofen-himagro` — ТІОФЕН | Himagro | Фунгіцид
- [x] **72.** `baizafon-zp-himagro` — БАЙЗАФОН, ЗП | Himagro | Фунгіцид *(аналог: Байлетон)*
- [x] **73.** `atsydan-zp-himagro` — АЦИДАН, ЗП | Himagro | Фунгіцид *(аналог: Ридоміл)*
- [x] **74.** `fitolikar-ks-himagro` — ФІТОЛІКАР, КС | Himagro | Фунгіцид *(аналог: Імпакт)*
- [x] **75.** `efatol-zp-himagro` — ЕФАТОЛ, ЗП | Himagro | Фунгіцид *(аналог: Альєт)*
- [x] **76.** `metakarb-ks-himagro` — МЕТАКАРБ, КС | Himagro | Фунгіцид *(аналог: Дерозал+Ридоміл)*
- [x] **77.** `fuzaryn-ks-himagro` — ФУЗАРИН, КС | Himagro | Фунгіцид *(аналог: Супрім 400)*
- [x] **78.** `meteor-zp-himagro` — МЕТЕОР, ЗП | Himagro | Фунгіцид *(аналог: Чемпіон)*
- [x] **79.** `universal-zp-himagro` — УНІВЕРСАЛ, ЗП | Himagro | Фунгіцид *(аналог: Фолікур)*
- [x] **80.** `frehat-ks-himagro` — ФРЕГАТ, КС | Himagro | Фунгіцид

### Пачка 2.4 — позиції 81–90 ✅

- [x] **81.** `brodvei-ks-himagro` — БРОДВЕЙ, КС | Himagro | Фунгіцид *(аналог: Квадріс)*
- [x] **82.** `tiofen-ekstra-zp-himagro` — ТІОФЕН ЕКСТРА, ЗП | Himagro | Фунгіцид *(аналог: Топсин М +Топаз)*
- [x] **83.** `zhokei-ekstra-ks-himagro` — Жокей Екстра, КС | Himagro | Фунгіцид *(аналог: Амістар Екстра)*
- [x] **84.** `tonus-ke-himagro` — ТОНУС, КЕ | Himagro | Фунгіцид
- [x] **85.** `snuker-ks-himagro` — СНУКЕР, КС | Himagro | Фунгіцид *(аналог: Карамба)*
- [x] **86.** `bredli-himagro` — БРЕДЛІ | Himagro | Фунгіцид
- [x] **87.** `arhument-rk-nertus` — Аргумент, РК | Нертус | Гербіцид
- [x] **88.** `terts-rk-nertus` — Терц, РК | Нертус | Інсектицид
- [x] **89.** `premium-hold-ks-nertus` — Преміум Голд, КС | Нертус | Інсектицид
- [x] **90.** `herb-900-ke-nertus` — Герб 900, КЕ | Нертус | Інсектицид

### Пачка 2.5 — позиції 91–100 ✅

- ⚠ **91.** `milafuron-ks-kytai-nertus` — Мілафурон, КС КИТАЙ | Нертус | Інсектицид *(⚠ NOT FOUND — китайської упаковки не знайдено, доробити при появі)* *(NOT FOUND — 2026-новий або не існує у виробника)*
- [x] **92.** `shaman-ke-nertus` — Шаман, КЕ | Нертус | Інсектицид
- [x] **93.** `fatrin-ke-nertus` — Фатрін КЕ | Нертус | Інсектицид
- [x] **94.** `milafuron-ks-nertus` — Мілафурон, КС | Нертус | Інсектицид
- [x] **95.** `fosminii-tabl-nertus` — Фосміній, табл. | Нертус | Інсектицид
- [x] **96.** `kaizer-nertus` — Кайзер | Нертус | Інсектицид
- [x] **97.** `sentynel-ke-nertus` — Сентинел КЕ | Нертус | Інсектицид
- [x] **98.** `hotika-ks-nertus` — Готіка, КС | Нертус | Інсектицид
- [x] **99.** `kontador-duo-ks-nertus` — Контадор Дуо, КС | Нертус | Інсектицид
- [x] **100.** `bokser-ks-nertus` — Боксер, КС | Нертус | Інсектицид

---

## Пачка 3 — SKU 101–150 (50 шт) ✅ 47/50 (3 видалено)

**Статус пачки:** 🟢 47 / 47 — закрита 2026-05-05 (3 SKU видалено з каталогу)

### Пачка 3.1 — позиції 101–110 ✅

- [x] **101.** `prezyden-ks-nertus` — Президен, КС | Нертус | Інсектицид
- [x] **102.** `kontador-maksy-tn-nertus` — Контадор Макси, ТН | Нертус | Інсектицид
- [x] **103.** `torsida-ke-nertus` — Торсіда, КЕ | Нертус | Інсектицид
- [x] **104.** `tiara-vh-nertus` — Тіара, ВГ | Нертус | Інсектицид
- [x] **105.** `maitus-rh-nertus` — Майтус, РГ | Нертус | Інсектицид
- [x] **106.** `tioma-ks-nertus` — Тіома, КС | Нертус | Фунгіцид
- [x] **107.** `fontes-zp-nertus` — Фонтес ЗП | Нертус | Фунгіцид
- [x] **108.** `rinkotseb-z-p-nertus` — Рінкоцеб, з.п. | Нертус | Фунгіцид
- [x] **109.** `virtuoz-ke-nertus` — Віртуоз, КЕ | Нертус | Фунгіцид
- [x] **110.** `fluafol-ks-nertus` — Флуафол, КС | Нертус | Фунгіцид

### Пачка 3.2 — позиції 111–120 ✅

- [x] **111.** `fidelis-ks-nertus` — Фіделіс, КС | Нертус | Фунгіцид
- [x] **112.** `berkut-ke-nertus` — Беркут, КЕ | Нертус | Фунгіцид
- [x] **113.** `berkut-forte-ke-nertus` — Беркут Форте, КЕ | Нертус | Фунгіцид
- [x] **114.** `kiper-ks-nertus` — Кіпер, КС | Нертус | Фунгіцид
- [x] **115.** `tumen-tn-nertus` — Тумен, ТН | Нертус | Фунгіцид
- [x] **116.** `shlyakh-ke-new-nertus` — Шлях, КЕ NEW | Нертус | Фунгіцид
- [x] **117.** `trynavata-tn-nertus` — Тринавата, ТН | Нертус | Фунгіцид
- [x] **118.** `brander-ks-nertus` — Брандер, КС | Нертус | Фунгіцид
- [x] **119.** `folio-ke-nertus` — Фоліо, КЕ | Нертус | Фунгіцид
- [x] **120.** `bakash-tn-nertus` — Бакаш, ТН | Нертус | Фунгіцид

### Пачка 3.3 — позиції 121–130 ✅

- [x] **121.** `antal-tn-nertus` — Антал, ТН | Нертус | Фунгіцид
- [x] **122.** `skorazol-k-e-nertus` — Скоразол, к.е. | Нертус | Фунгіцид
- [x] **123.** `taurt-tn-nertus` — Таурт, ТН | Нертус | Фунгіцид
- [x] **124.** `kare-zp-nertus` — Каре, ЗП | Нертус | Фунгіцид
- [x] **125.** `sihma-rk-alfa-smart-agro` — Сігма, РК | Alfa Smart Agro | Гербіцид
- [x] **126.** `alfa-dykvat-rk-alfa-smart-agro` — Альфа-Дикват, РК | Alfa Smart Agro | Гербіцид
- [x] **127.** `otaman-rk-alfa-smart-agro` — Отаман, РК | Alfa Smart Agro | Гербіцид
- [x] **128.** `sokar-rk-alfa-smart-agro` — Сокар, РК | Alfa Smart Agro | Гербіцид
- [x] **129.** `tsyvik-vk-alfa-smart-agro` — Цивік, ВК | Alfa Smart Agro | Гербіцид
- [x] **130.** `alfa-prometryn-ks-alfa-smart-agro` — Альфа-Прометрин, КС | Alfa Smart Agro | Гербіцид

### Пачка 3.4 — позиції 131–140 ✅

- [x] **131.** `otaman-ekstra-rk-alfa-smart-agro` — Отаман Екстра, РК | Alfa Smart Agro | Гербіцид
- [x] **132.** `yukon-ks-alfa-smart-agro` — Юкон, КС | Alfa Smart Agro | Гербіцид
- [x] **133.** `alfa-dykvat-forte-rk-alfa-smart-agro` — Альфа-Дикват Форте, РК | Alfa Smart Agro | Гербіцид
- [x] **134.** `omeha-ekstra-ke-alfa-smart-agro` — Омега Екстра, КЕ | Alfa Smart Agro | Гербіцид
- [x] **135.** `khammer-duo-se-alfa-smart-agro` — Хаммер Дуо, СЕ | Alfa Smart Agro | Гербіцид
- [x] **136.** `buster-rk-alfa-smart-agro` — Бустер, РК | Alfa Smart Agro | Гербіцид
- [x] **137.** `superbizon-ke-alfa-smart-agro` — СуперБізон, КЕ | Alfa Smart Agro | Гербіцид
- ❌ **138.** `evadro-rk-alfa-smart-agro` — ВИДАЛЕНО з каталогу (не існує у виробника)
- [x] **139.** `lobera-ke-alfa-smart-agro` — Лобера, КЕ | Alfa Smart Agro | Гербіцид
- [x] **140.** `livendor-me-alfa-smart-agro` — Лівендор, МЕ | Alfa Smart Agro | Гербіцид

### Пачка 3.5 — позиції 141–150 ✅

- [x] **141.** `levias-ke-alfa-smart-agro` — Левіас, КЕ | Alfa Smart Agro | Гербіцид
- ❌ **142.** `elister-ridyna-alfa-smart-agro` — ВИДАЛЕНО з каталогу (не існує у виробника)
- [x] **143.** `kaiman-ke-alfa-smart-agro` — Кайман, КЕ | Alfa Smart Agro | Гербіцид
- ❌ **144.** `tanart-vh-alfa-smart-agro` — ВИДАЛЕНО з каталогу (не існує у виробника)
- [x] **145.** `pinol-ev-alfa-smart-agro` — Піноль, ЕВ | Alfa Smart Agro | Гербіцид
- [x] **146.** `viares-ks-alfa-smart-agro` — Віарес, КС | Alfa Smart Agro | Гербіцид
- [x] **147.** `veritan-rk-alfa-smart-agro` — Верітан, РК | Alfa Smart Agro | Гербіцид
- [x] **148.** `santal-rk-alfa-smart-agro` — Сантал, РК | Alfa Smart Agro | Гербіцид
- [x] **149.** `lendinh-ks-alfa-smart-agro` — Лендінг, КС | Alfa Smart Agro | Гербіцид
- [x] **150.** `hladiator-ks-alfa-smart-agro` — Гладіатор, КС | Alfa Smart Agro | Гербіцид

---

## Пачка 4 — SKU 151–200 (50 шт)

**Статус пачки:** ✅ / 50

### Пачка 4.1 — позиції 151–160

- [x] **151.** `flaip-ks-alfa-smart-agro` — Флайп, КС | Alfa Smart Agro | Гербіцид
- [x] **152.** `antyzlak-ke-tilky-razom-z-par-omeha-ekstra-ke-tsina-za-kompl` — Антизлак, КЕ (тільки разом з ПАР Омега Екстра, КЕ, ціна за комплект 1:1) | Alfa Smart Agro | Гербіцид
- [x] **153.** `kamelot-ke-alfa-smart-agro` — Камелот, КЕ | Alfa Smart Agro | Гербіцид
- [x] **154.** `nomais-rozchyn-alfa-smart-agro` — Номайс, розчин | Alfa Smart Agro | Гербіцид
- [x] **155.** `eledzhi-ke-alfa-smart-agro` — Еледжі, КЕ | Alfa Smart Agro | Гербіцид
- [x] **156.** `konkur-ks-alfa-smart-agro` — Конкур, КС | Alfa Smart Agro | Гербіцид
- [x] **157.** `alfa-star-vh-alfa-smart-agro` — Альфа-Стар, ВГ | Alfa Smart Agro | Гербіцид
- [x] **158.** `aktual-ke-alfa-smart-agro` — Актуал, КЕ | Alfa Smart Agro | Гербіцид
- [x] **159.** `mistard-vh-alfa-smart-agro` — Містард, ВГ | Alfa Smart Agro | Гербіцид
- [x] **160.** `sintak-ks-alfa-smart-agro` — Сінтак, КС | Alfa Smart Agro | Гербіцид

### Пачка 4.2 — позиції 161–170

- [x] **161.** `sihur-vh-par-omeha-plyus-alfa-smart-agro` — Сігур, ВГ + ПАР Омега Плюс | Alfa Smart Agro | Гербіцид
- [x] **162.** `lonhas-zp-alfa-smart-agro` — Лонгас, ЗП | Alfa Smart Agro | Гербіцид
- [x] **163.** `alfa-mayis-vh-alfa-smart-agro` — Альфа-Маїс, ВГ | Alfa Smart Agro | Гербіцид
- [x] **164.** `khammer-vh-alfa-smart-agro` — Хаммер, ВГ | Alfa Smart Agro | Гербіцид
- [x] **165.** `tryvium-vh-par-buster-alfa-smart-agro` — Тривіум, ВГ + ПАР Бустер | Alfa Smart Agro | Гербіцид
- [x] **166.** `tryatlon-praim-vh-alfa-smart-agro` — Триатлон Прайм, ВГ | Alfa Smart Agro | Гербіцид
- [x] **167.** `tryatlon-vh-alfa-smart-agro` — Триатлон, ВГ | Alfa Smart Agro | Гербіцид
- [x] **168.** `alfalyp-rk-alfa-smart-agro` — Альфалип, РК | Alfa Smart Agro | Інсектицид
- [x] **169.** `alfalyp-ekstra-rk-alfa-smart-agro` — Альфалип Екстра, РК | Alfa Smart Agro | Інсектицид
- [x] **170.** `kampus-ke-alfa-smart-agro` — Кампус, КЕ | Alfa Smart Agro | Інсектицид

### Пачка 4.3 — позиції 171–180

- [x] **171.** `teip-ekstra-ks-alfa-smart-agro` — Тейп Екстра, КС | Alfa Smart Agro | Інсектицид
- [x] **172.** `etalon-ks-alfa-smart-agro` — Еталон, КС | Alfa Smart Agro | Інсектицид
- [x] **173.** `alfa-standart-ks-alfa-smart-agro` — Альфа-Стандарт, КС | Alfa Smart Agro | Інсектицид
- [x] **174.** `alfa-etafon-rk-alfa-smart-agro` — Альфа-Етафон, РК | Alfa Smart Agro | Інсектицид
- [x] **175.** `oskar-premium-se-alfa-smart-agro` — Оскар Преміум, СЕ | Alfa Smart Agro | Інсектицид
- [x] **176.** `zalp-ke-alfa-smart-agro` — Залп, КЕ | Alfa Smart Agro | Інсектицид
- [x] **177.** `alfa-bentazon-rk-alfa-smart-agro` — Альфа-Бентазон, РК | Alfa Smart Agro | Інсектицид
- [x] **178.** `alfa-hetman-ke-alfa-smart-agro` — Альфа-Гетьман, КЕ | Alfa Smart Agro | Інсектицид
- [x] **179.** `nokaut-ekstra-ks-alfa-smart-agro` — Нокаут Екстра, КС | Alfa Smart Agro | Інсектицид
- [x] **180.** `alfa-bryhadyr-ke-alfa-smart-agro` — Альфа-Бригадир, КЕ | Alfa Smart Agro | Інсектицид

### Пачка 4.4 — позиції 181–190

- [x] **181.** `oskar-pauer-md-alfa-smart-agro` — Оскар Пауер, МД | Alfa Smart Agro | Інсектицид
- [x] **182.** `dzhyn-tb-alfa-smart-agro` — Джин, ТБ | Alfa Smart Agro | Інсектицид
- [x] **183.** `alfa-dykamba-rk-alfa-smart-agro` — Альфа-Дикамба, РК | Alfa Smart Agro | Інсектицид
- [x] **184.** `klondaik-tn-alfa-smart-agro` — Клондайк, ТН | Alfa Smart Agro | Інсектицид
- [x] **185.** `alfa-mid-zp-alfa-smart-agro` — Альфа-Мідь, ЗП | Alfa Smart Agro | Інсектицид
- [x] **186.** `napoval-ks-alfa-smart-agro` — Наповал, КС | Alfa Smart Agro | Інсектицид
- [x] **187.** `alvius-md-alfa-smart-agro` — Альвіус, МД | Alfa Smart Agro | Інсектицид
- [x] **188.** `razyt-ks-alfa-smart-agro` — Разит, КС | Alfa Smart Agro | Інсектицид
- [x] **189.** `komandor-ekstra-tn-alfa-smart-agro` — Командор Екстра, ТН | Alfa Smart Agro | Інсектицид
- [x] **190.** `alfa-piralid-rk-alfa-smart-agro` — Альфа-Піралід, РК | Alfa Smart Agro | Інсектицид

### Пачка 4.5 — позиції 191–200

- [x] **191.** `komandor-hrand-tn-alfa-smart-agro` — Командор Гранд, ТН | Alfa Smart Agro | Інсектицид
- [x] **192.** `ambir-sk-alfa-smart-agro` — Амбір, СК | Alfa Smart Agro | Інсектицид
- [x] **193.** `lohus-ks-alfa-smart-agro` — Логус, КС | Alfa Smart Agro | Інсектицид
- [x] **194.** `ramzes-vh-alfa-smart-agro` — Рамзес, ВГ | Alfa Smart Agro | Інсектицид
- [x] **195.** `ventsedor-tn-alfa-smart-agro` — Венцедор, ТН | Alfa Smart Agro | Фунгіцид
- [x] **196.** `varos-ks-alfa-smart-agro` — Варос, КС | Alfa Smart Agro | Фунгіцид
- [x] **197.** `alfa-tebuzol-ke-alfa-smart-agro` — Альфа-Тебузол, КЕ | Alfa Smart Agro | Фунгіцид
- [x] **198.** `feniks-ks-alfa-smart-agro` — Фенікс, КС | Alfa Smart Agro | Фунгіцид
- [x] **199.** `tezys-ks-alfa-smart-agro` — Тезис, КС | Alfa Smart Agro | Фунгіцид
- [x] **200.** `kheller-ks-alfa-smart-agro` — Хеллер, КС | Alfa Smart Agro | Фунгіцид

---

## Пачка 5 — SKU 201–250 (50 шт)

**Статус пачки:** ✅ / 50

### Пачка 5.1 — позиції 201–210

- [x] **201.** `hreivis-ev-alfa-smart-agro` — Грейвіс, ЕВ | Alfa Smart Agro | Фунгіцид
- [x] **202.** `kvalifai-ke-alfa-smart-agro` — Кваліфай, КЕ | Alfa Smart Agro | Фунгіцид
- [x] **203.** `feniks-duo-ks-alfa-smart-agro` — Фенікс Дуо, КС | Alfa Smart Agro | Фунгіцид
- [x] **204.** `krosbi-se-alfa-smart-agro` — Кросбі, СЕ | Alfa Smart Agro | Фунгіцид
- [x] **205.** `ardanis-sk-alfa-smart-agro` — Арданіс, СК | Alfa Smart Agro | Фунгіцид
- [x] **206.** `bolivar-forte-ks-alfa-smart-agro` — Болівар Форте, КС | Alfa Smart Agro | Фунгіцид
- [x] **207.** `amikon-ev-alfa-smart-agro` — Амікон, ЕВ | Alfa Smart Agro | Фунгіцид
- [x] **208.** `artis-plyus-ks-alfa-smart-agro` — Артіс Плюс, КС | Alfa Smart Agro | Фунгіцид
- [x] **209.** `relevant-ks-alfa-smart-agro` — Релевант, КС | Alfa Smart Agro | Фунгіцид
- [x] **210.** `barret-ke-alfa-smart-agro` — Баррет, КЕ | Alfa Smart Agro | Фунгіцид

### Пачка 5.2 — позиції 211–220

- [x] **211.** `korvizar-m-ke-alfa-smart-agro` — Корвізар М, КЕ | Alfa Smart Agro | Фунгіцид
- [x] **212.** `kantaris-tn-alfa-smart-agro` — Кантаріс, ТН | Alfa Smart Agro | Фунгіцид
- [x] **213.** `tekvil-ke-alfa-smart-agro` — Теквіл, КЕ | Alfa Smart Agro | Фунгіцид
- [x] **214.** `stavarro-se-alfa-smart-agro` — Ставарро, СЕ | Alfa Smart Agro | Фунгіцид
- [x] **215.** `dok-pro-zp-alfa-smart-agro` — ДОК Про, ЗП | Alfa Smart Agro | Фунгіцид
- [x] **216.** `adaraiv-ke-alfa-smart-agro` — Адарайв, КЕ | Alfa Smart Agro | Фунгіцид
- [x] **217.** `elsvin-me-alfa-smart-agro` — Елсвін, МЕ | Alfa Smart Agro | Фунгіцид
- [x] **218.** `avitsenna-se-alfa-smart-agro` — Авіценна, СЕ | Alfa Smart Agro | Фунгіцид
- [x] **219.** `avido-tn-alfa-smart-agro` — Авідо, ТН | Alfa Smart Agro | Фунгіцид
- [x] **220.** `telamus-ks-alfa-smart-agro` — Теламус, КС | Alfa Smart Agro | Фунгіцид

### Пачка 5.3 — позиції 221–230

- [x] **221.** `avitsenna-plyus-tn-alfa-smart-agro` — Авіценна Плюс, ТН | Alfa Smart Agro | Фунгіцид
- [x] **222.** `anelas-ke-alfa-smart-agro` — Анелас, КЕ | Alfa Smart Agro | Фунгіцид
- [x] **223.** `kontroler-zp-alfa-smart-agro` — Контролер, ЗП | Alfa Smart Agro | Фунгіцид
- ❌ **224.** `inferno-vh-ukravit` — Інферно,ВГ | Укравіт | Гербіцид *(відкинуто Сергієм 2026-05-06)*
- [x] **225.** `aivori-plyus-ukravit` — Айворі плюс | Укравіт | Гербіцид
- [x] **226.** `desykant-rk-ukravit` — Десикант, РК | Укравіт | Гербіцид
- [x] **227.** `hlifovit-rk-ukravit` — Гліфовіт, РК | Укравіт | Гербіцид
- [x] **228.** `halant-rk-ukravit` — Галант,РК | Укравіт | Гербіцид
- ❌ **229.** `kapkan-prynada-ukravit` — Капкан (принада) | Укравіт | Гербіцид *(відкинуто Сергієм 2026-05-06)*
- ❌ **230.** `zakhvat-oil-ev-ukravit` — Захват Ойл, ЕВ | Укравіт | Гербіцид *(відкинуто Сергієм 2026-05-06)*

### Пачка 5.4 — позиції 231–240

- [x] **231.** `huliver-rk-berehynya-ukravit` — Гулівер РК (Берегиня) | Укравіт | Гербіцид
- ❌ **232.** `hrou-amino-avanhard-dkm-ukravit` — Гроу Аміно Авангард ДКМ | Укравіт | Гербіцид *(відкинуто Сергієм 2026-05-06)*
- [x] **233.** `fas-ukravit` — Фас | Укравіт | Гербіцид
- ❌ **234.** `hlifovit-ekstra-rk-ukravit` — Гліфовіт Екстра, РК | Укравіт | Гербіцид *(відкинуто Сергієм 2026-05-06)*
- [x] **235.** `antyhusyn-ks-ukravit` — Антигусинь, КС | Укравіт | Гербіцид
- [x] **236.** `desykant-maks-rk-ukravit` — Десикант Макс, РК | Укравіт | Гербіцид
- [x] **237.** `miladar-ks-ukravit` — Міладар, КС | Укравіт | Гербіцид
- [x] **238.** `ahent-se-ukravit` — Агент, СЕ | Укравіт | Гербіцид
- [x] **239.** `varyah-ke-ukravit` — Варяг, КЕ | Укравіт | Гербіцид
- [x] **240.** `ternat-ks-ukravit` — Тернат, КС | Укравіт | Гербіцид

### Пачка 5.5 — позиції 241–250

- [x] **241.** `tizer-ke-ukravit` — Тізер, КЕ | Укравіт | Гербіцид
- [x] **242.** `raps-klei-ke-ukravit` — Рапс-клей, КЕ | Укравіт | Гербіцид
- [x] **243.** `khortus-ke-ukravit` — Хортус, КЕ | Укравіт | Гербіцид
- [x] **244.** `ultrasyl-tn-ukravit` — Ультрасил, ТН | Укравіт | Гербіцид
- [x] **245.** `unikal-ks-ukravit` — Унікаль, КС | Укравіт | Гербіцид
- [x] **246.** `brilon-rk-ukravit` — Брілон,РК | Укравіт | Гербіцид
- [x] **247.** `varyah-trio-se-ukravit` — Варяг Тріо, СЕ | Укравіт | Гербіцид
- [x] **248.** `dezaral-ks-ukravit` — Дезарал, КС | Укравіт | Гербіцид
- [x] **249.** `pikador-rk-ukravit` — Пікадор, РК | Укравіт | Гербіцид
- [x] **250.** `supervin-ks-ukravit` — Супервін, КС | Укравіт | Гербіцид

---

## Пачка 6 — SKU 251–300 (50 шт)

**Статус пачки:** ✅ / 50

### Пачка 6.1 — позиції 251–260

- [x] **251.** `ahrostar-rk-ukravit` — Агростар, РК | Укравіт | Гербіцид
- [x] **252.** `desykant-eir-rk-ukravit` — Десикант Ейр, РК | Укравіт | Гербіцид
- [x] **253.** `kvin-star-maks-ke-ukravit` — Квін Стар Макс, КЕ | Укравіт | Гербіцид
- [x] **254.** `ats-lyuks-zp-ukravit` — АЦ Люкс, ЗП | Укравіт | Гербіцид
- [x] **255.** `dymevit-ke-ukravit` — Димевіт, КЕ | Укравіт | Гербіцид
- [x] **256.** `zakhysnyk-ks-ukravit` — Захисник, КС | Укравіт | Гербіцид
- [x] **257.** `imi-vit-rk-ukravit` — Імі-Віт,РК | Укравіт | Гербіцид
- [x] **258.** `khlorpirivit-ahro-ke-ukravit` — Хлорпірівіт-агро, КЕ | Укравіт | Гербіцид
- [x] **259.** `ats-lyuks-likvid-zp-ukravit` — АЦ Люкс Ліквід, ЗП | Укравіт | Гербіцид
- [x] **260.** `henezys-rk-ukravit` — Генезис, РК | Укравіт | Гербіцид

### Пачка 6.2 — позиції 261–270

- [x] **261.** `panda-ke-ukravit` — Панда, КЕ | Укравіт | Гербіцид
- [x] **262.** `fenomen-vh-ukravit` — Феномен, ВГ | Укравіт | Гербіцид
- [x] **263.** `dezaral-ekstra-ks-ukravit` — Дезарал Екстра, КС | Укравіт | Гербіцид
- [x] **264.** `flahman-rk-ukravit` — Флагман, РК | Укравіт | Гербіцид
- [x] **265.** `datonit-hold-ke-ukravit` — Датоніт Голд, КЕ | Укравіт | Гербіцид
- [x] **266.** `matador-tn-ukravit` — Матадор, ТН | Укравіт | Гербіцид
- [x] **267.** `troiset-vh-triafit-ukravit` — Тройсет, ВГ (Тріафіт) | Укравіт | Гербіцид
- [x] **268.** `rekord-tn-ukravit` — Рекорд, ТН | Укравіт | Гербіцид
- [x] **269.** `violis-ks-ukravit` — Віоліс, КС | Укравіт | Гербіцид
- [x] **270.** `top-efekt-ks-ukravit` — Топ Ефект, КС | Укравіт | Гербіцид

### Пачка 6.3 — позиції 271–280

- [x] **271.** `tsilytel-zp-ukravit` — Цілитель, ЗП | Укравіт | Гербіцид
- [x] **272.** `kelt-ke-ukravit` — Кельт, КЕ | Укравіт | Гербіцид
- [x] **273.** `manvit-zp-ukravit` — Манвіт, ЗП | Укравіт | Гербіцид
- [x] **274.** `restler-trio-ks-ukravit` — Рестлер Тріо, КС | Укравіт | Гербіцид
- [x] **275.** `dyvo-n-rk-ukravit` — Диво Н, РК | Укравіт | Гербіцид
- [x] **276.** `supresor-pinohasnyk-ukravit` — Супресор, піногасник | Укравіт | Гербіцид
- [x] **277.** `inhres-adyuvant-ukravit` — Інгрес, адьювант | Укравіт | Гербіцид
- [x] **278.** `unikal-maks-ks-ukravit` — Унікаль МАКС, КС | Укравіт | Гербіцид
- [x] **279.** `komandyr-ke-ukravit` — Командир, КЕ | Укравіт | Гербіцид
- ❌ **280.** `selfos-tb-ukravit` — Селфос, ТБ | Укравіт | Гербіцид *(відкинуто Сергієм 2026-05-06)*

### Пачка 6.4 — позиції 281–290

- ❌ **281.** `fenomen-praim-vh-ukravit` — Феномен Прайм, ВГ | Укравіт | Гербіцид *(відкинуто Сергієм 2026-05-06)*
- [x] **282.** `antykolorad-maks-ks-ukravit` — Антиколорад МАКС, КС | Укравіт | Гербіцид
- [x] **283.** `selenit-maks-ke-ukravit` — Селеніт Макс, КЕ | Укравіт | Гербіцид
- [x] **284.** `vitalon-ekspert-ke-ukravit` — Віталон Експерт, КЕ | Укравіт | Гербіцид
- [x] **285.** `miladar-duo-ks-ukravit` — Міладар Дуо, КС | Укравіт | Гербіцид
- [x] **286.** `antykhrushch-ks-ukravit` — Антихрущ,КС | Укравіт | Гербіцид
- ❌ **287.** `as-selektyv-tn-ukravit` — АС-Селектив, ТН | Укравіт | Гербіцид *(відкинуто Сергієм 2026-05-06)*
- [x] **288.** `venon-ks-ukravit` — Венон, КС | Укравіт | Гербіцид
- [x] **289.** `hart-zp-ukravit` — Гарт, ЗП | Укравіт | Гербіцид
- [x] **290.** `makstar-rk-ukravit` — Макстар, РК | Укравіт | Гербіцид

### Пачка 6.5 — позиції 291–300

- [x] **291.** `ti-reks-ke-ukravit` — Ті Рекс, КЕ | Укравіт | Гербіцид
- [x] **292.** `ultrasyl-duo-tn-ukravit` — Ультрасил Дуо, ТН | Укравіт | Гербіцид
- [x] **293.** `khimars-ato-zhuk-ukravit` — ХімАрс (АТО ЖУК) | Укравіт | Гербіцид
- [x] **294.** `fundazym-zp-ukravit` — Фундазим, ЗП | Укравіт | Гербіцид
- [x] **295.** `mastak-rk-ukravit` — Мастак, РК | Укравіт | Гербіцид
- [x] **296.** `sinan-ks-ukravit` — Сінан, КС | Укравіт | Гербіцид
- [x] **297.** `barion-en-ukravit` — Баріон,ЕН | Укравіт | Гербіцид
- [x] **298.** `brodivit-r-ukravit` — Бродівіт, Р | Укравіт | Гербіцид
- [x] **299.** `kailis-ks-ukravit` — Кайліс, КС | Укравіт | Гербіцид
- [x] **300.** `lyuks-maksi-ks-ukravit` — Люкс Максі, КС | Укравіт | Гербіцид

---

## Пачка 7 — SKU 301–342 (42 шт)

**Статус пачки:** ✅ / 42

### Пачка 7.1 — позиції 301–310

- [x] **301.** `stels-ke-ukravit` — Стелс, КЕ | Укравіт | Гербіцид
- [x] **302.** `zakhysnyk-ekstra-ks-ukravit` — Захисник Екстра, КС | Укравіт | Гербіцид
- [x] **303.** `laivit-tn-ukravit` — Лайвіт, ТН | Укравіт | Гербіцид
- ❌ **304.** `antysapa-likvid-vh-ukravit` — Антисапа Ліквід, ВГ | Укравіт | Гербіцид *(відкинуто Сергієм 2026-05-06)*
- [x] **305.** `zakhyst-zp-ukravit` — Захист, ЗП | Укравіт | Гербіцид
- [x] **306.** `stelavit-rk-ukravit` — Стелавіт, РК | Укравіт | Гербіцид
- [x] **307.** `ekzor-tn-ukravit` — Екзор,ТН | Укравіт | Гербіцид
- [x] **308.** `lyuvitor-ks-ukravit` — Лювітор, КС | Укравіт | Гербіцид
- [x] **309.** `naraps-rk-ukravit` — Нарапс, РК | Укравіт | Гербіцид
- [x] **310.** `akula-ke-ukravit` — Акула, КЕ | Укравіт | Гербіцид

### Пачка 7.2 — позиції 311–320

- [x] **311.** `kariolis-tn-ukravit` — Каріоліс,ТН | Укравіт | Гербіцид
- ⚠ **312.** `antrial-ke-new2026-ukravit` — Антріал, КЕ NEW2026 | Укравіт | Гербіцид *(NOT FOUND — 2026-новий або не існує у виробника)*
- [x] **313.** `ashard-rk-novynka-ukravit` — Асгард, РК Новинка | Укравіт | Гербіцид
- [x] **314.** `eskalip-ks-ukravit` — Ескаліп, КС | Укравіт | Гербіцид
- [x] **315.** `kapital-ks-ukravit` — Капітал, КС | Укравіт | Гербіцид
- [x] **316.** `antyklishch-maks-ke-ukravit` — Антикліщ МАКС, КЕ | Укравіт | Гербіцид
- ❌ **317.** `antysapa-vh-ukravit` — Антисапа, ВГ | Укравіт | Гербіцид *(відкинуто Сергієм 2026-05-06)*
- [x] **318.** `inspir-hold-ke-ukravit` — Інспір Голд, КЕ | Укравіт | Гербіцид
- [x] **319.** `molvit-ke-ukravit` — Молвіт, КЕ | Укравіт | Гербіцид
- [x] **320.** `delavit-ukravit` — Делавіт | Укравіт | Гербіцид

### Пачка 7.3 — позиції 321–330

- [x] **321.** `ayaks-ks-ukravit` — Аякс, КС | Укравіт | Гербіцид
- [x] **322.** `hold-star-vh-ukravit` — Голд Стар, ВГ | Укравіт | Гербіцид
- [x] **323.** `holdiks-ks-ukravit` — Голдікс, КС | Укравіт | Гербіцид
- ❌ **324.** `enerhodar-ks-ukravit` — Енергодар, КС | Укравіт | Гербіцид *(відкинуто Сергієм 2026-05-06)*
- [x] **325.** `landin-tn-ukravit` — Ландін, ТН | Укравіт | Гербіцид
- ⚠ **326.** `likur-ke-new2026-ukravit` — Лікур, КЕ NEW2026 | Укравіт | Гербіцид *(NOT FOUND — 2026-новий або не існує у виробника)*
- ⚠ **327.** `paskal-tn-ukravit` — Паскаль, ТН | Укравіт | Гербіцид *(NOT FOUND — 2026-новий або не існує у виробника)*
- [x] **328.** `dzhek-pot-ke-ukravit` — Джек Пот, КЕ | Укравіт | Гербіцид
- [x] **329.** `samshyt-ks-ukravit` — Самшит, КС | Укравіт | Гербіцид
- [x] **330.** `strazh-ks-ukravit` — Страж, КС | Укравіт | Гербіцид

### Пачка 7.4 — позиції 331–340

- [x] **331.** `turil-vh-ukravit` — Туріл, ВГ | Укравіт | Гербіцид
- ❌ **332.** `hold-star-ekstra-vh-ukravit` — Голд Стар Екстра, ВГ | Укравіт | Гербіцид *(відкинуто Сергієм 2026-05-06)*
- [x] **333.** `rialt-ks-ukravit` — Ріальт, КС | Укравіт | Гербіцид
- [x] **334.** `veiron-ks-ukravit` — Вейрон КС | Укравіт | Гербіцид
- ⚠ **335.** `vinat-ks-new-2026-ukravit` — Вінат, КС NEW 2026 | Укравіт | Гербіцид *(NOT FOUND — 2026-новий або не існує у виробника)*
- [x] **336.** `formula-vh-ukravit` — Формула, ВГ | Укравіт | Гербіцид
- [x] **337.** `tivitus-vh-ukravit` — Тівітус, ВГ | Укравіт | Гербіцид
- [x] **338.** `laplas-vh-novynka-ukravit` — Лаплас, ВГ Новинка | Укравіт | Гербіцид
- ⚠ **339.** `leksion-vh-new2026-ukravit` — Лексіон, ВГ NEW2026 | Укравіт | Гербіцид *(NOT FOUND — 2026-новий або не існує у виробника)*
- [x] **340.** `belvin-ks-ukravit` — Бельвін, КС | Укравіт | Гербіцид

### Пачка 7.5 — позиції 341–342

- ⚠ **341.** `tendor-vh-new-2026-ukravit` — Тендор, ВГ NEW 2026 | Укравіт | Гербіцид *(NOT FOUND — 2026-новий або не існує у виробника)*
- [x] **342.** `klainer-vh-ukravit` — Клайнер, ВГ | Укравіт | Гербіцид

---

## Як заповнюємо

1. Для кожного товару Claude шукає HQ-фото на сайті виробника (через WebFetch / WebSearch).
2. Скачує в Сайт/public/products/<slug>.jpg.
3. Якщо знайшли — позначаємо в цьому файлі [x] і пишемо джерело збоку.
4. Якщо не знайшли — позначаємо ⚠ NOT FOUND, додаємо до списку «спитати у виробника».
5. Після кожних 10 SKU — оновлюємо лічильник пачки і коммітимо в git.

## Не використовуємо фото

- Оригінальних брендів (Сингента, Кортева, BASF, Байер) — не наші товари, ризик DMCA.
- З вотермарками інших дилерів.
- Один файл на кілька SKU — Google Merchant це бачить як дубль.
