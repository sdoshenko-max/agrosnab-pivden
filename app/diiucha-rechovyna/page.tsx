import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { activeIngredients } from "@/lib/activeIngredients";

export const metadata = { title: "Діючі речовини", description: "Каталог за діючою речовиною — гліфосат, тебуконазол, тіаметоксам та інші" };

function plural(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "препарат";
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "препарати";
  return "препаратів";
}

export default function AIList() {
  const top = activeIngredients.slice(0, 10);
  const rest = activeIngredients.slice(10);
  return (
    <>
      <Header lang="uk" />
      <main>
        <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
          <div className="container-w py-10">
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">Діючі речовини</h1>
            <p className="text-white/80">Виберіть діючу речовину — побачите всі препарати на її основі</p>
          </div>
        </section>

        {top.length > 0 && (
          <section className="container-w pt-8">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <span className="text-2xl">🔥</span>Топ-10 найпоширеніших
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {top.map(a => (
                <Link key={a.slug} href={`/diiucha-rechovyna/${a.slug}`} className="card !p-3 hover:border-brand hover:bg-brand/5 hover:shadow-md transition-all duration-200 group">
                  <p className="font-bold text-sm mb-1 group-hover:text-brand transition-colors leading-snug">{a.nameUk}</p>
                  <p className="text-xs text-brand font-semibold">{a.productSlugs.length} {plural(a.productSlugs.length)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="container-w py-8">
          {rest.length > 0 && <h2 className="text-xl font-bold mb-3">Усі діючі речовини ({activeIngredients.length})</h2>}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {rest.map(a => (
              <Link key={a.slug} href={`/diiucha-rechovyna/${a.slug}`} className="card !p-3 hover:border-brand hover:bg-brand/5 transition-all duration-200 group">
                <p className="font-bold text-sm mb-1 group-hover:text-brand transition-colors leading-snug">{a.nameUk}</p>
                <p className="text-xs text-muted">{a.productSlugs.length} {plural(a.productSlugs.length)}</p>
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
