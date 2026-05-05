"use client";

import { useState, useEffect } from "react";
import { X, Send, Check, Phone } from "lucide-react";
import { PhoneInput, isValidPhone } from "./PhoneInput";
import { type Lang, COMPANY } from "@/lib/i18n";
import { trackLeadConversion } from "@/lib/analytics";

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "https://agrosnab-pivden-form.sdoshenko.workers.dev";

export function CallbackModal({ open, onClose, lang }: { open: boolean; onClose: () => void; lang: Lang }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape" && open) onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const labels = lang === "uk"
    ? {
        title: "Замовити дзвінок",
        subtitle: "Залиште номер — передзвонимо протягом 15 хвилин у робочий час",
        name: "Ваше імʼя",
        message: "Ваше питання (необовʼязково)",
        submit: "Замовити дзвінок",
        sending: "Надсилаємо…",
        ok: "Дякуємо! Ми звʼяжемося з вами найближчим часом.",
        error: "Не вдалося надіслати. Зателефонуйте нам.",
        callDirect: "Або одразу зателефонуйте",
        close: "Закрити",
        workHours: COMPANY.workHoursUk,
      }
    : {
        title: "Заказать звонок",
        subtitle: "Оставьте номер — перезвоним в течение 15 минут в рабочее время",
        name: "Ваше имя",
        message: "Ваш вопрос (необязательно)",
        submit: "Заказать звонок",
        sending: "Отправляем…",
        ok: "Спасибо! Мы свяжемся с вами в ближайшее время.",
        error: "Не удалось отправить. Позвоните нам.",
        callDirect: "Или позвоните сразу",
        close: "Закрыть",
        workHours: COMPANY.workHoursRu,
      };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPhone(phone) || !name.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formType: "callback", name, phone, comment: message, region: "", delivery: "", payment: "", product: "", area: "", lang })
      });
      if (!res.ok) throw new Error();
      trackLeadConversion({ form_type: "callback" });
      setStatus("ok");
      setTimeout(() => {
        setName(""); setPhone(""); setMessage(""); setStatus("idle"); onClose();
      }, 2200);
    } catch { setStatus("error"); }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><Phone className="w-5 h-5 text-brand" />{labels.title}</h2>
            <p className="text-xs text-muted mt-1">{labels.workHours}</p>
          </div>
          <button onClick={onClose} aria-label={labels.close} className="p-1 -m-1 text-muted hover:text-ink"><X className="w-6 h-6" /></button>
        </div>

        {status === "ok" ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/10 text-brand mb-4"><Check className="w-8 h-8" /></div>
            <h3 className="text-lg font-bold">{labels.ok}</h3>
          </div>
        ) : (
          <form onSubmit={submit} className="p-4 space-y-3">
            <p className="text-sm text-muted">{labels.subtitle}</p>
            <input
              type="text"
              placeholder={labels.name}
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
              autoFocus
            />
            <PhoneInput value={phone} onChange={setPhone} />
            <textarea
              placeholder={labels.message}
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none resize-none"
            />
            <button
              type="submit"
              disabled={status === "sending" || !isValidPhone(phone) || !name.trim()}
              className="btn-primary w-full disabled:opacity-50"
            >
              {status === "sending" ? labels.sending : labels.submit}
              <Send className="w-4 h-4" />
            </button>
            {status === "error" && <p className="text-sm text-red-600 text-center">{labels.error}</p>}
            <p className="text-center text-xs text-muted pt-2">
              {labels.callDirect}: <a href={`tel:${COMPANY.phone}`} className="text-brand font-semibold">{COMPANY.phone}</a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
