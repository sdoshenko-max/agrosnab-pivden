import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
export const metadata = { title: "Політика конфіденційності" };

export default function Privacy() {
  return (
    <>
      <Header lang="uk" />
      <main className="container-w py-10 max-w-3xl">
        <h1 className="text-3xl font-extrabold mb-4">Політика конфіденційності</h1>
        <p className="text-muted mb-6">Редакція від 01.05.2026</p>
        <div className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-xl font-bold mt-6">1. Загальні положення</h2>
          <p>ТОВ «АГРОСНАБ-ПІВДЕНЬ» поважає право на приватність відвідувачів сайту та обробляє персональні дані відповідно до Закону України «Про захист персональних даних».</p>
          <h2 className="text-xl font-bold mt-6">2. Які дані ми збираємо</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Ім'я та прізвище</li>
            <li>Контактний телефон</li>
            <li>Адреса електронної пошти</li>
            <li>Область та населений пункт (для доставки)</li>
            <li>Інформація про замовлення</li>
          </ul>
          <h2 className="text-xl font-bold mt-6">3. Як ми використовуємо дані</h2>
          <p>Дані використовуються виключно для обробки замовлень, зв'язку з клієнтом, доставки товару та надання консультацій. Ми не передаємо персональні дані третім особам без вашої згоди.</p>
          <h2 className="text-xl font-bold mt-6">4. Зберігання даних</h2>
          <p>Дані зберігаються в захищених системах, доступ обмежений колом уповноважених співробітників. Заявки отримуємо через захищений Telegram-бот.</p>
          <h2 className="text-xl font-bold mt-6">5. Cookies</h2>
          <p>Сайт використовує локальне сховище браузера (localStorage) для збереження кошика. Жодних трекінг-cookies сторонніх сервісів ми не встановлюємо.</p>
          <h2 className="text-xl font-bold mt-6">6. Ваші права</h2>
          <p>Ви маєте право запросити доступ до своїх даних, виправити їх або видалити. Звертайтеся: agrosnabpivden@gmail.com.</p>
        </div>
      </main>
      <Footer lang="uk" />
      <FloatingCallButton />
    </>
  );
}
