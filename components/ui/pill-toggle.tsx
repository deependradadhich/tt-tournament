"use client";

import { useState } from "react";

export function PillToggle({
  name,
  options,
  defaultValue,
}: {
  name: string;
  options: { value: string; label: string; disabled?: boolean }[];
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="grid grid-cols-2 gap-2">
      <input type="hidden" name={name} value={value} />
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={opt.disabled}
            onClick={() => setValue(opt.value)}
            className={`rounded-2xl py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              selected ? "bg-accent text-accent-contrast" : "bg-faint-bg text-muted"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
