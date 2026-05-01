import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import { GlobalCartDrawer } from "@/components/GlobalCartDrawer";

export const metadata: Metadata = {
  metadataBase: new URL("https://agrosnab-pivden.com.ua"),
  title: { default: "АГРОСНАБ-ПІВДЕНЬ — засоби захисту рослин для Півдня України", template: "%s | АГРОСНАБ-ПІВДЕНЬ" },
  description: "Інтернет-каталог ЗЗР для фермерів Миколаївської, Херсонської, Одеської областей.",
  icons: { icon: "/favicon.svg" },
  openGraph: { type: "website", locale: "uk_UA", siteName: "АГРОСНАБ-ПІВДЕНЬ" }
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 5, themeColor: "#166534"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CartProvider>
          {children}
          <GlobalCartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
