"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Beaker } from "lucide-react";
import type { Culture, Product, TankMix } from "@/lib/data";
import { dict, type Lang } from "@/lib/i18n";
import { ProductCardFull } from "./ProductCardFull";
import { RequestModal } from "./RequestModal";

export function CulturePage({
  culture,
  products,
  tankMixes,
  lang
}: {
  culture: Culture;
  products: Product[];
  tankMixes: TankMix[];
  lang: Lang;
}) {
  const t = dict[lang];
  const base = lang === "uk" ? "" : "/ru";

  const [tech, setTech] = useState<string>(culture.technologies?.[0]?.slug || "all");
  const [stage, setStage] = useState<string>(culture.stages[0]?.slug || "all");
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestProduct, setRequestProduct] = useState<string>("");

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (!p.stage.includes(stage)) return false;
      if (culture.technologies && p.technology && p.technology.length > 0) {
        if (!p.technology.includes(tech)) return false;
      }
      return true;
    });
  }, [products, stage, tech, culture.technologies]);

  function openRequest(productName: string) {
    setRequestProduct(productName);
    setRequestOpen(true);
  }

  const labels = lang === "uk"
    ? { back: "Усі культури", tech: "Технологія", stage: "Етап обробки", noProducts: "Немає препаратів у цій категорії", mixForCulture: "Готова бакова суміш для цієї культури", openMix: "Подивитись склад" }
    : { back: "Все культуры", tech: "Технология", stage: "Этап обработки", noProducts: "Нет препаратов в этой категории", mixForCulture: "Готовая баковая смесь для этой культуры", openMix: "Посмотреть состав" };

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="container-w py-10 lg:py-14">
          <Link href={`${base}/`} className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-4">
            <ChevronLeft className="w-4 h-4" />
            {labels.back}
          </Link>
          <div className="flex items-start gap-4 lg:gap-6">
            <div className="text-6xl lg:text-7xl shrink-0">{culture.emoji}</div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">
                {lang === "uk"
                  ? `${culture.nameUk} — захист і схема обробки`
                  : `${culture.nameRu} — защита и схема обработки`}
              </h1>
              <p className="text-base lg:text-lg text-white/90 max-w-2xl">
                {lang === "uk" ? (culture.longUk || culture.shortUk) : (culture.longRu || culture.shortRu)}
              </p>
            </div>
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

        {/* Продукти */}
        {filtered.length === 0 ? (
          <p className="text-muted text-center py-12">{labels.noProducts}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => (
              <ProductCardFull key={p.slug} product={p} lang={lang} onRequest={openRequest} />
            ))}
          </div>
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
