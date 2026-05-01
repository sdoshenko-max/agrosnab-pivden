import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { articles, getArticleBySlug } from "@/lib/articles";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";

export function generateStaticParams() {
  return articles.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const a = getArticleBySlug(params.slug);
  if (!a) return {};
  return { title: a.title, description: a.description };
}

function renderBody(body: string) {
  // Простий рендер: рядки на абзаци, **жирний** на <strong>, [текст](лінк) на <a>
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

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();
  return (
    <>
      <Header lang="uk" />
      <main className="container-w py-10 max-w-3xl">
        <Link href="/baza-znan" className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand mb-3">
          <ChevronLeft className="w-4 h-4" />До бази знань
        </Link>
        <div className="text-5xl mb-3">{article.emoji}</div>
        <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">{article.title}</h1>
        <p className="text-muted text-sm mb-6">{article.date}</p>
        <article className="text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: renderBody(article.body) }} />
      </main>
      <Footer lang="uk" />
      <FloatingCallButton />
    </>
  );
}
