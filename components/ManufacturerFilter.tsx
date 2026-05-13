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
      ? "border-brand bg-brand/5 ring-2 ring-brand/30"
      : "border-border bg-white hover:border-brand/40 hover:bg-bg/50";

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))" }}>
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-lg border transition-all ${active("all")}`}
        aria-pressed={value === "all"}
      >
        <span
          className="inline-flex items-center justify-center rounded-full text-muted bg-bg border border-border"
          style={{ width: 44, height: 44, fontSize: 22 }}
          aria-hidden="true"
        >
          ∗
        </span>
        <span className="text-[11px] font-semibold leading-tight text-center text-ink line-clamp-2">
          {allLabel}
        </span>
      </button>
      {options.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-lg border transition-all ${active(m)}`}
          aria-pressed={value === m}
          title={m}
        >
          <ManufacturerLogo name={m} size={44} />
          <span className="text-[11px] font-semibold leading-tight text-center text-ink line-clamp-2">
            {m}
          </span>
        </button>
      ))}
    </div>
  );
}
