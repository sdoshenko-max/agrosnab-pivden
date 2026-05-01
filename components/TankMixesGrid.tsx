import Link from "next/link";
import { Beaker, ArrowRight } from "lucide-react";
import { tankMixes } from "@/lib/data";
import { dict, type Lang } from "@/lib/i18n";

export function TankMixesGrid({ lang }: { lang: Lang }) {
  const t = dict[lang];
  const base = lang === "uk" ? "" : "/ru";
  const perHaLabel = lang === "uk" ? "Готівка за обробку 1 га" : "Наличные за обработку 1 га";

  return (
    <section className="bg-white py-12 lg:py-16 border-y border-border">
      <div className="container-w">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-3 py-1 rounded-full text-sm font-semibold mb-3">
            <Beaker className="w-4 h-4" />
            {t.mixes.subtitle}
          </div>
          <h2 className="text-2xl lg:text-3xl">{t.mixes.title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tankMixes.map(m => {
            const perHaCash = m.components.reduce((s, c) => s + c.ratePerHa * c.priceCash, 0);
            return (
              <Link key={m.slug} href={`${base}/bakovi-sumishi/${m.slug}`} className="card flex flex-col group hover:border-brand">
                <h3 className="font-bold text-base mb-2 group-hover:text-brand">
                  {lang === "uk" ? m.titleUk : m.titleRu}
                </h3>
                <p className="text-sm text-muted leading-snug mb-3">
                  {lang === "uk" ? m.descUk : m.descRu}
                </p>
                <ul className="space-y-1 text-sm mb-4">
                  {m.components.map((c, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span className="text-ink truncate">
                        <span className="font-medium">{c.name}</span>
                        <span className="text-muted text-xs"> · {c.role}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-3 border-t border-border">
                  <p className="text-xs text-muted">{perHaLabel}</p>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-brand">${perHaCash.toFixed(2)}<span className="text-xs font-normal text-muted">/га</span></span>
                    <ArrowRight className="w-4 h-4 text-brand" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
