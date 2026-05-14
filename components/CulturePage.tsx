"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Beaker } from "lucide-react";
import type { Culture, Product, TankMix } from "@/lib/data";
import { dict, type Lang } from "@/lib/i18n";
import { ProductCardFull } from "./ProductCardFull";
import { RequestModal } from "./RequestModal";
import { ManufacturerFilter } from "./ManufacturerFilter";

const TIER_LABELS: Record<string, { uk: string; ru: string }> = {
  econom: { uk: "Економ", ru: "Эконом" },
  premium: { uk: "Преміум", ru: "Премиум" },
  original: { uk: "Оригінал", ru: "Оригинал" },
};

type CulturePageProps = {
  culture: Culture;
  products: Product[];
  tankMixes: TankMix[];
  lang: Lang;
};

export function CulturePage(props: CulturePageProps) {
  return (
    <Suspense fallback={null}>
      <CulturePageInner {...props} />
    </Suspense>
  );
}

function CulturePageInner({ culture, products, tankMixes, lang }: CulturePageProps) {
  const t = dict[lang];
  const base = lang === "uk" ? "" : "/ru";

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaultTech = culture.technologies?.[0]?.slug || "all";
  const defaultStage = culture.stages[0]?.slug || "all";
  const tech = searchParams.get("tech") || defaultTech;
  const stage = searchParams.get("stage") || defaultStage;
  const tier = searchParams.get("tier") || "all";
  const manufacturer = searchParams.get("manufacturer") || "all";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  // Тримаємо актуальний query string у ref — синхронно оновлюємо при кожному
  // кліку. useSearchParams і window.location.search оновлюються асинхронно
  // (router.replace використовує transitions), тому при швидких послідовних
  // кліках сусідній клік бачив застарілий стан і затирав попередні параметри.
  const queryRef = useRef<string>(searchParams.toString());
  useEffect(() => { queryRef.current = searchParams.toString(); }, [searchParams]);

  function updateParams(updates: Record<string, string | number | null>) {
    const sp = new URLSearchParams(queryRef.current);
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "" || v === undefined || v === "all") sp.delete(k);
      else sp.set(k, String(v));
    }
    const qs = sp.toString();
    queryRef.current = qs;
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }
  const setTech = (v: string) => updateParams({ tech: v === defaultTech ? null : v, page: null });
  const setStage = (v: string) => updateParams({ stage: v === defaultStage ? null : v, page: null });
  const setTier = (v: string) => updateParams({ tier: v, page: null });
  const setManufacturer = (v: string) => updateParams({ manufacturer: v, page: null });
  const setPage = (v: number) => updateParams({ page: v <= 1 ? null : v });

  const [requestOpen, setRequestOpen] = useState(false);
  const [requestProduct, setRequestProduct] = useState<string>("");
  const PAGE_SIZE = 12;

  // Списки для фільтрів — будуємо з продуктів, відфільтрованих лише по етапу/технології
  // (щоб не зникали опції після вибору групи/виробника/tier).
  const productsForOptions = useMemo(() => {
    return products.filter(p => {
      if (!p.stage.includes(stage)) return false;
      if (culture.technologies && p.technology && p.technology.length > 0) {
        if (!p.technology.includes(tech)) return false;
      }
      return true;
    });
  }, [products, stage, tech, culture.technologies]);

  // Каскаднi фiльтри: виробники залежать вiд поточного tier, tier — вiд поточного виробника.
  const manufacturerOptions = useMemo(() => {
    const src = tier === "all"
      ? productsForOptions
      : productsForOptions.filter(p => p.tier === tier);
    return Array.from(new Set(src.map(p => p.manufacturer))).sort();
  }, [productsForOptions, tier]);

  const tierOptions = useMemo(() => {
    const src = manufacturer === "all"
      ? productsForOptions
      : productsForOptions.filter(p => p.manufacturer === manufacturer);
    return Array.from(new Set(src.map(p => p.tier)));
  }, [productsForOptions, manufacturer]);

  // Якщо обраний виробник зник пiсля змiни tier — скидаємо на "Усi".
  useEffect(() => {
    if (manufacturer !== "all" && !manufacturerOptions.includes(manufacturer)) setManufacturer("all");
  }, [manufacturerOptions, manufacturer]);

  const filtered = useMemo(() => {
    return productsForOptions.filter(p => {
      if (tier !== "all" && p.tier !== tier) return false;
      if (manufacturer !== "all" && p.manufacturer !== manufacturer) return false;
      return true;
    });
  }, [productsForOptions, tier, manufacturer]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function goPrev() { if (safePage > 1) { setPage(safePage - 1); window.scrollTo({ top: 0, behavior: "smooth" }); } }
  function goNext() { if (safePage < totalPages) { setPage(safePage + 1); window.scrollTo({ top: 0, behavior: "smooth" }); } }
  function goPage(n: number) { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }

  const pageNumbers: number[] = [];
  if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pageNumbers.push(i); }
  else {
    pageNumbers.push(1);
    if (safePage > 4) pageNumbers.push(-1);
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    for (let i = start; i <= end; i++) pageNumbers.push(i);
    if (safePage < totalPages - 3) pageNumbers.push(-2);
    pageNumbers.push(totalPages);
  }

  function openRequest(productName: string) {
    setRequestProduct(productName);
    setRequestOpen(true);
  }

  const labels = lang === "uk"
    ? { back: "Назад", tech: "Технологія", stage: "Етап обробки", tier: "Рівень", manufacturer: "Виробник", all: "Усі", noProducts: "Немає препаратів у цій категорії", mixForCulture: "Готова бакова суміш для цієї культури", openMix: "Подивитись склад" }
    : { back: "Назад", tech: "Технология", stage: "Этап обработки", tier: "Уровень", manufacturer: "Производитель", all: "Все", noProducts: "Нет препаратов в этой категории", mixForCulture: "Готовая баковая смесь для этой культуры", openMix: "Посмотреть состав" };

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="container-w py-10 lg:py-14">
          <button onClick={() => { if (typeof window !== "undefined" && window.history.length > 1) window.history.back(); else window.location.href = `${base}/kultury`; }} className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-4"><ChevronLeft className="w-4 h-4" />{labels.back}</button>
          <div>
            {culture.image ? (
              <img
                src={culture.image}
                alt={lang === "uk" ? culture.nameUk : culture.nameRu}
                className="float-left mr-4 mb-2 w-20 h-20 lg:w-28 lg:h-28 rounded-full object-cover ring-2 ring-white/30 shadow-lg"
              />
            ) : (
              <span className="float-left mr-4 mb-2 text-6xl lg:text-7xl leading-none select-none">{culture.emoji}</span>
            )}
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">
              {lang === "uk"
                ? `${culture.nameUk} — захист і схема обробки`
                : `${culture.nameRu} — защита и схема обработки`}
            </h1>
            <p className="text-base lg:text-lg text-white/90">
              {lang === "uk" ? (culture.longUk || culture.shortUk) : (culture.longRu || culture.shortRu)}
            </p>
            <div className="clear-both"></div>
          </div>
        </div>
      </section>

      {/* Технології (тільки якщо є) */}
      {culture.technologies && (
        <section className="bg-white border-b border-border">
          <div className="container-w py-4">
            <p className="text-xs uppercase tracking-wide text-muted font-semibold mb-2">{labels.tech}</p>
            <div className="flex flex-wrap gap-2">
              {culture.technologies.map(t => (
                <button
                  key={t.slug}
                  onClick={() => setTech(t.slug)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    tech === t.slug
                      ? "bg-brand text-white"
                      : "bg-bg text-ink hover:bg-border"
                  }`}
                >
                  {lang === "uk" ? t.nameUk : t.nameRu}
                </button>
              ))}
            </div>
            {culture.technologies.find(x => x.slug === tech) && (
              <p className="text-sm text-muted mt-2">
                {lang === "uk"
                  ? culture.technologies.find(x => x.slug === tech)!.descUk
                  : culture.technologies.find(x => x.slug === tech)!.descRu}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Етапи */}
      <section className="container-w py-6 lg:py-8">
        <p className="text-xs uppercase tracking-wide text-muted font-semibold mb-3">{labels.stage}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {culture.stages.map(s => (
            <button
              key={s.slug}
              onClick={() => setStage(s.slug)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                stage === s.slug
                  ? "bg-brand text-white"
                  : "bg-white border border-border hover:border-brand"
              }`}
            >
              <span>{s.icon}</span>
              <span>{lang === "uk" ? s.nameUk : s.nameRu}</span>
            </button>
          ))}
        </div>

        {/* Додаткові фільтри: рівень, виробник */}
        {(manufacturerOptions.length > 1 || tierOptions.length > 1) && (
          <div className="card !p-4 mb-6 grid grid-cols-1 gap-4">
            {tierOptions.length > 1 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted font-semibold mb-2">{labels.tier}</p>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => setTier("all")} className={`text-xs px-2.5 py-1 rounded-md ${tier === "all" ? "bg-brand text-white" : "bg-bg hover:bg-border"}`}>{labels.all}</button>
                  {(["econom", "premium", "original"] as const).filter(t => tierOptions.includes(t)).map(t => (
                    <button key={t} onClick={() => setTier(t)} className={`text-xs px-2.5 py-1 rounded-md ${tier === t ? "bg-brand text-white" : "bg-bg hover:bg-border"}`}>
                      {lang === "uk" ? TIER_LABELS[t].uk : TIER_LABELS[t].ru}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {manufacturerOptions.length > 1 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted font-semibold mb-2">{labels.manufacturer}</p>
                <ManufacturerFilter
                  value={manufacturer}
                  onChange={setManufacturer}
                  options={manufacturerOptions}
                  allLabel={labels.all}
                />
              </div>
            )}
          </div>
        )}

        {/* Продукти */}
        {filtered.length === 0 ? (
          <p className="text-muted text-center py-12">{labels.noProducts}</p>
        ) : (
          <>
            <p className="text-sm text-muted mb-3">{lang === "uk" ? `Показано ${pageItems.length} з ${filtered.length}` : `Показано ${pageItems.length} из ${filtered.length}`}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pageItems.map(p => (
                <ProductCardFull key={p.code || p.slug} product={p} lang={lang} onRequest={openRequest} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-muted">{lang === "uk" ? "Сторінка" : "Страница"} {safePage} {lang === "uk" ? "з" : "из"} {totalPages}</p>
                <div className="flex items-center gap-1 flex-wrap justify-center">
                  <button onClick={goPrev} disabled={safePage === 1} className="px-3 py-1.5 rounded-md border border-border text-sm disabled:opacity-40 hover:bg-brand/5 transition-colors flex items-center gap-1"><ChevronLeft className="w-4 h-4" />{lang === "uk" ? "Попередня" : "Предыдущая"}</button>
                  {pageNumbers.map((n, idx) => n < 0
                    ? <span key={`e${idx}`} className="px-2 text-muted">…</span>
                    : <button key={n} onClick={() => goPage(n)} className={`min-w-[36px] px-2 py-1.5 rounded-md text-sm ${n === safePage ? "bg-brand text-white" : "border border-border hover:bg-brand/5"} transition-colors`}>{n}</button>
                  )}
                  <button onClick={goNext} disabled={safePage === totalPages} className="px-3 py-1.5 rounded-md border border-border text-sm disabled:opacity-40 hover:bg-brand/5 transition-colors flex items-center gap-1">{lang === "uk" ? "Наступна" : "Следующая"}<ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Бакові суміші */}
      {tankMixes.length > 0 && (
        <section className="bg-white border-y border-border py-8">
          <div className="container-w">
            <div className="flex items-center gap-2 mb-4">
              <Beaker className="w-5 h-5 text-brand" />
              <h2 className="text-xl font-bold">{labels.mixForCulture}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tankMixes.map(m => {
                const total = m.components.reduce((s, c) => s + c.priceVat, 0);
                return (
                  <div key={m.slug} className="card">
                    <h3 className="font-bold mb-1">{lang === "uk" ? m.titleUk : m.titleRu}</h3>
                    <p className="text-sm text-muted mb-3">{lang === "uk" ? m.descUk : m.descRu}</p>
                    <ul className="space-y-1 text-sm mb-3">
                      {m.components.map((c, i) => (
                        <li key={i} className="flex justify-between gap-2">
                          <span><span className="font-medium">{c.name}</span> <span className="text-muted text-xs">· {c.role}</span></span>
                          <span className="font-semibold whitespace-nowrap">${c.priceVat}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
                      <span>{t.productCard.priceVat}:</span>
                      <span className="text-brand">${total.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <RequestModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        productName={requestProduct}
        lang={lang}
      />
    </>
  );
}
