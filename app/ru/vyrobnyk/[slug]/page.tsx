import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { CatalogPage } from "@/components/CatalogPage";
import { allManufacturers, getManufacturerBySlug, getProductsByManufacturer } from "@/lib/manufacturers";
import type { Metadata } from "next";

export function generateStaticParams() {
  return allManufacturers().map(m => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const m = getManufacturerBySlug(params.slug);
  if (!m) return {};
  return {
    title: `${m.name} — препараты на Агроснаб-Південь`,
    description: `Все препараты производителя ${m.name} в каталоге Агроснаб-Південь. ${m.count} товаров: гербициды, фунгициды, инсектициды.`
  };
}

export default function ManufacturerRouteRu({ params }: { params: { slug: string } }) {
  const m = getManufacturerBySlug(params.slug);
  if (!m) notFound();
  const products = getProductsByManufacturer(params.slug);
  return (
    <>
      <Header lang="ru" />
      <main>
        <CatalogPage
          title={`Виробник: ${m.name}`}
          titleRu={`Производитель: ${m.name}`}
          productSlugs={products.map(p => p.slug)}
          lang="ru"
        />
      </main>
      <Footer lang="ru" />
      <FloatingCallButton />
    </>
  );
}
