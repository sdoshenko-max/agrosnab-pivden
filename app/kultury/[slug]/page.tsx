import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { CulturePage } from "@/components/CulturePage";
import {
  cultures,
  getCultureBySlug,
  getProductsByCulture,
  getTankMixesByCulture
} from "@/lib/data";
import type { Metadata } from "next";

export function generateStaticParams() {
  return cultures.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const c = getCultureBySlug(params.slug);
  if (!c) return {};
  return {
    title: `Захист ${c.nameUk}`,
    description: c.shortUk
  };
}

export default function CultureRoute({ params }: { params: { slug: string } }) {
  const culture = getCultureBySlug(params.slug);
  if (!culture) notFound();
  const products = getProductsByCulture(params.slug);
  const mixes = getTankMixesByCulture(params.slug);

  return (
    <>
      <Header lang="uk" />
      <main>
        <CulturePage culture={culture} products={products} tankMixes={mixes} lang="uk" />
      </main>
      <Footer lang="uk" />
      <FloatingCallButton />
    </>
  );
}
