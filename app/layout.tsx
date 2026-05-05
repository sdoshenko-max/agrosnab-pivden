import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import { GlobalCartDrawer } from "@/components/GlobalCartDrawer";
import { CurrencyProvider } from "@/components/CurrencyContext";
import { Analytics } from "@/components/Analytics";

export const metadata: Metadata = {
  metadataBase: new URL("https://agrosnab-pivden.com"),
  title: { default: "АГРОСНАБ-ПІВДЕНЬ — засоби захисту рослин для Півдня України", template: "%s | АГРОСНАБ-ПІВДЕНЬ" },
  description: "Інтернет-каталог ЗЗР для фермерів Миколаївської, Херсонської, Одеської областей. Чесні дженерики, економія до 60% від оригіналу.",
  icons: { icon: "/favicon.svg" },
  openGraph: { type: "website", locale: "uk_UA", siteName: "АГРОСНАБ-ПІВДЕНЬ", images: ["/og.png"] },
  alternates: { languages: { "uk": "/", "ru": "/ru" } }
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 5, themeColor: "#166534" };

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ТОВ АГРОСНАБ-ПІВДЕНЬ",
  "url": "https://agrosnab-pivden.com",
  "logo": "https://agrosnab-pivden.com/logo.svg",
  "telephone": "+380660321997",
  "email": "sdoshenko@gmail.com",
  "address": { "@type": "PostalAddress", "addressLocality": "Миколаїв", "addressCountry": "UA" },
  "areaServed": ["Миколаївська область", "Херсонська область", "Одеська область"]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      </head>
      <body>
        <Analytics />
        <CurrencyProvider>
          <CartProvider>
            {children}
            <GlobalCartDrawer />
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
