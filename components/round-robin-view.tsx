import Link from "next/link";
import type { StandingRow } from "@/lib/stats";
import { roundName } from "@/lib/format";
import { parseGames, isGameWon, type ScoringRules } from "@/lib/scoring";
import type { MatchWithPlayers } from "@/lib/tournament-data";
import { matchEntrantA, matchEntrantB } from "@/lib/entrants";

export function StandingsTable({
  standings,
  profileHrefBase,
  title = "Leaderboard",
}: {
  standings: StandingRow[];
  profileHrefBase: string;
  title?: string;
}) {
  return (
    <div className="flex flex-col gap-3 px-5">
      <p className="text-xs font-bold uppercase tracking-wide text-muted">{title}</p>

      <div>
        <div className="flex px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wide text-muted">
          <span className="flex-1">Team</span>
          <span className="w-7 text-center">P</span>
          <span className="w-7 text-center">W</span>
          <span className="w-7 text-center">L</span>
          <span className="w-9 text-center">Pts</span>
          <span className="w-10 text-center">PF</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-card-border bg-card">
          {standings.map((row, i) => (
            <Link
              key={row.id}
              href={`${profileHrefBase}/${row.id}`}
              className={`flex items-center px-3 py-2.5 ${i < standings.length - 1 ? "border-b border-faint-bg" : ""}`}
            >
              <span className="flex-1 truncate text-sm font-semibold">
                {row.rank}. {row.name}
              </span>
              <span className="w-7 text-center text-sm text-muted">{row.played}</span>
              <span className="w-7 text-center text-sm text-muted">{row.won}</span>
              <span className="w-7 text-center text-sm text-muted">{row.lost}</span>
              <span className="w-9 text-center text-sm font-bold">{row.points}</span>
              <span className="w-10 text-center text-sm text-muted">{row.pointsScored}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FixturesList({
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
    <div className="flex flex-col gap-4 px-5">
      <p className="text-xs font-bold uppercase tracking-wide text-muted">Fixtures</p>
      {rounds.map((round) => (
        <div key={round} className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted">{roundName(round, totalRounds, "ROUND_ROBIN")}</p>
          {matches
            .filter((m) => m.round === round)
            .map((m) => {
              const a = matchEntrantA(m, doubles);
              const b = matchEntrantB(m, doubles);
              const gamesLine = parseGames(m.games)
                .filter((g) => isGameWon(g, rules) !== null)
                .map((g) => `${g.a}–${g.b}`)
                .join(", ");
              return (
                <Link
                  key={m.id}
                  href={matchHref(m.id)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-card-border bg-card px-3.5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{a?.name}</p>
                    <p className="mt-0.5 truncate text-sm font-semibold">{b?.name}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {gamesLine && <p className="text-xs text-muted">{gamesLine}</p>}
                    {m.status === "READY" && <p className="text-xs font-bold text-accent">Toss →</p>}
                    {m.status === "LIVE" && <p className="text-xs font-bold text-accent">● Live</p>}
                  </div>
                </Link>
              );
            })}
        </div>
      ))}
    </div>
  );
}
