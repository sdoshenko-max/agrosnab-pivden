"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { products as allProducts, cultures } from "@/lib/data";
import { type Lang } from "@/lib/i18n";
import { ProductCardFull } from "./ProductCardFull";
import { RequestModal } from "./RequestModal";

const PAGE_SIZE = 12;

const tierLabels: Record<string, { uk: string; ru: string }> = {
  econom: { uk: "Економ", ru: "Эконом" },
  premium: { uk: "Преміум", ru: "Премиум" },
  original: { uk: "Оригінал", ru: "Оригинал" }
};

export function CatalogPage({
  title,
  titleRu,
  productSlugs,
  lang,
  hideAiFilter
}: {
  title: string;
  titleRu: string;
  productSlugs: string[];
  lang: Lang;
  hideAiFilter?: boolean;
}) {
  const baseProducts = useMemo(() => allProducts.filter(p => productSlugs.includes(p.slug)), [productSlugs]);

  const [tier, setTier] = useState<string>("all");
  const [manufacturer, setManufacturer] = useState<string>("all");
  const [culture, setCulture] = useState<string>("all");
  const [ai, setAi] = useState<string>("all");
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestProduct, setRequestProduct] = useState<string>("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const manufacturers = Array.from(new Set(baseProducts.map(p => p.manufacturer))).sort();
  const productCultures = Array.from(new Set(baseProducts.flatMap(p => p.cultures)));
  const aiSet = new Map<string, string>();
  baseProducts.forEach(p => {
    const firstUk = p.activeIngredient.split(/\s*\+\s*/)[0].replace(/\s*\([^)]+\)\s*/g, "").replace(/,.*$/, "").trim();
    const firstRu = p.activeIngredientRu.split(/\s*\+\s*/)[0].replace(/\s*\([^)]+\)\s*/g, "").replace(/,.*$/, "").trim();
    if (firstUk) aiSet.set(firstUk, lang === "uk" ? firstUk : firstRu);
  });
  const aiList = Array.from(aiSet.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  const filtered = useMemo(() => {
    return baseProducts.filter(p => {
      if (tier !== "all" && p.tier !== tier) return false;
      if (manufacturer !== "all" && p.manufacturer !== manufacturer) return false;
      if (culture !== "all" && !p.cultures.includes(culture)) return false;
      if (ai !== "all") {
        const firstUk = p.activeIngredient.split(/\s*\+\s*/)[0].replace(/\s*\([^)]+\)\s*/g, "").replace(/,.*$/, "").trim();
        if (firstUk !== ai) return false;
      }
      return true;
    });
  }, [baseProducts, tier, manufacturer, culture, ai]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // При смене фильтров — сброс на 1 страницу
  useEffect(() => { setPage(1); }, [tier, manufacturer, culture, ai]);

  const labels = lang === "uk"
    ? { back: "Головна", filters: "Фільтри", reset: "Скинути", tier: "Рівень", manufacturer: "Виробник", culture: "Культура", ai: "Діюча речовина", all: "Усі", showing: "Показано", of: "з", noResults: "Немає препаратів за обраними фільтрами", page: "Сторінка", prev: "Попередня", next: "Наступна" }
    : { back: "Главная", filters: "Фильтры", reset: "Сбросить", tier: "Уровень", manufacturer: "Производитель", culture: "Культура", ai: "Действующее вещество", all: "Все", showing: "Показано", of: "из", noResults: "Нет препаратов по выбранным фильтрам", page: "Страница", prev: "Предыдущая", next: "Следующая" };

  const hasActiveFilter = tier !== "all" || manufacturer !== "all" || culture !== "all" || ai !== "all";
  const base = lang === "uk" ? "" : "/ru";

  function reset() { setTier("all"); setManufacturer("all"); setCulture("all"); setAi("all"); }
  function openRequest(name: string) { setRequestProduct(name); setRequestOpen(true); }

  function goPrev() {
    if (safePage > 1) {
      setPage(safePage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  function goNext() {
    if (safePage < totalPages) {
      setPage(safePage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  function goPage(n: number) {
    setPage(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Список номеров страниц для отображения (макс 7 кнопок)
  const pageNumbers: number[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (safePage > 4) pageNumbers.push(-1); // эллипсис
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    for (let i = start; i <= end; i++) pageNumbers.push(i);
    if (safePage < totalPages - 3) pageNumbers.push(-2);
    pageNumbers.push(totalPages);
  }

  return (
    <>
      <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="container-w py-8">
          <Link href={`${base}/`} className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-3">
            <ChevronLeft className="w-4 h-4" />{labels.back}
          </Link>
          <h1 className="text-3xl lg:text-4xl font-extrabold">{lang === "uk" ? title : titleRu}</h1>
          <p className="text-white/80 text-sm mt-2">{`${labels.showing} ${pageItems.length} ${labels.of} ${filtered.length}${filtered.length !== baseProducts.length ? ` (${baseProducts.length} ${labels.of === "з" ? "усього" : "всего"})` : ""}`}</p>
        </div>
      </section>

      <section className="container-w py-6">
        <button onClick={() => setFiltersOpen(!filtersOpen)} className="lg:hidden btn-outline mb-4 w-full">
          <Filter className="w-4 h-4" />{labels.filters}{hasActiveFilter ? " ●" : ""}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <aside className={`${filtersOpen ? "block" : "hidden"} lg:block space-y-4`}>
            <div className="card !p-4 lg:sticky lg:top-20">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold flex items-center gap-2"><Filter className="w-4 h-4" />{labels.filters}</h2>
                {hasActiveFilter && (<button onClick={reset} className="text-xs text-accent flex items-center gap-1"><X className="w-3 h-3" />{labels.reset}</button>)}
              </div>
              <div className="mb-4">
                <p className="text-xs text-muted font-semibold mb-2 uppercase">{labels.tier}</p>
                <div className="flex flex-wrap gap-1.5">
                  {["all", "econom", "premium", "original"].map(v => (
                    <button key={v} onClick={() => setTier(v)} className={`text-xs px-2.5 py-1 rounded-md ${tier === v ? "bg-brand text-white" : "bg-bg hover:bg-border"}`}>
                      {v === "all" ? labels.all : (lang === "uk" ? tierLabels[v].uk : tierLabels[v].ru)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <p className="text-xs text-muted font-semibold mb-2 uppercase">{labels.manufacturer}</p>
                <select value={manufacturer} onChange={e => setManufacturer(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm">
                  <option value="all">{labels.all}</option>
                  {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <p className="text-xs text-muted font-semibold mb-2 uppercase">{labels.culture}</p>
                <select value={culture} onChange={e => setCulture(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm">
                  <option value="all">{labels.all}</option>
                  {cultures.filter(c => productCultures.includes(c.slug)).map(c => (
                    <option key={c.slug} value={c.slug}>{lang === "uk" ? c.nameUk : c.nameRu}</option>
                  ))}
                </select>
              </div>
              {!hideAiFilter && aiList.length > 1 && (
                <div>
                  <p className="text-xs text-muted font-semibold mb-2 uppercase">{labels.ai}</p>
                  <select value={ai} onChange={e => setAi(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm">
                    <option value="all">{labels.all}</option>
                    {aiList.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                </div>
              )}
            </div>
          </aside>
          <div>
            {filtered.length === 0 ? (
              <p className="text-muted text-center py-12">{labels.noResults}</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pageItems.map(p => (<ProductCardFull key={p.slug} product={p} lang={lang} onRequest={openRequest} />))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-sm text-muted">{labels.page} {safePage} {labels.of} {totalPages}</p>
                    <div className="flex items-center gap-1 flex-wrap justify-center">
                      <button onClick={goPrev} disabled={safePage === 1} className="px-3 py-1.5 rounded-md border border-border text-sm disabled:opacity-40 hover:bg-brand/5 transition-colors flex items-center gap-1"><ChevronLeft className="w-4 h-4" />{labels.prev}</button>
                      {pageNumbers.map((n, idx) => n < 0
                        ? <span key={`e${idx}`} className="px-2 text-muted">…</span>
                        : <button key={n} onClick={() => goPage(n)} className={`min-w-[36px] px-2 py-1.5 rounded-md text-sm ${n === safePage ? "bg-brand text-white" : "border border-border hover:bg-brand/5"} transition-colors`}>{n}</button>
                      )}
                      <button onClick={goNext} disabled={safePage === totalPages} className="px-3 py-1.5 rounded-md border border-border text-sm disabled:opacity-40 hover:bg-brand/5 transition-colors flex items-center gap-1">{labels.next}<ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <RequestModal open={requestOpen} onClose={() => setRequestOpen(false)} productName={requestProduct} lang={lang} />
    </>
  );
}
