"use client";

import { useState } from "react";
import { Sprout, Send, Check } from "lucide-react";
import { type Lang } from "@/lib/i18n";
import { PhoneInput, isValidPhone } from "./PhoneInput";

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "https://agrosnab-pivden-form.sdoshenko.workers.dev";

const STR = {
  uk: {
    badge: "Безкоштовна консультація агронома",
    title: "Не впевнені, чи це саме той препарат?",
    desc: "Опишіть вашу проблему — підкажемо, який препарат потрібен, у якій нормі і коли вносити. Передзвонимо протягом 15 хвилин у робочий час.",
    name: "Ім'я",
    phone: "Телефон",
    problem: "Опишіть проблему: культура, фаза, що бачите на полі (необов'язково)",
    submit: "Отримати консультацію",
    sending: "Відправляємо...",
    success: "Дякуємо! Агроном передзвонить найближчим часом.",
    error: "Помилка відправки. Спробуйте ще раз або зателефонуйте нам.",
  },
  ru: {
    badge: "Бесплатная консультация агронома",
    title: "Не уверены, что это нужный препарат?",
    desc: "Опишите вашу проблему — подскажем, какой препарат нужен, в какой норме и когда вносить. Перезвоним в течение 15 минут в рабочее время.",
    name: "Имя",
    phone: "Телефон",
    problem: "Опишите проблему: культура, фаза, что видите на поле (необязательно)",
    submit: "Получить консультацию",
    sending: "Отправляем...",
    success: "Спасибо! Агроном перезвонит в ближайшее время.",
    error: "Ошибка отправки. Попробуйте ещё раз или позвоните нам.",
  },
} as const;

export function ConsultationForm({
  lang,
  productName,
  productSlug,
}: {
  lang: Lang;
  productName: string;
  productSlug: string;
}) {
  const s = STR[lang];
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+380");
  const [problem, setProblem] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPhone(phone)) return;
    setStatus("sending");
    try {
      const productUrl = typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : `/produkt/${productSlug}`;
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "consultation",
          name,
          phone,
          product: productName,
          productUrl,
          comment: problem,
          lang,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="container-w py-8">
      <div className="bg-gradient-to-br from-brand to-brand-dark rounded-2xl p-6 lg:p-10 text-white shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-semibold mb-3">
              <Sprout className="w-4 h-4" />
              {s.badge}
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold mb-3">{s.title}</h2>
            <p className="text-white/90 leading-relaxed">{s.desc}</p>
          </div>
          {status === "ok" ? (
            <div className="bg-white/15 rounded-xl p-8 text-center">
              <Check className="w-14 h-14 mx-auto mb-3" />
              <p className="font-semibold text-lg">{s.success}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <input
                type="text"
                placeholder={s.name}
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-ink placeholder:text-muted bg-white border-0 focus:ring-2 focus:ring-accent outline-none"
              />
              <PhoneInput
                value={phone}
                onChange={setPhone}
                placeholder={s.phone}
                className="w-full px-4 py-3 rounded-lg text-ink placeholder:text-muted bg-white border-0 focus:ring-2 focus:ring-accent outline-none"
              />
              <textarea
                placeholder={s.problem}
                value={problem}
                onChange={e => setProblem(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 rounded-lg text-ink placeholder:text-muted bg-white border-0 focus:ring-2 focus:ring-accent outline-none resize-none"
              />
              <button
                type="submit"
                disabled={status === "sending" || !isValidPhone(phone)}
                className="w-full bg-accent hover:bg-accent-dark text-white font-bold px-6 py-3 rounded-lg inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "sending" ? s.sending : s.submit}
                <Send className="w-4 h-4" />
              </button>
              {status === "error" && <p className="text-sm text-yellow-200 text-center">{s.error}</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
