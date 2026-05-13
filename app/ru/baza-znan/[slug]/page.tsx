import React from "react";
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

// Безопасный рендер для статей без blocks — без dangerouslySetInnerHTML.
function parseInline(text: string, baseKey: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  const pushText = (s: string) => {
    const parts = s.split("\n");
    parts.forEach((p, idx) => {
      if (idx > 0) nodes.push(<br key={`${baseKey}-br-${i++}`} />);
      if (p) nodes.push(<React.Fragment key={`${baseKey}-t-${i++}`}>{p}</React.Fragment>);
    });
  };
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) pushText(text.slice(lastIndex, m.index));
    if (m[1] !== undefined) {
      nodes.push(<strong key={`${baseKey}-b-${i++}`}>{m[1]}</strong>);
    } else if (m[2] !== undefined && m[3] !== undefined) {
      nodes.push(<a key={`${baseKey}-l-${i++}`} href={m[3]} className="text-brand underline">{m[2]}</a>);
    }
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) pushText(text.slice(lastIndex));
  return nodes;
}

function renderBody(body: string): React.ReactNode {
  return body.split("\n\n").map((p, pi) => {
    const key = `p-${pi}`;
    const headEnd = p.startsWith("**") ? p.indexOf("**", 2) : -1;
    if (headEnd > 0 && headEnd < 100) {
      const stripped = p.replace(/\*\*/g, "");
      return <h2 key={key} className="text-xl font-bold mt-6 mb-2">{stripped}</h2>;
    }
    return <p key={key} className="mb-4">{parseInline(p, key)}</p>;
  });
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
            <article className="text-base leading-relaxed">
              {renderBody(i.body)}
            </article>
          </>
        )}
      </main>
      <Footer lang="ru" />
      <FloatingCallButton />
    </>
  );
}
