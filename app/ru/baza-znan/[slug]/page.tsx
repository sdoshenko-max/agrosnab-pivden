import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { articles, getArticleBySlug, getArticleI18n } from "@/lib/articles";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import { ArticleBody } from "@/components/article/ArticleBody";
import { ArticleHeader } from "@/components/article/blocks";

export function generateStaticParams() {
  return articles.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const a = getArticleBySlug(params.slug);
  if (!a) return {};
  const i = getArticleI18n(a, "ru");
  return { title: i.title, description: i.description };
}

// Legacy-рендер для статей без blocks: строки на абзацы, **жирный** на <strong>, [текст](ссылка) на <a>.
function renderBody(body: string) {
  const html = body.split("\n\n").map(p => {
    let line = p
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-brand underline">$1</a>')
      .replace(/\n/g, "<br/>");
    if (line.startsWith("<strong>") && line.includes("</strong>") && line.indexOf("</strong>") < 100) {
      return `<h2 class="text-xl font-bold mt-6 mb-2">${line.replace(/<\/?strong>/g, "")}</h2>`;
    }
    return `<p class="mb-4">${line}</p>`;
  }).join("");
  return html;
}

export default function ArticlePageRu({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();
  const i = getArticleI18n(article, "ru");
  const hasBlocks = Array.isArray(i.blocks) && i.blocks.length > 0;

  return (
    <>
      <Header lang="ru" />
      <main className="container-w py-8 sm:py-10 max-w-3xl">
        <Link href="/ru/baza-znan" className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand mb-5">
          <ChevronLeft className="w-4 h-4" />К базе знаний
        </Link>

        {hasBlocks ? (
          <>
            <ArticleHeader
              emoji={article.emoji}
              category={i.category || "База знаний"}
              title={i.title}
              subtitle={i.subtitle}
              date={article.date}
              readingTime={i.readingTime}
              lang="ru"
            />
            <ArticleBody blocks={i.blocks!} lang="ru" />
          </>
        ) : (
          <>
            <div className="text-5xl mb-3">{article.emoji}</div>
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">{i.title}</h1>
            <p className="text-muted text-sm mb-6">{article.date}</p>
            <article
              className="text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderBody(i.body) }}
            />
          </>
        )}
      </main>
      <Footer lang="ru" />
      <FloatingCallButton />
    </>
  );
}
