"use client";

import { useState } from "react";
import { X, ShoppingCart, Trash2, Send, Check } from "lucide-react";
import { useCart } from "./CartContext";
import { dict, type Lang } from "@/lib/i18n";
import { PhoneInput, isValidPhone } from "./PhoneInput";

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "https://agrosnab-pivden-form.sdoshenko.workers.dev";

export function CartDrawer({ open, onClose, lang }: { open: boolean; onClose: () => void; lang: Lang }) {
  const t = dict[lang];
  const cart = useCart();
  const [stage, setStage] = useState<"cart" | "form">("cart");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("+380");
  const [region, setRegion] = useState<string>(t.form.regions[0]);
  const [delivery, setDelivery] = useState<string>(t.form.deliveryOpts[0]);
  const [payment, setPayment] = useState<string>(t.form.paymentOpts[0]);
  const [comment, setComment] = useState<string>("");
  const [consent, setConsent] = useState<boolean>(false);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  const labels = lang === "uk"
    ? { title: "Ваш кошик", empty: "Кошик порожній", continueShopping: "Продовжити обирати товари", checkout: "Оформити заявку", total: "Разом", removeAll: "Очистити кошик", products: "товарів" }
    : { title: "Ваша корзина", empty: "Корзина пуста", continueShopping: "Продолжить выбор товаров", checkout: "Оформить заявку", total: "Итого", removeAll: "Очистить корзину", products: "товаров" };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent || !isValidPhone(phone) || cart.items.length === 0) return;
    setStatus("sending");
    const cartText = cart.items.map(i => `• ${i.name} (${i.manufacturer}) — ${i.qty} ${i.unit} × $${i.priceVat} = $${(i.qty * i.priceVat).toFixed(2)}`).join("\n");
    const productSummary = `${cart.items.length} ${labels.products}, ${cart.totalVat.toFixed(2)} $ з ПДВ / ${cart.totalCash.toFixed(2)} $ готівка\n\n${cartText}`;
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "cart",
          name, phone, region, delivery, payment, comment,
          product: productSummary,
          area: "",
          lang
        })
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      cart.clear();
    } catch {
      setStatus("error");
    }
  }

  if (!open) return null;
  const cur = cart.items[0]?.currency === "EUR" ? "€" : "$";

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex justify-end overflow-y-auto" onClick={onClose}>
      <div className="bg-white w-full max-w-md h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {stage === "cart" ? labels.title : t.form.title}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-bg rounded-lg" aria-label="close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {status === "ok" ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/10 text-brand mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t.form.success}</h3>
            <button onClick={onClose} className="btn-outline mt-4">OK</button>
          </div>
        ) : stage === "cart" ? (
          cart.items.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-muted" />
              <p className="text-muted mb-4">{labels.empty}</p>
              <button onClick={onClose} className="btn-outline">{labels.continueShopping}</button>
            </div>
          ) : (
            <>
              <div className="p-4 space-y-3">
                {cart.items.map(i => (
                  <div key={i.slug} className="card !p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-sm">{i.name}</p>
                        <p className="text-xs text-muted">{i.manufacturer} · {i.packaging}</p>
                      </div>
                      <button onClick={() => cart.remove(i.slug)} className="text-muted hover:text-red-600" aria-label="remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-stretch border border-border rounded-lg overflow-hidden text-sm">
                        <button onClick={() => cart.update(i.slug, Math.max(0, i.qty - 1))} className="px-2 hover:bg-bg">−</button>
                        <input type="number" value={i.qty} onChange={e => cart.update(i.slug, Math.max(0, parseInt(e.target.value || "0", 10)))} className="w-12 text-center border-0 focus:outline-none" />
                        <button onClick={() => cart.update(i.slug, i.qty + 1)} className="px-2 hover:bg-bg">+</button>
                        <span className="px-2 text-xs text-muted self-center">{i.unit}</span>
                      </div>
                      <p className="font-bold text-brand">{cur}{(i.qty * i.priceVat).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                <button onClick={() => cart.clear()} className="text-xs text-muted hover:text-red-600 flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> {labels.removeAll}
                </button>
              </div>
              <div className="sticky bottom-0 bg-white border-t border-border p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{t.productCard.priceVat}</span>
                  <span className="font-bold text-brand text-lg">{cur}{cart.totalVat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{t.productCard.priceCash}</span>
                  <span className="font-semibold">{cur}{cart.totalCash.toFixed(2)}</span>
                </div>
                <button onClick={() => setStage("form")} className="btn-primary w-full">
                  {labels.checkout}
                </button>
              </div>
            </>
          )
        ) : (
          <form onSubmit={submit} className="p-4 space-y-3">
            <input type="text" placeholder={t.form.name} value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
            <PhoneInput value={phone} onChange={setPhone} />
            <select value={region} onChange={e => setRegion(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white">
              {t.form.regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={delivery} onChange={e => setDelivery(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white">
              {t.form.deliveryOpts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select value={payment} onChange={e => setPayment(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white">
              {t.form.paymentOpts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <textarea placeholder={t.form.comment} value={comment} onChange={e => setComment(e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none resize-none" />
            <label className="flex items-start gap-2 text-xs text-muted">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5" required />
              <span>{t.form.consent}</span>
            </label>
            <div className="bg-bg p-3 rounded-lg text-sm">
              <div className="flex justify-between"><span className="text-muted">{cart.items.length} {labels.products}</span><span className="font-bold text-brand">{cur}{cart.totalVat.toFixed(2)}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setStage("cart")} className="btn-outline">←</button>
              <button type="submit" disabled={status === "sending" || !consent || !isValidPhone(phone)} className="btn-primary disabled:opacity-50">
                {status === "sending" ? t.form.sending : t.form.submit}
                <Send className="w-4 h-4" />
              </button>
            </div>
            {status === "error" && <p className="text-sm text-red-600 text-center">{t.form.error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
