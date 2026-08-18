import { notFound } from "next/navigation";
import { getTournamentByAdminKey } from "@/lib/tournament-data";
import { matchEntrantA, matchEntrantB, matchEntrantAId, matchWinnerEntrant } from "@/lib/entrants";
import { TossPanel } from "@/components/toss-panel";
import { ScorePanel } from "@/components/score-panel";
import { LiveRefresh } from "@/components/live-refresh";
import { ScreenHeader } from "@/components/ui/screen-header";
import { parseGames } from "@/lib/scoring";

export default async function AdminMatchPage({
  params,
}: {
  params: Promise<{ key: string; matchId: string }>;
}) {
  const { key, matchId } = await params;
  const tournament = await getTournamentByAdminKey(key);
  if (!tournament) notFound();

  const match = tournament.matches.find((m) => m.id === matchId);
  if (!match) notFound();

  const doubles = tournament.format === "DOUBLES";
  const entrantA = matchEntrantA(match, doubles);
  const entrantB = matchEntrantB(match, doubles);
  const winner = matchWinnerEntrant(match, doubles);
  const rules = {
    pointsPerGame: tournament.pointsPerGame,
    winBy2: tournament.winBy2,
    bestOf: tournament.bestOf,
  };

  const title = match.status === "READY" ? "Coin Toss" : "Live Match";
  const tossSubtitle =
    match.tossWinnerId && entrantA && entrantB
      ? `${match.tossWinnerId === matchEntrantAId(match, doubles) ? entrantA.name : entrantB.name} chose to ${
          match.tossChoice === "SERVE" ? "serve first" : "pick their side"
        }`
      : undefined;

  return (
    <div className="flex flex-1 flex-col">
      {(match.status === "READY" || match.status === "LIVE") && <LiveRefresh intervalMs={5000} />}

      <ScreenHeader
        title={match.status === "PENDING" || match.status === "BYE" ? "Match" : title}
        subtitle={match.status === "LIVE" || match.status === "COMPLETED" ? tossSubtitle : undefined}
        backHref={`/admin/${tournament.adminKey}/results`}
      />

      {match.status === "PENDING" && (
        <p className="px-5 pt-2 text-sm text-muted">Waiting for the previous round to finish.</p>
      )}

      {match.status === "BYE" && (
        <p className="px-5 pt-2 text-sm text-muted">{winner?.name} advances automatically — bye.</p>
      )}

      {match.status === "READY" && entrantA && entrantB && (
        <TossPanel adminKey={tournament.adminKey} matchId={match.id} playerA={entrantA} playerB={entrantB} />
      )}

      {(match.status === "LIVE" || match.status === "COMPLETED") && entrantA && entrantB && (
        <ScorePanel
          adminKey={tournament.adminKey}
          matchId={match.id}
          playerA={entrantA}
          playerB={entrantB}
          initialGames={parseGames(match.games)}
          rules={rules}
        />
      )}
    </div>
  );
}
