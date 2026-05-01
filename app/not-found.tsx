import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <html lang="uk">
      <body className="min-h-screen flex items-center justify-center bg-bg p-6">
        <div className="text-center">
          <p className="text-7xl font-extrabold text-brand mb-2">404</p>
          <h1 className="text-2xl font-bold mb-3">Сторінку не знайдено</h1>
          <p className="text-muted mb-6">Можливо, посилання застаріле або сторінку видалено.</p>
          <Link href="/" className="btn-primary inline-flex">
            <Home className="w-4 h-4" /> На головну
          </Link>
        </div>
      </body>
    </html>
  );
}
