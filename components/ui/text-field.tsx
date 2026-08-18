import { InputHTMLAttributes } from "react";

export function TextField({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      <input
        className={`rounded-xl border border-card-border bg-card px-3.5 py-3 text-base text-foreground placeholder:text-faint focus:border-accent focus:outline-none ${className}`}
        {...props}
      />
    </label>
  );
}
