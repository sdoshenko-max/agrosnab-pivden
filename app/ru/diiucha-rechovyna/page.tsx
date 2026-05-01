import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { activeIngredients } from "@/lib/activeIngredients";

export const metadata = { title: "Действующие вещества", description: "Каталог по действующему веществу" };

export default function AIListRu() {
  return (
    <>
      <Header lang="ru" />
      <main>
        <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
          <div className="container-w py-10">
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">Действующие вещества</h1>
            <p className="text-white/80">Выберите действующее вещество — увидите все препараты на его основе</p>
          </div>
        </section>
        <section className="container-w py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {activeIngredients.map(a => (
              <Link key={a.slug} href={`/ru/diiucha-rechovyna/${a.slug}`} className="card !p-3 hover:border-brand group">
                <p className="font-bold text-sm mb-1 group-hover:text-brand">{a.nameRu}</p>
                <p className="text-xs text-muted">{a.productSlugs.length} препаратов</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer lang="ru" />
      <FloatingCallButton />
    </>
  );
}
