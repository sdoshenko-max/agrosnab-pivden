export const GA_ID = "G-79JCPMNE9D";
export const ADS_ID = "AW-18140720729";
export const ADS_CONVERSION_LEAD = "AW-18140720729/qTTRCOnD6qccENnclcpD";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", event, params || {});
}

export function trackLeadConversion(meta?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "generate_lead", meta || {});
  window.gtag("event", "conversion", {
    send_to: ADS_CONVERSION_LEAD,
    value: 1.0,
    currency: "UAH",
    ...meta,
  });
}
