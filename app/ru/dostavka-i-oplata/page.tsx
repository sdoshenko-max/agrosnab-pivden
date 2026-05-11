import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { Truck, Wallet, MapPin, FileCheck } from "lucide-react";
export const metadata = { title: "Доставка и оплата" };

export default function DeliveryPayment() {
  return (
    <>
      <Header lang="ru" />
      <main className="container-w py-10 max-w-4xl">
        <h1 className="text-3xl font-extrabold mb-6">Доставка и оплата</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="card"><Truck className="w-8 h-8 text-brand mb-2" /><h2 className="text-lg font-bold mb-2">Самовывоз</h2><p className="text-muted">Бесплатно со склада в г. Николаев. Время согласовываем по телефону.</p></div>
          <div className="card"><MapPin className="w-8 h-8 text-brand mb-2" /><h2 className="text-lg font-bold mb-2">Новая Почта</h2><p className="text-muted">По всей Украине наложенным платежом. Стоимость доставки — по тарифам Новой Почты, оплачивает получатель.</p></div>
          <div className="card"><Wallet className="w-8 h-8 text-brand mb-2" /><h2 className="text-lg font-bold mb-2">Наличные</h2><p className="text-muted">При получении на складе или через наложенный платёж Новой Почты.</p></div>
          <div className="card"><FileCheck className="w-8 h-8 text-brand mb-2" /><h2 className="text-lg font-bold mb-2">С НДС (безнал)</h2><p className="text-muted">100% предоплата на расчётный счёт. Закрывающие документы: счёт, расходная, налоговая.</p></div>
        </div>
        <h2 className="text-xl font-bold mb-3">Как оформить заказ</h2>
        <ol className="list-decimal pl-5 space-y-2 text-muted mb-8">
          <li>Оставьте заявку через сайт или позвоните на <a href="tel:+380660321997" className="text-brand font-semibold">+380 66 032 19 97</a></li>
          <li>Менеджер перезвонит в течение 15 минут и уточнит детали</li>
          <li>Подтверждаем наличие, формируем счёт, договариваемся о дате отгрузки</li>
          <li>Получаете товар с сертификатами и документами качества</li>
        </ol>
        <h2 className="text-xl font-bold mb-3">Сроки</h2>
        <p className="text-muted">Самовывоз — в день оплаты (при наличии на складе). Новая Почта — отгрузка в день оплаты, доставка 1–2 рабочих дня.</p>
      </main>
      <Footer lang="ru" />
      <FloatingCallButton />
    </>
  );
}
