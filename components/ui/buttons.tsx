import { ButtonHTMLAttributes } from "react";

type Variant = "black" | "accent" | "outline";

const VARIANT_CLASS: Record<Variant, string> = {
  black:
    "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 disabled:bg-faint-bg disabled:text-faint",
  accent: "bg-accent text-accent-contrast hover:opacity-90 disabled:bg-faint-bg disabled:text-faint",
  outline:
    "bg-card text-foreground border border-card-border hover:bg-faint-bg disabled:text-faint",
};

export function Button({
  variant = "black",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`w-full rounded-2xl py-4 text-base font-semibold transition-colors disabled:cursor-not-allowed ${VARIANT_CLASS[variant]} ${className}`}
      {...props}
    />
  );
}
