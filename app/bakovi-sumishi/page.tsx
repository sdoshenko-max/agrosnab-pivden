import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { tankMixes, cultures } from "@/lib/data";
import { Beaker, ArrowRight } from "lucide-react";

export const metadata = { title: "Готові бакові суміші", description: "Перевірені комбінації препаратів для Півдня України" };

export default function MixesList() {
  return (
    <>
      <Header lang="uk" />
      <main>
        <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
          <div className="container-w py-10">
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">Готові бакові суміші</h1>
            <p className="text-white/80">Перевірені комбінації препаратів для типових ситуацій на Півдні України</p>
          </div>
        </section>
        <section className="container-w py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tankMixes.map(m => {
              const total = m.components.reduce((s, c) => s + c.priceCash, 0);
              const culture = cultures.find(c => c.slug === m.cultureSlug);
              return (
                <Link key={m.slug} href={`/bakovi-sumishi/${m.slug}`} className="card flex flex-col group hover:border-brand">
                  <div className="flex items-center gap-2 mb-2">
                    <Beaker className="w-5 h-5 text-brand" />
                    {culture && <span className="text-xs text-muted">{culture.nameUk} {culture.emoji}</span>}
                  </div>
                  <h2 className="font-bold mb-2 group-hover:text-brand">{m.titleUk}</h2>
                  <p className="text-sm text-muted mb-3 leading-snug">{m.descUk}</p>
                  <div className="text-xs text-muted mb-3">{m.components.length} препаратів</div>
                  <div className="mt-auto pt-3 border-t border-border flex justify-between items-center">
                    <span className="font-bold text-brand">${total.toFixed(2)}</span>
                    <ArrowRight className="w-4 h-4 text-brand" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <Footer lang="uk" />
      <FloatingCallButton />
    </>
  );
}
