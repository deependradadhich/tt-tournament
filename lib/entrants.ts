import type { MatchWithPlayers, TournamentWithData } from "@/lib/tournament-data";

export type Entrant = { id: string; name: string };

export function isDoublesTournament(tournament: { format: string }) {
  return tournament.format === "DOUBLES";
}

/** Returns the tournament's competing entrants — players for singles, teams for doubles. */
export function getEntrants(tournament: TournamentWithData): Entrant[] {
  return isDoublesTournament(tournament)
    ? tournament.teams.map((t) => ({ id: t.id, name: t.name }))
    : tournament.players.map((p) => ({ id: p.id, name: p.name }));
}

export function matchEntrantA(match: MatchWithPlayers, doubles: boolean): Entrant | null {
  return doubles ? match.teamA : match.playerA;
}

export function matchEntrantB(match: MatchWithPlayers, doubles: boolean): Entrant | null {
  return doubles ? match.teamB : match.playerB;
}

export function matchWinnerEntrant(match: MatchWithPlayers, doubles: boolean): Entrant | null {
  return doubles ? match.winnerTeam : match.winner;
}

export function matchWinnerEntrantId(match: MatchWithPlayers, doubles: boolean): string | null {
  return doubles ? match.winnerTeamId : match.winnerId;
}

export function matchEntrantAId(match: MatchWithPlayers, doubles: boolean): string | null {
  return doubles ? match.teamAId : match.playerAId;
}

export function matchEntrantBId(match: MatchWithPlayers, doubles: boolean): string | null {
  return doubles ? match.teamBId : match.playerBId;
}
