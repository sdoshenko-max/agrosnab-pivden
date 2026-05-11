import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
export const metadata = { title: "Политика конфиденциальности" };

export default function Privacy() {
  return (
    <>
      <Header lang="ru" />
      <main className="container-w py-10 max-w-3xl">
        <h1 className="text-3xl font-extrabold mb-4">Политика конфиденциальности</h1>
        <p className="text-muted mb-6">Редакция от 01.05.2026</p>
        <div className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-xl font-bold mt-6">1. Общие положения</h2>
          <p>ООО «АГРОСНАБ-ПІВДЕНЬ» уважает право на приватность посетителей сайта и обрабатывает персональные данные в соответствии с Законом Украины «О защите персональных данных».</p>
          <h2 className="text-xl font-bold mt-6">2. Какие данные мы собираем</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Имя и фамилия</li>
            <li>Контактный телефон</li>
            <li>Адрес электронной почты</li>
            <li>Область и населённый пункт (для доставки)</li>
            <li>Информация о заказе</li>
          </ul>
          <h2 className="text-xl font-bold mt-6">3. Как мы используем данные</h2>
          <p>Данные используются исключительно для обработки заказов, связи с клиентом, доставки товара и предоставления консультаций. Мы не передаём персональные данные третьим лицам без вашего согласия.</p>
          <h2 className="text-xl font-bold mt-6">4. Хранение данных</h2>
          <p>Данные хранятся в защищённых системах, доступ ограничен кругом уполномоченных сотрудников. Заявки получаем через защищённый Telegram-бот.</p>
          <h2 className="text-xl font-bold mt-6">5. Cookies</h2>
          <p>Сайт использует локальное хранилище браузера (localStorage) для сохранения корзины. Никаких трекинг-cookies сторонних сервисов мы не устанавливаем.</p>
          <h2 className="text-xl font-bold mt-6">6. Ваши права</h2>
          <p>Вы вправе запросить доступ к своим данным, исправить их или удалить. Обращайтесь: sdoshenko@gmail.com.</p>
        </div>
      </main>
      <Footer lang="ru" />
      <FloatingCallButton />
    </>
  );
}
