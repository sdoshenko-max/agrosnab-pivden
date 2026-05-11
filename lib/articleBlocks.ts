// Структуровані блоки для статей бази знань.
// Дозволяють рендерити статтю не як простирадло markdown, а як набір
// типізованих візуальних компонентів (callout, картка товару, таблиця, плитки).
//
// Стара схема (поле `body: string`) лишається — старі статті рендеряться як були.
// Якщо стаття має `blocks` — рендеримо нову розкладку через <ArticleBody />.

export type CalloutVariant = "tldr" | "info" | "success" | "warning";

export type ArticleBlock =
  // Великий лід під заголовком статті
  | { type: "lead"; text: string }
  // Заголовок секції з якорем (для TOC)
  | { type: "h2"; id: string; text: string }
  // Підзаголовок
  | { type: "h3"; text: string }
  // Звичайний абзац. text може містити **жирний** і [текст](url)
  | { type: "p"; text: string }
  // Виділена цитата / попередження
  | { type: "quote"; text: string }
  // Калаут-блок (TL;DR, інфо, статистика, параметри)
  | {
      type: "callout";
      variant: CalloutVariant;
      icon?: string;           // емодзі або символ
      title?: string;          // напр. "КОРОТКО" або "ВТРАТИ ВІД ФОМОЗУ"
      items?: string[];        // bullet items
      rows?: { label: string; value: string }[]; // або key-value пари
      text?: string;           // або просто текст
    }
  // Картка товару — підтягує дані з lib/products.ts за slug-ом
  | {
      type: "productCard";
      productSlug: string;
      badge?: string;          // напр. "🟢 РЕКОМЕНДОВАНО", "💸 НАЙДЕШЕВШИЙ", "☔ ВОЛОГІ РОКИ"
      badgeColor?: "green" | "orange" | "blue" | "amber" | "red";
      rateNote: string;        // "0,5–0,7 л/га"
      budgetNote: string;      // "$9.3/га"
      analog?: string;         // "Амістар Екстра"
      note: string;            // короткий опис рекомендації під картку
    }
  // Сітка карток товарів — для секції "Препарати"
  | { type: "productGrid"; cards: Extract<ArticleBlock, { type: "productCard" }>[] }
  // Таблиця цін / економіки обробки
  | {
      type: "priceTable";
      caption?: string;
      headers: string[];        // ["Препарат", "Норма", "Ціна/л", "Бюджет/га"]
      rows: { cells: string[]; highlight?: boolean; emoji?: string; muted?: boolean }[];
    }
  // Сітка плиток "помилок" / правил
  | {
      type: "warningGrid";
      items: { title: string; reason: string }[];
    }
  // Фінальний CTA-блок
  | {
      type: "ctaBlock";
      title: string;
      buttons: { label: string; href: string; variant: "primary" | "secondary"; icon?: string }[];
      links?: { label: string; href: string }[];
    }
  // Хвіст — схожі статті
  | {
      type: "relatedArticles";
      items: { label: string; href: string; emoji?: string }[];
    }
  // Розділювач
  | { type: "divider" }
  // TOC — генерується автоматично з усіх блоків h2 (порядок збігається)
  | { type: "toc" };
