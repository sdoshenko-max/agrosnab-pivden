"use client";

import { useState, useEffect } from "react";
import { X, Send, Check } from "lucide-react";
import { dict, type Lang } from "@/lib/i18n";
import { PhoneInput, isValidPhone } from "./PhoneInput";
import { trackLeadConversion } from "@/lib/analytics";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "https://agrosnab-pivden-form.sdoshenko.workers.dev";

export function RequestModal({
  open,
  onClose,
  productName,
  productUrl,
  lang
}: {
  open: boolean;
  onClose: () => void;
  productName?: string;
  productUrl?: string;
  lang: Lang;
}) {
  const t = dict[lang];
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("+380");
  const [region, setRegion] = useState<string>(t.form.regions[0]);
  const [product, setProduct] = useState<string>(productName || "");
  const [area, setArea] = useState<string>("");
  const [delivery, setDelivery] = useState<string>(t.form.deliveryOpts[0]);
  const [payment, setPayment] = useState<string>(t.form.paymentOpts[0]);
  const [comment, setComment] = useState<string>("");
  const [consent, setConsent] = useState<boolean>(false);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  useEffect(() => {
    if (productName) setProduct(productName);
  }, [productName]);

  useLockBodyScroll(open);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent || !isValidPhone(phone)) return;
    setStatus("sending");
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "full",
          name, phone, region, product, area, delivery, payment, comment,
          productUrl: productUrl || (typeof window !== "undefined" ? window.location.pathname : ""),
          lang
        })
      });
      if (!res.ok) throw new Error();
      trackLeadConversion({ form_type: "full", product_name: product, region });
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto overscroll-contain"
      onClick={onClose}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full my-auto" onClick={e => e.stopPropagation()}>
        {status === "ok" ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/10 text-brand mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t.form.success}</h3>
            <button onClick={onClose} className="btn-outline mt-4">OK</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-xl font-bold">{t.form.title}</h3>
              <button onClick={onClose} className="p-1 hover:bg-bg rounded-lg" aria-label="close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submit} className="p-5 space-y-3">
              <input type="text" placeholder={t.form.name} value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
              <PhoneInput value={phone} onChange={setPhone} placeholder={t.form.phone + " *"} />
              <div>
                <label className="text-xs text-muted">{t.form.region}</label>
                <select value={region} onChange={e => setRegion(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white">
                  {t.form.regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted">{t.form.product}</label>
                <input type="text" value={product} onChange={e => setProduct(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted">{t.form.area}</label>
                <input type="number" min="1" value={area} onChange={e => setArea(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted">{t.form.delivery}</label>
                <select value={delivery} onChange={e => setDelivery(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white">
                  {t.form.deliveryOpts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted">{t.form.payment}</label>
                <select value={payment} onChange={e => setPayment(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-white">
                  {t.form.paymentOpts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <textarea placeholder={t.form.comment} value={comment} onChange={e => setComment(e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none resize-none" />
              <label className="flex items-start gap-2 text-xs text-muted">
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5" required />
                <span>{t.form.consent}</span>
              </label>
              <button type="submit" disabled={status === "sending" || !consent || !isValidPhone(phone)} className="w-full btn-primary disabled:opacity-50">
                {status === "sending" ? t.form.sending : t.form.submit}
                <Send className="w-4 h-4" />
              </button>
              {status === "error" && <p className="text-sm text-red-600 text-center">{t.form.error}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
