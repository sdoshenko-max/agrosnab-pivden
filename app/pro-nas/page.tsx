import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { Sprout, MapPin, Wallet, Phone } from "lucide-react";
export const metadata = { title: "Про нас" };

export default function About() {
  return (
    <>
      <Header lang="uk" />
      <main>
        <section className="bg-gradient-to-br from-brand to-brand-dark text-white py-12">
          <div className="container-w">
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-3">Про АГРОСНАБ-ПІВДЕНЬ</h1>
            <p className="text-white/90 max-w-2xl">Постачальник засобів захисту рослин для фермерів України.</p>
          </div>
        </section>
        <section className="container-w py-10 max-w-4xl">
          <div className="space-y-4 text-sm leading-relaxed mb-8">
            <p>Ми працюємо з фермерами Миколаївської, Херсонської та Одеської областей. Розуміємо локальну специфіку — посуху, вовчок на соняшнику, амброзію, фітофтору на картоплі — і знаємо, як її лікувати без переплати за бренди.</p>
            <p>Наша філософія проста: <strong>чесний дженерик з ідентичною діючою речовиною економить фермеру 30–60% бюджету</strong>, а врожай — той самий, що з оригіналом. Тому в нашому каталозі — українські та іноземні дженерики від Нопосон, PEST.UA, Himagro, Укравіт, Alfa Smart Agro, Нертус, поряд з оригіналами Adama, BASF, Corteva, Syngenta, Bayer для тих, хто звик до бренду.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="card"><Sprout className="w-8 h-8 text-brand mb-2" /><h3 className="font-bold mb-1">Спеціалізація</h3><p className="text-sm text-muted">Гербіциди, фунгіциди, інсектициди, протруйники, регулятори росту, мікродобрива, прилипачі</p></div>
            <div className="card"><MapPin className="w-8 h-8 text-brand mb-2" /><h3 className="font-bold mb-1">Регіон</h3><p className="text-sm text-muted">Склад у Миколаєві, доставка по всій Україні Новою Поштою</p></div>
            <div className="card"><Wallet className="w-8 h-8 text-brand mb-2" /><h3 className="font-bold mb-1">Ціна</h3><p className="text-sm text-muted">Готівка або безнал з ПДВ. Без переплат за «бренд»</p></div>
            <div className="card"><Phone className="w-8 h-8 text-brand mb-2" /><h3 className="font-bold mb-1">Підтримка</h3><p className="text-sm text-muted">Безкоштовна консультація агронома по телефону або у Viber</p></div>
          </div>
          <div className="card bg-bg">
            <h3 className="font-bold mb-2">Реквізити</h3>
            <p className="text-sm text-muted">ТОВ «АГРОСНАБ-ПІВДЕНЬ»<br />ЄДРПОУ: 35674029<br />Email: sdoshenko@gmail.com<br />Телефон: <a href="tel:+380770321997" className="text-brand">+380 77 032 19 97</a></p>
          </div>
        </section>
      </main>
      <Footer lang="uk" />
      <FloatingCallButton />
    </>
  );
}
