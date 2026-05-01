"use client";

import Link from "next/link";
import { Phone, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { CartButton } from "./CartButton";
import { dict, type Lang } from "@/lib/i18n";

export function Header({ lang }: { lang: Lang }) {
  const t = dict[lang];
  const [open, setOpen] = useState(false);
  const base = lang === "uk" ? "" : "/ru";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border">
      <div className="container-w flex items-center justify-between h-16 gap-3">
        <Link href={`${base}/`} className="shrink-0">
          <Logo className="h-9 w-auto" />
        </Link>
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-ink">
          <Link href={`${base}/kultury`} className="hover:text-brand">{t.nav.cultures}</Link>
          <Link href={`${base}/grupy`} className="hover:text-brand">{t.nav.groups}</Link>
          <Link href={`${base}/diiucha-rechovyna`} className="hover:text-brand">{t.nav.ai}</Link>
          <Link href={`${base}/bakovi-sumishi`} className="hover:text-brand">{t.nav.mixes}</Link>
          <Link href={`${base}/baza-znan`} className="hover:text-brand">{t.nav.knowledge}</Link>
          <Link href={`${base}/kontakty`} className="hover:text-brand">{t.nav.contacts}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center text-sm font-semibold border border-border rounded-lg overflow-hidden">
            <Link href="/" className={`px-3 py-1.5 ${lang === "uk" ? "bg-brand text-white" : "hover:bg-bg"}`}>UA</Link>
            <Link href="/ru" className={`px-3 py-1.5 ${lang === "ru" ? "bg-brand text-white" : "hover:bg-bg"}`}>RU</Link>
          </div>
          <CartButton lang={lang} />
          <a href="#quick-call" className="btn-primary !py-2 !px-3 text-sm hidden md:inline-flex">
            <Phone className="w-4 h-4" />
            <span className="hidden lg:inline">{t.cta.callMe}</span>
          </a>
          <button className="lg:hidden p-2 -mr-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-white">
          <div className="container-w py-3 flex flex-col gap-1">
            <Link href={`${base}/kultury`} onClick={() => setOpen(false)} className="py-2.5 font-medium">{t.nav.cultures}</Link>
            <Link href={`${base}/grupy`} onClick={() => setOpen(false)} className="py-2.5 font-medium">{t.nav.groups}</Link>
            <Link href={`${base}/diiucha-rechovyna`} onClick={() => setOpen(false)} className="py-2.5 font-medium">{t.nav.ai}</Link>
            <Link href={`${base}/bakovi-sumishi`} onClick={() => setOpen(false)} className="py-2.5 font-medium">{t.nav.mixes}</Link>
            <Link href={`${base}/baza-znan`} onClick={() => setOpen(false)} className="py-2.5 font-medium">{t.nav.knowledge}</Link>
            <Link href={`${base}/kontakty`} onClick={() => setOpen(false)} className="py-2.5 font-medium">{t.nav.contacts}</Link>
            <div className="flex gap-2 pt-2">
              <Link href="/" className={`flex-1 py-2 text-center rounded-lg border ${lang === "uk" ? "bg-brand text-white border-brand" : "border-border"}`}>UA</Link>
              <Link href="/ru" className={`flex-1 py-2 text-center rounded-lg border ${lang === "ru" ? "bg-brand text-white border-brand" : "border-border"}`}>RU</Link>
            </div>
            <a href="#quick-call" onClick={() => setOpen(false)} className="btn-primary mt-2">
              <Phone className="w-4 h-4" />
              {t.cta.callMe}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
