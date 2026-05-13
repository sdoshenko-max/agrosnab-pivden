import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { MagnetCards } from "@/components/MagnetCards";
import { GroupsStrip } from "@/components/GroupsStrip";
import { CulturesGrid } from "@/components/CulturesGrid";
import { TankMixesGrid } from "@/components/TankMixesGrid";
import { WhyUs } from "@/components/WhyUs";
import { HowItWorks } from "@/components/HowItWorks";
import { QuickCallForm } from "@/components/QuickCallForm";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "АГРОСНАБ-ПІВДЕНЬ — средства защиты растений для Украины",
  description:
    "Интернет-каталог СЗР для фермеров Николаевской, Херсонской, Одесской областей. Честные дженерики, экономия до 60% от оригинала. Самовывоз Николаев или Новая Почта."
};

export default function HomeRu() {
  return (
    <>
      <Header lang="ru" />
      <main>
        <Hero lang="ru" />
        <MagnetCards lang="ru" />
        <GroupsStrip lang="ru" />
        <CulturesGrid lang="ru" />
        <TankMixesGrid lang="ru" oneCardPerCulture showAllButton />
        <WhyUs lang="ru" />
        <HowItWorks lang="ru" />
        <QuickCallForm lang="ru" />
      </main>
      <Footer lang="ru" />
      <FloatingCallButton />
    </>
  );
}
