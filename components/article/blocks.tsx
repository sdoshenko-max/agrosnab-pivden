// Будівельні блоки для статті у новому форматі.
// Серверні компоненти (без "use client") — швидке рендерення, добре для SEO.
// Кнопка "В кошик" не використовується — у картці лише посилання на сторінку товару.

import Link from "next/link";
import {
  AlertTriangle,
  Info,
  Zap,
  Sparkles,
  TrendingUp,
  ChevronRight,
  ArrowRight,
  Phone,
  MessageCircle,
} from "lucide-react";
import { products } from "@/lib/products";
import { manufacturerSlug } from "@/lib/manufacturers";
import { ProductImage } from "@/components/ProductImage";
import { Price } from "@/components/Price";
import type { ArticleBlock, CalloutVariant } from "@/lib/articleBlocks";

export type Lang = "uk" | "ru";

const labels = {
  uk: {
    author: "Агроном АГРОСНАБ-ПІВДЕНЬ",
    toc: "Зміст",
    activeIngredient: "Діюча речовина",
    norma: "Норма",
    budget: "Бюджет / га",
    analog: "Аналог",
    cash: "Готівка",
    vat: "з ПДВ",
    details: "Подивитися деталі",
    related: "Схожі статті",
    productNotFound: "Товар не знайдено",
  },
  ru: {
    author: "Агроном АГРОСНАБ-ПІВДЕНЬ",
    toc: "Содержание",
    activeIngredient: "Действующее вещество",
    norma: "Норма",
    budget: "Бюджет / га",
    analog: "Аналог",
    cash: "Наличными",
    vat: "с НДС",
    details: "Посмотреть детали",
    related: "Похожие статьи",
    productNotFound: "Товар не найден",
  },
} as const;

// ---------- Утиліти ----------

/** Inline-markdown: **жирний** і [текст](url). */
function inlineHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Повертаємо назад розмітку
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-brand hover:underline font-medium">$1</a>'
    );
}

// ---------- Шапка статті ----------

export function ArticleHeader({
  emoji,
  category,
  title,
  subtitle,
  date,
  readingTime,
  author,
  lang = "uk",
}: {
  emoji: string;
  category: string;
  title: string;
  subtitle?: string;
  date: string;
  readingTime?: string;
  author?: string;
  lang?: Lang;
}) {
  const authorName = author || labels[lang].author;
  return (
    <header className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-3xl">{emoji}</span>
        <span className="text-xs font-bold tracking-wider text-brand uppercase">
          {category}
        </span>
      </div>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-ink mb-3">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg sm:text-xl text-muted leading-snug mb-5">
          {subtitle}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted pb-5 border-b border-border">
        <span>👤 {authorName}</span>
        <span>📅 {date}</span>
        {readingTime && <span>⏱ {readingTime}</span>}
      </div>
    </header>
  );
}

// ---------- Лід ----------

export function Lead({ text }: { text: string }) {
  return (
    <div className="border-l-4 border-brand bg-brand/5 rounded-r-lg p-5 sm:p-6 my-7">
      <p
        className="text-base sm:text-lg leading-relaxed text-ink font-medium"
        dangerouslySetInnerHTML={{ __html: inlineHtml(text) }}
      />
    </div>
  );
}

// ---------- TOC (Collapsible) ----------

