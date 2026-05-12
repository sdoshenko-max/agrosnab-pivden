import Link from "next/link";
import { MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { cities } from "@/lib/cities";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Регіони обслуговування — міста Миколаївської області | Агроснаб Південь",
  description: "Засоби захисту рослин для фермерів Миколаївщини. Доставка Новою Поштою зі складу в Миколаєві у Вознесенськ, Первомайськ, Баштанку, Новий Буг, Очаків та інші міста.",
  alternates: { canonical: "https://agrosnab-pivden.com/mista/" },
};

export default function MistaIndex() {
  const sorted = [...cities].sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <>
      <Header lang="uk" />
      <main>
        <section className="bg-bg border-b border-border">
          <div className="container-w py-8 md:py-12">
            <nav className="text-sm text-muted mb-3 flex items-center gap-1.5 flex-wrap">
              <Link href="/" className="hover:text-brand">Головна</Link>
              <span>/</span>
              <span>Регіони</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-bold text-ink mb-4 leading-tight">
              Регіони обслуговування — Миколаївська область
            </h1>
            <p className="text-base md:text-lg text-muted max-w-3xl leading-relaxed">
              Працюємо з фермерами по всій Миколаївщині. Склад у Миколаєві — швидка доставка Новою Поштою у будь-яке відділення області, самовивіз без додаткових витрат. Для кожного міста зібрали локальну специфіку: культури, типові виклики, календар обробок, рекомендовані препарати.
            </p>
          </div>
        </section>

        <section className="container-w py-10 md:py-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map(c => (
              <Link
                key={c.slug}
                href={`/mista/${c.slug}`}
                className="card hover:border-brand hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                    <div>
                      <h2 className="font-bold text-lg group-hover:text-brand transition-colors leading-tight">
                        {c.nameUk}
                      </h2>
                      <p className="text-xs text-muted mt-0.5">{c.district}</p>
                    </div>
                  </div>
                  {c.distanceKm > 0 ? (
                    <span className="text-sm font-bold text-brand whitespace-nowrap shrink-0">
                      {c.distanceKm} км
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-brand whitespace-nowrap shrink-0">
                      Склад
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted leading-snug line-clamp-3">{c.climateZone}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer lang="uk" />
      <FloatingCallButton />
    </>
  );
}
