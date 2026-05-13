"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { activeIngredients, type AIEntry } from "@/lib/activeIngredients";

type Lang = "uk" | "ru";

function plural(n: number, lang: Lang): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (lang === "ru") {
    if (m10 === 1 && m100 !== 11) return "препарат";
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "препарата";
    return "препаратов";
  }
  if (m10 === 1 && m100 !== 11) return "препарат";
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "препарати";
  return "препаратів";
}

// Підсвічуємо matched substring у назві. Безпечно — рендеримо як React-вузли.
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-200 text-ink rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function ActiveIngredientSearch({ lang }: { lang: Lang }) {
  const [q, setQ] = useState("");
  const query = q.trim();

  const labels = lang === "uk"
    ? {
        placeholder: "Введіть назву д.р. (напр. «тебуконазол», «гліфосат», «імід»)",
        clear: "Очистити",
        top: "Топ-10 найпоширеніших",
        all: `Усі діючі речовини (${activeIngredients.length})`,
        foundN: (n: number) => `Знайдено ${n} ${n === 1 ? "діючу речовину" : (n >= 2 && n <= 4 ? "діючі речовини" : "діючих речовин")}`,
        nothing: "За запитом нічого не знайдено. Спробуйте іншу частину назви — напр. «теб», «імід», «глі».",
      }
    : {
        placeholder: "Введите название д.в. (напр. «тебуконазол», «глифосат», «имид»)",
        clear: "Очистить",
        top: "Топ-10 самых распространённых",
        all: `Все действующие вещества (${activeIngredients.length})`,
        foundN: (n: number) => `Найдено ${n} ${n === 1 ? "действующее вещество" : (n >= 2 && n <= 4 ? "действующих вещества" : "действующих веществ")}`,
        nothing: "По запросу ничего не найдено. Попробуйте другую часть названия — напр. «теб», «имид», «гли».",
      };

  const filtered: AIEntry[] | null = useMemo(() => {
    if (!query) return null;
    const ql = query.toLowerCase();
    return activeIngredients.filter(a =>
      a.nameUk.toLowerCase().includes(ql) || a.nameRu.toLowerCase().includes(ql)
    );
  }, [query]);

  const base = lang === "ru" ? "/ru/diiucha-rechovyna" : "/diiucha-rechovyna";

  const renderCard = (a: AIEntry, big = false) => (
    <Link
      key={a.slug}
      href={`${base}/${a.slug}`}
      className="card !p-3 hover:border-brand hover:bg-brand/5 hover:shadow-md transition-all duration-200 group"
    >
      <p className={`font-bold mb-1 group-hover:text-brand transition-colors leading-snug ${big ? "text-sm" : "text-sm"}`}>
        <Highlight text={lang === "uk" ? a.nameUk : a.nameRu} query={query} />
      </p>
      <p className={`text-xs font-semibold ${big ? "text-brand" : "text-muted"}`}>
        {a.productSlugs.length} {plural(a.productSlugs.length, lang)}
      </p>
    </Link>
  );

  const top = activeIngredients.slice(0, 10);
  const rest = activeIngredients.slice(10);

  return (
    <>
      {/* Поле пошуку */}
      <section className="container-w pt-6">
        <div className="relative max-w-2xl">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={labels.placeholder}
            className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-border bg-white text-base focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
            aria-label={labels.placeholder}
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-bg text-muted hover:text-ink transition-colors"
              aria-label={labels.clear}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </section>

      {filtered ? (
        // === Режим пошуку ===
        <section className="container-w py-6">
          {filtered.length > 0 ? (
            <>
              <h2 className="text-base font-bold mb-3 text-muted">{labels.foundN(filtered.length)}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filtered.map(a => renderCard(a))}
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-muted">{labels.nothing}</div>
          )}
        </section>
      ) : (
        // === Дефолтний вигляд: топ-10 + усі ===
        <>
          {top.length > 0 && (
            <section className="container-w pt-6">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="text-2xl">🔥</span>{labels.top}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {top.map(a => renderCard(a, true))}
              </div>
            </section>
          )}
          <section className="container-w py-8">
            {rest.length > 0 && <h2 className="text-xl font-bold mb-3">{labels.all}</h2>}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {rest.map(a => renderCard(a))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
