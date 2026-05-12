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
    title: `${p.nameRu} ${p.packaging} — ${p.activeIngredientRu || p.manufacturer}`,
    description: p.descriptionRu || `${p.nameRu} ${p.packaging} (${p.manufacturer})${p.activeIngredientRu ? `, ${p.activeIngredientRu}` : ""}.`,
    alternates: { canonical: `https://agrosnab-pivden.com/ru/produkt/${p.slug}/${p.code}/` }
  };
}

export default function ProductByCodeRouteRu({ params }: { params: { slug: string; code: string } }) {
  const product = getProductByCode(params.code);
  if (!product || product.slug !== params.slug) notFound();
  const longDesc = originalsDescriptions[product.slug]?.ru;
  return (
    <>
      <Header lang="ru" />
      <main>
        <ProductPage product={product} lang="ru" longDesc={longDesc} />
      </main>
      <Footer lang="ru" />
      <FloatingCallButton />
    </>
  );
}
