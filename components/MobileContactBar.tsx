"use client";

import { Phone, Send } from "lucide-react";
import { usePathname } from "next/navigation";
import { COMPANY } from "@/lib/i18n";

export function MobileContactBar() {
  const pathname = usePathname();
  const isRu = pathname?.startsWith("/ru") ?? false;
  const callLabel = isRu ? "Позвонить" : "Подзвонити";
  const ariaLabel = isRu ? "Быстрая связь" : "Швидкий зв'язок";

  return (
    <nav
      id="mobile-contact-bar"
      aria-label={ariaLabel}
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch h-[60px]">
        <a
          href={`tel:${COMPANY.phone}`}
          data-event="mobile_call_click"
          data-location="mobile_bar"
          aria-label={callLabel}
          className="flex-1 flex items-center justify-center gap-2 text-ink font-semibold text-sm active:bg-bg border-r border-border"
        >
          <Phone className="w-5 h-5 text-brand" aria-hidden="true" />
          <span>{callLabel}</span>
        </a>
        <a
          href={`https://t.me/${COMPANY.telegramUser}`}
          target="_blank"
          rel="noopener"
          data-event="mobile_telegram_click"
          data-location="mobile_bar"
          aria-label="Telegram"
          className="flex-1 flex items-center justify-center gap-2 text-ink font-semibold text-sm active:bg-bg"
        >
          <Send className="w-5 h-5 text-blue-500" aria-hidden="true" />
          <span>Telegram</span>
        </a>
      </div>
    </nav>
  );
}
