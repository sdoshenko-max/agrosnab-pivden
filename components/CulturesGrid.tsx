import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cultures } from "@/lib/data";
import { dict, type Lang } from "@/lib/i18n";

export function CulturesGrid({ lang }: { lang: Lang }) {
  const t = dict[lang];
  const base = lang === "uk" ? "" : "/ru";

  return (
    <section id="cultures" className="container-w py-12 lg:py-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-3xl mb-2">{t.cultures.title}</h2>
        <p className="text-muted">{t.cultures.subtitle}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
        {cultures.map(c => (
          <Link
            key={c.slug}
            href={`${base}/kultury/${c.slug}`}
            className="card flex flex-col items-center text-center group hover:border-brand hover:bg-brand/5 hover:shadow-lg transition-all duration-200"
          >
            {c.image ? (
              <img
                src={c.image}
                alt={lang === "uk" ? c.nameUk : c.nameRu}
                loading="lazy"
                className="w-20 h-20 lg:w-24 lg:h-24 mb-3 rounded-full object-cover ring-1 ring-border transition-transform duration-200 group-hover:-translate-y-2 group-hover:scale-110"
              />
            ) : (
              <div className="text-5xl mb-3 transition-transform duration-200 group-hover:-translate-y-2 group-hover:scale-110">{c.emoji}</div>
            )}
            <h3 className="font-bold text-base mb-2 group-hover:text-brand transition-colors">
              {lang === "uk" ? c.nameUk : c.nameRu}
            </h3>
            <p className="text-xs text-muted leading-snug mb-3 line-clamp-3">
              {lang === "uk" ? c.shortUk : c.shortRu}
            </p>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-brand">
              {t.nav.cultures}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
