"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Phone, FileText, Package, Beaker, FlaskConical } from "lucide-react";
import type { Product } from "@/lib/types";
import { products as allProducts, cultures as allCultures } from "@/lib/data";
import { dict, type Lang, COMPANY } from "@/lib/i18n";
import { AgronomistCalculator } from "./AgronomistCalculator";
import { RequestModal } from "./RequestModal";
import { AddToCart } from "./AddToCart";

const tierLabels: Record<string, { uk: string; ru: string; cls: string }> = {
  econom: { uk: "Економ", ru: "Эконом", cls: "badge-econom" },
  premium: { uk: "Преміум", ru: "Премиум", cls: "badge-premium" },
  original: { uk: "Оригінал", ru: "Оригинал", cls: "badge-original" }
};

export function ProductPage({ product, lang }: { product: Product; lang: Lang }) {
  const t = dict[lang];
  const base = lang === "uk" ? "" : "/ru";
  const [requestOpen, setRequestOpen] = useState(false);

  const name = lang === "uk" ? product.name : product.nameRu;
  const ai = lang === "uk" ? product.activeIngredient : product.activeIngredientRu;
  const desc = lang === "uk" ? product.description : product.descriptionRu;
  const tier = tierLabels[product.tier];
  const tierLabel = lang === "uk" ? tier.uk : tier.ru;
  const cur = product.currency === "USD" ? "$" : "€";

  const cultureNames = product.cultures
    .map(slug => allCultures.find(c => c.slug === slug))
    .filter(Boolean)
    .map(c => lang === "uk" ? c!.nameUk : c!.nameRu);

  const related = allProducts
    .filter(p => p.slug !== product.slug)
    .filter(p => p.cultures.some(c => product.cultures.includes(c)))
    .filter(p => p.stage.some(s => product.stage.includes(s)))
    .slice(0, 4);

  const labels = lang === "uk"
    ? { back: "До каталогу", regulation: "Регламент застосування", related: "Часто беруть разом", crop: "Культура", target: "Призначення", rate: "Норма", manufacturer: "Виробник", about: "Про препарат" }
    : { back: "К каталогу", regulation: "Регламент применения", related: "Часто берут вместе", crop: "Культура", target: "Назначение", rate: "Норма", manufacturer: "Производитель", about: "О препарате" };

  return (
    <>
      <div className="bg-white border-b border-border">
        <div className="container-w py-3">
          <Link href={`${base}/`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand">
            <ChevronLeft className="w-4 h-4" />
            {labels.back}
          </Link>
        </div>
      </div>

      <section className="bg-white border-b border-border">
        <div className="container-w py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-bg rounded-xl border border-border flex items-center justify-center p-8 min-h-[300px]">
            {product.image ? (
              <img src={product.image} alt={name} className="max-w-full max-h-[400px] object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            ) : (
              <div className="text-9xl opacity-30">🧴</div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`badge ${tier.cls}`}>{tierLabel}</span>
              {product.saveFromOriginal && (<span className="text-accent font-bold text-sm">−{product.saveFromOriginal}% від оригіналу</span>)}
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-1">{name}</h1>
            <p className="text-muted mb-4">{labels.manufacturer}: <span className="font-medium text-ink">{product.manufacturer}</span></p>

            <div className="bg-brand/5 rounded-lg p-4 mb-4">
              <p className="text-xs uppercase tracking-wide text-muted font-semibold mb-1">{t.productCard.activeIngredient}</p>
              <p className="text-lg font-bold text-ink">{ai}</p>
              <p className="text-sm text-muted">{product.concentration}</p>
              {product.analog && (<p className="text-sm text-muted mt-2">{t.productCard.analog}: <span className="font-semibold text-ink">{product.analog}</span></p>)}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="card !p-3">
                <Package className="w-5 h-5 text-brand mb-1" />
                <p className="text-xs text-muted">{t.productCard.packaging}</p>
                <p className="font-bold">{product.packaging}</p>
              </div>
              <div className="card !p-3">
                <FlaskConical className="w-5 h-5 text-brand mb-1" />
                <p className="text-xs text-muted">{labels.rate}</p>
                <p className="font-bold">{product.rate}</p>
              </div>
            </div>

            <div className="card !p-4 mb-5 bg-bg">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm text-muted">{t.productCard.priceVat}</span>
                <span className="text-2xl font-extrabold text-brand">{cur}{product.priceVat}<span className="text-sm font-normal">/{product.unit}</span></span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted">{t.productCard.priceCash}</span>
                <span className="text-xl font-bold text-ink">{cur}{product.priceCash}<span className="text-sm font-normal">/{product.unit}</span></span>
              </div>
            </div>

            <AddToCart product={product} lang={lang} />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <button onClick={() => setRequestOpen(true)} className="btn-outline !py-2 text-sm">
                <FileText className="w-4 h-4" />
                {t.cta.submit}
              </button>
              <a href={`tel:${COMPANY.phone}`} className="btn-outline !py-2 text-sm">
                <Phone className="w-4 h-4" />
                {t.cta.callNow}
              </a>
            </div>
          </div>
        </div>
      </section>

      {desc && (
        <section className="container-w py-8">
          <h2 className="text-xl font-bold mb-3">{labels.about}</h2>
          <p className="text-muted leading-relaxed max-w-3xl">{desc}</p>
        </section>
      )}

      <section className="container-w py-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Beaker className="w-5 h-5 text-brand" />
          {labels.regulation}
        </h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 font-semibold">{labels.crop}</th>
                <th className="text-left p-2 font-semibold">{labels.target}</th>
                <th className="text-left p-2 font-semibold">{labels.rate}</th>
              </tr>
            </thead>
            <tbody>
              {cultureNames.map((cn, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="p-2 font-medium">{cn}</td>
                  <td className="p-2 text-muted">{ai}</td>
                  <td className="p-2 font-semibold whitespace-nowrap">{product.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="container-w py-6">
        <AgronomistCalculator product={product} lang={lang} />
      </section>

      {related.length > 0 && (
        <section className="bg-white border-t border-border py-8">
          <div className="container-w">
            <h2 className="text-xl font-bold mb-4">{labels.related}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {related.map(p => (
                <Link key={p.slug} href={`${base}/produkt/${p.slug}`} className="card hover:border-brand group">
                  <span className={`badge ${tierLabels[p.tier].cls} mb-2 inline-block`}>
                    {lang === "uk" ? tierLabels[p.tier].uk : tierLabels[p.tier].ru}
                  </span>
                  <h3 className="font-bold text-sm mb-1 group-hover:text-brand">{lang === "uk" ? p.name : p.nameRu}</h3>
                  <p className="text-xs text-muted mb-2">{p.manufacturer}</p>
                  <p className="text-base font-bold text-brand">{p.currency === "USD" ? "$" : "€"}{p.priceVat}<span className="text-xs font-normal text-muted">/{p.unit}</span></p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <RequestModal open={requestOpen} onClose={() => setRequestOpen(false)} productName={name} lang={lang} />
    </>
  );
}
