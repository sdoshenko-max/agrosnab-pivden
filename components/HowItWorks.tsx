import { dict, type Lang } from "@/lib/i18n";

export function HowItWorks({ lang }: { lang: Lang }) {
  const t = dict[lang];
  return (
    <section className="bg-white py-12 lg:py-16 border-y border-border">
      <div className="container-w">
        <h2 className="text-2xl lg:text-3xl text-center mb-10">{t.how.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {t.how.steps.map((step, i) => (
            <div key={i} className="text-center relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand text-white text-2xl font-bold mb-3 shadow-sm">
                {step.n}
              </div>
              <h3 className="font-bold text-lg mb-2">{step.t}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
