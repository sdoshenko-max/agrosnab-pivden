"use client";

import Link from "next/link";
import { Phone, FileText, ArrowRight } from "lucide-react";
import type { Product } from "@/lib/data";
import { dict, type Lang, COMPANY } from "@/lib/i18n";

const tierLabels: Record<string, { uk: string; ru: string; cls: string }> = {
  econom: { uk: "Економ", ru: "Эконом", cls: "badge-econom" },
  premium: { uk: "Преміум", ru: "Премиум", cls: "badge-premium" },
  original: { uk: "Оригінал", ru: "Оригинал", cls: "badge-original" }
};

export function ProductCardFull({
  product,
  lang,
  onRequest
}: {
  product: Product;
  lang: Lang;
  onRequest: (productName: string) => void;
}) {
  const t = dict[lang];
  const base = lang === "uk" ? "" : "/ru";
  const tier = tierLabels[product.tier];
  const name = lang === "uk" ? product.name : product.nameRu;
  const ai = lang === "uk" ? product.activeIngredient : product.activeIngredientRu;
  const desc = lang === "uk" ? product.description : product.descriptionRu;
  const unitLabel = product.unit;
  const productHref = `${base}/produkt/${product.slug}`;
  const cur = product.currency === "USD" ? "$" : "€";
  const detailsLabel = lang === "uk" ? "Деталі" : "Подробнее";

  return (
    <article className="card flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Link href={productHref} className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-bg rounded-lg overflow-hidden flex items-center justify-center border border-border hover:border-brand">
          {product.image ? (
            <img src={product.image} alt={name} className="w-full h-full object-contain" loading="lazy" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <span className="text-3xl">🧴</span>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`badge ${tier.cls}`}>{lang === "uk" ? tier.uk : tier.ru}</span>
            {product.saveFromOriginal && (<span className="text-accent font-bold text-sm">−{product.saveFromOriginal}%</span>)}
          </div>
          <Link href={productHref} className="font-bold text-lg leading-tight hover:text-brand block">{name}</Link>
          <p className="text-xs text-muted">{product.manufacturer}</p>
        </div>
      </div>

      <div className="bg-brand/5 rounded-lg p-3">
        <p className="text-xs uppercase tracking-wide text-muted font-semibold mb-1">{t.productCard.activeIngredient}</p>
        <p className="text-sm font-bold text-ink leading-snug">{ai}, {product.concentration}</p>
        {product.analog && (<p className="text-xs text-muted mt-1">{t.productCard.analog}: <span className="text-ink font-medium">{product.analog}</span></p>)}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-muted">{t.productCard.packaging}</p>
          <p className="font-semibold">{product.packaging}</p>
        </div>
        <div>
          <p className="text-xs text-muted">{t.productCard.rate}</p>
          <p className="font-semibold">{product.rate}</p>
        </div>
      </div>

      {desc && <p className="text-sm text-muted leading-snug">{desc}</p>}

      <div className="border-t border-border pt-3 mt-auto">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-xs text-muted">{t.productCard.priceCash}</span>
          <span className="text-lg font-bold text-brand">{cur}{product.priceCash}<span className="text-xs font-normal text-muted">/{unitLabel}</span></span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-muted">{t.productCard.priceVat}</span>
          <span className="text-sm text-muted">{cur}{product.priceVat}<span className="text-xs font-normal">/{unitLabel}</span></span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => onRequest(name)} className="btn-primary !py-2 !px-3 text-sm">
          <FileText className="w-4 h-4" />
          {t.cta.submit}
        </button>
        <Link href={productHref} className="btn-outline !py-2 !px-3 text-sm">
          {detailsLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
