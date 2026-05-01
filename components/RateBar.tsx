"use client";

import { useCurrency } from "./CurrencyContext";

export function RateBar() {
  const { rates } = useCurrency();
  return (
    <div className="bg-bg border-b border-border text-xs text-muted">
      <div className="container-w py-1.5 flex items-center justify-between">
        <span>Курс міжбанк {rates.date}: 1$ = {rates.USD} ₴ · 1€ = {rates.EUR} ₴</span>
        <span className="hidden sm:inline">Ціни на сайті — в гривнях за курсом дня</span>
      </div>
    </div>
  );
}
