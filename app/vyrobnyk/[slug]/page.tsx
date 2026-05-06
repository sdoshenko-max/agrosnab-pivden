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
    title: `${m.name} — препарати на Агроснаб-Південь`,
    description: `Усі препарати виробника ${m.name} в каталозі Агроснаб-Південь. ${m.count} товарів: гербіциди, фунгіциди, інсектициди.`
  };
}

export default function ManufacturerRoute({ params }: { params: { slug: string } }) {
  const m = getManufacturerBySlug(params.slug);
  if (!m) notFound();
  const products = getProductsByManufacturer(params.slug);
  return (
    <>
      <Header lang="uk" />
      <main>
        <CatalogPage
          title={`Виробник: ${m.name}`}
          titleRu={`Производитель: ${m.name}`}
          productSlugs={products.map(p => p.slug)}
          lang="uk"
        />
      </main>
      <Footer lang="uk" />
      <FloatingCallButton />
    </>
  );
}
