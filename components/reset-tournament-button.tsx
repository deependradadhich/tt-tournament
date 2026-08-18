"use client";

import { useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { resetTournament } from "@/lib/actions";

export function ResetTournamentButton({ adminKey }: { adminKey: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm("Start a new tournament? This permanently deletes this tournament, its players, and all match results.")) {
          return;
        }
        startTransition(async () => {
          try {
            await resetTournament(adminKey);
          } catch (e) {
            unstable_rethrow(e);
          }
        });
      }}
      className="text-xs text-muted underline disabled:opacity-50"
    >
      Reset
    </button>
  );
}
