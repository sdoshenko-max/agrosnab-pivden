"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { products, cultures } from "@/lib/data";
import { groups } from "@/lib/groups";
import type { Lang } from "@/lib/i18n";

export function SearchBox({ lang }: { lang: Lang }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const base = lang === "uk" ? "" : "/ru";

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const query = q.trim().toLowerCase();
  const results = query.length < 2 ? null : {
    products: products.filter(p =>
      (lang === "uk" ? p.name : p.nameRu).toLowerCase().includes(query) ||
      (lang === "uk" ? p.activeIngredient : p.activeIngredientRu).toLowerCase().includes(query) ||
      p.manufacturer.toLowerCase().includes(query)
    ).slice(0, 8),
    cultures: cultures.filter(c => (lang === "uk" ? c.nameUk : c.nameRu).toLowerCase().includes(query)).slice(0, 4),
    groups: groups.filter(g => (lang === "uk" ? g.nameUk : g.nameRu).toLowerCase().includes(query)).slice(0, 4)
  };

  const placeholder = lang === "uk" ? "Пошук препарату або діючої речовини..." : "Поиск препарата или действующего вещества...";
  const empty = lang === "uk" ? "Нічого не знайдено" : "Ничего не найдено";

  return (
    <div ref={ref} className="relative flex-1 max-w-md hidden md:block">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder={placeholder}
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="w-full pl-9 pr-8 py-2 rounded-lg border border-border bg-bg focus:bg-white focus:border-brand outline-none text-sm"
        />
        {q && (
          <button onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-muted" /></button>
        )}
      </div>
      {open && results && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-border shadow-lg max-h-96 overflow-y-auto z-50">
          {results.products.length === 0 && results.cultures.length === 0 && results.groups.length === 0 ? (
            <p className="p-3 text-sm text-muted text-center">{empty}</p>
          ) : (
            <>
              {results.products.length > 0 && (
                <div className="p-2">
                  <p className="text-[10px] uppercase font-semibold text-muted px-2 py-1">{lang === "uk" ? "Препарати" : "Препараты"}</p>
                  {results.products.map(p => (
                    <Link key={p.slug} href={`${base}/produkt/${p.slug}`} onClick={() => setOpen(false)} className="block px-2 py-1.5 hover:bg-bg rounded">
                      <p className="text-sm font-semibold">{lang === "uk" ? p.name : p.nameRu}</p>
                      <p className="text-xs text-muted truncate">{lang === "uk" ? p.activeIngredient : p.activeIngredientRu} · {p.manufacturer} · {p.priceOnRequest ? (lang === "uk" ? "ціна за запитом" : "цена по запросу") : `$${p.priceCash}/${p.unit}`}</p>
                    </Link>
                  ))}
                </div>
              )}
              {results.cultures.length > 0 && (
                <div className="p-2 border-t border-border">
                  <p className="text-[10px] uppercase font-semibold text-muted px-2 py-1">{lang === "uk" ? "Культури" : "Культуры"}</p>
                  {results.cultures.map(c => (
                    <Link key={c.slug} href={`${base}/kultury/${c.slug}`} onClick={() => setOpen(false)} className="block px-2 py-1.5 hover:bg-bg rounded text-sm font-medium">
                      {c.emoji} {lang === "uk" ? c.nameUk : c.nameRu}
                    </Link>
                  ))}
                </div>
              )}
              {results.groups.length > 0 && (
                <div className="p-2 border-t border-border">
                  <p className="text-[10px] uppercase font-semibold text-muted px-2 py-1">{lang === "uk" ? "Групи" : "Группы"}</p>
                  {results.groups.map(g => (
                    <Link key={g.slug} href={`${base}/grupy/${g.slug}`} onClick={() => setOpen(false)} className="block px-2 py-1.5 hover:bg-bg rounded text-sm font-medium">
                      {g.emoji} {lang === "uk" ? g.nameUk : g.nameRu}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
