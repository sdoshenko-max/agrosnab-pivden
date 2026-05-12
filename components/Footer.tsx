import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Logo } from "./Logo";
import { dict, type Lang, COMPANY } from "@/lib/i18n";
import { cities } from "@/lib/cities";

export function Footer({ lang }: { lang: Lang }) {
  const t = dict[lang];
  const base = lang === "uk" ? "" : "/ru";
  const warehouse = lang === "uk" ? COMPANY.warehouse : COMPANY.warehouseRu;
  const companyName = lang === "uk" ? COMPANY.name : COMPANY.nameRu;

  return (
    <footer className="bg-ink text-white mt-16">
      <div className="container-w py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <Logo className="h-10 w-auto mb-4 [&_text]:!fill-white [&_text:nth-of-type(2)]:!fill-brand-light" />
          <p className="text-slate-300 text-sm leading-relaxed mb-4 max-w-md">{t.footer.about}</p>
          <div className="text-xs text-slate-400 space-y-1">
            <p>{companyName}</p>
            <p>{t.footer.edrpou}: {COMPANY.edrpou}</p>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-3">{t.footer.contacts}</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2"><Phone className="w-4 h-4 mt-0.5 shrink-0" /><a href={`tel:${COMPANY.phone}`} className="hover:text-white">{COMPANY.phone}</a></li>
            <li className="flex items-start gap-2"><MessageCircle className="w-4 h-4 mt-0.5 shrink-0" /><a href={`viber://chat?number=%2B${COMPANY.viber.replace(/\D/g, "")}`} className="hover:text-white">Viber</a></li>
            <li className="flex items-start gap-2"><MessageCircle className="w-4 h-4 mt-0.5 shrink-0" /><a href={`https://t.me/${COMPANY.telegramUser}`} className="hover:text-white">Telegram</a></li>
            <li className="flex items-start gap-2"><Mail className="w-4 h-4 mt-0.5 shrink-0" /><a href={`mailto:${COMPANY.email}`} className="hover:text-white">{COMPANY.email}</a></li>
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" /><span>{warehouse}</span></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-3">{t.footer.docs}</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><Link href={`${base}/pro-nas`} className="hover:text-white">{lang === "uk" ? "Про нас" : "О нас"}</Link></li>
            <li><Link href={`${base}/kontakty`} className="hover:text-white">{lang === "uk" ? "Контакти" : "Контакты"}</Link></li>
            <li><Link href={`${base}/dostavka-i-oplata`} className="hover:text-white">{t.footer.shipping}</Link></li>
            <li><Link href={`${base}/sertyfikaty`} className="hover:text-white">{t.footer.certificates}</Link></li>
            <li><Link href={`${base}/oferta`} className="hover:text-white">{t.footer.offer}</Link></li>
            <li><Link href={`${base}/konfidentsiynist`} className="hover:text-white">{t.footer.privacy}</Link></li>
          </ul>
        </div>
      </div>
      {lang === "uk" && cities.length > 0 && (
        <div className="border-t border-slate-800">
          <div className="container-w py-6">
            <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-3 font-semibold">
              Регіони обслуговування
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {cities.map(c => (
                <Link
                  key={c.slug}
                  href={`/mista/${c.slug}`}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  {c.nameUk}
                </Link>
              ))}
              <Link
                href="/mista"
                className="text-slate-400 hover:text-white transition-colors font-semibold"
              >
                всі регіони →
              </Link>
            </div>
          </div>
        </div>
      )}
      <div className="border-t border-slate-800">
        <div className="container-w py-4 text-xs text-slate-400 text-center">
          © {new Date().getFullYear()} {companyName}. {t.footer.rights}.
        </div>
      </div>
    </footer>
  );
}
