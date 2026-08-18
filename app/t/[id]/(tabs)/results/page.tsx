import { notFound } from "next/navigation";
import { getTournamentBySlugId } from "@/lib/tournament-data";
import { BracketView } from "@/components/bracket-view";
import { StandingsTable, FixturesList } from "@/components/round-robin-view";
import { UpNextCard, findNextActionableMatch } from "@/components/up-next-card";
import { LiveRefresh } from "@/components/live-refresh";
import { computeChampion } from "@/lib/champion";
import { computeStandings } from "@/lib/stats";
import { totalRoundsFor } from "@/lib/format";

export default async function PublicResultsTabPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tournament = await getTournamentBySlugId(id);
  if (!tournament) notFound();

  const doubles = tournament.format === "DOUBLES";
  const totalRounds = totalRoundsFor(tournament.matches);
  const rules = {
    pointsPerGame: tournament.pointsPerGame,
    winBy2: tournament.winBy2,
    bestOf: tournament.bestOf,
  };
  const champion = computeChampion(tournament, totalRounds);
  const nextMatch = !champion ? findNextActionableMatch(tournament.matches, doubles) : undefined;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <LiveRefresh />

      <div className="px-5 pt-4">
        <h1 className="text-2xl font-extrabold">Results</h1>
        <p className="text-sm text-muted">{tournament.name}</p>
      </div>

      {champion && (
        <div className="mx-5 rounded-2xl bg-accent px-4 py-4 text-accent-contrast">
          <p className="text-xs font-bold uppercase tracking-wide opacity-85">Champion</p>
          <p className="mt-1 text-xl font-extrabold">{champion.entrant.name}</p>
          {champion.scoreText && <p className="mt-1.5 text-sm opacity-85">{champion.scoreText}</p>}
        </div>
      )}

      {nextMatch && (
        <UpNextCard
          match={nextMatch}
          doubles={doubles}
          matchHref={`/t/${tournament.id}/match/${nextMatch.id}`}
        />
      )}

      <StandingsTable
        standings={computeStandings(tournament)}
        profileHrefBase={`/t/${tournament.id}/roster`}
      />

      {tournament.matchType === "KNOCKOUT" ? (
        <BracketView
          matches={tournament.matches}
          totalRounds={totalRounds}
          rules={rules}
          doubles={doubles}
          matchHref={(matchId) => `/t/${tournament.id}/match/${matchId}`}
        />
      ) : (
        <FixturesList
          matches={tournament.matches}
          totalRounds={totalRounds}
          rules={rules}
          doubles={doubles}
          matchHref={(matchId) => `/t/${tournament.id}/match/${matchId}`}
        />
      )}
    </div>
  );
}
