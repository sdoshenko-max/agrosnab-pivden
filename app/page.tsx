import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { MagnetCards } from "@/components/MagnetCards";
import { CulturesGrid } from "@/components/CulturesGrid";
import { TankMixesGrid } from "@/components/TankMixesGrid";
import { WhyUs } from "@/components/WhyUs";
import { HowItWorks } from "@/components/HowItWorks";
import { QuickCallForm } from "@/components/QuickCallForm";
import { FloatingCallButton } from "@/components/FloatingCallButton";

export default function Home() {
  return (
    <>
      <Header lang="uk" />
      <main>
        <Hero lang="uk" />
        <MagnetCards lang="uk" />
        <CulturesGrid lang="uk" />
        <TankMixesGrid lang="uk" />
        <WhyUs lang="uk" />
        <HowItWorks lang="uk" />
        <QuickCallForm lang="uk" />
      </main>
      <Footer lang="uk" />
      <FloatingCallButton />
    </>
  );
}
