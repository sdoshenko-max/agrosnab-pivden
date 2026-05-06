"use client";

import { useState, useMemo } from "react";
import { Calculator, ShoppingCart, Check, Info, AlertCircle } from "lucide-react";
import { type Product, getPackSize } from "@/lib/data";
import { type Lang } from "@/lib/i18n";
import { useCart } from "./CartContext";
import { useCurrency } from "./CurrencyContext";

export function AgronomistCalculator({ product, lang }: { product: Product; lang: Lang }) {
  const cart = useCart();
  const { format } = useCurrency();
  const [area, setArea] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [added, setAdded] = useState<boolean>(false);
  const packSize = getPackSize(product.packaging);

  const defaultRate = useMemo(() => {
    const m = product.rate.match(/[\d.,]+/g);
    if (m && m.length >= 2) return ((parseFloat(m[0].replace(",", ".")) + parseFloat(m[1].replace(",", "."))) / 2).toFixed(2);
    if (m && m.length === 1) return m[0].replace(",", ".");
    return "";
  }, [product.rate]);

  const result = useMemo(() => {
    const a = parseFloat(area);
    const r = parseFloat(rate || defaultRate);
    if (!a || !r) return null;
    const total = a * r;
    const cansCeil = packSize > 0 ? Math.ceil(total / packSize) : 0;
    const cansFloor = packSize > 0 ? Math.floor(total / packSize) : 0;
    const volCeil = cansCeil * packSize;
    const volFloor = cansFloor * packSize;
    const surplus = volCeil - total;
    const shortage = total - volFloor;
    const extraHa = surplus / r;
    const shortHa = shortage / r;
    const priceCeil = volCeil * product.priceCash;
    const priceFloor = volFloor * product.priceCash;
    const priceVatCeil = volCeil * product.priceVat;
    const priceVatFloor = volFloor * product.priceVat;
    const isExact = Math.abs(surplus) < 0.01;
    return { area: a, rate: r, total, cansCeil, cansFloor, volCeil, volFloor, surplus, shortage, extraHa, shortHa, priceCeil, priceFloor, priceVatCeil, priceVatFloor, isExact };
  }, [area, rate, defaultRate, product, packSize]);

  const labels = lang === "uk"
    ? { title: "Калькулятор агронома", area: "Площа поля, га", rate: "Норма витрати", need: "Потрібно за нормою", buyFull: "Повне покриття", buySave: "Купити менше", cansLabel: "каністр", vatLabel: "з ПДВ", added: "Додано в кошик", surplusTpl: "{vol} {unit} = вистачить на всю площу. Залишок {surplus} {unit} ({extra} га).", shortageTpl: "{vol} {unit} = вистачить тільки на {covered} га. Не вистачить {short} {unit} — потрібно докупити ще 1 каністру.", exactInfo: "Рівно під вашу площу — без залишку." }
    : { title: "Калькулятор агронома", area: "Площадь поля, га", rate: "Норма расхода", need: "Нужно по норме", buyFull: "Полное покрытие", buySave: "Купить меньше", cansLabel: "канистр", vatLabel: "с НДС", added: "Добавлено в корзину", surplusTpl: "{vol} {unit} = хватит на всю площадь. Остаток {surplus} {unit} ({extra} га).", shortageTpl: "{vol} {unit} = хватит только на {covered} га. Не хватит {short} {unit} — нужно докупить ещё 1 канистру.", exactInfo: "Ровно под вашу площадь — без остатка." };

  function fmt(n: number, dec: number = 1): string {
    return packSize % 1 ? n.toFixed(dec) : n.toFixed(0);
  }

  function tplSurplus(vol: number, surplus: number, extra: number): string {
    return labels.surplusTpl
      .replace("{vol}", fmt(vol)).replace(/{unit}/g, product.unit)
      .replace("{surplus}", surplus.toFixed(1))
      .replace("{extra}", extra.toFixed(1));
  }

  function tplShortage(vol: number, short: number, covered: number): string {
    return labels.shortageTpl
      .replace("{vol}", fmt(vol)).replace(/{unit}/g, product.unit)
      .replace("{covered}", covered.toFixed(1))
      .replace("{short}", short.toFixed(1));
  }

  function addToCart(qty: number) {
    if (!result) return;
    cart.add({
      slug: product.slug, name: lang === "uk" ? product.name : product.nameRu,
      manufacturer: product.manufacturer, packaging: product.packaging, packSize,
      unit: product.unit, qty,
      priceVat: product.priceVat, priceCash: product.priceCash, currency: product.currency
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="card bg-bg">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="w-5 h-5 text-brand" />
        <h3 className="font-bold text-lg">{labels.title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-muted">{labels.area}</label>
          <input type="number" min="1" max="100000" step="1" value={area} onChange={e => { const v = e.target.value; if (v === "" || (parseFloat(v) >= 0 && parseFloat(v) <= 100000)) setArea(v); }} placeholder="100" className="w-full px-3 py-2 rounded-lg border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
        </div>
        <div>
          <label className="text-xs text-muted">{labels.rate} ({product.unit}/га)</label>
          <input type="number" min="0.01" max="20" step="0.01" value={rate} onChange={e => { const v = e.target.value; if (v === "" || (parseFloat(v) >= 0 && parseFloat(v) <= 20)) setRate(v); }} placeholder={defaultRate || product.rate} className="w-full px-3 py-2 rounded-lg border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
        </div>
      </div>
      {result && (
        <div className="bg-white rounded-lg p-3 space-y-3 text-sm border border-border">
          <div className="flex justify-between text-muted">
            <span>{labels.need}:</span>
            <span className="font-semibold text-ink">{result.total.toFixed(2)} {product.unit}</span>
          </div>

          {/* Полное покрытие — основной выбор */}
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-wide text-brand font-bold">{labels.buyFull}</span>
              <div className="text-right">
                <div className="font-bold text-brand text-xl whitespace-nowrap">{format(result.priceCeil, product.currency)}</div>
                <div className="text-[11px] text-muted whitespace-nowrap">{format(result.priceVatCeil, product.currency)} {labels.vatLabel}</div>
              </div>
            </div>
            <p className="flex items-start gap-1.5 text-xs text-muted bg-brand/5 p-2 rounded leading-snug">
              <Info className="w-3.5 h-3.5 text-brand mt-0.5 shrink-0" />
              <span><b className="text-ink">{result.cansCeil} {labels.cansLabel} × {product.packaging}</b> = {result.isExact ? labels.exactInfo : tplSurplus(result.volCeil, result.surplus, result.extraHa)}</span>
            </p>
            <button onClick={() => addToCart(result.cansCeil)} className={`btn-primary w-full !py-2 text-sm ${added ? "!bg-brand-dark" : ""}`}>
              {added ? <><Check className="w-4 h-4" />{labels.added}</> : <><ShoppingCart className="w-4 h-4" />{result.cansCeil} {labels.cansLabel}</>}
            </button>
          </div>

          {/* Альтернатива «купить меньше» */}
          {!result.isExact && result.cansFloor > 0 && (
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-wide text-muted font-semibold">{labels.buySave}</span>
                <div className="text-right">
                  <div className="font-semibold text-ink text-lg whitespace-nowrap">{format(result.priceFloor, product.currency)}</div>
                  <div className="text-[11px] text-muted whitespace-nowrap">{format(result.priceVatFloor, product.currency)} {labels.vatLabel}</div>
                </div>
              </div>
              <p className="flex items-start gap-1.5 text-xs text-muted bg-amber-50 border border-amber-200 p-2 rounded leading-snug">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                <span><b className="text-ink">{result.cansFloor} {labels.cansLabel} × {product.packaging}</b> = {tplShortage(result.volFloor, result.shortage, result.area - result.shortHa)}</span>
              </p>
              <button onClick={() => addToCart(result.cansFloor)} className="btn-outline w-full !py-2 text-sm">
                <ShoppingCart className="w-4 h-4" />{result.cansFloor} {labels.cansLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
