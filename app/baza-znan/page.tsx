import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { articles } from "@/lib/articles";
import { ArrowRight } from "lucide-react";
export const metadata = { title: "База знань", description: "Корисні матеріали для агрономів і фермерів України" };

export default function Knowledge() {
  return (
    <>
      <Header lang="uk" />
      <main>
        <section className="bg-gradient-to-br from-brand to-brand-dark text-white py-10">
          <div className="container-w">
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">База знань</h1>
            <p className="text-white/90">Технології, поради, типові схеми захисту</p>
          </div>
        </section>
        <section className="container-w py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map(a => (
              <Link key={a.slug} href={`/baza-znan/${a.slug}`} className="card hover:border-brand group">
                <div className="text-3xl mb-2">{a.emoji}</div>
                <h2 className="text-lg font-bold mb-2 group-hover:text-brand">{a.title}</h2>
                <p className="text-sm text-muted mb-3 leading-snug">{a.description}</p>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{a.date}</span>
                  <ArrowRight className="w-4 h-4 text-brand" />
                </div>
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
