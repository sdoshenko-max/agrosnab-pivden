import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { CatalogPage } from "@/components/CatalogPage";
import { groups, getGroupBySlug } from "@/lib/groups";
import { products } from "@/lib/data";
import type { Metadata } from "next";

export function generateStaticParams() {
  return groups.map(g => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const g = getGroupBySlug(params.slug);
  if (!g) return {};
  return { title: g.nameRu, description: g.descRu };
}

export default function GroupRouteRu({ params }: { params: { slug: string } }) {
  const g = getGroupBySlug(params.slug);
  if (!g) notFound();
  return (
    <>
      <Header lang="ru" />
      <main>
        <CatalogPage title={g.nameUk} titleRu={g.nameRu} productSlugs={products.filter(p => p.groupSlug === g.slug).map(p => p.slug)} lang="ru" currentGroupSlug={g.slug} />
      </main>
      <Footer lang="ru" />
      <FloatingCallButton />
    </>
  );
}
