"use client";

import { useState, useMemo } from "react";
import { Calculator, ShoppingCart, Check } from "lucide-react";
import type { Product } from "@/lib/data";
import { dict, type Lang } from "@/lib/i18n";
import { useCart } from "./CartContext";

export function AgronomistCalculator({ product, lang }: { product: Product; lang: Lang }) {
  const t = dict[lang];
  const cart = useCart();
  const [area, setArea] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [added, setAdded] = useState<boolean>(false);

  const defaultRate = useMemo(() => {
    const m = product.rate.match(/[\d.,]+/g);
    if (m && m.length >= 2) {
      const avg = (parseFloat(m[0].replace(",", ".")) + parseFloat(m[1].replace(",", "."))) / 2;
      return avg.toFixed(2);
    }
    if (m && m.length === 1) return m[0].replace(",", ".");
    return "";
  }, [product.rate]);

  const result = useMemo(() => {
    const a = parseFloat(area);
    const r = parseFloat(rate || defaultRate);
    if (!a || !r) return null;
    const total = a * r;
    const packSize = parseFloat((product.packaging.match(/[\d.,]+/) || ["1"])[0].replace(",", "."));
    const cans = packSize > 0 ? Math.ceil(total / packSize) : 0;
    const priceVat = +(total * product.priceVat).toFixed(2);
    const priceCash = +(total * product.priceCash).toFixed(2);
    return { total: total, totalStr: total.toFixed(2), cans, priceVat, priceCash };
  }, [area, rate, defaultRate, product]);

  const titles = lang === "uk"
    ? { title: "Калькулятор агронома", area: "Площа поля, га", rate: "Норма витрати", total: "Загальна потреба", cans: "Каністри", priceV: "Сума з ПДВ", priceC: "Сума готівкою", addCart: "Додати в кошик", added: "Додано в кошик" }
    : { title: "Калькулятор агронома", area: "Площадь поля, га", rate: "Норма расхода", total: "Общая потребность", cans: "Канистры", priceV: "Сумма с НДС", priceC: "Сумма наличными", addCart: "Добавить в корзину", added: "Добавлено в корзину" };

  function addToCart() {
    if (!result) return;
    cart.add({
      slug: product.slug,
      name: lang === "uk" ? product.name : product.nameRu,
      manufacturer: product.manufacturer,
      packaging: product.packaging,
      unit: product.unit,
      qty: Math.round(result.total * 100) / 100,
      priceVat: product.priceVat,
      priceCash: product.priceCash,
      currency: product.currency
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="card bg-bg">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="w-5 h-5 text-brand" />
        <h3 className="font-bold text-lg">{titles.title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-muted">{titles.area}</label>
          <input type="number" min="1" value={area} onChange={e => setArea(e.target.value)} placeholder="100" className="w-full px-3 py-2 rounded-lg border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
        </div>
        <div>
          <label className="text-xs text-muted">{titles.rate} ({product.unit}/га)</label>
          <input type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)} placeholder={defaultRate || product.rate} className="w-full px-3 py-2 rounded-lg border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
        </div>
      </div>
      {result && (
        <>
          <div className="bg-white rounded-lg p-3 space-y-1.5 text-sm border border-border">
            <div className="flex justify-between"><span className="text-muted">{titles.total}:</span><span className="font-semibold">{result.totalStr} {product.unit}</span></div>
            <div className="flex justify-between"><span className="text-muted">{titles.cans} ({product.packaging}):</span><span className="font-semibold">{result.cans}</span></div>
            <div className="flex justify-between border-t border-border pt-1.5 mt-1.5"><span className="text-muted">{titles.priceV}:</span><span className="font-bold text-brand">${result.priceVat}</span></div>
            <div className="flex justify-between"><span className="text-muted">{titles.priceC}:</span><span className="font-semibold">${result.priceCash}</span></div>
          </div>
          <button onClick={addToCart} className={`w-full mt-3 ${added ? "btn-secondary" : "btn-primary"}`}>
            {added ? <><Check className="w-4 h-4" />{titles.added}</> : <><ShoppingCart className="w-4 h-4" />{titles.addCart} ({result.totalStr} {product.unit})</>}
          </button>
        </>
      )}
    </div>
  );
}
