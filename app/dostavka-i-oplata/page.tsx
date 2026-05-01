import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { Truck, Wallet, MapPin, FileCheck } from "lucide-react";
export const metadata = { title: "Доставка та оплата" };

export default function DeliveryPayment() {
  return (
    <>
      <Header lang="uk" />
      <main className="container-w py-10 max-w-4xl">
        <h1 className="text-3xl font-extrabold mb-6">Доставка та оплата</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="card"><Truck className="w-8 h-8 text-brand mb-2" /><h2 className="text-lg font-bold mb-2">Самовивіз</h2><p className="text-muted">Безкоштовно зі складу в м. Миколаїв. Час узгоджуємо телефоном.</p></div>
          <div className="card"><MapPin className="w-8 h-8 text-brand mb-2" /><h2 className="text-lg font-bold mb-2">Нова Пошта</h2><p className="text-muted">По всій Україні накладеним платежем. Вартість доставки — за тарифами Нової Пошти, оплачує одержувач.</p></div>
          <div className="card"><Wallet className="w-8 h-8 text-brand mb-2" /><h2 className="text-lg font-bold mb-2">Готівка</h2><p className="text-muted">При отриманні на складі або через накладений платіж Новою Поштою.</p></div>
          <div className="card"><FileCheck className="w-8 h-8 text-brand mb-2" /><h2 className="text-lg font-bold mb-2">З ПДВ (безнал)</h2><p className="text-muted">100% передоплата на розрахунковий рахунок. Закриваючі документи: рахунок, видаткова, податкова.</p></div>
        </div>
        <h2 className="text-xl font-bold mb-3">Як оформити замовлення</h2>
        <ol className="list-decimal pl-5 space-y-2 text-muted mb-8">
          <li>Залиште заявку через сайт або зателефонуйте на <a href="tel:+380660321997" className="text-brand font-semibold">+380 66 032 19 97</a></li>
          <li>Менеджер передзвонить протягом 15 хвилин і уточнить деталі</li>
          <li>Підтверджуємо наявність, формуємо рахунок, домовляємося про дату відвантаження</li>
          <li>Отримуєте товар із сертифікатами та документами якості</li>
        </ol>
        <h2 className="text-xl font-bold mb-3">Терміни</h2>
        <p className="text-muted">Самовивіз — у день оплати (при наявності на складі). Нова Пошта — відвантаження в день оплати, доставка 1–2 робочі дні.</p>
      </main>
      <Footer lang="uk" />
      <FloatingCallButton />
    </>
  );
}
