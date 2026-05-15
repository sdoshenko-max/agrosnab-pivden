"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Phone, FileText, Package, Beaker, FlaskConical, ShoppingCart, Truck, FileBadge2 } from "lucide-react";
import { type Product, getPackSize } from "@/lib/types";
import { getStock } from "@/lib/stock";
import { products as allProducts, cultures as allCultures } from "@/lib/data";
import { manufacturerSlug } from "@/lib/manufacturers";
import { dict, type Lang, COMPANY } from "@/lib/i18n";
import { AgronomistCalculator } from "./AgronomistCalculator";
import { ConsultationForm } from "./ConsultationForm";
import { RequestModal } from "./RequestModal";
import { AddToCart } from "./AddToCart";
import { useCart } from "./CartContext";
import { useCurrency } from "./CurrencyContext";
import { ProductImage } from "./ProductImage";
import { LongDescription } from "./LongDescription";
import { ProductMobileAccordion, type AccordionSection } from "./ProductMobileAccordion";

const tierLabels: Record<string, { uk: string; ru: string; cls: string }> = {
  econom: { uk: "Економ", ru: "Эконом", cls: "badge-econom" },
  premium: { uk: "Преміум", ru: "Премиум", cls: "badge-premium" },
  original: { uk: "Оригінал", ru: "Оригинал", cls: "badge-original" }
};

