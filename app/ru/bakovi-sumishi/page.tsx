import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { TankMixesGrid } from "@/components/TankMixesGrid";

export const metadata = { title: "Готовые баковые смеси", description: "Проверенные комбинации препаратов для Украины — стоимость обработки 1 гектара" };

export default function MixesListRu() {
  return (
    <>
      <Header lang="ru" />
      <main>
        <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
          <div className="container-w py-10">
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">Готовые баковые смеси</h1>
            <p className="text-white/80">Проверенные комбинации препаратов для типичных ситуаций · цена обработки 1 гектара (наличные)</p>
          </div>
        </section>
        <TankMixesGrid lang="ru" enableCultureFilter />
      </main>
      <Footer lang="ru" />
      <FloatingCallButton />
    </>
  );
}
