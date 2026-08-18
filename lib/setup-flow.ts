import type { TournamentWithData } from "@/lib/tournament-data";

/** Where an in-progress (DRAFT) tournament's organizer should land next. */
export function nextSetupPath(adminKey: string, tournament: TournamentWithData): string {
  const base = `/admin/${adminKey}`;
  if (tournament.status !== "DRAFT") return `${base}/results`;

  if (tournament.format === "DOUBLES") {
    if (tournament.players.length < 4) return `${base}/setup/players`;
    const unpaired = tournament.players.filter((p) => !p.teamId).length;
    const teamsReady = tournament.teams.length >= 2 && unpaired <= 1;
    return teamsReady ? `${base}/setup/draw` : `${base}/setup/teams`;
  }

  return tournament.players.length >= 2 ? `${base}/setup/draw` : `${base}/setup/players`;
}
