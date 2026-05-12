"use client";

import { createContext, useContext, useEffect, useReducer, useState, ReactNode } from "react";

export type CartItem = {
  slug: string;
  name: string;
  manufacturer: string;
  packaging: string;
  packSize: number;       // розмір однієї каністри (5, 10, 20)
  unit: string; // "л" | "кг"
  qty: number;            // кількість КАНІСТР
  priceVat: number;       // ціна за 1 л/кг
  priceCash: number;      // ціна за 1 л/кг
  currency: string; // "USD" | "EUR"
};

type CartState = { items: CartItem[] };
type Action =
  | { type: "add"; item: CartItem }
  | { type: "update"; slug: string; qty: number }
  | { type: "remove"; slug: string }
  | { type: "clear" }
  | { type: "init"; state: CartState };

const initial: CartState = { items: [] };

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "init":
      return action.state;
    case "add": {
      const existing = state.items.find(i => i.slug === action.item.slug);
      if (existing) {
        return { items: state.items.map(i => i.slug === action.item.slug ? { ...i, qty: i.qty + action.item.qty } : i) };
      }
      return { items: [...state.items, action.item] };
    }
    case "update":
      return { items: state.items.map(i => i.slug === action.slug ? { ...i, qty: Math.max(0, action.qty) } : i).filter(i => i.qty > 0) };
    case "remove":
      return { items: state.items.filter(i => i.slug !== action.slug) };
    case "clear":
      return { items: [] };
    default:
      return state;
  }
}

type CartCtx = {
  items: CartItem[];
  add: (item: CartItem) => void;
  update: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  totalVat: number;
  totalCash: number;
  count: number;
  isOpen: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [isOpen, setOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("agrosnab_cart");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.items)) dispatch({ type: "init", state: parsed });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("agrosnab_cart", JSON.stringify(state)); } catch {}
  }, [state]);

  // qty * packSize * price = сума за позицію
  const totalVat = state.items.reduce((s, i) => s + i.qty * i.packSize * i.priceVat, 0);
  const totalCash = state.items.reduce((s, i) => s + i.qty * i.packSize * i.priceCash, 0);
  const count = state.items.reduce((s, i) => s + i.qty, 0);

  const value: CartCtx = {
    items: state.items,
    add: item => { dispatch({ type: "add", item }); setOpen(true); },
    update: (slug, qty) => dispatch({ type: "update", slug, qty }),
    remove: slug => dispatch({ type: "remove", slug }),
    clear: () => dispatch({ type: "clear" }),
    totalVat, totalCash, count,
    isOpen, setOpen
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
