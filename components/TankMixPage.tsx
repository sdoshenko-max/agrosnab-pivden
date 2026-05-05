"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Beaker, ShoppingCart, Phone, Calculator, Check } from "lucide-react";
import type { TankMix } from "@/lib/types";
import { cultures as allCultures } from "@/lib/data";
import { dict, type Lang, COMPANY } from "@/lib/i18n";
import { useCart } from "./CartContext";
import { useCurrency } from "./CurrencyContext";
import { RequestModal } from "./RequestModal";

export function TankMixPage({ mix, lang }: { mix: TankMix; lang: Lang }) {
  const t = dict[lang];
  const cart = useCart();
  const { format } = useCurrency();
  const base = lang === "uk" ? "" : "/ru";
  const [area, setArea] = useState<string>("");
  const [requestOpen, setRequestOpen] = useState(false);
  const [added, setAdded] = useState(false);

  const culture = allCultures.find(c => c.slug === mix.cultureSlug);
  const a = parseFloat(area);
  const hasArea = !isNaN(a) && a > 0;

  const rows = useMemo(() => {
    return mix.components.map(c => {
      const need = hasArea ? a * c.ratePerHa : c.ratePerHa;
      const cans = c.packSize > 0 ? Math.ceil(need / c.packSize) : 0;
      const totalVol = cans * c.packSize;
      const sumVat = totalVol * c.priceVat;
      const sumCash = totalVol * c.priceCash;
      return { ...c, need, cans, totalVol, sumVat, sumCash };
    });
  }, [mix, a, hasArea]);

  const totalVat = rows.reduce((s, r) => s + r.sumVat, 0);
  const totalCash = rows.reduce((s, r) => s + r.sumCash, 0);
  const perHaCash = mix.components.reduce((s, c) => s + c.ratePerHa * c.priceCash, 0);
  const perHaVat = mix.components.reduce((s, c) => s + c.ratePerHa * c.priceVat, 0);

  const labels = lang === "uk"
    ? { back: "Усі суміші", culture: "Для культури", components: "Склад суміші", role: "Роль", rate: "Норма л/га", need: "Потрібно", cans: "Каністр", buy: "Купити", sum: "Сума", area: "Площа поля, га", per1ha: "Вартість обробки 1 гектара (готівка)", whyMix: "Навіщо ця комбінація", addAll: "Додати весь набір у кошик", added: "Додано", call: "Зателефонувати", noArea: "Введіть площу, щоб порахувати скільки купити", canShort: "кан." }
    : { back: "Все смеси", culture: "Для культуры", components: "Состав смеси", role: "Роль", rate: "Норма л/га", need: "Нужно", cans: "Канистр", buy: "Купить", sum: "Сумма", area: "Площадь поля, га", per1ha: "Стоимость обработки 1 гектара (наличные)", whyMix: "Зачем эта комбинация", addAll: "Добавить весь набор в корзину", added: "Добавлено", call: "Позвонить", noArea: "Введите площадь, чтобы рассчитать сколько купить", canShort: "кан." };

  function addAllToCart() {
    if (!hasArea) return;
    rows.forEach(r => {
      cart.add({
        slug: r.slug || `mix-${mix.slug}-${r.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: r.name, manufacturer: r.manufacturer,
        packaging: `${r.packSize} ${r.unit}`, packSize: r.packSize, unit: r.unit,
        qty: r.cans, priceVat: r.priceVat, priceCash: r.priceCash, currency: "USD"
      });
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <>
      <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="container-w py-8">
          <Link href={`${base}/bakovi-sumishi`} className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-3"><ChevronLeft className="w-4 h-4" />{labels.back}</Link>
          <div className="flex items-start gap-4">
            <Beaker className="w-10 h-10 mt-1 shrink-0" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold mb-2">{lang === "uk" ? mix.titleUk : mix.titleRu}</h1>
              {culture && (<p className="text-white/80 text-sm">{labels.culture}: <Link href={`${base}/kultury/${culture.slug}`} className="underline">{lang === "uk" ? culture.nameUk : culture.nameRu}</Link></p>)}
            </div>
          </div>
        </div>
      </section>

      <section className="container-w py-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div>
          <div className="card mb-6"><h2 className="font-bold text-lg mb-2">{labels.whyMix}</h2><p className="text-muted leading-relaxed">{lang === "uk" ? mix.descUk : mix.descRu}</p></div>
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2"><Beaker className="w-5 h-5 text-brand" />{labels.components}</h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left">
                <th className="p-2 font-semibold">№</th>
                <th className="p-2 font-semibold">{labels.role}</th>
                <th className="p-2 font-semibold text-right">{labels.rate}</th>
                {hasArea && <th className="p-2 font-semibold text-right">{labels.need}</th>}
                {hasArea && <th className="p-2 font-semibold text-right">{labels.cans}</th>}
                <th className="p-2 font-semibold text-right">{labels.sum}</th>
              </tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="p-2 align-top">
                      {r.slug ? (
                        <Link href={`${base}/produkt/${r.slug}`} className="font-bold text-brand hover:underline">{r.name}</Link>
                      ) : (
                        <p className="font-bold">{r.name}</p>
                      )}
                      <p className="text-xs text-muted">{r.manufacturer} · {r.packSize} {r.unit}</p>
                    </td>
                    <td className="p-2 align-top"><span className="badge badge-econom">{r.role}</span></td>
                    <td className="p-2 align-top text-right whitespace-nowrap">{r.ratePerHa} {r.unit}/га</td>
                    {hasArea && <td className="p-2 align-top text-right whitespace-nowrap">{r.need.toFixed(2)} {r.unit}</td>}
                    {hasArea && <td className="p-2 align-top text-right whitespace-nowrap">{r.cans} {labels.canShort}<br /><span className="text-xs text-muted">= {r.totalVol} {r.unit}</span></td>}
                    <td className="p-2 align-top text-right whitespace-nowrap"><p className="font-bold text-brand">{format(r.sumCash)}</p><p className="text-xs text-muted">{format(r.sumVat)} з ПДВ</p></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside>
          <div className="card lg:sticky lg:top-20 space-y-4">
            <div className="bg-brand/5 rounded-lg p-4 border-2 border-brand/30">
              <p className="text-[11px] uppercase tracking-wide text-muted font-semibold mb-1">{labels.per1ha}</p>
              <p className="text-3xl font-extrabold text-brand">{format(perHaCash)}<span className="text-base font-normal text-muted">/га</span></p>
              <p className="text-xs text-muted mt-0.5">{format(perHaVat)} {t.productCard.priceVat.toLowerCase()}</p>
            </div>

            <div>
              <label className="text-xs text-muted font-semibold uppercase flex items-center gap-1 mb-2"><Calculator className="w-3 h-3" />{labels.area}</label>
              <input type="number" min="1" value={area} onChange={e => setArea(e.target.value)} placeholder="100" className="w-full px-3 py-2.5 rounded-lg border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-lg font-semibold" />
            </div>

            {hasArea ? (
              <>
                <div className="bg-bg rounded-lg p-3">
                  <p className="text-xs text-muted">{t.productCard.priceCash}</p>
                  <p className="text-3xl font-extrabold text-brand">{format(totalCash)}</p>
                  <p className="text-sm text-muted">{format(totalVat)} {t.productCard.priceVat.toLowerCase()}</p>
                </div>
                <button onClick={addAllToCart} className={`btn-primary w-full ${added ? "!bg-brand-dark" : ""}`}>
                  {added ? <><Check className="w-4 h-4" />{labels.added}</> : <><ShoppingCart className="w-4 h-4" />{labels.addAll}</>}
                </button>
              </>
            ) : (<p className="text-sm text-muted text-center py-2">{labels.noArea}</p>)}

            <button onClick={() => setRequestOpen(true)} className="btn-outline w-full">{t.cta.submit}</button>
            <a href={`tel:${COMPANY.phone}`} className="btn-outline w-full"><Phone className="w-4 h-4" />{labels.call}</a>
          </div>
        </aside>
      </section>

      <RequestModal open={requestOpen} onClose={() => setRequestOpen(false)} productName={(lang === "uk" ? mix.titleUk : mix.titleRu) + (hasArea ? ` (${a} га)` : "")} lang={lang} />
    </>
  );
}
