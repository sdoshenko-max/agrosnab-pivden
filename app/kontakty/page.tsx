import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
export const metadata = { title: "Контакти" };

export default function Contacts() {
  return (
    <>
      <Header lang="uk" />
      <main>
        <section className="bg-gradient-to-br from-brand to-brand-dark text-white py-10">
          <div className="container-w">
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">Контакти</h1>
            <p className="text-white/90">Зв'яжіться з нами зручним способом</p>
          </div>
        </section>
        <section className="container-w py-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <a href="tel:+380660321997" className="card flex items-center gap-4 hover:border-brand">
              <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center"><Phone className="w-6 h-6 text-brand" /></div>
              <div><p className="text-xs text-muted">Телефон</p><p className="font-bold text-lg">+380 66 032 19 97</p></div>
            </a>
            <a href="viber://chat?number=%2B380660321997" className="card flex items-center gap-4 hover:border-brand">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center"><MessageCircle className="w-6 h-6 text-purple-600" /></div>
              <div><p className="text-xs text-muted">Viber — консультація агронома</p><p className="font-bold">Написати в Viber</p></div>
            </a>
            <a href="https://t.me/+380660321997" className="card flex items-center gap-4 hover:border-brand">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center"><MessageCircle className="w-6 h-6 text-blue-600" /></div>
              <div><p className="text-xs text-muted">Telegram</p><p className="font-bold">Написати в Telegram</p></div>
            </a>
            <a href="mailto:sdoshenko@gmail.com" className="card flex items-center gap-4 hover:border-brand">
              <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center"><Mail className="w-6 h-6 text-brand" /></div>
              <div><p className="text-xs text-muted">Email</p><p className="font-bold">sdoshenko@gmail.com</p></div>
            </a>
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center"><MapPin className="w-6 h-6 text-brand" /></div>
              <div><p className="text-xs text-muted">Склад</p><p className="font-bold">м. Миколаїв</p><p className="text-xs text-muted">Самовивіз — за попередньою домовленістю</p></div>
            </div>
            <div className="card text-sm text-muted">
              <p className="font-bold text-ink mb-1">Реквізити</p>
              <p>ТОВ «АГРОСНАБ-ПІВДЕНЬ»<br />ЄДРПОУ: 35674029</p>
            </div>
          </div>
          <div className="card !p-0 overflow-hidden min-h-[400px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d83716.4!2d31.93!3d46.97!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40c4ad08efeefb73%3A0x6dbdc11f5ee0b633!2sMykolaiv!5e0!3m2!1suk!2sua!4v1714560000000"
              width="100%" height="100%" style={{ border: 0, minHeight: "400px" }}
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              title="Миколаїв"
            />
          </div>
        </section>
      </main>
      <Footer lang="uk" />
      <FloatingCallButton />
    </>
  );
}
