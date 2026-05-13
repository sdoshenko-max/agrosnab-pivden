import type { MetadataRoute } from "next";
import { products, cultures, tankMixes } from "@/lib/data";
import { groups } from "@/lib/groups";
import { activeIngredients } from "@/lib/activeIngredients";
import { allManufacturers } from "@/lib/manufacturers";
import { articles } from "@/lib/articles";
import { cities } from "@/lib/cities";

const BASE = "https://agrosnab-pivden.com";

// Шляхи, які реально існують у /app — звіряти з папкою при додаванні нових сторінок.
const STATIC_UA = [
  "/", "/kultury/", "/grupy/", "/diiucha-rechovyna/", "/bakovi-sumishi/",
  "/kontakty/", "/pro-nas/", "/dostavka-i-oplata/", "/oferta/",
  "/konfidentsiynist/", "/sertyfikaty/", "/baza-znan/", "/mista/"
];
// RU статичні сторінки — звіряти з папкою /app/ru/ при додаванні нових.
const STATIC_RU = [
  "/ru/", "/ru/kultury/", "/ru/grupy/", "/ru/diiucha-rechovyna/",
  "/ru/bakovi-sumishi/", "/ru/kontakty/", "/ru/pro-nas/",
  "/ru/dostavka-i-oplata/", "/ru/oferta/", "/ru/konfidentsiynist/",
  "/ru/sertyfikaty/", "/ru/baza-znan/"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();
  const push = (path: string) => {
    const url = `${BASE}${path}`;
    if (seen.has(url)) return;
    seen.add(url);
    urls.push({ url, lastModified: now });
  };

  STATIC_UA.forEach(push);
  STATIC_RU.forEach(push);

  // Динамічні сторінки, що існують для обох мов.
  const bothLangs: Array<["", "/ru"][number]> = ["", "/ru"];
  for (const lang of bothLangs) {
    cultures.forEach(c => push(`${lang}/kultury/${c.slug}/`));
    groups.forEach(g => push(`${lang}/grupy/${g.slug}/`));
    activeIngredients.forEach(a => push(`${lang}/diiucha-rechovyna/${a.slug}/`));
    tankMixes.forEach(m => push(`${lang}/bakovi-sumishi/${m.slug}/`));
    allManufacturers().forEach(m => push(`${lang}/vyrobnyk/${m.slug}/`));

    // Лише SKU-сторінки за кодом фасовки. Slug-only /produkt/[slug]/ навмисно
    // не індексуємо: контент = найменший SKU (повний дубль), canonical у slug-only
    // веде на той самий SKU. Сторінка залишається доступною за прямим URL.
    products.forEach(p => push(`${lang}/produkt/${p.slug}/${p.code}/`));
  }

  // Статті бази знань — UA + RU.
  articles.forEach(a => {
    push(`/baza-znan/${a.slug}/`);
    push(`/ru/baza-znan/${a.slug}/`);
  });

  // Міські лендинги — лише UA (RU-версії немає за рішенням від 2026-05-12).
  cities.forEach(c => push(`/mista/${c.slug}/`));

  return urls;
}
