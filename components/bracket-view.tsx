import Link from "next/link";
import { roundName } from "@/lib/format";
import { parseGames, isGameWon, type ScoringRules } from "@/lib/scoring";
import type { MatchWithPlayers } from "@/lib/tournament-data";
import { matchEntrantA, matchEntrantB, matchWinnerEntrantId } from "@/lib/entrants";
import { ArrowRightIcon } from "@/components/ui/icons";

function finishedGamesLine(match: MatchWithPlayers, rules: ScoringRules) {
  const games = parseGames(match.games).filter((g) => isGameWon(g, rules) !== null);
  if (games.length === 0) return null;
  return games.map((g) => `${g.a}–${g.b}`).join(", ");
}

export function BracketView({
  matches,
  totalRounds,
  rules,
  doubles,
  matchHref,
}: {
  matches: MatchWithPlayers[];
  totalRounds: number;
  rules: ScoringRules;
  doubles: boolean;
  matchHref: (matchId: string) => string;
}) {
  const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1);

  return (
    <div className="flex gap-5 overflow-x-auto px-5 pb-4">
      {rounds.map((round) => (
        <div key={round} className="flex w-52 flex-shrink-0 flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted">
            {roundName(round, totalRounds, "KNOCKOUT")}
          </h3>
          {matches
            .filter((m) => m.round === round)
            .map((match) => (
              <MatchCard key={match.id} match={match} rules={rules} doubles={doubles} href={matchHref(match.id)} />
            ))}
        </div>
      ))}
    </div>
  );
}

function MatchCard({
  match,
  rules,
  doubles,
  href,
}: {
  match: MatchWithPlayers;
  rules: ScoringRules;
  doubles: boolean;
  href: string;
}) {
  const gamesLine = finishedGamesLine(match, rules);
  const a = matchEntrantA(match, doubles);
  const b = matchEntrantB(match, doubles);
  const winnerId = matchWinnerEntrantId(match, doubles);
  const hasBoth = !!a && !!b;

  return (
    <Link
      href={href}
      className={`flex flex-col gap-0.5 rounded-xl border border-card-border bg-card px-4 py-3.5 ${
        hasBoth ? "" : "opacity-50"
      }`}
    >
      <EntrantRow name={a?.name ?? "TBD"} isWinner={!!a && a.id === winnerId} known={!!a} />
      <EntrantRow name={b?.name ?? "TBD"} isWinner={!!b && b.id === winnerId} known={!!b} />

      {gamesLine && <span className="mt-1 text-xs text-muted">{gamesLine}</span>}

      {match.status === "READY" && (
        <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-accent">
          Tap to toss <ArrowRightIcon className="h-3.5 w-3.5" />
        </span>
      )}

      {match.status === "LIVE" && (
        <span className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Live
        </span>
      )}
    </Link>
  );
}

function EntrantRow({ name, isWinner, known }: { name: string; isWinner: boolean; known: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={`font-semibold ${known ? "" : "text-muted"}`}>{name}</span>
      {isWinner && <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />}
    </div>
  );
}