export function ProductPage({ product, lang, longDesc }: { product: Product; lang: Lang; longDesc?: string }) {
  const t = dict[lang];
  const { format } = useCurrency();
  const cart = useCart();
  const base = lang === "uk" ? "" : "/ru";
  const [requestOpen, setRequestOpen] = useState(false);

  const variants = allProducts
    .filter(p => p.slug === product.slug)
    .sort((a, b) => getPackSize(a.packaging) - getPackSize(b.packaging));

  const name = lang === "uk" ? product.name : product.nameRu;
  const ai = lang === "uk" ? product.activeIngredient : product.activeIngredientRu;
  const desc = lang === "uk" ? product.description : product.descriptionRu;
  const tier = tierLabels[product.tier];
  const tierLabel = lang === "uk" ? tier.uk : tier.ru;
  const stock = getStock(product);
  const inStock = stock > 0 && !product.priceOnRequest;

  const cultureNames = product.cultures.map(slug => allCultures.find(c => c.slug === slug)).filter(Boolean).map(c => lang === "uk" ? c!.nameUk : c!.nameRu);

  const labels = lang === "uk"
    ? { back: "Назад", regulation: "Регламент застосування", crop: "Культура", target: "Призначення", rate: "Норма", manufacturer: "Виробник", about: "Про препарат" }
    : { back: "Назад", regulation: "Регламент применения", crop: "Культура", target: "Назначение", rate: "Норма", manufacturer: "Производитель", about: "О препарате" };

  const accordionTitles = lang === "uk"
    ? { desc: "Опис препарату", rate: "Норма застосування", delivery: "Доставка та оплата", docs: "Документи", analogs: "Аналоги" }
    : { desc: "Описание препарата", rate: "Норма применения", delivery: "Доставка и оплата", docs: "Документы", analogs: "Аналоги" };

  // Пошук аналогів: та сама група + перетин по діючій речовині, різний slug.
  const aiKey = (product.activeIngredient || "").split(",")[0].trim().toLowerCase();
  const analogs = aiKey
    ? allProducts
        .filter(p =>
          p.slug !== product.slug &&
          p.groupSlug === product.groupSlug &&
          (p.activeIngredient || "").toLowerCase().includes(aiKey) &&
          !p.priceOnRequest
        )
        .slice(0, 5)
    : [];

  function handleOrder() {
    if (!inStock) {
      setRequestOpen(true);
      return;
    }
    cart.add({
      slug: product.slug,
      name,
      manufacturer: product.manufacturer,
      packaging: product.packaging,
      packSize: getPackSize(product.packaging),
      unit: product.unit,
      qty: 1,
      priceVat: product.priceVat,
      priceCash: product.priceCash,
      currency: product.currency
    });
  }

  return (
    <>
      <div className="bg-white border-b border-border">
        <div className="container-w py-3 flex items-center justify-between gap-3 flex-wrap text-sm">
          <button onClick={() => { if (typeof window !== "undefined" && window.history.length > 1) window.history.back(); else window.location.href = `${base}/grupy/${product.groupSlug}/`; }} className="inline-flex items-center gap-1 text-muted hover:text-brand transition-colors"><ChevronLeft className="w-4 h-4" />{labels.back}</button>
          <nav className="flex items-center gap-1 text-xs text-muted overflow-hidden">
            <Link href={`${base}/`} className="hover:text-brand whitespace-nowrap">{lang === "uk" ? "Головна" : "Главная"}</Link>
            <span>›</span>
            <Link href={`${base}/grupy/${product.groupSlug}`} className="hover:text-brand whitespace-nowrap">{product.group}</Link>
            <span>›</span>
            <span className="text-ink truncate">{name}</span>
          </nav>
        </div>
      </div>

      <section className="bg-white border-b border-border">
        <div className="container-w py-4 lg:py-12 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          <div className="bg-white rounded-xl border border-border flex items-center justify-center h-[180px] lg:h-auto lg:aspect-square overflow-hidden">
            <ProductImage product={product} alt={name} size="lg" className="w-full h-full object-contain p-2" priority />
          </div>

          {/* MOBILE: компактний верхній блок */}
          <div className="lg:hidden">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`badge ${tier.cls}`}>{tierLabel}</span>
              {inStock ? (
                <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  {lang === "uk" ? "В наявн." : "В наличии"} <b className="font-bold">{stock} {lang === "uk" ? "шт" : "шт"}</b>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap">
                  {lang === "uk" ? "Під замовлення" : "Под заказ"}
                </span>
              )}
              {product.saveFromOriginal && (<span className="text-accent font-bold text-sm">−{product.saveFromOriginal}%</span>)}
              <span className="ml-auto text-xs font-mono text-muted bg-bg border border-border px-2 py-0.5 rounded">№ {product.code}</span>
            </div>

            <h1 className="text-2xl font-extrabold mb-1 leading-tight">{name}</h1>
            <p className="text-sm text-muted mb-3">
              {product.group} · <Link href={`${base}/vyrobnyk/${manufacturerSlug(product.manufacturer)}/`} className="font-medium text-ink underline decoration-dotted underline-offset-2">{product.manufacturer}</Link>
            </p>

            {product.priceOnRequest ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 mb-3">
                <div className="text-lg font-extrabold text-amber-900 mb-0.5">{t.productCard.onRequest}</div>
                <p className="text-xs text-amber-800 leading-snug">{t.productCard.onRequestHint}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-bg p-3 mb-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted">{t.productCard.priceCash}</span>
                  <span className="text-2xl font-extrabold text-brand whitespace-nowrap">{format(product.priceCash * getPackSize(product.packaging), product.currency)}<span className="text-xs font-normal text-muted"> / {product.packaging}</span></span>
                </div>
                <div className="flex justify-between items-baseline mt-0.5">
                  <span className="text-xs text-muted">{t.productCard.priceVat}</span>
                  <span className="text-sm text-muted whitespace-nowrap">{format(product.priceVat * getPackSize(product.packaging), product.currency)}</span>
                </div>
              </div>
            )}

            <dl className="text-sm mb-3 space-y-1.5">
              <div className="flex gap-2">
                <dt className="text-muted shrink-0 w-24">{t.productCard.activeIngredient}:</dt>
                <dd className="font-semibold text-ink">{ai}</dd>
              </div>
              {product.rate && (
                <div className="flex gap-2">
                  <dt className="text-muted shrink-0 w-24">{labels.rate}:</dt>
                  <dd className="font-semibold text-ink">{product.rate}</dd>
                </div>
              )}
              <div className="flex gap-2">
                <dt className="text-muted shrink-0 w-24">{t.productCard.packaging}:</dt>
                <dd className="font-semibold text-ink">{product.packaging}</dd>
              </div>
              {product.analog && (
                <div className="flex gap-2">
                  <dt className="text-muted shrink-0 w-24">{t.productCard.analog}:</dt>
                  <dd>
                    <a
                      href="#mob-analogs"
                      data-event="product_analog_click"
                      data-location="product_page_mobile"
                      className="font-semibold text-ink underline decoration-dotted underline-offset-2 hover:text-brand"
                    >{product.analog}</a>
                  </dd>
                </div>
              )}
            </dl>

            {variants.length > 1 && (
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wide text-muted font-semibold mb-1.5">{lang === "uk" ? "Інші фасовки" : "Другие фасовки"}</p>
                <div className="flex flex-wrap gap-1.5">
                  {variants.map(v => (
                    <Link
                      key={v.code}
                      href={`${base}/produkt/${v.slug}/${v.code}/`}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-semibold ${
                        product.code === v.code
                          ? "border-brand bg-brand text-white"
                          : "border-border bg-white text-ink"
                      }`}
                    >
                      {v.packaging}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleOrder}
                data-event="product_order_click"
                data-location="product_page_mobile"
                className="btn-primary !py-3.5 text-base"
              >
                <ShoppingCart className="w-5 h-5" />
                {lang === "uk" ? "Замовити" : "Заказать"}
              </button>
              <a
                href={`tel:${COMPANY.phone}`}
                data-event="product_call_click"
                data-location="product_page_mobile"
                className="btn-outline !py-3.5 text-base"
              >
                <Phone className="w-5 h-5" />
                {lang === "uk" ? "Подзвонити" : "Позвонить"}
              </a>
            </div>
          </div>

          {/* DESKTOP: оригінальний блок без змін */}
          <div className="hidden lg:block">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`badge ${tier.cls}`}>{tierLabel}</span>
              {product.saveFromOriginal && (<span className="text-accent font-bold text-sm">−{product.saveFromOriginal}% від оригіналу</span>)}
              <span className="ml-auto text-xs font-mono text-muted bg-bg border border-border px-2 py-0.5 rounded">№ {product.code}</span>
            </div>
            <div className="flex justify-end mb-3">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-sm font-semibold px-3.5 py-2 rounded-full shadow-[0_2px_8px_rgba(16,185,129,0.32)] whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                {lang === "uk" ? "В наявності" : "В наличии"} <b className="font-bold">{stock} {lang === "uk" ? "шт" : "шт"}</b>
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-1">{name}</h1>
            <p className="text-muted mb-4">{labels.manufacturer}: <Link href={`${base}/vyrobnyk/${manufacturerSlug(product.manufacturer)}/`} className="font-medium text-ink underline decoration-dotted underline-offset-4 hover:text-brand hover:decoration-brand">{product.manufacturer}</Link></p>

            <div className="bg-brand/5 rounded-lg p-4 mb-4">
              <p className="text-xs uppercase tracking-wide text-muted font-semibold mb-1">{t.productCard.activeIngredient}</p>
              <p className="text-lg font-bold text-ink">{ai}</p>
              <p className="text-sm text-muted">{product.concentration}</p>
              {product.analog && (<p className="text-sm text-muted mt-2">{t.productCard.analog}: <span className="font-semibold text-ink">{product.analog}</span></p>)}
            </div>

            {variants.length > 1 && (
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wide text-muted font-semibold mb-2">{lang === "uk" ? "Фасовка" : "Фасовка"}</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map(v => (
                    <Link
                      key={v.code}
                      href={`${base}/produkt/${v.slug}/${v.code}/`}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors ${
                        product.code === v.code
                          ? "border-brand bg-brand text-white"
                          : "border-border bg-white text-ink hover:border-brand"
                      }`}
                    >
                      {v.packaging}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="card !p-3"><Package className="w-5 h-5 text-brand mb-1" /><p className="text-xs text-muted">{t.productCard.packaging}</p><p className="font-bold">{product.packaging}</p></div>
              {product.rate ? <div className="card !p-3"><FlaskConical className="w-5 h-5 text-brand mb-1" /><p className="text-xs text-muted">{labels.rate}</p><p className="font-bold">{product.rate}</p></div> : null}
            </div>

            {product.priceOnRequest ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 mb-5">
                <div className="text-2xl font-extrabold text-amber-900 mb-1">{t.productCard.onRequest}</div>
                <p className="text-sm text-amber-800 leading-snug">{t.productCard.onRequestHint}</p>
              </div>
            ) : (
              <div className="card !p-4 mb-5 bg-bg">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm text-muted">{t.productCard.priceCash}</span>
                  <span className="text-3xl font-extrabold text-brand whitespace-nowrap">{format(product.priceCash * getPackSize(product.packaging), product.currency)}<span className="text-sm font-normal text-muted"> / {product.packaging}</span></span>
                </div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs text-muted invisible">.</span>
                  <span className="text-xs text-muted">{format(product.priceCash, product.currency)}/{product.unit}</span>
                </div>
                <div className="flex justify-between items-baseline border-t border-border pt-2">
                  <span className="text-xs text-muted">{t.productCard.priceVat}</span>
                  <span className="text-base text-muted whitespace-nowrap">{format(product.priceVat * getPackSize(product.packaging), product.currency)} / {product.packaging}</span>
                </div>
              </div>
            )}

            {product.priceOnRequest ? (
              <button onClick={() => setRequestOpen(true)} className="btn-primary w-full !py-3"><FileText className="w-4 h-4" />{t.productCard.requestBtn}</button>
            ) : (
              <AddToCart product={product} lang={lang} />
            )}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <button onClick={() => setRequestOpen(true)} className="btn-outline !py-2 text-sm"><FileText className="w-4 h-4" />{t.cta.submit}</button>
              <a href={`tel:${COMPANY.phone}`} className="btn-outline !py-2 text-sm"><Phone className="w-4 h-4" />{t.cta.callNow}</a>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE: акордеон з описом, нормою, доставкою, документами, аналогами */}
      <section className="lg:hidden mt-4">
        <ProductMobileAccordion
          sections={[
            ...((longDesc || desc) ? [{
              id: "description",
              title: accordionTitles.desc,
              defaultOpen: true,
              content: longDesc
                ? <LongDescription text={longDesc} />
                : <p className="text-ink leading-relaxed">{desc}</p>
            }] : []),
            ...((product.rate || cultureNames.length > 0) ? [{
              id: "rate",
              title: accordionTitles.rate,
              content: (
                <div>
                  {product.rate && (
                    <p className="mb-3"><span className="text-muted">{labels.rate}: </span><span className="font-semibold text-ink">{product.rate}</span></p>
                  )}
                  {cultureNames.length > 0 && (
                    <div className="border border-border rounded-lg overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-bg"><tr><th className="text-left p-2 font-semibold">{labels.crop}</th><th className="text-left p-2 font-semibold">{labels.target}</th><th className="text-left p-2 font-semibold">{labels.rate}</th></tr></thead>
                        <tbody>{cultureNames.map((cn, i) => (<tr key={i} className="border-t border-border"><td className="p-2 font-medium">{cn}</td><td className="p-2 text-muted">{ai}</td><td className="p-2 font-semibold whitespace-nowrap">{product.rate || "—"}</td></tr>))}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            }] : []),
            {
              id: "delivery",
              title: accordionTitles.delivery,
              content: (
                <div className="space-y-2">
                  <p className="flex items-start gap-2"><Truck className="w-4 h-4 text-brand mt-0.5 shrink-0" /><span>{lang === "uk" ? "Самовивіз зі складу в Миколаєві або відправка Новою Поштою по всій Україні." : "Самовывоз со склада в Николаеве или отправка Новой Почтой по всей Украине."}</span></p>
                  <p className="text-muted">{lang === "uk" ? "Оплата: готівка при отриманні або з ПДВ (безнал) для ФОП/ТОВ." : "Оплата: наличные при получении или с НДС (безнал) для ФЛП/ООО."}</p>
                  <Link href={`${base}/dostavka-i-oplata`} className="inline-block mt-1 text-brand font-semibold underline decoration-dotted">{lang === "uk" ? "Усі умови →" : "Все условия →"}</Link>
                </div>
              )
            },
            {
              id: "docs",
              title: accordionTitles.docs,
              content: (
                <div className="space-y-2">
                  <p className="flex items-start gap-2"><FileBadge2 className="w-4 h-4 text-brand mt-0.5 shrink-0" /><span>{lang === "uk" ? "Надаємо сертифікати, паспорти якості та реєстраційні посвідчення на кожну поставку." : "Предоставляем сертификаты, паспорта качества и регистрационные удостоверения на каждую поставку."}</span></p>
                  <Link href={`${base}/sertyfikaty`} className="inline-block mt-1 text-brand font-semibold underline decoration-dotted">{lang === "uk" ? "Подивитися документи →" : "Посмотреть документы →"}</Link>
                </div>
              )
            },
            {
              id: "mob-analogs",
              title: accordionTitles.analogs,
              content: analogs.length > 0 ? (
                <div className="space-y-2">
                  {analogs.map(a => {
                    const aName = lang === "uk" ? a.name : a.nameRu;
                    const aTier = tierLabels[a.tier];
                    const aTierLabel = lang === "uk" ? aTier.uk : aTier.ru;
                    return (
                      <Link
                        key={a.code}
                        href={`${base}/produkt/${a.slug}/${a.code}/`}
                        data-event="product_analog_click"
                        data-location="product_page_mobile_accordion"
                        className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border bg-white hover:border-brand"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`badge ${aTier.cls} text-[10px]`}>{aTierLabel}</span>
                            <span className="text-xs text-muted truncate">{a.manufacturer}</span>
                          </div>
                          <p className="font-semibold text-ink truncate">{aName}</p>
                          <p className="text-xs text-muted">{a.packaging}</p>
                        </div>
                        <span className="text-brand font-bold whitespace-nowrap shrink-0">{a.priceOnRequest ? (lang === "uk" ? "за запитом" : "по запросу") : format(a.priceCash * getPackSize(a.packaging), a.currency)}</span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted">{lang === "uk" ? "Інших препаратів з такою діючою речовиною в каталозі поки немає. Зателефонуйте — допоможемо підібрати." : "Других препаратов с таким действующим веществом в каталоге пока нет. Позвоните — поможем подобрать."}</p>
              )
            }
          ] as AccordionSection[]}
        />
      </section>

      {/* DESKTOP: оригінальна структура опису + регламент + калькулятор */}
      <div className="hidden lg:block">
        {(longDesc || desc) && (
          <section className="container-w py-8">
            <h2 className="text-xl font-bold mb-4">{labels.about}</h2>
            {longDesc ? (
              <LongDescription text={longDesc} />
            ) : (
              <p className="text-muted leading-relaxed max-w-3xl">{desc}</p>
            )}
          </section>
        )}

        {!longDesc && cultureNames.length > 0 && (
          <section className="container-w py-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Beaker className="w-5 h-5 text-brand" />{labels.regulation}</h2>
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border"><th className="text-left p-2 font-semibold">{labels.crop}</th><th className="text-left p-2 font-semibold">{labels.target}</th><th className="text-left p-2 font-semibold">{labels.rate}</th></tr></thead>
                <tbody>{cultureNames.map((cn, i) => (<tr key={i} className="border-b border-border last:border-0"><td className="p-2 font-medium">{cn}</td><td className="p-2 text-muted">{ai}</td><td className="p-2 font-semibold whitespace-nowrap">{product.rate || "—"}</td></tr>))}</tbody>
              </table>
            </div>
          </section>
        )}

        {!product.priceOnRequest && <section className="container-w py-6"><AgronomistCalculator product={product} lang={lang} /></section>}
      </div>

      <ConsultationForm lang={lang} productName={name} productSlug={product.slug} />

      <RequestModal open={requestOpen} onClose={() => setRequestOpen(false)} productName={name} lang={lang} />
    </>
  );
}
