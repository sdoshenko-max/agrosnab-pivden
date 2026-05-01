# АГРОСНАБ-ПІВДЕНЬ — каталог ЗЗР

Інформаційний сайт + лідогенерація. Заявки → Telegram-група «Ліди МИНЕРАЛ-ТРЕЙД» (та сама, що й для mltd.com.ua).

## Стек

- **Frontend:** Next.js 14 (App Router) + React + TypeScript + Tailwind CSS
- **Іконки:** Lucide React
- **Хостинг:** Cloudflare Pages (деплой з GitHub)
- **Бекенд форм:** Cloudflare Worker

## Запуск локально

```bash
# 1. Встановити залежності
npm install

# 2. Створити .env.local з URL воркера (тимчасово після деплою воркера)
echo "NEXT_PUBLIC_WORKER_URL=https://agrosnab-pivden-form.<твій-сабдомен>.workers.dev" > .env.local

# 3. Запуск
npm run dev
```

Відкрити http://localhost:3000

## Структура

```
app/
  layout.tsx            кореневий лейаут (метатеги, шрифт Inter)
  page.tsx              головна UA  ( / )
  ru/page.tsx           головна RU  ( /ru )
  globals.css           Tailwind + базові стилі
components/
  Logo.tsx              SVG-лого
  Header.tsx            шапка з навігацією + перемикач UA/RU
  Footer.tsx            підвал з реквізитами
  Hero.tsx              hero-блок головної
  MagnetCards.tsx       блок «Хіти ціни» (5 топових товарів)
  CulturesGrid.tsx      сітка 10 культур
  TankMixesGrid.tsx     сітка 5 готових бакових сумішей
  WhyUs.tsx             блок «Чому ми»
  HowItWorks.tsx        блок «Як ми працюємо»
  QuickCallForm.tsx     блок «Замовити дзвінок» (форма → Worker → Telegram)
  FloatingCallButton.tsx плаваюча кнопка дзвінка
lib/
  i18n.ts               словники UA/RU + дані компанії
  data.ts               культури, товари, бакові суміші (з Deep Research)
public/
  logo.svg              SVG-лого для прямого використання
  favicon.svg           favicon
worker/
  worker-form.js        Cloudflare Worker для прийому заявок
  wrangler.toml         конфіг воркера
```

## Деплой

### Сайт (Cloudflare Pages)

1. Створити репо на GitHub: `agrosnab-pivden`
2. Залити цю папку
3. У Cloudflare Pages → «Create project» → підключити GitHub-репо
4. **Build settings:**
   - Framework preset: **Next.js**
   - Build command: `npm run build`
   - Build output directory: `.next`
5. **Environment variables:**
   - `NEXT_PUBLIC_WORKER_URL` = URL воркера (буде після деплою воркера)
6. Кожен `git push` → автодеплой

### Worker (форма заявок)

```bash
cd worker
npm install -g wrangler
wrangler login

# Задати секрети (значення взяти з налаштувань воркера mltd-form):
wrangler secret put BOT_TOKEN
wrangler secret put CHAT_ID

# Деплой
wrangler deploy
```

Після деплою воркера — отриманий URL вписати в `NEXT_PUBLIC_WORKER_URL` на Cloudflare Pages.

### Підключення домену

Коли купиш домен — у Cloudflare Pages → Custom domains → додати. NS вже мають бути на Cloudflare (як для mltd.com.ua).

## Що залишилось зробити

- [ ] Сторінки культур (`/kultury/[slug]/`)
- [ ] Сторінки товарів (`/produkt/[slug]/`)
- [ ] Сторінки груп ЗЗР (`/grupy/[slug]/`)
- [ ] Сторінки діючих речовин (`/diiucha-rechovyna/[slug]/`)
- [ ] Сторінки бакових сумішей (`/bakovi-sumishi/[slug]/`)
- [ ] Повна форма заявки з картки товару (модалка)
- [ ] Калькулятор агронома
- [ ] База знань / блог
- [ ] Заповнити каталог усіма позиціями з прайсу
- [ ] Знайти і додати фото товарів та культур
- [ ] Сторінки документів (оферта, конфіденційність)
- [ ] sitemap.xml + robots.txt

## Telegram

Воркер шле заявки в групу «Ліди МИНЕРАЛ-ТРЕЙД» (через того самого бота, що й mltd). Формат повідомлень — у `worker-form.js`.

## Контакти проекту

ТОВ «АГРОСНАБ-ПІВДЕНЬ» · ЄДРПОУ 35674029 · sdoshenko@gmail.com · +380660321997
