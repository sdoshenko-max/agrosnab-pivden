import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { ProductPage } from "@/components/ProductPage";
import { products, getProductBySlug } from "@/lib/data";
import type { Metadata } from "next";

export function generateStaticParams() {
  return products.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = getProductBySlug(params.slug);
  if (!p) return {};
  return {
    title: `${p.name} — ${p.activeIngredient}`,
    description: p.description || `${p.name} (${p.manufacturer}) — ${p.activeIngredient}, ${p.concentration}.`
  };
}

export default function ProductRoute({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();
  return (
    <>
      <Header lang="uk" />
      <main>
        <ProductPage product={product} lang="uk" />
      </main>
      <Footer lang="uk" />
      <FloatingCallButton />
    </>
  );
}
