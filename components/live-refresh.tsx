"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Polls the current route's server data so bracket/scoreboard viewers see updates without reloading. */
export function LiveRefresh({ intervalMs = 3000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
