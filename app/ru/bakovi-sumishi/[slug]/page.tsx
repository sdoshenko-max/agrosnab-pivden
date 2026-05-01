import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { TankMixPage } from "@/components/TankMixPage";
import { tankMixes } from "@/lib/data";
import type { Metadata } from "next";

export function generateStaticParams() { return tankMixes.map(m => ({ slug: m.slug })); }

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const m = tankMixes.find(x => x.slug === params.slug);
  if (!m) return {};
  return { title: m.titleRu, description: m.descRu };
}

export default function MixRouteRu({ params }: { params: { slug: string } }) {
  const mix = tankMixes.find(m => m.slug === params.slug);
  if (!mix) notFound();
  return (
    <>
      <Header lang="ru" />
      <main><TankMixPage mix={mix} lang="ru" /></main>
      <Footer lang="ru" />
      <FloatingCallButton />
    </>
  );
}
