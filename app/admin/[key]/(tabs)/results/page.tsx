import { notFound } from "next/navigation";
import { getTournamentByAdminKey } from "@/lib/tournament-data";
import { BracketView } from "@/components/bracket-view";
import { StandingsTable, FixturesList } from "@/components/round-robin-view";
import { TopPerformersCharts } from "@/components/top-performers-charts";
import { UpNextCard, findNextActionableMatch } from "@/components/up-next-card";
import { LiveRefresh } from "@/components/live-refresh";
import { CopyLinkButton } from "@/components/copy-link-button";
import { ResetTournamentButton } from "@/components/reset-tournament-button";
import { computeChampion } from "@/lib/champion";
import { computeStandings } from "@/lib/stats";
import { totalRoundsFor } from "@/lib/format";

export default async function ResultsTabPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const tournament = await getTournamentByAdminKey(key);
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
  const standings = computeStandings(tournament);

  return (
    <div className="flex flex-1 flex-col gap-4">
      {tournament.status === "LOCKED" && <LiveRefresh />}

      <div className="flex items-start justify-between px-5 pt-4">
        <div>
          <h1 className="text-2xl font-extrabold">Results</h1>
          <p className="text-sm text-muted">{tournament.name}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <CopyLinkButton path={`/t/${tournament.id}`} label="Public link" />
          <ResetTournamentButton adminKey={tournament.adminKey} />
        </div>
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
          matchHref={`/admin/${tournament.adminKey}/match/${nextMatch.id}`}
        />
      )}

      <TopPerformersCharts standings={standings} profileHrefBase={`/admin/${tournament.adminKey}/roster`} />

      <StandingsTable standings={standings} profileHrefBase={`/admin/${tournament.adminKey}/roster`} />

      {tournament.matchType === "KNOCKOUT" ? (
        <BracketView
          matches={tournament.matches}
          totalRounds={totalRounds}
          rules={rules}
          doubles={doubles}
          matchHref={(matchId) => `/admin/${tournament.adminKey}/match/${matchId}`}
        />
      ) : (
        <FixturesList
          matches={tournament.matches}
          totalRounds={totalRounds}
          rules={rules}
          doubles={doubles}
          matchHref={(matchId) => `/admin/${tournament.adminKey}/match/${matchId}`}
        />
      )}
    </div>
  );
}
