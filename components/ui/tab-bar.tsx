"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridIcon, CircleIcon, DiamondIcon } from "@/components/ui/icons";

export function TabBar({ base, rosterLabel = "Players" }: { base: string; rosterLabel?: string }) {
  const pathname = usePathname();
  const tabs = [
    { href: `${base}/results`, label: "Results", Icon: GridIcon },
    { href: `${base}/roster`, label: rosterLabel, Icon: CircleIcon },
    { href: `${base}/history`, label: "History", Icon: DiamondIcon },
  ];

  return (
    <nav className="sticky bottom-0 flex border-t border-card-border bg-card">
      {tabs.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-semibold ${
              active ? "text-accent" : "text-faint"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
