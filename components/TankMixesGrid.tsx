"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Beaker, ArrowRight } from "lucide-react";
import { tankMixes } from "@/lib/data";
import { cultures } from "@/lib/cultures";
import { dict, type Lang } from "@/lib/i18n";
import { useCurrency } from "./CurrencyContext";

const cultureOrder = cultures.map((c) => c.slug);

const cultureBySlug = new Map(cultures.map((c) => [c.slug, c]));

export function TankMixesGrid({
  lang,
  oneCardPerCulture = false,
  showAllButton = false,
  enableCultureFilter = false,
}: {
  lang: Lang;
  oneCardPerCulture?: boolean;
  showAllButton?: boolean;
  enableCultureFilter?: boolean;
}) {
  const t = dict[lang];
  const { format } = useCurrency();
  const base = lang === "uk" ? "" : "/ru";
  const perHaLabel = lang === "uk" ? "Вартість обробки 1 гектара (готівка)" : "Стоимость обработки 1 гектара (наличные)";
  const allLabel = lang === "uk" ? "Усі культури" : "Все культуры";
  const seeAllLabel = lang === "uk" ? "Подивитися всі суміші" : "Посмотреть все смеси";
  const emptyLabel = lang === "uk" ? "Для цієї культури сумішей поки немає" : "Для этой культуры смесей пока нет";

  const [culture, setCulture] = useState<string>("all");

  const availableCultureSlugs = useMemo(() => {
    const present = new Set(tankMixes.map((m) => m.cultureSlug));
    return cultureOrder.filter((slug) => present.has(slug));
  }, []);

  const visibleMixes = useMemo(() => {
    if (oneCardPerCulture) {
      const seen = new Set<string>();
      const firstByCulture: typeof tankMixes = [];
      for (const slug of cultureOrder) {
        const mix = tankMixes.find((m) => m.cultureSlug === slug);
        if (mix && !seen.has(slug)) {
          firstByCulture.push(mix);
          seen.add(slug);
        }
      }
      return firstByCulture;
    }
    if (enableCultureFilter && culture !== "all") {
      return tankMixes.filter((m) => m.cultureSlug === culture);
    }
    return tankMixes;
  }, [oneCardPerCulture, enableCultureFilter, culture]);

  const activePill = (v: string) =>
    v === culture
      ? "border-brand bg-brand/10 text-brand"
      : "border-border bg-white hover:border-brand/40";

  return (
    <section className="bg-white py-12 lg:py-16 border-y border-border">
      <div className="container-w">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-3 py-1 rounded-full text-sm font-semibold mb-3">
            <Beaker className="w-4 h-4" />{t.mixes.subtitle}
          </div>
          <h2 className="text-2xl lg:text-3xl">{t.mixes.title}</h2>
        </div>

        {enableCultureFilter && (
          <div className="mb-6 flex flex-wrap justify-center gap-1.5">
            <button
              type="button"
              onClick={() => setCulture("all")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${activePill("all")}`}
              aria-pressed={culture === "all"}
            >
              <span aria-hidden="true">∗</span>
              <span>{allLabel}</span>
            </button>
            {availableCultureSlugs.map((slug) => {
              const c = cultureBySlug.get(slug);
              if (!c) return null;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setCulture(slug)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${activePill(slug)}`}
                  aria-pressed={culture === slug}
                >
                  <span aria-hidden="true">{c.emoji}</span>
                  <span>{lang === "uk" ? c.nameUk : c.nameRu}</span>
                </button>
              );
            })}
          </div>
        )}

        {visibleMixes.length === 0 ? (
          <p className="text-center text-muted py-8">{emptyLabel}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleMixes.map((m) => {
              const perHaCash = m.components.reduce((s, c) => s + c.ratePerHa * c.priceCash, 0);
              return (
                <Link key={m.slug} href={`${base}/bakovi-sumishi/${m.slug}`} className="card flex flex-col group hover:border-brand hover:shadow-lg transition-all duration-200">
                  <h3 className="font-bold text-base mb-2 group-hover:text-brand transition-colors">{lang === "uk" ? m.titleUk : m.titleRu}</h3>
                  <p className="text-sm text-muted leading-snug mb-3">{lang === "uk" ? m.descUk : m.descRu}</p>
                  <ul className="space-y-1 text-sm mb-4">
                    {m.components.map((c, i) => (
                      <li key={i} className="flex gap-2"><span className="text-ink truncate"><span className="font-medium">{c.name}</span><span className="text-muted text-xs"> · {c.role}</span></span></li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-3 border-t-2 border-brand/30 bg-brand/5 -mx-5 -mb-5 px-5 py-3 rounded-b-xl">
                    <p className="text-[11px] uppercase font-semibold text-muted tracking-wide">{perHaLabel}</p>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-2xl font-extrabold text-brand">{format(perHaCash)}<span className="text-sm font-normal text-muted">/га</span></span>
                      <ArrowRight className="w-4 h-4 text-brand transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {showAllButton && (
          <div className="text-center mt-8">
            <Link
              href={`${base}/bakovi-sumishi`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-brand text-brand font-semibold hover:bg-brand hover:text-white transition-colors"
            >
              {seeAllLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
