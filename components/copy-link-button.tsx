"use client";

import { useState } from "react";

export function CopyLinkButton({ path, label }: { path: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        const url = `${window.location.origin}${path}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 active:scale-95 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
