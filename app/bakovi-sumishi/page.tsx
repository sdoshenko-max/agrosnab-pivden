import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { TankMixesGrid } from "@/components/TankMixesGrid";

export const metadata = { title: "Готові бакові суміші", description: "Перевірені комбінації препаратів для України — вартість обробки 1 гектара" };

export default function MixesList() {
  return (
    <>
      <Header lang="uk" />
      <main>
        <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
          <div className="container-w py-10">
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">Готові бакові суміші</h1>
            <p className="text-white/80">Перевірені комбінації препаратів для типових ситуацій на Півдні України · ціна обробки 1 гектара (готівка)</p>
          </div>
        </section>
        <TankMixesGrid lang="uk" />
      </main>
      <Footer lang="uk" />
      <FloatingCallButton />
    </>
  );
}
