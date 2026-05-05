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

## Roadmap

### ✅ Зроблено

- [x] Сторінки культур (`/kultury/[slug]/`) — 10 культур, фільтри по технології + етапу обробки
- [x] Сторінки товарів (`/produkt/[slug]/`) — 385 товарів з фото, ціною (ПДВ + готівка), діючою речовиною, нормами, культурами, кошиком
- [x] Сторінки груп ЗЗР (`/grupy/[slug]/`) — 8 груп: гербіциди, фунгіциди, інсектициди, протруйники, десиканти, регулятори росту, адʼюванти, родентициди
- [x] Сторінки діючих речовин (`/diiucha-rechovyna/[slug]/`) — 83 AI з ≥2 SKU, генеруються автоматично з products.ts
- [x] Сторінки бакових сумішей (`/bakovi-sumishi/[slug]/`)
- [x] Повна форма заявки з картки товару (модалка `RequestModal`) + швидкий callback (`CallbackModal`)
- [x] Калькулятор агронома (`AgronomistCalculator`)
- [x] База знань / блог (`/baza-znan/`)
- [x] Каталог заповнено з прайсу `Прайс_05.04.26.xlsx` (385 SKU, з них 12 відкинуто Сергієм за принципом «не наша аудиторія» — список у `_PRICE_IMPORT_RULES.md`)
- [x] Фото товарів — 288 SKU (~75% покриття; original-tier без фото за DMCA-ризиком)
- [x] Сторінки документів — оферта (`/oferta/`), конфіденційність (`/konfidentsiynist/`), сертифікати (`/sertyfikaty/`)
- [x] sitemap.xml + robots.txt
- [x] Persist фільтрів через URL search params — refresh / browser back повертають той самий стан
- [x] GA4 + Google Ads conversion tracking (gtag-теги `G-79JCPMNE9D` + `AW-18140720729`, конверсія `generate_lead`, події phone/telegram/viber/whatsapp_click)
- [x] Worker форми (`agrosnab-pivden-form.sdoshenko.workers.dev`) шле заявки в TG з джерелом сайту в повідомленні

### ⏳ TODO

- [ ] Lead form extension в Google Ads (потрібен GA4 з налаштованими ключовими подіями)
- [ ] Google Merchant Center — feed для shopping ads (готовий каталог + 800×800 фото)
- [ ] Категорія «Біопрепарати» (зараз ризобактерії в `protruyniky` як суміжна)

## Telegram

Воркер шле заявки в групу «Ліди МИНЕРАЛ-ТРЕЙД» (через того самого бота, що й mltd). Формат повідомлень — у `worker-form.js`.

## Контакти проекту

ТОВ «АГРОСНАБ-ПІВДЕНЬ» · ЄДРПОУ 35674029 · sdoshenko@gmail.com · +380660321997
