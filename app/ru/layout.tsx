import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/ru", languages: { "uk": "/", "ru": "/ru" } },
  openGraph: { locale: "ru_UA" },
};

// Static export не підтримує middleware/headers() — щоб /ru/* мав <html lang="ru">,
// синхронно (до гідрації React) перепризначаємо lang через inline-скрипт.
// hreflang-alternates у root metadata уже кажуть Google що це російська версія.
export default function RuLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.lang='ru';" }} />
      {children}
    </>
  );
}
