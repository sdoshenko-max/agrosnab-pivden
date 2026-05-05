"use client";

import Script from "next/script";
import { useEffect } from "react";
import { GA_ID, ADS_ID, track } from "@/lib/analytics";

export function Analytics() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const a = target?.closest("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (href.startsWith("tel:")) {
        track("phone_click", { phone_number: href.slice(4), location: window.location.pathname });
      } else if (href.startsWith("mailto:")) {
        track("email_click", { email: href.slice(7), location: window.location.pathname });
      } else if (/wa\.me|whatsapp\.com/i.test(href)) {
        track("whatsapp_click", { location: window.location.pathname });
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
          gtag('config', '${ADS_ID}');
        `}
      </Script>
    </>
  );
}
