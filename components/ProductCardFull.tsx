"use client";

import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { type Product, getPackSize } from "@/lib/data";
import { manufacturerSlug } from "@/lib/manufacturers";
import { dict, type Lang } from "@/lib/i18n";
import { useCurrency } from "./CurrencyContext";
import { ProductImage } from "./ProductImage";

const tierLabels: Record<string, { uk: string; ru: string; cls: string }> = {
  econom: { uk: "Економ", ru: "Эконом", cls: "badge-econom" },
  premium: { uk: "Преміум", ru: "Премиум", cls: "badge-premium" },
  original: { uk: "Оригінал", ru: "Оригинал", cls: "badge-original" }
};

export function ProductCardFull({ product, lang, onRequest }: { product: Product; lang: Lang; onRequest: (productName: string) => void; }) {
  const t = dict[lang];
  const { format } = useCurrency();
  const base = lang === "uk" ? "" : "/ru";
  const tier = tierLabels[product.tier];
  const name = lang === "uk" ? product.name : product.nameRu;
  const ai = lang === "uk" ? product.activeIngredient : product.activeIngredientRu;
  const desc = lang === "uk" ? product.description : product.descriptionRu;
  const productHref = `${base}/produkt/${product.slug}`;
  const detailsLabel = lang === "uk" ? "Деталі" : "Подробнее";

  return (
    <article className="card flex flex-col gap-3 hover:border-brand hover:shadow-lg transition-all duration-200 group">
      <div className="flex items-start gap-3">
        <Link href={productHref} className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-bg rounded-lg overflow-hidden flex items-center justify-center border border-border group-hover:border-brand transition-transform duration-200 group-hover:-translate-y-0.5">
          <ProductImage product={product} alt={name} size="md" className="w-full h-full object-contain" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`badge ${tier.cls}`}>{lang === "uk" ? tier.uk : tier.ru}</span>
            {product.saveFromOriginal && (<span className="text-accent font-bold text-sm">−{product.saveFromOriginal}%</span>)}
          </div>
          <Link href={productHref} className="font-bold text-lg leading-tight hover:text-brand group-hover:text-brand transition-colors block">{name}</Link>
          <Link href={`${base}/vyrobnyk/${manufacturerSlug(product.manufacturer)}/`} className="text-xs text-muted hover:text-brand hover:underline" onClick={e => e.stopPropagation()}>{product.manufacturer}</Link>
        </div>
      </div>

      <div className="bg-brand/5 rounded-lg p-3">
        <p className="text-xs uppercase tracking-wide text-muted font-semibold mb-1">{t.productCard.activeIngredient}</p>
        <p className="text-sm font-bold text-ink leading-snug">{ai}{product.concentration ? `, ${product.concentration}` : ""}</p>
        {product.analog && (<p className="text-xs text-muted mt-1">{t.productCard.analog}: <span className="text-ink font-medium">{product.analog}</span></p>)}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div><p className="text-xs text-muted">{t.productCard.packaging}</p><p className="font-semibold">{product.packaging}</p></div>
        {product.rate ? <div><p className="text-xs text-muted">{t.productCard.rate}</p><p className="font-semibold">{product.rate}</p></div> : null}
      </div>

      {desc && <p className="text-sm text-muted leading-snug">{desc}</p>}

      <div className="border-t border-border pt-3 mt-auto">
        {product.priceOnRequest ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-center">
            <div className="text-base font-bold text-amber-900">{t.productCard.onRequest}</div>
            <div className="text-[11px] text-amber-700 leading-tight mt-0.5">{t.productCard.onRequestHint}</div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs text-muted">{t.productCard.priceCash}</span>
              <div className="text-right">
                <div className="text-lg font-bold text-brand whitespace-nowrap">{format(product.priceCash * getPackSize(product.packaging), product.currency)}<span className="text-xs font-normal text-muted"> / {product.packaging}</span></div>
                <div className="text-[11px] text-muted">{format(product.priceCash, product.currency)}/{product.unit}</div>
              </div>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-muted">{t.productCard.priceVat}</span>
              <span className="text-sm text-muted whitespace-nowrap">{format(product.priceVat * getPackSize(product.packaging), product.currency)} / {product.packaging}</span>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => onRequest(name)} className="btn-primary !py-2 !px-3 text-sm"><FileText className="w-4 h-4" />{product.priceOnRequest ? t.productCard.requestBtn : t.cta.submit}</button>
        <Link href={productHref} className="btn-outline !py-2 !px-3 text-sm">{detailsLabel}<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></Link>
      </div>
    </article>
  );
}
