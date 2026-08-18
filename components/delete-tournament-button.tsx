"use client";

import { useTransition } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import { deleteTournament } from "@/lib/actions";
import { CloseIcon } from "@/components/ui/icons";

export function DeleteTournamentButton({
  tournamentId,
  tournamentName,
}: {
  tournamentId: string;
  tournamentName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label={`Delete ${tournamentName}`}
      disabled={isPending}
      onClick={() => {
        if (
          !window.confirm(
            `Delete "${tournamentName}"? This permanently removes it and all its players, teams, and match results.`
          )
        ) {
          return;
        }
        startTransition(async () => {
          try {
            await deleteTournament(tournamentId);
            router.refresh();
          } catch (e) {
            unstable_rethrow(e);
          }
        });
      }}
      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-faint-bg text-muted disabled:opacity-50"
    >
      <CloseIcon className="h-4 w-4" />
    </button>
  );
}
