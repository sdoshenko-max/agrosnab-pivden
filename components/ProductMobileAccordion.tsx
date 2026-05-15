"use client";

import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export type AccordionSection = {
  id: string;
  title: string;
  content: ReactNode;
  defaultOpen?: boolean;
};

export function ProductMobileAccordion({ sections }: { sections: AccordionSection[] }) {
  return (
    <div className="lg:hidden divide-y divide-border border-y border-border bg-white">
      {sections.map(s => (
        <details key={s.id} open={s.defaultOpen} className="group">
          <summary className="flex items-center justify-between py-4 px-4 cursor-pointer list-none font-semibold text-ink hover:bg-bg select-none">
            <span className="text-base">{s.title}</span>
            <ChevronDown className="w-5 h-5 text-muted transition-transform group-open:rotate-180 shrink-0" />
          </summary>
          <div className="px-4 pb-5 pt-1 text-sm leading-relaxed">
            {s.content}
          </div>
        </details>
      ))}
    </div>
  );
}
