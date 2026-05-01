"use client";

// Валідація: тільки український номер +380XXXXXXXXX, рівно 13 символів
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // Завжди починаємо з 380
  let body = digits;
  if (body.startsWith("380")) body = body.slice(3);
  else if (body.startsWith("80")) body = body.slice(2);
  else if (body.startsWith("0")) body = body.slice(1);
  body = body.slice(0, 9);
  return "+380" + body;
}

export function isValidPhone(p: string): boolean {
  return /^\+380\d{9}$/.test(p);
}

export function PhoneInput({
  value,
  onChange,
  placeholder = "+380 _________",
  required = true,
  className = ""
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <input
      type="tel"
      inputMode="tel"
      value={value}
      onChange={e => onChange(formatPhone(e.target.value))}
      placeholder={placeholder}
      required={required}
      maxLength={13}
      pattern="\+380\d{9}"
      title="Формат: +380XXXXXXXXX (9 цифр після +380)"
      className={className || "w-full px-4 py-2.5 rounded-lg border border-border focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"}
    />
  );
}
