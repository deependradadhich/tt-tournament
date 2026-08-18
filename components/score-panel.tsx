"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adjustScore } from "@/lib/actions";
import {
  applyPoint,
  computeMatchState,
  isGameWon,
  type Game,
  type ScoringRules,
} from "@/lib/scoring";
import { Button } from "@/components/ui/buttons";

type Side = { id: string; name: string };

export function ScorePanel({
  adminKey,
  matchId,
  playerA,
  playerB,
  initialGames,
  rules,
}: {
  adminKey: string;
  matchId: string;
  playerA: Side;
  playerB: Side;
  initialGames: Game[];
  rules: ScoringRules;
}) {
  const [games, setGames] = useState(initialGames);
  const [syncedGames, setSyncedGames] = useState(initialGames);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Reset local (possibly optimistic) state whenever the server sends a fresh games array.
  if (initialGames !== syncedGames) {
    setSyncedGames(initialGames);
    setGames(initialGames);
  }

  const state = computeMatchState(games, rules);
  const current = games[games.length - 1] ?? { a: 0, b: 0 };
  const decided = state.matchWinner !== null;
  const lastFinished = [...games].reverse().find((g) => isGameWon(g, rules) !== null);

  function point(side: "A" | "B", delta: 1 | -1) {
    if (decided) return;
    setGames((g) => applyPoint(g, side, delta, rules));
    startTransition(async () => {
      await adjustScore(adminKey, matchId, side, delta);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 pt-4">
      <div className="flex items-center justify-center gap-4 text-center">
        <span className="font-bold">{playerA.name}</span>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-muted">
            {state.gamesWonA}–{state.gamesWonB}
          </span>
          {lastFinished && (
            <span className="text-xs text-faint">
              {lastFinished.a}–{lastFinished.b}
            </span>
          )}
        </div>
        <span className="font-bold">{playerB.name}</span>
      </div>

      <div className="grid grid-cols-2 items-center">
        <span className="justify-self-center text-6xl font-extrabold tabular-nums">{current.a}</span>
        <span className="justify-self-center text-6xl font-extrabold tabular-nums">{current.b}</span>
      </div>

      {!decided && (
        <>
          <div className="grid grid-cols-2">
            <div className="flex justify-center gap-3">
              <ScoreButton label="−" onClick={() => point("A", -1)} disabled={isPending} variant="outline" />
              <ScoreButton label="+" onClick={() => point("A", 1)} disabled={isPending} variant="accent" />
            </div>
            <div className="flex justify-center gap-3">
              <ScoreButton label="−" onClick={() => point("B", -1)} disabled={isPending} variant="outline" />
              <ScoreButton label="+" onClick={() => point("B", 1)} disabled={isPending} variant="accent" />
            </div>
          </div>

          <p className="text-center text-xs text-muted">
            First to {rules.pointsPerGame}
            {rules.winBy2 ? ", win by 2" : ""} · First to {Math.floor(rules.bestOf / 2) + 1} games wins
            the match
          </p>
        </>
      )}

      {decided && (
        <div className="mt-auto flex flex-col gap-3 pb-4">
          <div className="rounded-2xl bg-accent px-4 py-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-accent-contrast/80">Winner</p>
            <p className="text-lg font-extrabold text-accent-contrast">
              {state.matchWinner === "A" ? playerA.name : playerB.name}
            </p>
          </div>
          <Link href={`/admin/${adminKey}/results`}>
            <Button variant="black">Back to Results</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function ScoreButton({
  label,
  onClick,
  disabled,
  variant,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  variant: "outline" | "accent";
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label === "+" ? "Add point" : "Subtract point"}
      className={`flex h-12 w-12 items-center justify-center rounded-full text-xl font-semibold disabled:opacity-40 ${
        variant === "accent"
          ? "bg-accent text-accent-contrast"
          : "border border-card-border bg-card text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
