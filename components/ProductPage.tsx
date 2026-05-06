"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Phone, FileText, Package, Beaker, FlaskConical } from "lucide-react";
import { type Product, getPackSize } from "@/lib/types";
import { products as allProducts, cultures as allCultures } from "@/lib/data";
import { manufacturerSlug } from "@/lib/manufacturers";
import { dict, type Lang, COMPANY } from "@/lib/i18n";
import { AgronomistCalculator } from "./AgronomistCalculator";
import { RequestModal } from "./RequestModal";
import { AddToCart } from "./AddToCart";
import { useCurrency } from "./CurrencyContext";
import { ProductImage } from "./ProductImage";

const tierLabels: Record<string, { uk: string; ru: string; cls: string }> = {
  econom: { uk: "Економ", ru: "Эконом", cls: "badge-econom" },
  premium: { uk: "Преміум", ru: "Премиум", cls: "badge-premium" },
  original: { uk: "Оригінал", ru: "Оригинал", cls: "badge-original" }
};

export function ProductPage({ product, lang }: { product: Product; lang: Lang }) {
  const t = dict[lang];
  const { format } = useCurrency();
  const base = lang === "uk" ? "" : "/ru";
  const [requestOpen, setRequestOpen] = useState(false);

  const variants = allProducts
    .filter(p => p.slug === product.slug)
    .sort((a, b) => getPackSize(a.packaging) - getPackSize(b.packaging));

  const name = lang === "uk" ? product.name : product.nameRu;
  const ai = lang === "uk" ? product.activeIngredient : product.activeIngredientRu;
  const desc = lang === "uk" ? product.description : product.descriptionRu;
  const tier = tierLabels[product.tier];
  const tierLabel = lang === "uk" ? tier.uk : tier.ru;

  const cultureNames = product.cultures.map(slug => allCultures.find(c => c.slug === slug)).filter(Boolean).map(c => lang === "uk" ? c!.nameUk : c!.nameRu);
  const related = allProducts.filter(p => p.slug !== product.slug).filter(p => p.cultures.some(c => product.cultures.includes(c))).filter(p => p.stage.some(s => product.stage.includes(s))).slice(0, 4);

  const labels = lang === "uk"
    ? { back: "Назад", regulation: "Регламент застосування", related: "Часто беруть разом", crop: "Культура", target: "Призначення", rate: "Норма", manufacturer: "Виробник", about: "Про препарат" }
    : { back: "Назад", regulation: "Регламент применения", related: "Часто берут вместе", crop: "Культура", target: "Назначение", rate: "Норма", manufacturer: "Производитель", about: "О препарате" };

  return (
    <>
      <div className="bg-white border-b border-border">
        <div className="container-w py-3 flex items-center justify-between gap-3 flex-wrap text-sm">
          <button onClick={() => { if (typeof window !== "undefined" && window.history.length > 1) window.history.back(); else window.location.href = `${base}/grupy/${product.groupSlug}/`; }} className="inline-flex items-center gap-1 text-muted hover:text-brand transition-colors"><ChevronLeft className="w-4 h-4" />{labels.back}</button>
          <nav className="flex items-center gap-1 text-xs text-muted overflow-hidden">
            <Link href={`${base}/`} className="hover:text-brand whitespace-nowrap">{lang === "uk" ? "Головна" : "Главная"}</Link>
            <span>›</span>
            <Link href={`${base}/grupy/${product.groupSlug}`} className="hover:text-brand whitespace-nowrap">{product.group}</Link>
            <span>›</span>
            <span className="text-ink truncate">{name}</span>
          </nav>
        </div>
      </div>

      <section className="bg-white border-b border-border">
        <div className="container-w py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-border flex items-center justify-center aspect-square overflow-hidden">
            <ProductImage product={product} alt={name} size="lg" className="w-full h-full object-contain p-2" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`badge ${tier.cls}`}>{tierLabel}</span>
              {product.saveFromOriginal && (<span className="text-accent font-bold text-sm">−{product.saveFromOriginal}% від оригіналу</span>)}
              <span className="ml-auto text-xs font-mono text-muted bg-bg border border-border px-2 py-0.5 rounded">№ {product.code}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-1">{name}</h1>
            <p className="text-muted mb-4">{labels.manufacturer}: <Link href={`${base}/vyrobnyk/${manufacturerSlug(product.manufacturer)}/`} className="font-medium text-ink underline decoration-dotted underline-offset-4 hover:text-brand hover:decoration-brand">{product.manufacturer}</Link></p>

            <div className="bg-brand/5 rounded-lg p-4 mb-4">
              <p className="text-xs uppercase tracking-wide text-muted font-semibold mb-1">{t.productCard.activeIngredient}</p>
              <p className="text-lg font-bold text-ink">{ai}</p>
              <p className="text-sm text-muted">{product.concentration}</p>
              {product.analog && (<p className="text-sm text-muted mt-2">{t.productCard.analog}: <span className="font-semibold text-ink">{product.analog}</span></p>)}
            </div>

            {variants.length > 1 && (
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wide text-muted font-semibold mb-2">{lang === "uk" ? "Фасовка" : "Фасовка"}</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map(v => (
                    <Link
                      key={v.code}
                      href={`${base}/produkt/${v.slug}/${v.code}/`}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors ${
                        product.code === v.code
                          ? "border-brand bg-brand text-white"
                          : "border-border bg-white text-ink hover:border-brand"
                      }`}
                    >
                      {v.packaging}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="card !p-3"><Package className="w-5 h-5 text-brand mb-1" /><p className="text-xs text-muted">{t.productCard.packaging}</p><p className="font-bold">{product.packaging}</p></div>
              {product.rate ? <div className="card !p-3"><FlaskConical className="w-5 h-5 text-brand mb-1" /><p className="text-xs text-muted">{labels.rate}</p><p className="font-bold">{product.rate}</p></div> : null}
            </div>

            {product.priceOnRequest ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 mb-5">
                <div className="text-2xl font-extrabold text-amber-900 mb-1">{t.productCard.onRequest}</div>
                <p className="text-sm text-amber-800 leading-snug">{t.productCard.onRequestHint}</p>
              </div>
            ) : (
              <div className="card !p-4 mb-5 bg-bg">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm text-muted">{t.productCard.priceCash}</span>
                  <span className="text-3xl font-extrabold text-brand whitespace-nowrap">{format(product.priceCash * getPackSize(product.packaging), product.currency)}<span className="text-sm font-normal text-muted"> / {product.packaging}</span></span>
                </div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs text-muted invisible">.</span>
                  <span className="text-xs text-muted">{format(product.priceCash, product.currency)}/{product.unit}</span>
                </div>
                <div className="flex justify-between items-baseline border-t border-border pt-2">
                  <span className="text-xs text-muted">{t.productCard.priceVat}</span>
                  <span className="text-base text-muted whitespace-nowrap">{format(product.priceVat * getPackSize(product.packaging), product.currency)} / {product.packaging}</span>
                </div>
              </div>
            )}

            {product.priceOnRequest ? (
              <button onClick={() => setRequestOpen(true)} className="btn-primary w-full !py-3"><FileText className="w-4 h-4" />{t.productCard.requestBtn}</button>
            ) : (
              <AddToCart product={product} lang={lang} />
            )}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <button onClick={() => setRequestOpen(true)} className="btn-outline !py-2 text-sm"><FileText className="w-4 h-4" />{t.cta.submit}</button>
              <a href={`tel:${COMPANY.phone}`} className="btn-outline !py-2 text-sm"><Phone className="w-4 h-4" />{t.cta.callNow}</a>
            </div>
          </div>
        </div>
      </section>

      {desc && (<section className="container-w py-8"><h2 className="text-xl font-bold mb-3">{labels.about}</h2><p className="text-muted leading-relaxed max-w-3xl">{desc}</p></section>)}

      <section className="container-w py-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Beaker className="w-5 h-5 text-brand" />{labels.regulation}</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border"><th className="text-left p-2 font-semibold">{labels.crop}</th><th className="text-left p-2 font-semibold">{labels.target}</th><th className="text-left p-2 font-semibold">{labels.rate}</th></tr></thead>
            <tbody>{cultureNames.map((cn, i) => (<tr key={i} className="border-b border-border last:border-0"><td className="p-2 font-medium">{cn}</td><td className="p-2 text-muted">{ai}</td><td className="p-2 font-semibold whitespace-nowrap">{product.rate || "—"}</td></tr>))}</tbody>
          </table>
        </div>
      </section>

      {!product.priceOnRequest && <section className="container-w py-6"><AgronomistCalculator product={product} lang={lang} /></section>}

      {related.length > 0 && (
        <section className="bg-white border-t border-border py-8">
          <div className="container-w">
            <h2 className="text-xl font-bold mb-4">{labels.related}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {related.map(p => (
                <Link key={p.slug} href={`${base}/produkt/${p.slug}`} className="card hover:border-brand group">
                  <span className={`badge ${tierLabels[p.tier].cls} mb-2 inline-block`}>{lang === "uk" ? tierLabels[p.tier].uk : tierLabels[p.tier].ru}</span>
                  <h3 className="font-bold text-sm mb-1 group-hover:text-brand">{lang === "uk" ? p.name : p.nameRu}</h3>
                  <p className="text-xs text-muted mb-2">{p.manufacturer}</p>
                  {p.priceOnRequest ? (
                    <p className="text-sm font-bold text-amber-700">{t.productCard.onRequest}</p>
                  ) : (
                    <p className="text-base font-bold text-brand whitespace-nowrap">{format(p.priceCash * getPackSize(p.packaging), p.currency)}<span className="text-xs font-normal text-muted"> / {p.packaging}</span></p>
                  )}
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
