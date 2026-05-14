"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Rates = {
  USD: number;
  EUR: number;
  date: string;
  source: "minfin-interbank" | "fallback";
  provider: string;
  fetchedAt?: string | null;
};

const DEFAULT_RATES: Rates = { USD: 44.00, EUR: 51.70, date: "2026-05-05", source: "fallback", provider: "Fallback" };
const STORAGE_KEY = "agrosnab_rates_minfin_v1";
const RATES_URL = "/currency-rates.json";

const Ctx = createContext<{ rates: Rates; format: (usd: number, currency?: string) => string; loading: boolean }>({
  rates: DEFAULT_RATES,
  format: (u: number) => "",
  loading: false
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [rates, setRates] = useState<Rates>(DEFAULT_RATES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.rates?.USD && parsed.rates?.EUR) {
          setRates(normalizeRates(parsed));
        }
      }
    } catch {}

    setLoading(true);
    fetch(`${RATES_URL}?v=${Date.now()}`, { cache: "no-store" })
      .then(r => r.json())
      .then((data) => {
        const newRates = normalizeRates(data);
        setRates(newRates);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function format(amount: number, currency: string = "USD"): string {
    const rate = currency === "EUR" ? rates.EUR : rates.USD;
    const uah = Math.round(amount * rate);
    return uah.toLocaleString("uk-UA").replace(/,/g, " ") + " ₴";
  }

  return <Ctx.Provider value={{ rates, format, loading }}>{children}</Ctx.Provider>;
}

function normalizeRates(data: any): Rates {
  const usd = Number(data?.rates?.USD);
  const eur = Number(data?.rates?.EUR);
  if (!Number.isFinite(usd) || !Number.isFinite(eur)) return DEFAULT_RATES;

  return {
    USD: usd,
    EUR: eur,
    date: String(data?.date || data?.rates?.date || DEFAULT_RATES.date),
    source: data?.source === "minfin-interbank" ? "minfin-interbank" : "fallback",
    provider: String(data?.provider || "Minfin.com.ua"),
    fetchedAt: data?.fetchedAt || null,
  };
}

export function useCurrency() {
  return useContext(Ctx);
}
