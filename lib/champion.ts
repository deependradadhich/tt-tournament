import type { TournamentWithData } from "@/lib/tournament-data";
import type { Entrant } from "@/lib/entrants";
import { matchWinnerEntrant } from "@/lib/entrants";
import type { StandingRow } from "@/lib/stats";
import { computeStandings } from "@/lib/stats";
import { getEntrants } from "@/lib/entrants";
import { parseGames, isGameWon, type ScoringRules } from "@/lib/scoring";

export type Champion = { entrant: Entrant; scoreText: string };

export function computeChampion(tournament: TournamentWithData, totalRounds: number): Champion | null {
  const doubles = tournament.format === "DOUBLES";
  const rules: ScoringRules = { pointsPerGame: tournament.pointsPerGame, winBy2: tournament.winBy2, bestOf: tournament.bestOf };

  if (tournament.matchType === "KNOCKOUT") {
    const final = tournament.matches.find((m) => m.round === totalRounds);
    if (!final || final.status !== "COMPLETED") return null;
    const winner = matchWinnerEntrant(final, doubles);
    if (!winner) return null;
    const scoreText = parseGames(final.games)
      .filter((g) => isGameWon(g, rules) !== null)
      .map((g) => `${g.a}–${g.b}`)
      .join(", ");
    return { entrant: winner, scoreText: scoreText ? `Final: ${scoreText}` : "" };
  }

  const withEntrants = tournament.matches.filter((m) => m.playerAId || m.teamAId);
  const allComplete = withEntrants.length > 0 && withEntrants.every((m) => m.status === "COMPLETED");
  if (!allComplete) return null;

  const standings: StandingRow[] = computeStandings(tournament);
  const leader = standings[0];
  if (!leader) return null;
  const entrant = getEntrants(tournament).find((e) => e.id === leader.id);
  if (!entrant) return null;
  return { entrant, scoreText: "" };
}
