import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { ShieldCheck, FileText, Check } from "lucide-react";
export const metadata = { title: "Сертификаты и документы" };

export default function Certs() {
  return (
    <>
      <Header lang="ru" />
      <main className="container-w py-10 max-w-3xl">
        <h1 className="text-3xl font-extrabold mb-4">Сертификаты и документы</h1>
        <p className="text-muted mb-8">Все препараты, которые мы поставляем, имеют полный пакет разрешительных документов и соответствуют требованиям украинского законодательства.</p>
        <div className="space-y-4">
          <div className="card flex gap-3"><ShieldCheck className="w-6 h-6 text-brand shrink-0 mt-1" /><div><h3 className="font-bold mb-1">Регистрационные удостоверения</h3><p className="text-sm text-muted">Все препараты внесены в Государственный реестр пестицидов и агрохимикатов, разрешённых к использованию в Украине.</p></div></div>
          <div className="card flex gap-3"><FileText className="w-6 h-6 text-brand shrink-0 mt-1" /><div><h3 className="font-bold mb-1">Паспорта качества</h3><p className="text-sm text-muted">На каждую партию — паспорт качества от производителя с указанием действующего вещества, концентрации, даты изготовления и срока годности.</p></div></div>
          <div className="card flex gap-3"><Check className="w-6 h-6 text-brand shrink-0 mt-1" /><div><h3 className="font-bold mb-1">Сертификаты соответствия</h3><p className="text-sm text-muted">Сертификаты ДСТУ и документы, подтверждающие происхождение товара.</p></div></div>
        </div>
        <p className="mt-8 text-muted text-sm">Документы на конкретный препарат предоставляем вместе с товаром или по запросу — позвоните: <a href="tel:+380660321997" className="text-brand font-semibold">+380 66 032 19 97</a>.</p>
      </main>
      <Footer lang="ru" />
      <FloatingCallButton />
    </>
  );
}
