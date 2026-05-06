# Originals reimport — результат застосування

> Виконано 2026-05-06T07:07:31.537Z. Скрипт `scripts/_apply_originals_import.mjs`.

## Зміни в `lib/products.ts`

| Кошик | К-сть |
|---|---|
| 🔄 UPDATE (priceVat/priceCash/currency) | 32 |
| 👻 GHOST (видалено рядків) | 19 |
| ➕ ADD (додано нових SKU) | 578 |
| ✎ Manufacturer перейменовано | 3 |
| ✎ Slug перейменовано (з 301-редіректом) | 2 |

## Нові редіректи (додано в `public/_redirects`)

```
/produkt/tarha-super-nissan/    /produkt/tarha-super-sammit-agro/    301
/produkt/tarha-super-nissan     /produkt/tarha-super-sammit-agro/    301
/ru/produkt/tarha-super-nissan/ /ru/produkt/tarha-super-sammit-agro/ 301
/ru/produkt/tarha-super-nissan  /ru/produkt/tarha-super-sammit-agro/ 301
/produkt/rehent-20-g-baier/    /produkt/rehent-20-g-basf/    301
/produkt/rehent-20-g-baier     /produkt/rehent-20-g-basf/    301
/ru/produkt/rehent-20-g-baier/ /ru/produkt/rehent-20-g-basf/ 301
/ru/produkt/rehent-20-g-baier  /ru/produkt/rehent-20-g-basf/ 301
```

## ADD: розподіл по виробниках

| Виробник | Додано SKU |
|---|---|
| Сингента | 93 |
| Дефенда | 71 |
| Самміт-Агро | 66 |
| Адама | 60 |
| Басф | 59 |
| Байер | 56 |
| Терра Віта | 47 |
| Нуфарм | 44 |
| Кортева | 41 |
| ФМС | 27 |
| UPL | 14 |

## ⚠ Що НЕ заповнено для нових 581 SKU

- `activeIngredient` / `activeIngredientRu` — порожньо. Треба ресерч на офсайтах виробників (крок 3 чек-листа). На сайті відобразиться як «—».
- `concentration` — порожньо.
- `rate` (норма витрати) — порожньо.
- `cultures` — порожній масив. Товар не з'явиться в списках за культурою. Треба додати після ресерчу.
- `stage` — порожній масив.
- `image` — поле відсутнє. Сайт показуватиме placeholder. Фото — на крок 8 (post-import).

## ⚠ Пропущені при ADD (3)

Не змогли визначити тип одиниці ("л"/"кг") — це переважно комплекти з різнотипними компонентами:

| Виробник | Назва | Причина |
|---|---|---|
| Адама | Апріорі ВГ+Адгейзі (1:6) | unit="компл", packaging="1кг+5л" |
| Нуфарм | Астрал Комбі | unit="уп", packaging="40гр+100г/л" |
| Нуфарм | Бромцид | unit="уп", packaging="4*5л" |