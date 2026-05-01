import { ArrowRight, Phone } from "lucide-react";
import { dict, type Lang } from "@/lib/i18n";

export function Hero({ lang }: { lang: Lang }) {
  const t = dict[lang];
  return (
    <section className="relative bg-gradient-to-br from-brand via-brand to-brand-dark text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="white" />
          <circle cx="900" cy="300" r="120" fill="white" />
          <circle cx="500" cy="350" r="60" fill="white" />
        </svg>
      </div>
      <div className="container-w py-16 lg:py-24 relative">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
            {t.hero.title}
          </h1>
          <p className="text-lg lg:text-xl text-white/90 mb-8 max-w-2xl">
            {t.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="#cultures" className="btn-primary !bg-accent hover:!bg-accent-dark !text-white">
              {t.hero.cta1}
              <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#quick-call" className="btn-outline !border-white !text-white hover:!bg-white hover:!text-brand">
              <Phone className="w-5 h-5" />
              {t.hero.cta2}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
