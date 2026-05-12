import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { ProductPage } from "@/components/ProductPage";
import { products, getProductByCode } from "@/lib/data";
import { originalsDescriptions } from "@/lib/_descriptions/originals";
import type { Metadata } from "next";

export function generateStaticParams() {
  return products.map(p => ({ slug: p.slug, code: p.code }));
}

export async function generateMetadata({ params }: { params: { slug: string; code: string } }): Promise<Metadata> {
  const p = getProductByCode(params.code);
  if (!p) return {};
  return {
    title: `${p.name} ${p.packaging} — ${p.activeIngredient || p.manufacturer}`,
    description: p.description || `${p.name} ${p.packaging} (${p.manufacturer})${p.activeIngredient ? `, ${p.activeIngredient}` : ""}.`,
    alternates: { canonical: `https://agrosnab-pivden.com/produkt/${p.slug}/${p.code}/` }
  };
}

export default function ProductByCodeRoute({ params }: { params: { slug: string; code: string } }) {
  const product = getProductByCode(params.code);
  if (!product || product.slug !== params.slug) notFound();
  const longDesc = originalsDescriptions[product.slug]?.ua;
  return (
    <>
      <Header lang="uk" />
      <main>
        <ProductPage product={product} lang="uk" longDesc={longDesc} />
      </main>
      <Footer lang="uk" />
      <FloatingCallButton />
    </>
  );
}
