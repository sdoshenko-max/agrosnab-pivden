import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { ProblemPicker } from "@/components/ProblemPicker";
import { GroupsStrip } from "@/components/GroupsStrip";
import { CulturesGrid } from "@/components/CulturesGrid";
import { TankMixesGrid } from "@/components/TankMixesGrid";
import { WhyUs } from "@/components/WhyUs";
import { HowItWorks } from "@/components/HowItWorks";
import { QuickCallForm } from "@/components/QuickCallForm";
import { FloatingCallButton } from "@/components/FloatingCallButton";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://agrosnab-pivden.com/",
    languages: {
      uk: "https://agrosnab-pivden.com/",
      ru: "https://agrosnab-pivden.com/ru/",
    },
  },
};

export default function Home() {
  return (
    <>
      <Header lang="uk" />
      <main>
        <Hero lang="uk" />
        <ProblemPicker lang="uk" />
        <GroupsStrip lang="uk" />
        <CulturesGrid lang="uk" />
        <TankMixesGrid lang="uk" oneCardPerCulture showAllButton />
        <WhyUs lang="uk" />
        <HowItWorks lang="uk" />
        <QuickCallForm lang="uk" />
      </main>
      <Footer lang="uk" />
      <FloatingCallButton />
    </>
  );
}
