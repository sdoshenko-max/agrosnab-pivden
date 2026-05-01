"use client";
import Link from "next/link";
import { TrendingDown, ArrowRight } from "lucide-react";
import { highlightedProducts } from "@/lib/data";
import { dict, type Lang } from "@/lib/i18n";
import { useCurrency } from "./CurrencyContext";

export function MagnetCards({ lang }: { lang: Lang }) {
  const t = dict[lang];
  const { format } = useCurrency();
  const base = lang === "uk" ? "" : "/ru";
  return (
    <section className="container-w py-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-dark px-3 py-1 rounded-full text-xs font-semibold mb-1">
            <TrendingDown className="w-3 h-3" />{t.magnets.subtitle}
          </div>
          <h2 className="text-xl lg:text-2xl">{t.magnets.title}</h2>
        </div>
      </div>
      <div className="card !p-0 overflow-hidden">
        {highlightedProducts.map((p, i) => (
          <Link key={p.slug} href={`${base}/produkt/${p.slug}`}
            className={`flex items-center gap-3 p-3 hover:bg-bg ${i > 0 ? "border-t border-border" : ""}`}>
            <span className="badge badge-econom shrink-0 hidden sm:inline-flex">Економ</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{lang === "uk" ? p.name : p.nameRu}</p>
              <p className="text-xs text-muted truncate">{lang === "uk" ? p.activeIngredient : p.activeIngredientRu}, {p.concentration} · {p.manufacturer}</p>
            </div>
            {p.saveFromOriginal && (<span className="text-accent font-bold text-sm shrink-0 hidden md:inline">−{p.saveFromOriginal}%</span>)}
            <div className="text-right shrink-0">
              <p className="font-bold text-brand whitespace-nowrap">{format(p.priceCash, p.currency)}<span className="text-xs font-normal text-muted">/{p.unit}</span></p>
              <p className="text-[10px] text-muted">готівка</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted shrink-0 hidden sm:block" />
          </Link>
        ))}
      </div>
    </section>
  );
}
