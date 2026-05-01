import { Wallet, Truck, FileCheck, MessageCircle } from "lucide-react";
import { dict, type Lang } from "@/lib/i18n";

export function WhyUs({ lang }: { lang: Lang }) {
  const t = dict[lang];
  const icons = [Wallet, Truck, FileCheck, MessageCircle];

  return (
    <section className="container-w py-12 lg:py-16">
      <h2 className="text-2xl lg:text-3xl text-center mb-8">{t.why.title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {t.why.items.map((it, i) => {
          const Icon = icons[i];
          return (
            <div key={i} className="card text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-brand/10 text-brand rounded-full mb-3">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base mb-2">{it.t}</h3>
              <p className="text-sm text-muted leading-snug">{it.d}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
