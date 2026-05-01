import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { cultures, products } from "@/lib/data";
import { ArrowRight } from "lucide-react";

export const metadata = { title: "Культуры", description: "Защита культур: пшеница, подсолнечник, кукуруза, соя, рапс и другие" };

export default function CulturesRouteRu() {
  return (
    <>
      <Header lang="ru" />
      <main>
        <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
          <div className="container-w py-10">
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">Культуры</h1>
            <p className="text-white/80">Выберите культуру — получите готовую схему защиты</p>
          </div>
        </section>
        <section className="container-w py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cultures.map(c => {
              const count = products.filter(p => p.cultures.includes(c.slug)).length;
              return (
                <Link key={c.slug} href={`/ru/kultury/${c.slug}`} className="card hover:border-brand hover:shadow-lg transition-all duration-200 group overflow-hidden !p-0">
                  {c.image ? (
                    <div className="aspect-[16/10] overflow-hidden bg-bg"><img src={c.image} alt={c.nameRu} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" /></div>
                  ) : (<div className="aspect-[16/10] bg-bg flex items-center justify-center text-6xl transition-transform duration-200 group-hover:scale-110">{c.emoji}</div>)}
                  <div className="p-5 group-hover:bg-brand/5 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl transition-transform duration-200 group-hover:-translate-y-1">{c.emoji}</span>
                      <h2 className="text-lg font-bold group-hover:text-brand transition-colors">{c.nameRu}</h2>
                    </div>
                    <p className="text-sm text-muted mb-3 line-clamp-2">{c.shortRu}</p>
                    <span className="text-sm font-semibold text-brand inline-flex items-center gap-1">{count} препаратов<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <Footer lang="ru" />
      <FloatingCallButton />
    </>
  );
}
