"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { products as allProducts, cultures } from "@/lib/data";
import { groups } from "@/lib/groups";
import { type Lang } from "@/lib/i18n";
import { ProductCardFull } from "./ProductCardFull";
import { RequestModal } from "./RequestModal";
import { ManufacturerFilter } from "./ManufacturerFilter";

const PAGE_SIZE = 12;

const tierLabels: Record<string, { uk: string; ru: string }> = {
  econom: { uk: "Економ", ru: "Эконом" },
  premium: { uk: "Преміум", ru: "Премиум" },
  original: { uk: "Оригінал", ru: "Оригинал" }
};

type CatalogPageProps = {
  title: string;
  titleRu: string;
  productSlugs: string[];
  lang: Lang;
  hideAiFilter?: boolean;
  /** Якщо це сторінка групи ЗЗР — slug поточної групи (для підсвітки в табах). */
  currentGroupSlug?: string;
};

export function CatalogPage(props: CatalogPageProps) {
  return (
    <Suspense fallback={null}>
      <CatalogPageInner {...props} />
    </Suspense>
  );
}

function CatalogPageInner({ title, titleRu, productSlugs, lang, hideAiFilter, currentGroupSlug }: CatalogPageProps) {
  const baseProducts = useMemo(() => allProducts.filter(p => productSlugs.includes(p.slug)), [productSlugs]);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tier = searchParams.get("tier") || "all";
  const manufacturer = searchParams.get("manufacturer") || "all";
  const culture = searchParams.get("culture") || "all";
  const ai = searchParams.get("ai") || "all";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  function updateParams(updates: Record<string, string | number | null>) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "" || v === undefined || v === "all") sp.delete(k);
      else sp.set(k, String(v));
    }
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }
  const setTier = (v: string) => updateParams({ tier: v, page: null });
  const setManufacturer = (v: string) => updateParams({ manufacturer: v, page: null });
  const setCulture = (v: string) => updateParams({ culture: v, page: null });
  const setAi = (v: string) => updateParams({ ai: v, page: null });
  const setPage = (v: number) => updateParams({ page: v <= 1 ? null : v });

  const [requestOpen, setRequestOpen] = useState(false);
  const [requestProduct, setRequestProduct] = useState<string>("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const firstAi = (p: typeof baseProducts[number], inLang: Lang) => {
    const src = inLang === "uk" ? p.activeIngredient : p.activeIngredientRu;
    return src.split(/\s*\+\s*/)[0].replace(/\s*\([^)]+\)\s*/g, "").replace(/\s*[,;]?\s*\d+([.,]\d+)?\s*(г|мг|кг)\/[лкт][гр]?\s*$/, "").replace(/[,;]\s*$/, "").trim();
  };

  // Каскаднi фiльтри: списки опцiй кожного фiльтра враховують усi iншi активнi фiльтри (крiм самого себе).
  const matchAllExcept = (p: typeof baseProducts[number], skip: "tier" | "manufacturer" | "culture" | "ai") => {
    if (skip !== "tier" && tier !== "all" && p.tier !== tier) return false;
    if (skip !== "manufacturer" && manufacturer !== "all" && p.manufacturer !== manufacturer) return false;
    if (skip !== "culture" && culture !== "all" && !p.cultures.includes(culture)) return false;
    if (skip !== "ai" && ai !== "all" && firstAi(p, "uk") !== ai) return false;
    return true;
  };

  const manufacturers = useMemo(
    () => Array.from(new Set(baseProducts.filter(p => matchAllExcept(p, "manufacturer")).map(p => p.manufacturer))).sort(),
    [baseProducts, tier, culture, ai]
  );
  const productCultures = useMemo(
    () => Array.from(new Set(baseProducts.filter(p => matchAllExcept(p, "culture")).flatMap(p => p.cultures))),
    [baseProducts, tier, manufacturer, ai]
  );
  const aiList = useMemo(() => {
    const set = new Map<string, string>();
    baseProducts.filter(p => matchAllExcept(p, "ai")).forEach(p => {
      const uk = firstAi(p, "uk");
      if (uk) set.set(uk, lang === "uk" ? uk : firstAi(p, "ru"));
    });
    return Array.from(set.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [baseProducts, tier, manufacturer, culture, lang]);

  // Якщо активний фiльтр зник зi списку опцiй (наприклад tier=original виключає Нертус) — скидаємо.
  useEffect(() => {
    if (manufacturer !== "all" && !manufacturers.includes(manufacturer)) setManufacturer("all");
  }, [manufacturers, manufacturer]);
  useEffect(() => {
    if (culture !== "all" && !productCultures.includes(culture)) setCulture("all");
  }, [productCultures, culture]);
  useEffect(() => {
    if (ai !== "all" && !aiList.find(([k]) => k === ai)) setAi("all");
  }, [aiList, ai]);

  const filtered = useMemo(() => {
    return baseProducts.filter(p => matchAllExcept(p, "tier") && (tier === "all" || p.tier === tier));
  }, [baseProducts, tier, manufacturer, culture, ai]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const labels = lang === "uk"
    ? { back: "Головна", filters: "Фільтри", reset: "Скинути", tier: "Рівень", manufacturer: "Виробник", culture: "Культура", ai: "Діюча речовина", all: "Усі", showing: "Показано", of: "з", noResults: "Немає препаратів за обраними фільтрами", page: "Сторінка", prev: "Попередня", next: "Наступна" }
    : { back: "Главная", filters: "Фильтры", reset: "Сбросить", tier: "Уровень", manufacturer: "Производитель", culture: "Культура", ai: "Действующее вещество", all: "Все", showing: "Показано", of: "из", noResults: "Нет препаратов по выбранным фильтрам", page: "Страница", prev: "Предыдущая", next: "Следующая" };

  const hasActiveFilter = tier !== "all" || manufacturer !== "all" || culture !== "all" || ai !== "all";
  const base = lang === "uk" ? "" : "/ru";

  function reset() { updateParams({ tier: null, manufacturer: null, culture: null, ai: null, page: null }); }
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
          <button onClick={() => { if (typeof window !== "undefined" && window.history.length > 1) window.history.back(); else window.location.href = `${base}/`; }} className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-3"><ChevronLeft className="w-4 h-4" />{labels.back}</button>
          <h1 className="text-3xl lg:text-4xl font-extrabold">{lang === "uk" ? title : titleRu}</h1>
          <p className="text-white/80 text-sm mt-2">{`${labels.showing} ${pageItems.length} ${labels.of} ${filtered.length}${filtered.length !== baseProducts.length ? ` (${baseProducts.length} ${labels.of === "з" ? "усього" : "всего"})` : ""}`}</p>
        </div>
      </section>

      {/* Десктоп: таб-смуга в 2 ряди (flex-wrap, без скролу) */}
      {currentGroupSlug && (
        <nav className="hidden lg:block bg-white border-b border-border sticky top-[60px] z-40">
          <div className="container-w py-3">
            <div className="flex flex-wrap gap-2">
              {groups.map(g => (
                <Link
                  key={g.slug}
                  href={`${base}/grupy/${g.slug}/`}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-2 ${
                    g.slug === currentGroupSlug
                      ? "bg-brand text-white shadow-sm"
                      : "bg-bg text-ink hover:bg-border"
                  }`}
                >
                  <span className="text-lg leading-none">{g.emoji}</span>
                  <span>{lang === "uk" ? g.nameUk : g.nameRu}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}

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
              {currentGroupSlug && (
                <div className="mb-4 lg:hidden">
                  <p className="text-xs text-muted font-semibold mb-2 uppercase">{lang === "uk" ? "Група ЗЗР" : "Группа СЗР"}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {groups.map(g => (
                      <Link
                        key={g.slug}
                        href={`${base}/grupy/${g.slug}/`}
                        className={`text-xs px-2.5 py-1.5 rounded-md flex items-center gap-1 transition-colors ${
                          g.slug === currentGroupSlug
                            ? "bg-brand text-white"
                            : "bg-bg text-ink hover:bg-border"
                        }`}
                      >
                        <span>{g.emoji}</span>
                        <span>{lang === "uk" ? g.nameUk : g.nameRu}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
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
                <ManufacturerFilter
                  value={manufacturer}
                  onChange={setManufacturer}
                  options={manufacturers}
                  allLabel={labels.all}
                />
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
