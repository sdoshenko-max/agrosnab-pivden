import type { MetadataRoute } from "next";
import { products, cultures, tankMixes } from "@/lib/data";
import { groups } from "@/lib/groups";
import { activeIngredients } from "@/lib/activeIngredients";

const BASE = "https://agrosnab-pivden.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = [
    "/", "/kultury", "/grupy", "/diiucha-rechovyna", "/bakovi-sumishi",
    "/kontakty", "/pro-nas", "/dostavka-i-oplata", "/oferta", "/konfidentsiynist", "/sertyfikaty", "/baza-znan"
  ];
  const urls: MetadataRoute.Sitemap = [];
  for (const lang of ["", "/ru"]) {
    for (const p of staticPaths) urls.push({ url: `${BASE}${lang}${p}`, lastModified: now });
    cultures.forEach(c => urls.push({ url: `${BASE}${lang}/kultury/${c.slug}`, lastModified: now }));
    products.forEach(p => urls.push({ url: `${BASE}${lang}/produkt/${p.slug}`, lastModified: now }));
    groups.forEach(g => urls.push({ url: `${BASE}${lang}/grupy/${g.slug}`, lastModified: now }));
    activeIngredients.forEach(a => urls.push({ url: `${BASE}${lang}/diiucha-rechovyna/${a.slug}`, lastModified: now }));
    tankMixes.forEach(m => urls.push({ url: `${BASE}${lang}/bakovi-sumishi/${m.slug}`, lastModified: now }));
  }
  return urls;
}
