"use client";

import { useState } from "react";
import { Sprout, Send, Check, MessageCircle, Phone as PhoneIcon } from "lucide-react";
import { dict, type Lang, COMPANY } from "@/lib/i18n";
import { PhoneInput, isValidPhone } from "./PhoneInput";

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "https://agrosnab-pivden-form.sdoshenko.workers.dev";

type ContactMethod = "call" | "telegram" | "viber";

export function ProblemPicker({ lang }: { lang: Lang }) {
  const t = dict[lang].problemPicker;
  const [problemText, setProblemText] = useState<string>("");
  const [phone, setPhone] = useState<string>("+380");
  const [contactMethod, setContactMethod] = useState<ContactMethod>("call");
  const [selectedScenario, setSelectedScenario] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  function handleChip(scenario: typeof t.scenarios[number]) {
    setSelectedScenario(scenario.id);
    setProblemText(scenario.prefill);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPhone(phone)) return;
    setStatus("sending");
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "problem-picker",
          source: "problem_picker_home",
          selected_scenario: selectedScenario,
          problem_text: problemText,
          phone,
          contact_method: contactMethod,
          page_url: typeof window !== "undefined" ? window.location.href : "",
          lang
        })
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="problem-picker" className="container-w py-6 lg:py-10">
      <div className="rounded-2xl border border-brand/20 bg-gradient-to-br from-white to-green-50/60 p-4 sm:p-6 lg:p-8 shadow-sm lg:shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Колонка 1 — заголовок + опис + переваги (на desktop) */}
          <div>
            <div className="inline-flex items-center gap-1.5 bg-brand/10 text-brand px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold mb-3">
              <Sprout className="w-3.5 h-3.5" aria-hidden="true" />
              {t.badge}
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight mb-2 text-ink">
              {t.title}
            </h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed mb-3">
              {t.subtitle}
            </p>
            <p className="text-xs sm:text-sm text-muted/80 italic leading-snug">
              {t.example}
            </p>

            <ul className="hidden lg:block mt-6 space-y-2 text-sm">
              {t.benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-2 text-ink">
                  <Check className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Колонка 2 — chips + форма */}
          <div>
            {status === "ok" ? (
              <div className="bg-brand/10 border border-brand/30 rounded-xl p-5 sm:p-6 text-center">
                <Check className="w-10 h-10 mx-auto mb-3 text-brand" aria-hidden="true" />
                <p className="font-semibold text-ink leading-snug">{t.success}</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label={t.title}>
                  {t.scenarios.map((s) => {
                    const active = selectedScenario === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleChip(s)}
                        aria-pressed={active}
                        className={`text-xs sm:text-sm px-3 py-1.5 rounded-full border transition-colors min-h-[36px] ${
                          active
                            ? "bg-brand text-white border-brand"
                            : "bg-white text-ink border-border hover:border-brand"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={submit} className="space-y-3">
                  <textarea
                    value={problemText}
                    onChange={(e) => setProblemText(e.target.value)}
                    placeholder={t.problemPlaceholder}
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-lg border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none bg-white text-ink placeholder:text-muted text-sm resize-y min-h-[96px]"
                  />

                  <PhoneInput value={phone} onChange={setPhone} />

                  <div>
                    <p className="text-xs text-muted mb-1.5">{t.contactLabel}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(["call", "telegram", "viber"] as const).map((m) => {
                        const active = contactMethod === m;
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setContactMethod(m)}
                            aria-pressed={active}
                            className={`text-xs sm:text-sm px-2 py-2 rounded-lg border transition-colors min-h-[40px] ${
                              active
                                ? "bg-brand/10 border-brand text-brand font-semibold"
                                : "bg-white border-border text-ink hover:border-brand"
                            }`}
                          >
                            {t.contactMethods[m]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={status === "sending" || !isValidPhone(phone)}
                    className="w-full btn-primary disabled:opacity-50 py-3 text-sm sm:text-base"
                  >
                    {status === "sending" ? t.sending : t.submit}
                    <Send className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <a
                    href={`https://t.me/${COMPANY.telegramUser}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-event="problem_picker_telegram_click"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-brand/30 text-brand text-sm font-medium hover:bg-brand/5 transition-colors min-h-[40px]"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    {t.telegramPhoto}
                  </a>

                  {status === "error" && (
                    <p className="text-sm text-red-600 text-center">{t.error}</p>
                  )}
                </form>
              </>
            )}

            {/* Преимущества на мобиле — под формой */}
            <ul className="lg:hidden mt-4 grid grid-cols-1 gap-1.5 text-xs text-muted">
              {t.benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-brand shrink-0" aria-hidden="true" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
