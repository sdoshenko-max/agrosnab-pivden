"use client";

import { useState } from "react";
import { ArrowRight, Phone, TrendingDown, MessageCircle, Truck } from "lucide-react";
import { dict, type Lang } from "@/lib/i18n";
import { CallbackModal } from "./CallbackModal";
import { SaveCard } from "./SaveCard";

export function Hero({ lang }: { lang: Lang }) {
  const t = dict[lang];
  const [callbackOpen, setCallbackOpen] = useState(false);
  const badges = lang === "uk"
    ? [
        { icon: TrendingDown, text: "Економія до 60%", sub: "від ціни оригіналу" },
        { icon: MessageCircle, text: "Агроном онлайн", sub: "відповідь за 15 хв" },
        { icon: Truck, text: "Доставка по всій Україні", sub: "Нова Пошта · самовивіз" },
      ]
    : [
        { icon: TrendingDown, text: "Экономия до 60%", sub: "от цены оригинала" },
        { icon: MessageCircle, text: "Агроном онлайн", sub: "ответ за 15 мин" },
        { icon: Truck, text: "Доставка по всей Украине", sub: "Новая Почта · самовывоз" },
      ];
  const tagline = lang === "uk"
    ? <>Чесні дженерики з ідентичною діючою речовиною. Без переплати за бренд — економія до <b className="bg-accent text-white px-1.5 rounded">60%</b> з тим самим результатом.</>
    : <>Честные дженерики с идентичным действующим веществом. Без переплаты за бренд — экономия до <b className="bg-accent text-white px-1.5 rounded">60%</b> с тем же результатом.</>;

  return (
    <section className="relative bg-brand-dark text-white overflow-hidden">
      {/* Фото-фон: соняшник і соя півдня України */}
      <picture>
        <source srcSet="/hero/hero_v1.webp" type="image/webp" />
        <img
          src="/hero/hero_v1.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
      </picture>
      {/* Затемнення зліва для читабельності тексту */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(20,83,45,0.92) 0%, rgba(20,83,45,0.70) 35%, rgba(20,83,45,0.20) 65%, transparent 90%), linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.25) 100%)",
        }}
      />

      <div className="container-w py-12 lg:py-20 relative">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-center">
          {/* Ліва колонка — заголовок, текст, CTA, плашки переваг */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4 drop-shadow-[0_2px_20px_rgba(0,0,0,0.35)]">{t.hero.title}</h1>
            <p className="text-lg lg:text-xl text-white/95 mb-6 max-w-2xl leading-relaxed">{tagline}</p>
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <a href="#cultures" className="btn-primary !bg-accent hover:!bg-accent-dark !text-white">
                {t.hero.cta1}
                <ArrowRight className="w-5 h-5" />
              </a>
              <button onClick={() => setCallbackOpen(true)} className="btn-outline !border-white !text-white hover:!bg-white hover:!text-brand">
                <Phone className="w-5 h-5" />
                {t.hero.cta2}
              </button>
            </div>
            {/* Плашки переваг */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-3xl">
              {badges.map((b, i) => (
                <div key={i} className="bg-white/10 backdrop-blur border border-white/20 rounded-lg px-3 py-2.5 flex items-center gap-2.5">
                  <b.icon className="w-5 h-5 shrink-0" style={{color: "#fbbf24"}} />
                  <div className="leading-tight">
                    <p className="font-bold text-sm">{b.text}</p>
                    <p className="text-[11px] text-white/70">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Права колонка — клікабельна картка економії з прикладом з каталогу */}
          <div className="flex justify-center lg:justify-end">
            <SaveCard lang={lang} />
          </div>
        </div>
      </div>
    <CallbackModal open={callbackOpen} onClose={() => setCallbackOpen(false)} lang={lang} />
    </section>
  );
}
