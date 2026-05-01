import Link from "next/link";
import { groups } from "@/lib/groups";
import { products } from "@/lib/data";
import type { Lang } from "@/lib/i18n";

export function GroupsStrip({ lang }: { lang: Lang }) {
  const base = lang === "uk" ? "" : "/ru";
  const title = lang === "uk" ? "Каталог за групами" : "Каталог по группам";
  return (
    <section className="container-w pb-8">
      <h2 className="text-xl lg:text-2xl mb-3">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {groups.map(g => {
          const count = products.filter(p => p.groupSlug === g.slug).length;
          return (
            <Link key={g.slug} href={`${base}/grupy/${g.slug}`}
              className="card !p-3 flex flex-col items-center text-center hover:border-brand group">
              <div className="text-3xl mb-1">{g.emoji}</div>
              <p className="font-bold text-sm group-hover:text-brand">{lang === "uk" ? g.nameUk : g.nameRu}</p>
              <p className="text-xs text-muted">{count}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
