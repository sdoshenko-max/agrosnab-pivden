import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { CatalogPage } from "@/components/CatalogPage";
import { activeIngredients, getAIBySlug } from "@/lib/activeIngredients";
import type { Metadata } from "next";

export function generateStaticParams() {
  return activeIngredients.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const a = getAIBySlug(params.slug);
  if (!a) return {};
  return { title: `${a.nameUk} — препарати`, description: `Препарати на основі діючої речовини ${a.nameUk}` };
}

export default function AIRoute({ params }: { params: { slug: string } }) {
  const a = getAIBySlug(params.slug);
  if (!a) notFound();
  return (
    <>
      <Header lang="uk" />
      <main>
        <CatalogPage title={`Діюча речовина: ${a.nameUk}`} titleRu={`Действующее вещество: ${a.nameRu}`} productSlugs={a.productSlugs} lang="uk" />
      </main>
      <Footer lang="uk" />
      <FloatingCallButton />
    </>
  );
}
