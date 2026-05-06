import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { ProductPage } from "@/components/ProductPage";
import { products, getProductBySlug } from "@/lib/data";
import type { Metadata } from "next";

export function generateStaticParams() {
  const slugs = new Set(products.map(p => p.slug));
  return Array.from(slugs).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = getProductBySlug(params.slug);
  if (!p) return {};
  return {
    title: `${p.nameRu} — ${p.activeIngredientRu}`,
    description: p.descriptionRu || `${p.nameRu} (${p.manufacturer}) — ${p.activeIngredientRu}, ${p.concentration}.`
  };
}

export default function ProductRouteRu({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();
  return (
    <>
      <Header lang="ru" />
      <main>
        <ProductPage product={product} lang="ru" />
      </main>
      <Footer lang="ru" />
      <FloatingCallButton />
    </>
  );
}
