import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { groups } from "@/lib/groups";
import { products } from "@/lib/data";
import { ArrowRight } from "lucide-react";

export const metadata = { title: "Группы СЗР", description: "Каталог средств защиты растений по группам" };

export default function GroupsRouteRu() {
  return (
    <>
      <Header lang="ru" />
      <main>
        <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
          <div className="container-w py-10">
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">Группы СЗР</h1>
            <p className="text-white/80">Выберите категорию препаратов</p>
          </div>
        </section>
        <section className="container-w py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map(g => {
              const count = products.filter(p => p.groupSlug === g.slug).length;
              return (
                <Link key={g.slug} href={`/ru/grupy/${g.slug}`} className="card hover:border-brand hover:bg-brand/5 hover:shadow-lg transition-all duration-200 group">
                  <div className="text-4xl mb-2 transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-110">{g.emoji}</div>
                  <h2 className="text-lg font-bold mb-1 group-hover:text-brand transition-colors">{g.nameRu}</h2>
                  <p className="text-sm text-muted mb-3">{g.descRu}</p>
                  <span className="text-sm font-semibold text-brand inline-flex items-center gap-1">{count} препаратов<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></span>
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
