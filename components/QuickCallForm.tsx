"use client";

import { useState } from "react";
import { Phone, Send, Check } from "lucide-react";
import { dict, type Lang } from "@/lib/i18n";
import { PhoneInput, isValidPhone } from "./PhoneInput";

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "https://agrosnab-pivden-form.sdoshenko.workers.dev";

export function QuickCallForm({ lang }: { lang: Lang }) {
  const t = dict[lang];
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("+380");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPhone(phone)) return;
    setStatus("sending");
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formType: "quick-call", name, phone, lang })
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="quick-call" className="container-w py-12 lg:py-16">
      <div className="bg-gradient-to-br from-brand to-brand-dark rounded-2xl p-8 lg:p-12 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-semibold mb-3">
              <Phone className="w-4 h-4" />
              {t.quickCall.title}
            </div>
            <h2 className="text-2xl lg:text-3xl mb-3">{t.quickCall.title}</h2>
            <p className="text-white/90">{t.quickCall.desc}</p>
          </div>
          {status === "ok" ? (
            <div className="bg-white/15 rounded-xl p-6 text-center">
              <Check className="w-12 h-12 mx-auto mb-3" />
              <p className="font-semibold">{t.form.success}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <input type="text" placeholder={t.form.name} value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-lg text-ink placeholder:text-muted bg-white border-0 focus:ring-2 focus:ring-accent outline-none" />
              <PhoneInput value={phone} onChange={setPhone} placeholder={t.form.phone} className="w-full px-4 py-3 rounded-lg text-ink placeholder:text-muted bg-white border-0 focus:ring-2 focus:ring-accent outline-none" />
              <button type="submit" disabled={status === "sending" || !isValidPhone(phone)} className="w-full btn-primary disabled:opacity-50">
                {status === "sending" ? t.form.sending : t.quickCall.submit}
                <Send className="w-4 h-4" />
              </button>
              {status === "error" && <p className="text-sm text-yellow-200 text-center">{t.form.error}</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
