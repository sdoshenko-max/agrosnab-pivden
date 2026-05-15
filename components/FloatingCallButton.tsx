"use client";

import { Phone } from "lucide-react";
import { COMPANY } from "@/lib/i18n";

export function FloatingCallButton() {
  return (
    <a
      href={`tel:${COMPANY.phone}`}
      className="fixed bottom-5 right-5 z-30 w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-accent hover:bg-accent-dark text-white hidden md:flex items-center justify-center shadow-xl transition-transform hover:scale-110 group"
      aria-label="Call us"
    >
      <Phone className="w-6 h-6 lg:w-7 lg:h-7" />
      <span className="absolute right-full mr-3 bg-ink text-white text-sm font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
        {COMPANY.phone}
      </span>
    </a>
  );
}
