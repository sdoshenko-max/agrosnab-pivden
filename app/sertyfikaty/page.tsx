import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { ShieldCheck, FileText, Check } from "lucide-react";
export const metadata = { title: "Сертифікати та документи" };

export default function Certs() {
  return (
    <>
      <Header lang="uk" />
      <main className="container-w py-10 max-w-3xl">
        <h1 className="text-3xl font-extrabold mb-4">Сертифікати та документи</h1>
        <p className="text-muted mb-8">Усі препарати, які ми постачаємо, мають повний пакет дозвільних документів і відповідають вимогам українського законодавства.</p>
        <div className="space-y-4">
          <div className="card flex gap-3"><ShieldCheck className="w-6 h-6 text-brand shrink-0 mt-1" /><div><h3 className="font-bold mb-1">Реєстраційні посвідчення</h3><p className="text-sm text-muted">Усі препарати внесені до Державного реєстру пестицидів і агрохімікатів, дозволених до використання в Україні.</p></div></div>
          <div className="card flex gap-3"><FileText className="w-6 h-6 text-brand shrink-0 mt-1" /><div><h3 className="font-bold mb-1">Паспорти якості</h3><p className="text-sm text-muted">На кожну партію — паспорт якості від виробника із зазначенням діючої речовини, концентрації, дати виготовлення та терміну придатності.</p></div></div>
          <div className="card flex gap-3"><Check className="w-6 h-6 text-brand shrink-0 mt-1" /><div><h3 className="font-bold mb-1">Сертифікати відповідності</h3><p className="text-sm text-muted">Сертифікати ДСТУ та документи, що підтверджують походження товару.</p></div></div>
        </div>
        <p className="mt-8 text-muted text-sm">Документи на конкретний препарат надаємо разом із товаром або на запит — зателефонуйте: <a href="tel:+380660321997" className="text-brand font-semibold">+380 66 032 19 97</a>.</p>
      </main>
      <Footer lang="uk" />
      <FloatingCallButton />
    </>
  );
}
