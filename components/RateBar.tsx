"use client";

import { useCurrency } from "./CurrencyContext";

const MONTHS_UK = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
const MONTHS_RU = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

function formatRateDate(date: string, lang: "uk" | "ru" = "uk"): string {
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  const months = lang === "uk" ? MONTHS_UK : MONTHS_RU;
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export function RateBar({ lang = "uk" }: { lang?: "uk" | "ru" }) {
  const { rates } = useCurrency();
  const date = formatRateDate(rates.date, lang);
  const right = lang === "uk" ? "Ціни на сайті — в гривнях за курсом дня" : "Цены на сайте — в гривнах по курсу дня";
  const left = lang === "uk" ? `Курс міжбанку Minfin${date ? ` на ${date}` : ""}` : `Курс межбанка Minfin${date ? ` на ${date}` : ""}`;
  return (
    <div className="bg-bg border-b border-border text-xs text-muted">
      <div className="container-w py-1.5 flex items-center justify-between">
        <span>{left}: 1$ = {rates.USD.toFixed(2)} ₴ · 1€ = {rates.EUR.toFixed(2)} ₴</span>
        <span className="hidden sm:inline">{right}</span>
      </div>
    </div>
  );
}
