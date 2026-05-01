import { TrendingDown } from "lucide-react";
import { highlightedProducts } from "@/lib/data";
import { dict, type Lang } from "@/lib/i18n";

export function MagnetCards({ lang }: { lang: Lang }) {
  const t = dict[lang];
  return (
    <section className="container-w py-12 lg:py-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-dark px-3 py-1 rounded-full text-sm font-semibold mb-3">
          <TrendingDown className="w-4 h-4" />
          {t.magnets.subtitle}
        </div>
        <h2 className="text-2xl lg:text-3xl">{t.magnets.title}</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
        {highlightedProducts.map(p => (
          <a
            key={p.slug}
            href={`#`}
            className="card flex flex-col group hover:border-brand"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="badge badge-econom">Економ</span>
              {p.saveFromOriginal && (
                <span className="text-accent font-bold text-sm">−{p.saveFromOriginal}%</span>
              )}
            </div>
            <h3 className="text-lg font-bold mb-1 group-hover:text-brand">{p.name}</h3>
            <p className="text-xs text-muted mb-2">{p.manufacturer}</p>
            <p className="text-sm font-medium text-ink mb-3 leading-snug">
              {p.activeIngredient}, {p.concentration}
            </p>
            <div className="mt-auto pt-3 border-t border-border">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-muted">{t.productCard.priceCash}</span>
                <span className="text-base font-bold text-brand">${p.priceCash}{p.unit === "л" ? t.productCard.perL : t.productCard.perKg}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-muted">{t.productCard.priceVat}</span>
                <span className="text-xs text-muted">${p.priceVat}{p.unit === "л" ? t.productCard.perL : t.productCard.perKg}</span>
              </div>
            </div>
            {p.analog && (
              <p className="text-[11px] text-muted mt-2 text-center">
                {t.productCard.analog}: {p.analog}
              </p>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}
