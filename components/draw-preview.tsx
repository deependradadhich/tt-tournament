"use client";

import { useEffect, useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { lockDraw } from "@/lib/actions";
import { shuffle, nextPowerOfTwo, buildRound1Pairs, roundRobinRounds } from "@/lib/pairing";
import { Button } from "@/components/ui/buttons";

type Entrant = { id: string; name: string };

export function DrawPreview({
  adminKey,
  entrants,
  matchType,
}: {
  adminKey: string;
  entrants: Entrant[];
  matchType: "KNOCKOUT" | "ROUND_ROBIN";
}) {
  const [order, setOrder] = useState<string[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const entrantIds = entrants.map((e) => e.id);
  const nameOf = (id: string) => entrants.find((e) => e.id === id)?.name ?? "TBD";

  // Shuffle only after mount so the server-rendered and first client-rendered pass match (avoids hydration mismatch).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: client-only random init, not derived from props
    setOrder(shuffle(entrantIds));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!order) {
    return <div className="flex-1 px-5 py-4 text-sm text-muted">Shuffling…</div>;
  }

  const pairs: [string, string | null][] =
    matchType === "KNOCKOUT" ? buildRound1Pairs(order, nextPowerOfTwo(order.length)) : roundRobinRounds(order)[0] ?? [];

  return (
    <div className="flex flex-1 flex-col gap-3 px-5 py-2">
      {pairs.map(([a, b], i) => (
        <div key={i} className="rounded-xl border border-card-border bg-card px-4 py-3">
          <p className="font-semibold">{nameOf(a)}</p>
          <p className="text-xs text-muted">vs</p>
          <p className="font-semibold">{b ? nameOf(b) : "TBD"}</p>
          {!b && <p className="mt-1 text-sm font-medium text-accent">Bye — advances automatically</p>}
        </div>
      ))}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="mt-auto flex gap-3 pb-4 pt-4">
        <button
          type="button"
          onClick={() => setOrder(shuffle(entrantIds))}
          className="flex-1 rounded-2xl border border-card-border bg-card py-4 text-base font-semibold"
        >
          Reshuffle
        </button>
        <Button
          variant="accent"
          className="flex-1"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              try {
                await lockDraw(adminKey, order);
              } catch (e) {
                unstable_rethrow(e);
                setError(e instanceof Error ? e.message : "Something went wrong.");
              }
            })
          }
        >
          {isPending ? "Locking…" : "Lock Draw"}
        </Button>
      </div>
    </div>
  );
}
