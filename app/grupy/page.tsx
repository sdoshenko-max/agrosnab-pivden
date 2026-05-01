import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { groups } from "@/lib/groups";
import { products } from "@/lib/data";
import { activeIngredients } from "@/lib/activeIngredients";
import { ArrowRight, FlaskConical } from "lucide-react";

export const metadata = { title: "Групи ЗЗР", description: "Каталог засобів захисту рослин за групами" };

export default function GroupsRoute() {
  return (
    <>
      <Header lang="uk" />
      <main>
        <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
          <div className="container-w py-10">
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">Групи ЗЗР</h1>
            <p className="text-white/80">Виберіть категорію препаратів</p>
          </div>
        </section>
        <section className="container-w py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map(g => {
              const count = products.filter(p => p.groupSlug === g.slug).length;
              return (
                <Link key={g.slug} href={`/grupy/${g.slug}`} className="card hover:border-brand group">
                  <div className="text-4xl mb-2">{g.emoji}</div>
                  <h2 className="text-lg font-bold mb-1 group-hover:text-brand">{g.nameUk}</h2>
                  <p className="text-sm text-muted mb-3">{g.descUk}</p>
                  <span className="text-sm font-semibold text-brand inline-flex items-center gap-1">{count} препаратів<ArrowRight className="w-4 h-4" /></span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Або шукайте за діючою речовиною */}
        <section className="bg-white border-t border-border py-10">
          <div className="container-w">
            <div className="flex items-center gap-2 mb-2">
              <FlaskConical className="w-5 h-5 text-brand" />
              <h2 className="text-xl lg:text-2xl font-bold">Або шукайте за діючою речовиною</h2>
            </div>
            <p className="text-muted mb-5">Знаєте, який саме хімічний компонент вам потрібен — клікніть на нього і побачите всі препарати на його основі від різних виробників.</p>
            <div className="flex flex-wrap gap-2">
              {activeIngredients.slice(0, 30).map(a => (
                <Link key={a.slug} href={`/diiucha-rechovyna/${a.slug}`} className="inline-flex items-center gap-1.5 bg-bg hover:bg-brand hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  {a.nameUk}
                  <span className="text-xs opacity-70">{a.productSlugs.length}</span>
                </Link>
              ))}
            </div>
            {activeIngredients.length > 30 && (
              <Link href="/diiucha-rechovyna" className="inline-flex items-center gap-1 text-sm font-semibold text-brand mt-4">
                Усі діючі речовини <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </section>
      </main>
      <Footer lang="uk" />
      <FloatingCallButton />
    </>
  );
}
