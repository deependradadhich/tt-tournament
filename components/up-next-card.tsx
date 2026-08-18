import Link from "next/link";
import type { MatchWithPlayers } from "@/lib/tournament-data";
import { matchEntrantA, matchEntrantB } from "@/lib/entrants";
import { Button } from "@/components/ui/buttons";

/** Finds the first playable-or-live match, in round/position order, to spotlight on the Results screen. */
export function findNextActionableMatch(matches: MatchWithPlayers[], doubles: boolean) {
  return matches.find((m) => {
    if (m.status !== "READY" && m.status !== "LIVE") return false;
    return !!matchEntrantA(m, doubles) && !!matchEntrantB(m, doubles);
  });
}

export function UpNextCard({
  match,
  doubles,
  matchHref,
}: {
  match: MatchWithPlayers;
  doubles: boolean;
  matchHref: string;
}) {
  const a = matchEntrantA(match, doubles);
  const b = matchEntrantB(match, doubles);

  return (
    <div className="mx-5 rounded-2xl border-2 border-accent bg-card px-4 py-4">
      <p className="text-xs font-bold uppercase tracking-wide text-accent">Up Next</p>
      <p className="mt-1 font-semibold">
        {a?.name} vs {b?.name}
      </p>
      <Link href={matchHref} className="mt-2.5 block">
        <Button variant="accent">{match.status === "LIVE" ? "Continue Match" : "Start Match (Toss)"}</Button>
      </Link>
    </div>
  );
}
