"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { pairPlayers, randomPairTeams, removeTeam } from "@/lib/actions";
import { Button } from "@/components/ui/buttons";
import { CloseIcon } from "@/components/ui/icons";

type Player = { id: string; name: string; teamId: string | null };
type Team = { id: string; name: string };

export function TeamFormation({
  adminKey,
  players,
  teams,
}: {
  adminKey: string;
  players: Player[];
  teams: Team[];
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const unpaired = players.filter((p) => !p.teamId);
  const teamsReady = teams.length >= 2 && unpaired.length <= 1;

  function toggle(id: string) {
    setError(null);
    if (selected === id) {
      setSelected(null);
      return;
    }
    if (selected === null) {
      setSelected(id);
      return;
    }
    const a = selected;
    setSelected(null);
    startTransition(async () => {
      try {
        await pairPlayers(adminKey, a, id);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  function doRandomPair() {
    setError(null);
    startTransition(async () => {
      try {
        await randomPairTeams(adminKey);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  function doRemoveTeam(teamId: string) {
    startTransition(async () => {
      await removeTeam(adminKey, teamId);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-2 px-5 py-2">
      <button
        type="button"
        disabled={isPending || unpaired.length < 2}
        onClick={doRandomPair}
        className="rounded-xl border border-card-border bg-card py-3.5 text-sm font-semibold disabled:opacity-40"
      >
        Random Pairing
      </button>

      {error && <p className="text-sm text-danger">{error}</p>}

      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">
        Unpaired ({unpaired.length})
      </p>
      <div className="flex flex-wrap gap-2">
        {unpaired.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={isPending}
            onClick={() => toggle(p.id)}
            className={`rounded-full px-3.5 py-2 text-sm font-semibold disabled:opacity-50 ${
              selected === p.id ? "bg-accent text-accent-contrast" : "bg-faint-bg text-muted"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
        Teams ({teams.length})
      </p>
      <div className="flex flex-col gap-2">
        {teams.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 rounded-xl border border-card-border bg-card px-4 py-3"
          >
            <span className="flex-1 font-medium">{t.name}</span>
            <button
              type="button"
              disabled={isPending}
              aria-label="Remove team"
              onClick={() => doRemoveTeam(t.id)}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-faint-bg text-muted disabled:opacity-50"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-auto pb-4 pt-6">
        {teamsReady ? (
          <Link href={`/admin/${adminKey}/setup/draw`}>
            <Button variant="black">Generate Draw</Button>
          </Link>
        ) : (
          <Button variant="black" disabled>
            Generate Draw
          </Button>
        )}
      </div>
    </div>
  );
}
