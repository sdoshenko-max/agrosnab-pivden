import Link from "next/link";
import { Phone, MapPin, Truck, Calendar, AlertTriangle, MessageCircle, Package } from "lucide-react";
import type { Product } from "@/lib/data";
import type { City } from "@/lib/types";
import { cultures } from "@/lib/cultures";
import { COMPANY } from "@/lib/i18n";
import { getNeighborCities } from "@/lib/cities";
import { CityProductsList } from "./CityProductsList";

export function CityPage({ city, topProducts }: { city: City; topProducts: Product[] }) {
  const cityCultures = cultures.filter(c => city.mainCultureSlugs.includes(c.slug));
  const neighbors = getNeighborCities(city.slug, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `${COMPANY.name} — обслуговування ${city.inCity}`,
    "image": "https://agrosnab-pivden.com/logo.png",
    "url": `https://agrosnab-pivden.com/mista/${city.slug}/`,
    "telephone": COMPANY.phone,
    "email": COMPANY.email,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Миколаїв",
      "addressRegion": "Миколаївська область",
      "addressCountry": "UA"
    },
    "areaServed": {
      "@type": "City",
      "name": city.nameUk,
      "containedInPlace": city.region
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": city.coordinates.lat,
      "longitude": city.coordinates.lng
    }
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Головна", "item": "https://agrosnab-pivden.com/" },
      { "@type": "ListItem", "position": 2, "name": "Регіони", "item": "https://agrosnab-pivden.com/mista/" },
      { "@type": "ListItem", "position": 3, "name": city.nameUk, "item": `https://agrosnab-pivden.com/mista/${city.slug}/` }
    ]
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": city.faq.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* Breadcrumb + H1 + Lead */}
      <section className="bg-bg border-b border-border">
        <div className="container-w py-8 md:py-12">
          <nav className="text-sm text-muted mb-3 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-brand">Головна</Link>
            <span>/</span>
            <Link href="/mista" className="hover:text-brand">Регіони</Link>
            <span>/</span>
            <span>{city.nameUk}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-ink mb-4 leading-tight">
            ЗЗР і агрохімія {city.inCity} — Агроснаб Південь
          </h1>
          <p className="text-base md:text-lg text-muted max-w-3xl leading-relaxed">{city.intro}</p>

          <div className="grid sm:grid-cols-3 gap-3 mt-6">
            <div className="card flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand shrink-0 mt-1" />
              <div>
                <p className="font-bold text-ink">Склад — Миколаїв</p>
                <p className="text-sm text-muted">
                  {city.distanceKm > 0 ? `${city.distanceKm} км до ${city.nameGen}` : "У межах міста"}
                </p>
              </div>
            </div>
            <div className="card flex items-start gap-3">
              <Truck className="w-5 h-5 text-brand shrink-0 mt-1" />
              <div>
                <p className="font-bold text-ink">Швидка доставка</p>
                <p className="text-sm text-muted">Новою Поштою</p>
              </div>
            </div>
            <div className="card flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-brand shrink-0 mt-1" />
              <div>
                <p className="font-bold text-ink">Агроном на зв'язку</p>
                <p className="text-sm text-muted">Консультація безкоштовна</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Карта культур міста */}
      {cityCultures.length > 0 && (
        <section className="container-w py-10 md:py-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Які культури вирощують {city.inCity}
          </h2>
          <p className="text-muted mb-6 max-w-3xl">{city.climateZone}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cityCultures.map(c => (
              <Link
                key={c.slug}
                href={`/kultury/${c.slug}`}
                className="card hover:border-brand hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl shrink-0">{c.emoji}</span>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-brand transition-colors">{c.nameUk}</h3>
                    <p className="text-sm text-muted mt-1 leading-snug">{c.shortUk}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Топ препаратів для зони */}
      {topProducts.length > 0 && (
        <section className="bg-bg border-y border-border py-10 md:py-14">
          <div className="container-w">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Топ препаратів для фермерів {city.inCity}
            </h2>
            <p className="text-muted mb-6 max-w-3xl">
              Підбірка з нашого каталогу під культури і умови регіону.
            </p>
            <CityProductsList products={topProducts} />
            <div className="mt-6 text-center">
              <Link href="/grupy" className="btn-outline inline-flex items-center gap-2">
                <Package className="w-5 h-5" /> Весь каталог
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Сезонний календар */}
      <section className="container-w py-10 md:py-14">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
          <Calendar className="w-7 h-7 text-brand" />
          Календар обробок {city.inCity}
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-bg border-b-2 border-border">
              <tr>
                <th className="text-left py-3 px-4 font-bold w-1/3 md:w-1/4">Період</th>
                <th className="text-left py-3 px-4 font-bold">Що робимо</th>
              </tr>
            </thead>
            <tbody>
              {city.seasonalCalendar.map((s, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-3 px-4 font-semibold text-brand align-top">{s.month}</td>
                  <td className="py-3 px-4 text-ink leading-relaxed">{s.tasks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Найближчий склад */}
      <section className="bg-brand text-white py-10 md:py-14">
        <div className="container-w grid md:grid-cols-2 gap-6 md:gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
              {city.distanceKm > 0
                ? `Найближчий склад — Миколаїв, ${city.distanceKm} км`
                : "Склад у Миколаєві"}
            </h2>
            <p className="opacity-95 mb-3 leading-relaxed">
              {city.distanceKm > 0
                ? `Фізичної точки продажу ${city.inCity} немає — найближчий склад у Миколаєві, ${city.distanceKm} км. Швидка доставка Новою Поштою з нашого складу до найближчого відділення НП ${city.inCity}, або адресно через кур'єра НП.`
                : "Наш склад знаходиться у Миколаєві. Безкоштовна доставка в межах міста, самовивіз без додаткових витрат, для всієї України — Нова Пошта."}
            </p>
            <p className="opacity-95 mb-5 leading-relaxed">
              <strong>Самовивіз</strong> — з нашого складу в Миколаєві{city.distanceKm > 0 ? ` (${city.distanceKm} км трасою)` : ""}.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`tel:${COMPANY.phone}`}
                className="inline-flex items-center gap-2 bg-white text-brand font-bold px-5 py-3 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Phone className="w-5 h-5" /> {COMPANY.phone}
              </a>
              <a
                href={`https://t.me/${COMPANY.telegramUser}`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 border-2 border-white text-white font-bold px-5 py-3 rounded-lg hover:bg-white hover:text-brand transition-colors"
              >
                <MessageCircle className="w-5 h-5" /> Telegram
              </a>
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className="text-6xl md:text-7xl font-extrabold opacity-25 leading-none">
              {city.distanceKm > 0 ? `${city.distanceKm} км` : "Тут"}
            </div>
            <div className="text-base md:text-lg opacity-75 mt-2">
              {city.distanceKm > 0 ? `від Миколаєва до ${city.nameGen}` : "Наш склад і офіс"}
            </div>
          </div>
        </div>
      </section>

      {/* Локальні виклики */}
      <section className="container-w py-10 md:py-14">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
          <AlertTriangle className="w-7 h-7 text-brand" />
          Що найчастіше шкодить полям {city.inCity}
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {city.localChallenges.map((ch, i) => (
            <div key={i} className="card">
              <h3 className="font-bold text-lg mb-2 text-brand leading-snug">{ch.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{ch.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-bg border-y border-border py-10 md:py-14">
        <div className="container-w max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Часті запитання фермерів {city.inCity}
          </h2>
          <div className="space-y-3">
            {city.faq.map((f, i) => (
              <details key={i} className="card group">
                <summary className="cursor-pointer font-bold text-ink hover:text-brand flex items-center justify-between gap-3 list-none">
                  <span className="leading-snug">{f.q}</span>
                  <span className="text-brand text-2xl group-open:rotate-45 transition-transform shrink-0">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-w py-10 md:py-14 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Потрібна консультація?</h2>
        <p className="text-muted mb-6 max-w-2xl mx-auto leading-relaxed">
          Безкоштовна консультація агронома по препаратах і нормах витрати — надішліть фото бур'яну або шкідника у Viber/Telegram, отримайте відповідь за 15 хвилин.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href={`tel:${COMPANY.phone}`} className="btn-primary inline-flex items-center gap-2">
            <Phone className="w-5 h-5" /> Зателефонувати
          </a>
          <a
            href={`https://t.me/${COMPANY.telegramUser}`}
            target="_blank"
            rel="noopener"
            className="btn-outline inline-flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" /> Telegram
          </a>
        </div>
      </section>

      {/* Перелінковка на сусідні міста */}
      {neighbors.length > 0 && (
        <section className="bg-bg border-t border-border py-10 md:py-14">
          <div className="container-w">
            <h2 className="text-xl md:text-2xl font-bold mb-6">Сусідні міста, куди ми возимо</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {neighbors.map(n => (
                <Link
                  key={n.slug}
                  href={`/mista/${n.slug}`}
                  className="card hover:border-brand hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-ink truncate">{n.nameUk}</p>
                      <p className="text-xs text-muted truncate">{n.district}</p>
                    </div>
                    {n.distanceKm > 0 && (
                      <span className="text-sm font-semibold text-brand shrink-0">
                        {n.distanceKm} км
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
