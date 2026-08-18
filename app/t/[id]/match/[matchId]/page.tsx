import { notFound } from "next/navigation";
import { getTournamentBySlugId } from "@/lib/tournament-data";
import { matchEntrantA, matchEntrantB, matchEntrantAId, matchWinnerEntrant } from "@/lib/entrants";
import { LiveRefresh } from "@/components/live-refresh";
import { ScreenHeader } from "@/components/ui/screen-header";
import { computeMatchState, isGameWon, parseGames } from "@/lib/scoring";
import { roundName, totalRoundsFor } from "@/lib/format";

export default async function PublicMatchPage({
  params,
}: {
  params: Promise<{ id: string; matchId: string }>;
}) {
  const { id, matchId } = await params;
  const tournament = await getTournamentBySlugId(id);
  if (!tournament) notFound();

  const match = tournament.matches.find((m) => m.id === matchId);
  if (!match) notFound();

  const doubles = tournament.format === "DOUBLES";
  const entrantA = matchEntrantA(match, doubles);
  const entrantB = matchEntrantB(match, doubles);
  const winner = matchWinnerEntrant(match, doubles);

  const totalRounds = totalRoundsFor(tournament.matches);
  const rules = {
    pointsPerGame: tournament.pointsPerGame,
    winBy2: tournament.winBy2,
    bestOf: tournament.bestOf,
  };
  const games = parseGames(match.games);
  const state = computeMatchState(games, rules);
  const current = games[games.length - 1] ?? { a: 0, b: 0 };
  const lastFinished = [...games].reverse().find((g) => isGameWon(g, rules) !== null);

  const tossSubtitle =
    match.tossWinnerId && entrantA && entrantB
      ? `${match.tossWinnerId === matchEntrantAId(match, doubles) ? entrantA.name : entrantB.name} chose to ${
          match.tossChoice === "SERVE" ? "serve first" : "pick their side"
        }`
      : undefined;

  return (
    <div className="flex flex-1 flex-col">
      {(match.status === "READY" || match.status === "LIVE") && <LiveRefresh />}

      <ScreenHeader
        title={roundName(match.round, totalRounds, tournament.matchType)}
        subtitle={match.status === "LIVE" || match.status === "COMPLETED" ? tossSubtitle : undefined}
        backHref={`/t/${tournament.id}/results`}
      />

      {match.status === "PENDING" && (
        <p className="px-5 pt-2 text-sm text-muted">Waiting for the previous round to finish.</p>
      )}

      {match.status === "BYE" && (
        <p className="px-5 pt-2 text-sm text-muted">{winner?.name} advances automatically — bye.</p>
      )}

      {match.status === "READY" && entrantA && entrantB && (
        <p className="px-5 pt-2 text-sm text-muted">
          {entrantA.name} vs {entrantB.name} — waiting for the coin toss.
        </p>
      )}

      {(match.status === "LIVE" || match.status === "COMPLETED") && entrantA && entrantB && (
        <div className="flex flex-1 flex-col gap-6 px-5 pt-4">
          <div className="flex items-center justify-center gap-4 text-center">
            <span className="font-bold">{entrantA.name}</span>
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
            <span className="font-bold">{entrantB.name}</span>
          </div>

          <div className="grid grid-cols-2 items-center">
            <span className="justify-self-center text-6xl font-extrabold tabular-nums">{current.a}</span>
            <span className="justify-self-center text-6xl font-extrabold tabular-nums">{current.b}</span>
          </div>

          {match.status === "COMPLETED" && (
            <div className="mt-auto rounded-2xl bg-accent px-4 py-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-accent-contrast/80">Winner</p>
              <p className="text-lg font-extrabold text-accent-contrast">{winner?.name}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
