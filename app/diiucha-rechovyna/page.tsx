import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { ActiveIngredientSearch } from "@/components/ActiveIngredientSearch";

export const metadata = { title: "Діючі речовини", description: "Каталог за діючою речовиною — гліфосат, тебуконазол, тіаметоксам та інші" };

export default function AIList() {
  return (
    <>
      <Header lang="uk" />
      <main>
        <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
          <div className="container-w py-10">
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">Діючі речовини</h1>
            <p className="text-white/80">Введіть назву або частину назви — побачите всі препарати на цій основі</p>
          </div>
        </section>
        <ActiveIngredientSearch lang="uk" />
      </main>
      <Footer lang="uk" />
      <FloatingCallButton />
    </>
  );
}
