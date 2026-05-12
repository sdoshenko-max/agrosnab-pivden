"use client";

import { useCurrency } from "./CurrencyContext";

export function Price({ amount, currency = "USD", showOriginal = true, className = "", suffix = "" }: {
  amount: number;
  currency?: string;
  showOriginal?: boolean;
  className?: string;
  suffix?: string;
}) {
  const { format } = useCurrency();
  const sym = currency === "EUR" ? "€" : "$";
  return (
    <span className={className}>
      {format(amount, currency)}{suffix}
      {showOriginal && <span className="text-[10px] font-normal text-muted ml-1">({sym}{amount})</span>}
    </span>
  );
}
