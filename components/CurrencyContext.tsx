"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Rates = { USD: number; EUR: number; date: string };

const DEFAULT_RATES: Rates = { USD: 43.80, EUR: 51.45, date: "2026-05-02" };
const STORAGE_KEY = "agrosnab_rates";
const TTL_HOURS = 6;

const Ctx = createContext<{ rates: Rates; format: (usd: number, currency?: "USD" | "EUR") => string; loading: boolean }>({
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
        const age = (Date.now() - new Date(parsed.fetched).getTime()) / 1000 / 3600;
        if (age < TTL_HOURS && parsed.rates?.USD) {
          setRates(parsed.rates);
          return;
        }
      }
    } catch {}

    setLoading(true);
    fetch("https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5")
      .then(r => r.json())
      .then((data: Array<{ ccy: string; buy: string; sale: string }>) => {
        const usd = data.find(d => d.ccy === "USD");
        const eur = data.find(d => d.ccy === "EUR");
        if (!usd || !eur) throw new Error();
        const newRates: Rates = {
          USD: +((parseFloat(usd.buy) + parseFloat(usd.sale)) / 2).toFixed(2),
          EUR: +((parseFloat(eur.buy) + parseFloat(eur.sale)) / 2).toFixed(2),
          date: new Date().toISOString().slice(0, 10)
        };
        setRates(newRates);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ rates: newRates, fetched: new Date().toISOString() })); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function format(amount: number, currency: "USD" | "EUR" = "USD"): string {
    const rate = currency === "EUR" ? rates.EUR : rates.USD;
    const uah = Math.round(amount * rate);
    return uah.toLocaleString("uk-UA").replace(/,/g, " ") + " ₴";
  }

  return <Ctx.Provider value={{ rates, format, loading }}>{children}</Ctx.Provider>;
}

export function useCurrency() {
  return useContext(Ctx);
}
