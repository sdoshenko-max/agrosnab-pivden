"use client";

import Link from "next/link";
import { Phone, Menu, X, MessageCircle, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Logo } from "./Logo";
import { CartButton } from "./CartButton";
import { SearchBox } from "./SearchBox";
import { RateBar } from "./RateBar";
import { dict, type Lang, COMPANY } from "@/lib/i18n";
import { groups } from "@/lib/groups";
import { cultures, products } from "@/lib/data";

export function Header({ lang }: { lang: Lang }) {
  const t = dict[lang];
  const [open, setOpen] = useState(false);
  const base = lang === "uk" ? "" : "/ru";

  // Блокируем скролл body когда открыт mobile-меню
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const groupsWithCount = groups.map(g => ({ ...g, count: products.filter(p => p.groupSlug === g.slug).length }));
  const culturesWithCount = cultures.map(c => ({ ...c, count: products.filter(p => p.cultures.includes(c.slug)).length }));

  return (
    <>
    <RateBar lang={lang} />
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border">
      <div className="container-w flex items-center justify-between h-16 gap-3">
        <Link href={`${base}/`} className="shrink-0">
          <Logo className="h-9 w-auto" />
        </Link>
        <SearchBox lang={lang} />
        <div className="flex items-center gap-1">
          <a href={`viber://chat?number=%2B${COMPANY.viber.replace(/\D/g,"")}`} className="hidden sm:flex w-9 h-9 rounded-full bg-purple-100 text-purple-600 items-center justify-center hover:bg-purple-200" aria-label="Viber" title="Viber"><MessageCircle className="w-4 h-4" /></a>
          <a href={`https://t.me/${COMPANY.telegramUser}`} target="_blank" rel="noopener" className="hidden sm:flex w-9 h-9 rounded-full bg-blue-100 text-blue-600 items-center justify-center hover:bg-blue-200" aria-label="Telegram" title="Telegram"><MessageCircle className="w-4 h-4" /></a>
          <div className="hidden sm:flex items-center text-sm font-semibold border border-border rounded-lg overflow-hidden ml-1">
            <Link href="/" className={`px-3 py-1.5 ${lang === "uk" ? "bg-brand text-white" : "hover:bg-bg"}`}>UA</Link>
            <Link href="/ru" className={`px-3 py-1.5 ${lang === "ru" ? "bg-brand text-white" : "hover:bg-bg"}`}>RU</Link>
          </div>
          <CartButton lang={lang} />
          <a href={`tel:${COMPANY.phone}`} className="btn-primary !py-2 !px-3 text-sm hidden lg:inline-flex">
            <Phone className="w-4 h-4" />
            <span className="hidden xl:inline">{t.cta.callMe}</span>
          </a>
          <button className="lg:hidden p-2 -mr-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      <nav className="hidden lg:flex container-w items-center gap-6 text-sm font-medium text-ink h-10 border-t border-border">
        {/* Культури з dropdown */}
        <div className="relative group h-full flex items-center">
          <Link href={`${base}/kultury`} className="hover:text-brand transition-colors flex items-center gap-1 h-full">
            {t.nav.cultures}<ChevronDown className="w-3 h-3" />
          </Link>
          <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity absolute top-full left-0 mt-0 bg-white border border-border rounded-lg shadow-lg p-2 min-w-[260px] grid grid-cols-1 gap-0.5 z-50">
            {culturesWithCount.map(c => (
              <Link key={c.slug} href={`${base}/kultury/${c.slug}`} className="flex items-center justify-between gap-2 px-3 py-2 rounded hover:bg-brand/5 hover:text-brand text-sm">
                <span className="flex items-center gap-2"><span>{c.emoji}</span>{lang === "uk" ? c.nameUk : c.nameRu}</span>
                <span className="text-xs text-muted">{c.count}</span>
              </Link>
            ))}
          </div>
        </div>
        {/* Групи ЗЗР з dropdown */}
        <div className="relative group h-full flex items-center">
          <Link href={`${base}/grupy`} className="hover:text-brand transition-colors flex items-center gap-1 h-full">
            {t.nav.groups}<ChevronDown className="w-3 h-3" />
          </Link>
          <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity absolute top-full left-0 mt-0 bg-white border border-border rounded-lg shadow-lg p-2 min-w-[260px] grid grid-cols-1 gap-0.5 z-50">
            {groupsWithCount.map(g => (
              <Link key={g.slug} href={`${base}/grupy/${g.slug}`} className="flex items-center justify-between gap-2 px-3 py-2 rounded hover:bg-brand/5 hover:text-brand text-sm">
                <span className="flex items-center gap-2"><span>{g.emoji}</span>{lang === "uk" ? g.nameUk : g.nameRu}</span>
                <span className="text-xs text-muted">{g.count}</span>
              </Link>
            ))}
          </div>
        </div>
        <Link href={`${base}/diiucha-rechovyna`} className="hover:text-brand transition-colors">{t.nav.ai}</Link>
        <Link href={`${base}/bakovi-sumishi`} className="hover:text-brand transition-colors">{t.nav.mixes}</Link>
        <Link href={`${base}/baza-znan`} className="hover:text-brand transition-colors">{t.nav.knowledge}</Link>
        <Link href={`${base}/pro-nas`} className="hover:text-brand transition-colors">{lang === "uk" ? "Про нас" : "О нас"}</Link>
        <Link href={`${base}/kontakty`} className="hover:text-brand transition-colors">{t.nav.contacts}</Link>
      </nav>
      {open && (
        <div className="lg:hidden fixed inset-x-0 top-[64px] bottom-0 border-t border-border bg-white overflow-y-auto z-50">
          <div className="container-w py-3 flex flex-col gap-1">
            <Link href={`${base}/kultury`} onClick={() => setOpen(false)} className="py-2.5 font-medium border-b border-border">{t.nav.cultures}</Link>
            <div className="pl-3 flex flex-col text-sm">
              {culturesWithCount.map(c => (
                <Link key={c.slug} href={`${base}/kultury/${c.slug}`} onClick={() => setOpen(false)} className="flex items-center justify-between py-1.5">
                  <span className="flex items-center gap-2"><span>{c.emoji}</span>{lang === "uk" ? c.nameUk : c.nameRu}</span>
                  <span className="text-xs text-muted">{c.count}</span>
                </Link>
              ))}
            </div>
            <Link href={`${base}/grupy`} onClick={() => setOpen(false)} className="py-2.5 font-medium border-b border-border mt-2">{t.nav.groups}</Link>
            <div className="pl-3 flex flex-col text-sm">
              {groupsWithCount.map(g => (
                <Link key={g.slug} href={`${base}/grupy/${g.slug}`} onClick={() => setOpen(false)} className="flex items-center justify-between py-1.5">
                  <span className="flex items-center gap-2"><span>{g.emoji}</span>{lang === "uk" ? g.nameUk : g.nameRu}</span>
                  <span className="text-xs text-muted">{g.count}</span>
                </Link>
              ))}
            </div>
            <Link href={`${base}/diiucha-rechovyna`} onClick={() => setOpen(false)} className="py-2.5 font-medium border-t border-border mt-2">{t.nav.ai}</Link>
            <Link href={`${base}/bakovi-sumishi`} onClick={() => setOpen(false)} className="py-2.5 font-medium">{t.nav.mixes}</Link>
            <Link href={`${base}/baza-znan`} onClick={() => setOpen(false)} className="py-2.5 font-medium">{t.nav.knowledge}</Link>
            <Link href={`${base}/pro-nas`} onClick={() => setOpen(false)} className="py-2.5 font-medium">{lang === "uk" ? "Про нас" : "О нас"}</Link>
            <Link href={`${base}/kontakty`} onClick={() => setOpen(false)} className="py-2.5 font-medium">{t.nav.contacts}</Link>
            <div className="flex gap-2 pt-2">
              <a href={`viber://chat?number=%2B${COMPANY.viber.replace(/\D/g,"")}`} className="flex-1 py-2 text-center rounded-lg border border-purple-300 bg-purple-50 text-purple-600 font-semibold">Viber</a>
              <a href={`https://t.me/${COMPANY.telegramUser}`} target="_blank" rel="noopener" className="flex-1 py-2 text-center rounded-lg border border-blue-300 bg-blue-50 text-blue-600 font-semibold">Telegram</a>
            </div>
            <div className="flex gap-2 pt-2">
              <Link href="/" className={`flex-1 py-2 text-center rounded-lg border ${lang === "uk" ? "bg-brand text-white border-brand" : "border-border"}`}>UA</Link>
              <Link href="/ru" className={`flex-1 py-2 text-center rounded-lg border ${lang === "ru" ? "bg-brand text-white border-brand" : "border-border"}`}>RU</Link>
            </div>
            <a href={`tel:${COMPANY.phone}`} className="btn-primary mt-2"><Phone className="w-4 h-4" />{t.cta.callMe}</a>
          </div>
        </div>
      )}
    </header>
    </>
  );
}
