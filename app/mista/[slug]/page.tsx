import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { CityPage } from "@/components/CityPage";
import { cities, getCityBySlug } from "@/lib/cities";
import { products } from "@/lib/data";
import type { Metadata } from "next";

export function generateStaticParams() {
  return cities.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const c = getCityBySlug(params.slug);
  if (!c) return {};
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical: `https://agrosnab-pivden.com/mista/${c.slug}/` },
  };
}

export default function CityRoute({ params }: { params: { slug: string } }) {
  const city = getCityBySlug(params.slug);
  if (!city) notFound();

  // Алгоритм підбору топ-6 препаратів для міста:
  // 1) фільтр: продукти для культур зони, не "ціна за запитом"
  // 2) сортування всередині групи: highlight > original > premium > econom > алфавіт
  // 3) беремо ПО ОДНОМУ найкращому з кожної групи — щоб у топі був баланс
  //    (гербіцид + фунгіцид + інсектицид + ...), а не 6 препаратів однієї літери
  // 4) якщо груп менше 6 — добираємо другими найкращими з найбільших груп
  const tierOrder: Record<string, number> = { original: 0, premium: 1, econom: 2 };
  const eligible = products
    .filter(p => p.cultures.some(c => city.mainCultureSlugs.includes(c)))
    .filter(p => !p.priceOnRequest);

  const byGroup: Record<string, typeof eligible> = {};
  for (const p of eligible) {
    (byGroup[p.groupSlug] = byGroup[p.groupSlug] || []).push(p);
  }
  for (const key in byGroup) {
    byGroup[key].sort((a, b) => {
      if ((b.highlight ? 1 : 0) !== (a.highlight ? 1 : 0)) return (b.highlight ? 1 : 0) - (a.highlight ? 1 : 0);
      const ta = tierOrder[a.tier] ?? 3;
      const tb = tierOrder[b.tier] ?? 3;
      if (ta !== tb) return ta - tb;
      return a.name.localeCompare(b.name, "uk");
    });
  }
  // Round-robin: беремо першого з кожної групи, потім другого, доки не наберемо 6.
  const groupOrder = ["herbitsydy", "funhitsydy", "insektitsydy", "protruyniky", "desykanty", "regulyatory", "adyuvanty", "rodentytsydy", "mikrodobryva", "biopreparaty"];
  const sortedGroups = Object.keys(byGroup).sort((a, b) => {
    const ia = groupOrder.indexOf(a);
    const ib = groupOrder.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  const topProducts: typeof eligible = [];
  let round = 0;
  while (topProducts.length < 6) {
    let addedThisRound = 0;
    for (const g of sortedGroups) {
      if (topProducts.length >= 6) break;
      if (byGroup[g][round]) {
        topProducts.push(byGroup[g][round]);
        addedThisRound++;
      }
    }
    if (addedThisRound === 0) break;
    round++;
  }

  return (
    <>
      <Header lang="uk" />
      <main>
        <CityPage city={city} topProducts={topProducts} />
      </main>
      <Footer lang="uk" />
      <FloatingCallButton />
    </>
  );
}
