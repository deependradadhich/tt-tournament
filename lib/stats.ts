import type { MatchWithPlayers, TournamentWithData } from "@/lib/tournament-data";
import { getEntrants, matchEntrantAId, matchEntrantBId, matchWinnerEntrantId, type Entrant } from "@/lib/entrants";
import { isGameWon, parseGames, type ScoringRules } from "@/lib/scoring";
import { roundName } from "@/lib/format";

export function entrantRecord(entrantId: string, matches: MatchWithPlayers[], doubles: boolean) {
  let wins = 0;
  let losses = 0;
  for (const m of matches) {
    if (m.status !== "COMPLETED" && m.status !== "BYE") continue;
    const aId = matchEntrantAId(m, doubles);
    const bId = matchEntrantBId(m, doubles);
    if (aId !== entrantId && bId !== entrantId) continue;
    if (matchWinnerEntrantId(m, doubles) === entrantId) wins++;
    else losses++;
  }
  return { wins, losses, played: wins + losses };
}

export type StandingRow = {
  id: string;
  name: string;
  rank: number;
  played: number;
  won: number;
  lost: number;
  gamesWon: number;
  gamesLost: number;
  points: number;
};

/** Round-robin standings: 1 point per match won, tiebreak by game differential. */
export function computeStandings(tournament: TournamentWithData): StandingRow[] {
  const doubles = tournament.format === "DOUBLES";
  const entrants = getEntrants(tournament);
  const stats = new Map<string, Omit<StandingRow, "rank">>();
  for (const e of entrants) {
    stats.set(e.id, { id: e.id, name: e.name, played: 0, won: 0, lost: 0, gamesWon: 0, gamesLost: 0, points: 0 });
  }

  for (const m of tournament.matches) {
    if (m.status !== "COMPLETED") continue;
    const aId = matchEntrantAId(m, doubles);
    const bId = matchEntrantBId(m, doubles);
    if (!aId || !bId) continue;
    const a = stats.get(aId);
    const b = stats.get(bId);
    if (!a || !b) continue;

    const games = parseGames(m.games);
    const rules: ScoringRules = { pointsPerGame: tournament.pointsPerGame, winBy2: tournament.winBy2, bestOf: tournament.bestOf };
    let gamesWonA = 0;
    let gamesWonB = 0;
    for (const g of games) {
      const result = isGameWon(g, rules);
      if (result === "A") gamesWonA++;
      else if (result === "B") gamesWonB++;
    }

    a.played++;
    b.played++;
    a.gamesWon += gamesWonA;
    a.gamesLost += gamesWonB;
    b.gamesWon += gamesWonB;
    b.gamesLost += gamesWonA;

    const winnerId = matchWinnerEntrantId(m, doubles);
    if (winnerId === aId) {
      a.won++;
      a.points += 1;
      b.lost++;
    } else {
      b.won++;
      b.points += 1;
      a.lost++;
    }
  }

  return Array.from(stats.values())
    .sort((x, y) => y.points - x.points || y.gamesWon - y.gamesLost - (x.gamesWon - x.gamesLost))
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

export type EntrantMatchSummary = {
  matchId: string;
  roundLabel: string;
  opponentName: string;
  result: "W" | "L";
  score: string;
};

export type EntrantStats = {
  played: number;
  won: number;
  lost: number;
  winPct: number;
  pointsScored: number;
  matches: EntrantMatchSummary[];
};

/** Full profile stats for one entrant: record, win rate, total points scored, and a per-match log. */
export function computeEntrantStats(
  entrantId: string,
  tournament: TournamentWithData,
  totalRounds: number
): EntrantStats {
  const doubles = tournament.format === "DOUBLES";
  let won = 0;
  let lost = 0;
  let pointsScored = 0;
  const matches: EntrantMatchSummary[] = [];

  for (const m of tournament.matches) {
    if (m.status !== "COMPLETED") continue;
    const aId = matchEntrantAId(m, doubles);
    const bId = matchEntrantBId(m, doubles);
    const isA = aId === entrantId;
    const isB = bId === entrantId;
    if (!isA && !isB) continue;

    const win = matchWinnerEntrantId(m, doubles) === entrantId;
    if (win) won++;
    else lost++;

    const games = parseGames(m.games);
    for (const g of games) pointsScored += isA ? g.a : g.b;

    const opponent = isA ? (doubles ? m.teamB : m.playerB) : doubles ? m.teamA : m.playerA;
    matches.push({
      matchId: m.id,
      roundLabel: roundName(m.round, totalRounds, tournament.matchType),
      opponentName: opponent?.name ?? "—",
      result: win ? "W" : "L",
      score: games.map((g) => (isA ? `${g.a}–${g.b}` : `${g.b}–${g.a}`)).join(", "),
    });
  }

  const played = won + lost;
  return { played, won, lost, winPct: played ? Math.round((won / played) * 100) : 0, pointsScored, matches };
}

export type { Entrant };
