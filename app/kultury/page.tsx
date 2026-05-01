import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { cultures, products } from "@/lib/data";
import { ArrowRight } from "lucide-react";

export const metadata = { title: "Культури", description: "Захист культур: пшениця, соняшник, кукурудза, соя, ріпак та інші" };

export default function CulturesRoute() {
  return (
    <>
      <Header lang="uk" />
      <main>
        <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
          <div className="container-w py-10">
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">Культури</h1>
            <p className="text-white/80">Виберіть культуру — отримайте готову схему захисту</p>
          </div>
        </section>
        <section className="container-w py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cultures.map(c => {
              const count = products.filter(p => p.cultures.includes(c.slug)).length;
              return (
                <Link key={c.slug} href={`/kultury/${c.slug}`} className="card hover:border-brand group overflow-hidden !p-0">
                  {c.image ? (
                    <div className="aspect-[16/10] overflow-hidden bg-bg"><img src={c.image} alt={c.nameUk} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div>
                  ) : (<div className="aspect-[16/10] bg-bg flex items-center justify-center text-6xl">{c.emoji}</div>)}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{c.emoji}</span>
                      <h2 className="text-lg font-bold group-hover:text-brand">{c.nameUk}</h2>
                    </div>
                    <p className="text-sm text-muted mb-3 line-clamp-2">{c.shortUk}</p>
                    <span className="text-sm font-semibold text-brand inline-flex items-center gap-1">{count} препаратів<ArrowRight className="w-4 h-4" /></span>
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
