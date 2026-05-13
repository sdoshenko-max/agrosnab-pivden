"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCurrency } from "./CurrencyContext";
import { SAVE_PAIRS } from "@/lib/savePairs.generated";
import type { SavePair } from "@/lib/types";

const fmt = (n: number) =>
  Math.round(n).toLocaleString("uk-UA").replace(/,/g, " ");

const pkgWord = (unit: string) => (unit === "кг" ? "пакет" : "каністра");

export function SaveCard({ lang = "uk" }: { lang?: "uk" | "ru" }) {
  // Перший рендер (SSR + initial hydration) — детерміновано перша пара.
  // На клієнті після mount — рандом, щоб уникнути SSR/CSR mismatch.
  const [pair, setPair] = useState<SavePair>(SAVE_PAIRS[0]);
  const { rates } = useCurrency();

  useEffect(() => {
    setPair(SAVE_PAIRS[Math.floor(Math.random() * SAVE_PAIRS.length)]);
  }, []);

  if (!pair) return null;

  const rate = pair.currency === "EUR" ? rates.EUR : rates.USD;
  const packSize = getPackSize(pair.packaging);
  const origUah = pair.orig.priceVat * packSize * rate;
  const ourUah = pair.our.priceVat * packSize * rate;
  const saveAbs = origUah - ourUah;
  const percent = Math.round(((origUah - ourUah) / origUah) * 100);

  const labels = lang === "uk"
    ? {
        eyebrow: "⚡ Приклад економії",
        original: "Оригінал",
        our: "Наш аналог",
        save: "Економите",
        perPack: "на упаковку",
        sameIngredient: "Та сама діюча речовина, та сама ефективність",
        saveBadge: "ЕКОНОМІЯ",
      }
    : {
        eyebrow: "⚡ Пример экономии",
        original: "Оригинал",
        our: "Наш аналог",
        save: "Экономите",
        perPack: "на упаковку",
        sameIngredient: "То же действующее вещество, та же эффективность",
        saveBadge: "ЭКОНОМИЯ",
      };

  const groupNameLower = pair.groupName.toLowerCase();

  return (
    <div className="relative bg-white rounded-[20px] p-[22px] w-full max-w-[380px] shadow-[0_24px_60px_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.1)] -rotate-[1.5deg] transition-[transform,box-shadow] duration-300 ease-out hover:rotate-0 hover:shadow-[0_32px_70px_rgba(0,0,0,0.28),0_3px_6px_rgba(0,0,0,0.12)]">
      {/* Ribbon з відсотком економії */}
      <div className="absolute -top-3.5 -right-3.5 bg-accent text-white font-black text-[22px] px-3.5 py-3 rounded-[14px] shadow-[0_8px_20px_rgba(234,88,12,0.45)] rotate-[8deg] leading-none tracking-tight">
        −{percent}%
        <span className="block text-[10px] font-bold tracking-[0.12em] opacity-95 mt-0.5">
          {labels.saveBadge}
        </span>
      </div>

      <div className="text-[11px] font-extrabold text-muted tracking-[0.08em] uppercase mb-3">
        {labels.eyebrow}
      </div>

      <div className="inline-block text-xs font-bold text-brand bg-brand/10 px-2.5 py-1.5 rounded-lg mb-3.5">
        {pair.ai} · {groupNameLower}
      </div>

      {/* Рядок-лінк: оригінал */}
      <Link
        href={pair.orig.url}
        className="group/row block relative -mx-3 px-3 py-3 rounded-[10px] transition-colors hover:bg-slate-50 no-underline"
        aria-label={`${labels.original}: ${pair.orig.name}`}
      >
        <div className="text-[11px] font-extrabold text-muted tracking-wider uppercase mb-1">
          {pair.orig.brand} · {labels.original}
        </div>
        <div className="text-sm font-semibold text-ink mb-1">
          {pair.orig.name} · {pkgWord(pair.unit)} {pair.packaging}
        </div>
        <div className="text-[18px] font-black text-slate-400 line-through decoration-2 tracking-tight">
          {fmt(origUah)} ₴
        </div>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand text-xl font-black opacity-0 transition-[opacity,transform] duration-200 group-hover/row:opacity-100 group-hover/row:translate-x-1 pointer-events-none">
          →
        </span>
      </Link>

      <div className="border-t border-dashed border-slate-200 mt-1" />

      {/* Рядок-лінк: наш аналог */}
      <Link
        href={pair.our.url}
        className="group/row block relative -mx-3 px-3 py-3 rounded-[10px] transition-colors hover:bg-slate-50 no-underline"
        aria-label={`${labels.our}: ${pair.our.name}`}
      >
        <div className="text-[11px] font-extrabold text-brand tracking-wider uppercase mb-1">
          {pair.our.brand} · {labels.our}
        </div>
        <div className="text-sm font-semibold text-ink mb-1">
          {pair.our.name} · {pkgWord(pair.unit)} {pair.packaging}
        </div>
        <div className="text-[22px] font-black text-accent tracking-tight">
          {fmt(ourUah)} ₴
        </div>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand text-xl font-black opacity-0 transition-[opacity,transform] duration-200 group-hover/row:opacity-100 group-hover/row:translate-x-1 pointer-events-none">
          →
        </span>
      </Link>

      <div className="mt-3.5 px-3 py-2.5 rounded-[10px] bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 text-xs font-bold text-center leading-snug">
        {labels.save} <b className="text-amber-800 text-[13px]">{fmt(saveAbs)} ₴ {labels.perPack}</b>
        <br />
        <span className="font-semibold opacity-90">{labels.sameIngredient}</span>
      </div>
    </div>
  );
}

// Аналог lib/types.ts → getPackSize. Локальна копія, щоб не імпортувати зайве.
function getPackSize(packaging: string): number {
  const s = String(packaging || "").toLowerCase();
  const m = s.match(/(\d+(?:[.,]\d+)?)\s*(кг|мл|гр|г|л|т)/);
  if (!m) {
    const n = s.match(/[\d.,]+/);
    return n ? parseFloat(n[0].replace(",", ".")) || 1 : 1;
  }
  const num = parseFloat(m[1].replace(",", ".")) || 1;
  const u = m[2];
  if (u === "г" || u === "гр") return num / 1000;
  if (u === "мл") return num / 1000;
  if (u === "т") return num * 1000;
  return num;
}