export function TOC({ items, lang = "uk" }: { items: { id: string; text: string }[]; lang?: Lang }) {
  return (
    <details className="my-7 border border-border rounded-xl bg-card group" open>
      <summary className="cursor-pointer list-none flex items-center justify-between p-4 hover:bg-bg rounded-xl">
        <span className="font-bold text-ink flex items-center gap-2">
          📑 {labels[lang].toc}
        </span>
        <ChevronRight className="w-5 h-5 text-muted transition-transform group-open:rotate-90" />
      </summary>
      <ol className="px-4 pb-4 pt-1 space-y-2 list-none">
        {items.map((it, i) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className="flex gap-3 text-sm sm:text-base text-ink hover:text-brand hover:underline leading-snug"
            >
              <span className="text-muted font-mono shrink-0 w-5">{i + 1}.</span>
              <span>{it.text}</span>
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}

// ---------- H2 ----------

export function H2({
  id,
  text,
  num,
}: {
  id: string;
  text: string;
  num?: number;
}) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 mt-14 mb-5 text-2xl sm:text-3xl font-extrabold leading-tight text-ink"
    >
      {num !== undefined && (
        <span className="text-brand mr-2">{num}.</span>
      )}
      {text}
    </h2>
  );
}

// ---------- H3 ----------

export function H3({ text }: { text: string }) {
  return (
    <h3 className="mt-8 mb-3 text-lg sm:text-xl font-bold text-ink">
      {text}
    </h3>
  );
}

// ---------- Paragraph ----------

export function Paragraph({ text }: { text: string }) {
  return (
    <p
      className="my-4 text-base leading-relaxed text-ink/90"
      dangerouslySetInnerHTML={{ __html: inlineHtml(text) }}
    />
  );
}

// ---------- Quote ----------

export function Quote({ text }: { text: string }) {
  return (
    <blockquote className="my-6 border-l-4 border-accent bg-accent/5 rounded-r-lg p-4 sm:p-5">
      <p
        className="text-base leading-relaxed text-ink/90 italic"
        dangerouslySetInnerHTML={{ __html: inlineHtml(text) }}
      />
    </blockquote>
  );
}

// ---------- Callout ----------

const calloutStyles: Record<
  CalloutVariant,
  { bg: string; border: string; iconColor: string; titleColor: string; defaultIcon: any }
> = {
  tldr: {
    bg: "bg-emerald-50",
    border: "border-emerald-500",
    iconColor: "text-emerald-600",
    titleColor: "text-emerald-900",
    defaultIcon: Zap,
  },
  info: {
    bg: "bg-amber-50",
    border: "border-amber-500",
    iconColor: "text-amber-600",
    titleColor: "text-amber-900",
    defaultIcon: Info,
  },
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-400",
    iconColor: "text-emerald-600",
    titleColor: "text-emerald-900",
    defaultIcon: TrendingUp,
  },
  warning: {
    bg: "bg-rose-50",
    border: "border-rose-500",
    iconColor: "text-rose-600",
    titleColor: "text-rose-900",
    defaultIcon: AlertTriangle,
  },
};

