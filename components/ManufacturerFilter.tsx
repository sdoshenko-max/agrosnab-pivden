"use client";

import { ManufacturerLogo } from "./ManufacturerLogo";

export function ManufacturerFilter({
  value,
  onChange,
  options,
  allLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  allLabel: string;
}) {
  const active = (v: string) =>
    v === value
      ? "border-brand bg-brand/10 text-brand"
      : "border-border bg-white hover:border-brand/40";

  return (
    <div className="grid grid-cols-2 gap-1.5">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs font-semibold transition-colors text-left ${active("all")}`}
      >
        <span
          className="inline-flex items-center justify-center rounded-full text-muted bg-bg border border-border shrink-0"
          style={{ width: 20, height: 20, fontSize: 10 }}
          aria-hidden="true"
        >
          ∗
        </span>
        <span className="truncate">{allLabel}</span>
      </button>
      {options.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs font-semibold transition-colors text-left ${active(m)}`}
          aria-pressed={value === m}
        >
          <ManufacturerLogo name={m} size={20} />
          <span className="truncate">{m}</span>
        </button>
      ))}
    </div>
  );
}
