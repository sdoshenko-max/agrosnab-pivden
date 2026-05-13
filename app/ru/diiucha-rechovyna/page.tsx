import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { ActiveIngredientSearch } from "@/components/ActiveIngredientSearch";

export const metadata = { title: "Действующие вещества", description: "Каталог по действующему веществу — глифосат, тебуконазол, тиаметоксам и другие" };

export default function AIListRu() {
  return (
    <>
      <Header lang="ru" />
      <main>
        <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
          <div className="container-w py-10">
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">Действующие вещества</h1>
            <p className="text-white/80">Введите название или часть названия — увидите все препараты на этой основе</p>
          </div>
        </section>
        <ActiveIngredientSearch lang="ru" />
      </main>
      <Footer lang="ru" />
      <FloatingCallButton />
    </>
  );
}
