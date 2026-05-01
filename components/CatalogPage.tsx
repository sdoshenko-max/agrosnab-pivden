"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Filter, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { products as allProducts, cultures } from "@/lib/data";
import { dict, type Lang } from "@/lib/i18n";
import { ProductCardFull } from "./ProductCardFull";
import { RequestModal } from "./RequestModal";

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

  const manufacturers = Array.from(new Set(baseProducts.map(p => p.manufacturer))).sort();
  const productCultures = Array.from(new Set(baseProducts.flatMap(p => p.cultures)));
  // Унікальні діючі речовини у вибірці (по основній — першій частині складу)
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

  const labels = lang === "uk"
    ? { back: "Головна", filters: "Фільтри", reset: "Скинути", tier: "Рівень", manufacturer: "Виробник", culture: "Культура", ai: "Діюча речовина", all: "Усі", showing: "Показано", of: "з", noResults: "Немає препаратів за обраними фільтрами" }
    : { back: "Главная", filters: "Фильтры", reset: "Сбросить", tier: "Уровень", manufacturer: "Производитель", culture: "Культура", ai: "Действующее вещество", all: "Все", showing: "Показано", of: "из", noResults: "Нет препаратов по выбранным фильтрам" };

  const hasActiveFilter = tier !== "all" || manufacturer !== "all" || culture !== "all" || ai !== "all";
  const base = lang === "uk" ? "" : "/ru";

  function reset() { setTier("all"); setManufacturer("all"); setCulture("all"); setAi("all"); }
  function openRequest(name: string) { setRequestProduct(name); setRequestOpen(true); }

  return (
    <>
      <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="container-w py-8">
          <Link href={`${base}/`} className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-3">
            <ChevronLeft className="w-4 h-4" />{labels.back}
          </Link>
          <h1 className="text-3xl lg:text-4xl font-extrabold">{lang === "uk" ? title : titleRu}</h1>
          <p className="text-white/80 text-sm mt-2">{labels.showing} {filtered.length} {labels.of} {baseProducts.length}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(p => (<ProductCardFull key={p.slug} product={p} lang={lang} onRequest={openRequest} />))}
              </div>
            )}
          </div>
        </div>
      </section>

      <RequestModal open={requestOpen} onClose={() => setRequestOpen(false)} productName={requestProduct} lang={lang} />
    </>
  );
}
