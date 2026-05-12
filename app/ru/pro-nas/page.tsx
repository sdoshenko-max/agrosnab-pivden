import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { Sprout, MapPin, Wallet, Phone } from "lucide-react";
export const metadata = { title: "О нас" };

export default function About() {
  return (
    <>
      <Header lang="ru" />
      <main>
        <section className="bg-gradient-to-br from-brand to-brand-dark text-white py-12">
          <div className="container-w">
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-3">О компании АГРОСНАБ-ПІВДЕНЬ</h1>
            <p className="text-white/90 max-w-2xl">Поставщик средств защиты растений для фермеров Юга Украины.</p>
          </div>
        </section>
        <section className="container-w py-10 max-w-4xl">
          <div className="space-y-4 text-sm leading-relaxed mb-8">
            <p>Мы работаем с фермерами Николаевской, Херсонской и Одесской областей. Понимаем местную специфику — засуху, заразиху на подсолнечнике, амброзию, фитофтору на картофеле — и знаем, как с ней справиться без переплаты за бренды.</p>
            <p>Наша философия проста: <strong>честный дженерик с идентичным действующим веществом экономит фермеру 30–60% бюджета</strong>, а урожай — тот же, что и с оригиналом. Поэтому в нашем каталоге — украинские и иностранные дженерики от Нопосон, PEST.UA, Himagro, Укравит, Alfa Smart Agro, Нертус, наряду с оригиналами Adama, BASF, Corteva, Syngenta, Bayer для тех, кто привык к бренду.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="card"><Sprout className="w-8 h-8 text-brand mb-2" /><h3 className="font-bold mb-1">Специализация</h3><p className="text-sm text-muted">Гербициды, фунгициды, инсектициды, протравители, регуляторы роста, микроудобрения, прилипатели</p></div>
            <div className="card"><MapPin className="w-8 h-8 text-brand mb-2" /><h3 className="font-bold mb-1">Регион</h3><p className="text-sm text-muted">Юг Украины. Склад в Николаеве, доставка по всей стране Новой Почтой</p></div>
            <div className="card"><Wallet className="w-8 h-8 text-brand mb-2" /><h3 className="font-bold mb-1">Цена</h3><p className="text-sm text-muted">Наличными или безналичный расчёт с НДС. Без переплат за «бренд»</p></div>
            <div className="card"><Phone className="w-8 h-8 text-brand mb-2" /><h3 className="font-bold mb-1">Поддержка</h3><p className="text-sm text-muted">Бесплатная консультация агронома по телефону или в Viber</p></div>
          </div>
          <div className="card bg-bg">
            <h3 className="font-bold mb-2">Реквизиты</h3>
            <p className="text-sm text-muted">ООО «АГРОСНАБ-ПІВДЕНЬ»<br />ЕГРПОУ: 35674029<br />Email: sdoshenko@gmail.com<br />Телефон: <a href="tel:+380770321997" className="text-brand">+380 77 032 19 97</a></p>
          </div>
        </section>
      </main>
      <Footer lang="ru" />
      <FloatingCallButton />
    </>
  );
}
