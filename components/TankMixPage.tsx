"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Beaker, FileText, Phone } from "lucide-react";
import type { TankMix } from "@/lib/types";
import { cultures as allCultures } from "@/lib/data";
import { dict, type Lang, COMPANY } from "@/lib/i18n";
import { RequestModal } from "./RequestModal";

export function TankMixPage({ mix, lang }: { mix: TankMix; lang: Lang }) {
  const t = dict[lang];
  const base = lang === "uk" ? "" : "/ru";
  const [open, setOpen] = useState(false);

  const culture = allCultures.find(c => c.slug === mix.cultureSlug);
  const totalVat = mix.components.reduce((s, c) => s + c.priceVat, 0);
  const totalCash = mix.components.reduce((s, c) => s + c.priceCash, 0);

  const labels = lang === "uk"
    ? { back: "Усі суміші", culture: "Для культури", components: "Склад суміші", role: "Роль", manufacturer: "Виробник", price: "Ціна", total: "Сума за весь комплект", orderMix: "Замовити цю суміш", whyMix: "Навіщо ця комбінація" }
    : { back: "Все смеси", culture: "Для культуры", components: "Состав смеси", role: "Роль", manufacturer: "Производитель", price: "Цена", total: "Сумма за весь комплект", orderMix: "Заказать эту смесь", whyMix: "Зачем эта комбинация" };

  const productLine = mix.components.map(c => `${c.name} (${c.manufacturer}) — ${c.role}`).join("\n");

  return (
    <>
      <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="container-w py-8">
          <Link href={`${base}/bakovi-sumishi`} className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-3">
            <ChevronLeft className="w-4 h-4" />{labels.back}
          </Link>
          <div className="flex items-start gap-4">
            <Beaker className="w-10 h-10 mt-1 shrink-0" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold mb-2">{lang === "uk" ? mix.titleUk : mix.titleRu}</h1>
              {culture && (
                <p className="text-white/80 text-sm">{labels.culture}: <Link href={`${base}/kultury/${culture.slug}`} className="underline">{lang === "uk" ? culture.nameUk : culture.nameRu}</Link></p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container-w py-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div>
          <div className="card mb-6">
            <h2 className="font-bold text-lg mb-2">{labels.whyMix}</h2>
            <p className="text-muted leading-relaxed">{lang === "uk" ? mix.descUk : mix.descRu}</p>
          </div>

          <h2 className="font-bold text-lg mb-3">{labels.components}</h2>
          <div className="space-y-3">
            {mix.components.map((c, i) => (
              <div key={i} className="card flex items-start gap-4">
                <div className="w-12 h-12 shrink-0 bg-brand/10 text-brand rounded-lg flex items-center justify-center text-xl font-bold">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold">{c.name}</p>
                  <p className="text-xs text-muted mb-1">{c.manufacturer}</p>
                  <span className="badge badge-econom">{c.role}</span>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-brand">${c.priceCash}</p>
                  <p className="text-xs text-muted">${c.priceVat} {t.productCard.priceVat.toLowerCase()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside>
          <div className="card lg:sticky lg:top-20">
            <p className="text-sm text-muted mb-1">{labels.total}</p>
            <p className="text-3xl font-extrabold text-brand mb-1">${totalCash.toFixed(2)}</p>
            <p className="text-sm text-muted mb-4">${totalVat.toFixed(2)} {t.productCard.priceVat.toLowerCase()}</p>
            <button onClick={() => setOpen(true)} className="btn-primary w-full mb-2">
              <FileText className="w-4 h-4" />{labels.orderMix}
            </button>
            <a href={`tel:${COMPANY.phone}`} className="btn-outline w-full">
              <Phone className="w-4 h-4" />{t.cta.callNow}
            </a>
          </div>
        </aside>
      </section>

      <RequestModal open={open} onClose={() => setOpen(false)} productName={(lang === "uk" ? mix.titleUk : mix.titleRu) + ":\n" + productLine} lang={lang} />
    </>
  );
}
