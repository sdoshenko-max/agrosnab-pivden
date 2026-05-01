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
  return { title: m.titleUk, description: m.descUk };
}

export default function MixRoute({ params }: { params: { slug: string } }) {
  const mix = tankMixes.find(m => m.slug === params.slug);
  if (!mix) notFound();
  return (
    <>
      <Header lang="uk" />
      <main><TankMixPage mix={mix} lang="uk" /></main>
      <Footer lang="uk" />
      <FloatingCallButton />
    </>
  );
}
