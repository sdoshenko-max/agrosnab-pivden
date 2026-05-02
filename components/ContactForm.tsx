"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";
import { PhoneInput, isValidPhone } from "./PhoneInput";
import type { Lang } from "@/lib/i18n";

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "https://agrosnab-pivden-form.sdoshenko.workers.dev";

export function ContactForm({ lang }: { lang: Lang }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  const labels = lang === "uk"
    ? { title: "Напишіть нам", subtitle: "Залишіть повідомлення — відповімо протягом 15 хвилин у робочий час", name: "Ваше імʼя", message: "Ваше питання або повідомлення", send: "Надіслати", sending: "Надсилаємо…", ok: "Дякуємо! Ми звʼяжемося з вами найближчим часом.", error: "Не вдалося надіслати. Спробуйте ще раз або зателефонуйте." }
    : { title: "Напишите нам", subtitle: "Оставьте сообщение — ответим в течение 15 минут в рабочее время", name: "Ваше имя", message: "Ваш вопрос или сообщение", send: "Отправить", sending: "Отправляем…", ok: "Спасибо! Мы свяжемся с вами в ближайшее время.", error: "Не удалось отправить. Попробуйте ещё раз или позвоните." };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPhone(phone) || !name.trim() || !message.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formType: "contact", name, phone, comment: message, region: "", delivery: "", payment: "", product: "", area: "", lang })
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      setName(""); setPhone(""); setMessage("");
    } catch { setStatus("error"); }
  }

  if (status === "ok") {
    return (
      <div className="card text-center py-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/10 text-brand mb-4"><Check className="w-8 h-8" /></div>
        <h3 className="text-xl font-bold mb-2">{labels.ok}</h3>
        <button onClick={() => setStatus("idle")} className="btn-outline mt-4">OK</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <div>
        <h3 className="font-bold text-lg mb-1">{labels.title}</h3>
        <p className="text-sm text-muted">{labels.subtitle}</p>
      </div>
      <input
        type="text"
        placeholder={labels.name}
        value={name}
        onChange={e => setName(e.target.value)}
        required
        className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
      />
      <PhoneInput value={phone} onChange={setPhone} />
      <textarea
        placeholder={labels.message}
        value={message}
        onChange={e => setMessage(e.target.value)}
        required
        rows={4}
        className="w-full px-4 py-2.5 rounded-lg border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none resize-none"
      />
      <button
        type="submit"
        disabled={status === "sending" || !isValidPhone(phone) || !name.trim() || !message.trim()}
        className="btn-primary w-full disabled:opacity-50"
      >
        {status === "sending" ? labels.sending : labels.send}
        <Send className="w-4 h-4" />
      </button>
      {status === "error" && <p className="text-sm text-red-600 text-center">{labels.error}</p>}
    </form>
  );
}
