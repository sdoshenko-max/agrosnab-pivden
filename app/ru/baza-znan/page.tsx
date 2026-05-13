import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { articles, getArticleI18n } from "@/lib/articles";
import { ArrowRight } from "lucide-react";
export const metadata = { title: "База знаний", description: "Полезные материалы для агрономов и фермеров Украины" };

export default function KnowledgeRu() {
  return (
    <>
      <Header lang="ru" />
      <main>
        <section className="bg-gradient-to-br from-brand to-brand-dark text-white py-10">
          <div className="container-w">
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">База знаний</h1>
            <p className="text-white/90">Технологии, советы, типовые схемы защиты</p>
          </div>
        </section>
        <section className="container-w py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map(a => {
              const i = getArticleI18n(a, "ru");
              return (
                <Link key={a.slug} href={`/ru/baza-znan/${a.slug}`} className="card hover:border-brand group">
                  <div className="text-3xl mb-2">{a.emoji}</div>
                  <h2 className="text-lg font-bold mb-2 group-hover:text-brand">{i.title}</h2>
                  <p className="text-sm text-muted mb-3 leading-snug">{i.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>{a.date}</span>
                    <ArrowRight className="w-4 h-4 text-brand" />
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
