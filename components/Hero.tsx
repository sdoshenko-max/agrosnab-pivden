import { ArrowRight, Phone, TrendingDown, MessageCircle, Truck } from "lucide-react";
import { dict, type Lang } from "@/lib/i18n";

export function Hero({ lang }: { lang: Lang }) {
  const t = dict[lang];
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
    <section className="relative bg-gradient-to-br from-brand via-brand to-brand-dark text-white overflow-hidden">
      {/* SVG-фон з полем соняшників */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#166534" />
            </linearGradient>
          </defs>
          <rect width="1200" height="350" fill="url(#sky)" opacity="0.5" />
          <path d="M0,400 Q300,380 600,400 T1200,400 L1200,500 L0,500 Z" fill="#22c55e" opacity="0.6" />
          <path d="M0,440 Q400,420 800,440 T1200,440 L1200,500 L0,500 Z" fill="#166534" opacity="0.7" />
          {[...Array(8)].map((_, i) => (
            <g key={i} transform={`translate(${100 + i * 150}, ${380 - (i % 2) * 20})`}>
              <line x1="0" y1="0" x2="0" y2="60" stroke="#15803d" strokeWidth="3" />
              <circle cx="0" cy="0" r="14" fill="#fbbf24" />
              <circle cx="0" cy="0" r="6" fill="#78350f" />
            </g>
          ))}
        </svg>
      </div>
      <div className="container-w py-12 lg:py-20 relative">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">{t.hero.title}</h1>
          <p className="text-lg lg:text-xl text-white/95 mb-6 max-w-2xl leading-relaxed">{tagline}</p>
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <a href="#cultures" className="btn-primary !bg-accent hover:!bg-accent-dark !text-white">
              {t.hero.cta1}
              <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#quick-call" className="btn-outline !border-white !text-white hover:!bg-white hover:!text-brand">
              <Phone className="w-5 h-5" />
              {t.hero.cta2}
            </a>
          </div>
          {/* Плашки переваг */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-3xl">
            {badges.map((b, i) => (
              <div key={i} className="bg-white/10 backdrop-blur border border-white/20 rounded-lg px-3 py-2.5 flex items-center gap-2.5">
                <b.icon className="w-5 h-5 shrink-0 text-accent-light" style={{color: "#fbbf24"}} />
                <div className="leading-tight">
                  <p className="font-bold text-sm">{b.text}</p>
                  <p className="text-[11px] text-white/70">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
