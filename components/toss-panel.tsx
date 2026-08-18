"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordToss } from "@/lib/actions";
import { Button } from "@/components/ui/buttons";

type Side = { id: string; name: string };

export function TossPanel({
  adminKey,
  matchId,
  playerA,
  playerB,
}: {
  adminKey: string;
  matchId: string;
  playerA: Side;
  playerB: Side;
}) {
  const [phase, setPhase] = useState<"idle" | "flipping" | "result">("idle");
  const [winner, setWinner] = useState<Side | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function flip() {
    setPhase("flipping");
    setTimeout(() => {
      const picked = Math.random() < 0.5 ? playerA : playerB;
      setWinner(picked);
      setPhase("result");
    }, 900);
  }

  function choose(choice: "SERVE" | "SIDE") {
    if (!winner) return;
    startTransition(async () => {
      await recordToss(adminKey, matchId, winner.id, choice);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-5 pt-6">
      <p className="text-lg font-bold">
        {playerA.name} vs {playerB.name}
      </p>

      <div
        className={`flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent text-3xl font-extrabold text-accent-contrast shadow-lg ${
          phase === "flipping" ? "animate-spin" : ""
        }`}
      >
        TT
      </div>

      {phase === "idle" && (
        <div className="w-full">
          <Button variant="accent" onClick={flip}>
            Flip Coin
          </Button>
        </div>
      )}

      {phase === "flipping" && <p className="text-sm text-muted">Flipping…</p>}

      {phase === "result" && winner && (
        <div className="flex w-full flex-col items-center gap-4">
          <div className="text-center">
            <p className="text-lg font-bold">{winner.name} won the toss</p>
            <p className="text-sm text-muted">Choose an advantage</p>
          </div>
          <div className="flex w-full gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={() => choose("SERVE")}
              className="flex-1 rounded-2xl bg-black py-4 text-base font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-black"
            >
              Serve First
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => choose("SIDE")}
              className="flex-1 rounded-2xl bg-faint-bg py-4 text-base font-semibold text-muted disabled:opacity-50"
            >
              Choose Side
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