export function Callout({
  variant,
  title,
  icon,
  items,
  rows,
  text,
}: {
  variant: CalloutVariant;
  title?: string;
  icon?: string;
  items?: string[];
  rows?: { label: string; value: string }[];
  text?: string;
}) {
  const s = calloutStyles[variant];
  const Icon = s.defaultIcon;
  return (
    <div
      className={`my-7 border-l-4 ${s.border} ${s.bg} rounded-r-xl p-5 sm:p-6`}
    >
      {(title || icon) && (
        <div
          className={`flex items-center gap-2 mb-3 font-bold text-sm tracking-wider uppercase ${s.titleColor}`}
        >
          {icon ? (
            <span className="text-xl">{icon}</span>
          ) : (
            <Icon className={`w-5 h-5 ${s.iconColor}`} />
          )}
          {title}
        </div>
      )}
      {text && (
        <p
          className="text-base leading-relaxed text-ink/90"
          dangerouslySetInnerHTML={{ __html: inlineHtml(text) }}
        />
      )}
      {items && items.length > 0 && (
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li
              key={i}
              className="flex gap-2 text-base leading-relaxed text-ink/90"
            >
              <span className={`${s.iconColor} font-bold shrink-0`}>•</span>
              <span dangerouslySetInnerHTML={{ __html: inlineHtml(it) }} />
            </li>
          ))}
        </ul>
      )}
      {rows && rows.length > 0 && (
        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-base">
          {rows.map((r, i) => (
            <div key={i} className="contents">
              <dt className="text-muted font-medium">{r.label}</dt>
              <dd
                className="text-ink font-semibold"
                dangerouslySetInnerHTML={{ __html: inlineHtml(r.value) }}
              />
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

// ---------- ProductCard (компактна для статті) ----------

const badgeColorMap: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-800 border border-emerald-300",
  orange: "bg-orange-100 text-orange-800 border border-orange-300",
  blue: "bg-blue-100 text-blue-800 border border-blue-300",
  amber: "bg-amber-100 text-amber-800 border border-amber-300",
  red: "bg-rose-100 text-rose-800 border border-rose-300",
};

export function ProductCard({
  productSlug,
  badge,
  badgeColor = "green",
  rateNote,
  budgetNote,
  analog,
  note,
  lang = "uk",
}: {
  productSlug: string;
  badge?: string;
  badgeColor?: "green" | "orange" | "blue" | "amber" | "red";
  rateNote: string;
  budgetNote: string;
  analog?: string;
  note: string;
  lang?: Lang;
}) {
  const L = labels[lang];
  const base = lang === "uk" ? "" : "/ru";
  const product = products.find((p) => p.slug === productSlug);
  if (!product) {
    return (
      <div className="card border-rose-300 bg-rose-50">
        <p className="text-rose-700 text-sm">
          ⚠ {L.productNotFound}: <code>{productSlug}</code>
        </p>
      </div>
    );
  }

  return (
    <article className="card flex flex-col gap-3 hover:border-brand hover:shadow-lg transition-all duration-200">
      {/* Бейдж */}
      {badge && (
        <div>
          <span
            className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
              badgeColorMap[badgeColor]
            }`}
          >
            {badge}
          </span>
        </div>
      )}

      {/* Header: фото + назва */}
      <div className="flex items-start gap-3">
        <Link
          href={`${base}/produkt/${product.slug}`}
          className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-bg rounded-lg overflow-hidden flex items-center justify-center border border-border hover:border-brand transition"
        >
          <ProductImage
            product={product}
            alt={lang === "ru" ? (product.nameRu || product.name) : product.name}
            size="md"
            className="w-full h-full object-contain"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`${base}/produkt/${product.slug}`}
            className="font-bold text-lg leading-tight hover:text-brand block"
          >
            {lang === "ru" ? (product.nameRu || product.name) : product.name}
          </Link>
          <Link
            href={`${base}/vyrobnyk/${manufacturerSlug(product.manufacturer)}/`}
            className="text-xs text-muted hover:text-brand hover:underline"
          >
            {product.manufacturer}
          </Link>
        </div>
      </div>

      {/* Активна д.р. */}
      <div className="bg-brand/5 rounded-lg p-3">
        <p className="text-xs uppercase tracking-wide text-muted font-semibold mb-1">
          {L.activeIngredient}
        </p>
        <p className="text-sm font-bold text-ink leading-snug">
          {lang === "ru"
            ? (product.activeIngredientRu || product.activeIngredient)
            : product.activeIngredient}
          {product.concentration ? `, ${product.concentration}` : ""}
        </p>
      </div>

      {/* Норма / Бюджет / Аналог */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-muted">{L.norma}</p>
          <p className="font-semibold">{rateNote}</p>
        </div>
        <div>
          <p className="text-xs text-muted">{L.budget}</p>
          <p className="font-bold text-brand">{budgetNote}</p>
        </div>
      </div>
      {analog && (
        <p className="text-xs text-muted -mt-1">
          {L.analog}: <span className="text-ink font-medium">{analog}</span>
        </p>
      )}

      {/* Note — короткий опис */}
      <p className="text-sm text-ink/80 leading-relaxed">{note}</p>

      {/* Ціна: готівка (велика) + з ПДВ (мала, сіра) */}
      <div className="border-t border-border pt-3 mt-auto">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted">{L.cash}</span>
          <span className="text-lg font-bold text-brand whitespace-nowrap">
            <Price amount={product.priceCash} currency={product.currency} showOriginal={false} />
            <span className="text-xs font-normal text-muted"> / {product.unit}</span>
          </span>
        </div>
        <div className="flex items-baseline justify-between mt-0.5">
          <span className="text-[11px] text-muted/70">{L.vat}</span>
          <span className="text-xs text-muted whitespace-nowrap">
            <Price amount={product.priceVat} currency={product.currency} showOriginal={false} /> / {product.unit}
          </span>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`${base}/produkt/${product.slug}`}
        className="btn-secondary w-full justify-center text-sm py-2.5"
      >
        {L.details} <ArrowRight className="w-4 h-4" />
      </Link>
    </article>
  );
}

// ---------- ProductGrid ----------

export function ProductGrid({
  cards,
  lang = "uk",
}: {
  cards: Extract<ArticleBlock, { type: "productCard" }>[];
  lang?: Lang;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-4 my-7">
      {cards.map((c, i) => (
        <ProductCard
          key={i}
          productSlug={c.productSlug}
          badge={c.badge}
          badgeColor={c.badgeColor}
          rateNote={c.rateNote}
          budgetNote={c.budgetNote}
          analog={c.analog}
          note={c.note}
          lang={lang}
        />
      ))}
    </div>
  );
}

// ---------- PriceTable ----------

export function PriceTable({
  caption,
  headers,
  rows,
}: {
  caption?: string;
  headers: string[];
  rows: { cells: string[]; highlight?: boolean; emoji?: string; muted?: boolean }[];
}) {
  return (
    <div className="my-7">
      {caption && <p className="text-sm text-muted mb-2">{caption}</p>}

      {/* DESKTOP — звичайна таблиця (sm+) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-brand/10 border-b-2 border-brand">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`px-3 py-2.5 text-left font-bold text-ink ${
                    i === headers.length - 1 ? "text-right" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                className={`border-b border-border ${
                  r.highlight ? "bg-emerald-50" : ""
                } ${r.muted ? "opacity-60" : ""}`}
              >
                {r.cells.map((c, ci) => (
                  <td
                    key={ci}
                    className={`px-3 py-2.5 ${
                      ci === r.cells.length - 1
                        ? "text-right font-bold text-brand"
                        : ""
                    } ${r.muted ? "italic" : ""}`}
                  >
                    {ci === 0 && r.emoji ? (
                      <span className="mr-1">{r.emoji}</span>
                    ) : null}
                    <span
                      dangerouslySetInnerHTML={{ __html: inlineHtml(c) }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE — стопка строк-карточок (&lt;sm) */}
      <div className="sm:hidden space-y-2.5">
        {rows.map((r, i) => {
          const [titleCell, ...restCells] = r.cells;
          const restHeaders = headers.slice(1);
          return (
            <div
              key={i}
              className={`rounded-xl border p-3 ${
                r.highlight
                  ? "bg-emerald-50 border-emerald-300"
                  : "bg-card border-border"
              } ${r.muted ? "opacity-60" : ""}`}
            >
              <div className="font-bold text-ink mb-2 flex items-center gap-1.5 leading-tight">
                {r.emoji && <span>{r.emoji}</span>}
                <span
                  className={r.muted ? "italic" : ""}
                  dangerouslySetInnerHTML={{ __html: inlineHtml(titleCell) }}
                />
              </div>
              <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-sm">
                {restCells.map((c, ci) => (
                  <div key={ci} className="contents">
                    <dt className="text-muted text-xs">
                      {restHeaders[ci]}
                    </dt>
                    <dd
                      className={`text-right ${
                        ci === restCells.length - 1
                          ? "font-bold text-brand"
                          : "text-ink"
                      }`}
                      dangerouslySetInnerHTML={{ __html: inlineHtml(c) }}
                    />
                  </div>
                ))}
              </dl>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- WarningGrid ----------

export function WarningGrid({
  items,
}: {
  items: { title: string; reason: string }[];
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-4 my-7">
      {items.map((it, i) => (
        <div
          key={i}
          className="bg-rose-50 border border-rose-200 rounded-xl p-4"
        >
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <h3 className="font-bold text-ink leading-snug">
              <span className="text-rose-600">Помилка {i + 1}.</span>{" "}
              {it.title}
            </h3>
          </div>
          <p
            className="text-sm text-ink/80 leading-relaxed pl-7"
            dangerouslySetInnerHTML={{
              __html: `<strong class="text-rose-700">Чому:</strong> ${inlineHtml(
                it.reason
              ).replace(/^<strong>.*?<\/strong>\s*/, "")}`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ---------- CTABlock ----------

const ctaIconMap: Record<string, any> = {
  phone: Phone,
  chat: MessageCircle,
  arrow: ArrowRight,
};

export function CTABlock({
  title,
  buttons,
  links,
}: {
  title: string;
  buttons: { label: string; href: string; variant: "primary" | "secondary"; icon?: string }[];
  links?: { label: string; href: string }[];
}) {
  return (
    <div className="my-10 bg-gradient-to-br from-brand to-brand-dark text-white rounded-2xl p-6 sm:p-8 shadow-lg">
      <h3 className="text-xl sm:text-2xl font-bold mb-5 leading-snug">
        {title}
      </h3>
      <div className="flex flex-wrap gap-3 mb-5">
        {buttons.map((btn, i) => {
          const Icon = btn.icon ? ctaIconMap[btn.icon] : null;
          const cls =
            btn.variant === "primary"
              ? "bg-accent hover:bg-accent-dark text-white font-semibold px-5 py-3 rounded-lg inline-flex items-center justify-center gap-2 min-h-[44px] shadow-sm transition-colors"
              : "bg-white hover:bg-bg text-brand font-semibold px-5 py-3 rounded-lg inline-flex items-center justify-center gap-2 min-h-[44px] shadow-sm transition-colors";
          return (
            <Link key={i} href={btn.href} className={cls}>
              {Icon && <Icon className="w-5 h-5" />}
              {btn.label}
            </Link>
          );
        })}
      </div>
      {links && links.length > 0 && (
        <div className="border-t border-white/20 pt-4 space-y-2">
          {links.map((l, i) => (
            <Link
              key={i}
              href={l.href}
              className="block text-white/90 hover:text-white hover:underline text-sm sm:text-base"
            >
              {l.label} <ArrowRight className="inline w-4 h-4" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- RelatedArticles ----------

export function RelatedArticles({
  items,
  lang = "uk",
}: {
  items: { label: string; href: string; emoji?: string }[];
  lang?: Lang;
}) {
  return (
    <div className="my-10 border-t border-border pt-6">
      <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
        📚 {labels[lang].related}
      </h3>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i}>
            <Link
              href={it.href}
              className="flex items-center gap-2 text-ink hover:text-brand hover:underline"
            >
              {it.emoji && <span>{it.emoji}</span>}
              {it.label}
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- Divider ----------

export function Divider() {
  return <hr className="my-10 border-t border-border" />;
}
