"use client";

import { useEffect } from "react";

// Тільки український номер +380XXXXXXXXX, рівно 13 символів
export function isValidPhone(p: string): boolean {
  return /^\+380\d{9}$/.test(p);
}

// Витягуємо до 9 цифр номеру (без префікса +380) з повного значення
function getBody(value: string): string {
  const digits = (value || "").replace(/\D/g, "");
  let body = digits;
  if (body.startsWith("380")) body = body.slice(3);
  else if (body.startsWith("80")) body = body.slice(2);
  else if (body.startsWith("0")) body = body.slice(1);
  return body.slice(0, 9);
}

// Гарне форматування поки користувач набирає: 50 123 45 67
function formatBody(b: string): string {
  if (b.length <= 2) return b;
  if (b.length <= 5) return `${b.slice(0, 2)} ${b.slice(2)}`;
  if (b.length <= 7) return `${b.slice(0, 2)} ${b.slice(2, 5)} ${b.slice(5)}`;
  return `${b.slice(0, 2)} ${b.slice(2, 5)} ${b.slice(5, 7)} ${b.slice(7)}`;
}

export function PhoneInput({
  value,
  onChange,
  required = true,
  className = ""
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  const body = getBody(value);

  // Гарантуємо, що батько отримує валідний value
  useEffect(() => {
    const expected = body ? `+380${body}` : "";
    if (value !== expected) onChange(expected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 9);
    onChange(onlyDigits ? `+380${onlyDigits}` : "");
  }

  // Базовий стиль інпута — або кастомний від батька, або дефолтний
  const baseInput = className
    ? `${className} !pl-[68px]`
    : "w-full pl-[68px] pr-4 py-2.5 rounded-lg border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none bg-white";

  // Колір префікса — світлий якщо темний фон (для QuickCallForm), інакше темний
  const prefixColor = className.includes("bg-white") || !className ? "text-ink" : "text-ink";

  return (
    <div className="relative w-full">
      <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${prefixColor} font-medium pointer-events-none select-none`}>+380</span>
      <input
        type="tel"
        inputMode="numeric"
        value={formatBody(body)}
        onChange={handleChange}
        placeholder="50 123 45 67"
        required={required}
        maxLength={13}
        title="Формат: +380XXXXXXXXX (9 цифр після +380)"
        className={baseInput}
      />
    </div>
  );
}
