"use client";
import Link from "next/link";
import { TrendingDown } from "lucide-react";
import { highlightedProducts, getPackSize } from "@/lib/data";
import { dict, type Lang } from "@/lib/i18n";
import { useCurrency } from "./CurrencyContext";

export function MagnetCards({ lang }: { lang: Lang }) {
  const t = dict[lang];
  const { format } = useCurrency();
  const base = lang === "uk" ? "" : "/ru";

  // Дублюємо товари 2 рази щоб створити безшовну анімацію
  const items = [...highlightedProducts, ...highlightedProducts];

  return (
    <section className="bg-bg py-8 border-y border-border overflow-hidden">
      <div className="container-w mb-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingDown className="w-5 h-5 text-accent" />
          <h2 className="text-lg lg:text-xl font-bold">{t.magnets.title}</h2>
        </div>
        <p className="text-xs text-muted">{t.magnets.subtitle} · {lang === "uk" ? "натисніть на товар" : "нажмите на товар"} →</p>
      </div>

      <div className="relative w-full overflow-hidden marquee-mask">
        <div className="flex gap-3 marquee-track w-max">
          {items.map((p, i) => (
            <Link
              key={`${p.slug}-${i}`}
              href={`${base}/produkt/${p.slug}`}
              className="shrink-0 w-72 bg-white rounded-xl border border-border hover:border-brand hover:shadow-lg transition-all duration-200 p-3 flex flex-col gap-2 group"
            >
              <div className="flex items-center gap-2">
                <span className="badge badge-econom shrink-0">{lang === "uk" ? "Економ" : "Эконом"}</span>
                {p.analog && <span className="text-[11px] text-muted truncate">{lang === "uk" ? "аналог" : "аналог"} {p.analog}</span>}
              </div>
              <p className="font-bold text-sm leading-tight line-clamp-1 group-hover:text-brand transition-colors">{lang === "uk" ? p.name : p.nameRu}</p>
              <p className="text-[11px] text-muted line-clamp-1">{lang === "uk" ? p.activeIngredient : p.activeIngredientRu}</p>
              <div className="mt-auto pt-1 flex items-baseline justify-between">
                <p className="font-bold text-brand text-base whitespace-nowrap">{format(p.priceCash * getPackSize(p.packaging), p.currency)}<span className="text-[11px] font-normal text-muted"> / {p.packaging}</span></p>
                {p.saveFromOriginal && <span className="text-accent font-bold text-xs">−{p.saveFromOriginal}%</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .marquee-mask {
          mask-image: linear-gradient(to right, transparent 0, black 40px, black calc(100% - 40px), transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0, black 40px, black calc(100% - 40px), transparent 100%);
        }
        .marquee-track {
          animation: marquee 50s linear infinite;
          padding: 0 12px;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
